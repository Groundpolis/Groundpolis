/**
 * Web Client Server
 */

import * as os from 'os';
import * as fs from 'fs';
import ms = require('ms');
import * as Koa from 'koa';
import * as Router from '@koa/router';
import * as send from 'koa-send';
import * as favicon from 'koa-favicon';
import * as views from 'koa-views';
import * as glob from 'glob';
import * as MarkdownIt from 'markdown-it';

import packFeed from './feed';
import { fetchMeta } from '../../misc/fetch-meta';
import { genOpenapiSpec } from '../api/openapi/gen-spec';
import config from '../../config';
import { Users, Notes, Emojis, UserProfiles, Pages } from '../../models';
import parseAcct from '../../misc/acct/parse';
import getNoteSummary from '../../misc/get-note-summary';
import { ensure } from '../../prelude/ensure';
import { getConnection } from 'typeorm';
import redis from '../../db/redis';
import locales = require('../../../locales');

const markdown = MarkdownIt({
	html: true
});

const env = process.env.NODE_ENV;

const client = `${__dirname}/../../client/`;

// Init app
const app = new Koa();

const setCache = (ctx: Koa.ParameterizedContext, onProduction: string) => {
	ctx.set('Cache-Control', env === 'production' ? onProduction : 'no-store');
};

// Init renderer
app.use(views(__dirname + '/views', {
	extension: 'pug',
	options: {
		version: config.version,
		config
	}
}));

// Serve favicon
app.use(favicon(`${__dirname}/../../../assets/favicon.png`));

// Common request handler
app.use(async (ctx, next) => {
	// IFrameの中に入れられないようにする
	ctx.set('X-Frame-Options', 'DENY');
	await next();
});

// Init router
const router = new Router();

//#region static assets

router.get('/assets/(.*)', async ctx => {
	if (env !== 'production') {
		ctx.set('Cache-Control', 'no-store');
	}
	await send(ctx as any, ctx.path, {
		root: client,
		maxage: ms('7 days'),
	});
});

// Apple touch icon
router.get('/apple-touch-icon.png', async ctx => {
	await send(ctx as any, '/assets/apple-touch-icon.png', {
		root: client
	});
});

// ServiceWorker
router.get(/^\/sw\.(.+?)\.js$/, async ctx => {
	await send(ctx as any, `/assets/sw.${ctx.params[0]}.js`, {
		root: client
	});
});

// Manifest
router.get('/manifest.json', require('./manifest'));

router.get('/robots.txt', async ctx => {
	await send(ctx as any, '/assets/robots.txt', {
		root: client
	});
});

//#endregion

// Docs
router.get('/api-doc', async ctx => {
	await send(ctx as any, '/assets/redoc.html', {
		root: client
	});
});

// URL preview endpoint
router.get('/url', require('./url-preview'));

router.get('/api.json', async ctx => {
	ctx.body = genOpenapiSpec();
});

router.get('/docs.json', async ctx => {
	const lang = ctx.query.lang;
	if (!Object.keys(locales).includes(lang)) {
		ctx.body = [];
		return;
	}
	const paths = glob.sync(__dirname + `/../../../src/docs/*.${lang}.md`);
	const docs: { path: string; title: string; }[] = [];
	for (const path of paths) {
		const md = fs.readFileSync(path, { encoding: 'utf8' });
		const parsed = markdown.parse(md, {});
		if (parsed.length === 0) return;

		const buf = [...parsed];
		const headingTokens = [];

		// もっとも上にある見出しを抽出する
		while (buf[0].type !== 'heading_open') {
			buf.shift();
		}
		buf.shift();
		while (buf[0].type as string !== 'heading_close') {
			const token = buf.shift();
			if (token) {
				headingTokens.push(token);
			}
		}

		docs.push({
			path: path.split('/').pop()!.split('.')[0],
			title: markdown.renderer.render(headingTokens, {}, {})
		});
	}

	ctx.body = docs;
});

const getFeed = async (acct: string) => {
	const { username, host } = parseAcct(acct);
	const user = await Users.findOne({
		usernameLower: username.toLowerCase(),
		host,
		isSuspended: false
	});

	return user && await packFeed(user);
};

// Atom
router.get('/@:user.atom', async ctx => {
	const feed = await getFeed(ctx.params.user);

	if (feed) {
		ctx.set('Content-Type', 'application/atom+xml; charset=utf-8');
		ctx.body = feed.atom1();
	} else {
		ctx.status = 404;
	}
});

// RSS
router.get('/@:user.rss', async ctx => {
	const feed = await getFeed(ctx.params.user);

	if (feed) {
		ctx.set('Content-Type', 'application/rss+xml; charset=utf-8');
		ctx.body = feed.rss2();
	} else {
		ctx.status = 404;
	}
});

// JSON
router.get('/@:user.json', async ctx => {
	const feed = await getFeed(ctx.params.user);

	if (feed) {
		ctx.set('Content-Type', 'application/json; charset=utf-8');
		ctx.body = feed.json1();
	} else {
		ctx.status = 404;
	}
});

//#region for crawlers
// User
router.get(['/@:user', '/@:user/:sub'], async (ctx, next) => {
	const { username, host } = parseAcct(ctx.params.user);
	const user = await Users.findOne({
		usernameLower: username.toLowerCase(),
		host,
		isSuspended: false
	});

	if (user != null) {
		const profile = await UserProfiles.findOne(user.id).then(ensure);
		const meta = await fetchMeta();
		const me = profile.fields
			? profile.fields
				.filter(filed => filed.value != null && filed.value.match(/^https?:/))
				.map(field => field.value)
			: [];

		await ctx.render('user', {
			user, profile, me,
			sub: ctx.params.sub,
			instanceName: meta.name || 'Groundpolis',
			icon: meta.iconUrl
		});
		setCache(ctx, 'public, max-age=30');
	} else {
		// リモートユーザーなので
		// モデレータがAPI経由で参照可能にするために404にはしない
		await next();
	}
});

router.get('/users/:user', async ctx => {
	const user = await Users.findOne({
		id: ctx.params.user,
		host: null,
		isSuspended: false
	});

	if (user == null) {
		ctx.status = 404;
		return;
	}

	ctx.redirect(`/@${user.username}${ user.host == null ? '' : '@' + user.host}`);
});

// Note
router.get('/notes/:note', async ctx => {
	const note = await Notes.findOne(ctx.params.note);

	if (note) {
		const _note = await Notes.pack(note);
		const meta = await fetchMeta();
		await ctx.render('note', {
			note: _note,
			// TODO: Let locale changeable by instance setting
			summary: getNoteSummary(_note, locales['ja-JP']),
			instanceName: meta.name || 'Groundpolis',
			icon: meta.iconUrl
		});

		if (['public', 'home'].includes(note.visibility)) {
			setCache(ctx, 'public, max-age=180');
		} else {
			setCache(ctx, 'private, max-age=0, must-revalidate');
		}

		return;
	}

	ctx.status = 404;
});

// Page
router.get('/@:user/pages/:page', async ctx => {
	const { username, host } = parseAcct(ctx.params.user);
	const user = await Users.findOne({
		usernameLower: username.toLowerCase(),
		host
	});

	if (user == null) return;

	const page = await Pages.findOne({
		name: ctx.params.page,
		userId: user.id
	});

	if (page) {
		const _page = await Pages.pack(page);
		const meta = await fetchMeta();
		await ctx.render('page', {
			page: _page,
			instanceName: meta.name || 'Groundpolis'
		});

		if (['public'].includes(page.visibility)) {
			setCache(ctx, 'public, max-age=180');
		} else {
			setCache(ctx, 'private, max-age=0, must-revalidate');
		}

		return;
	}

	ctx.status = 404;
});
//#endregion

router.get('/info', async ctx => {
	const meta = await fetchMeta(true);
	const emojis = await Emojis.find({
		where: { host: null }
	});
	await ctx.render('info', {
		version: config.version,
		machine: os.hostname(),
		os: os.platform(),
		node: process.version,
		psql: await getConnection().query('SHOW server_version').then(x => x[0].server_version),
		redis: redis.server_info.redis_version,
		cpu: {
			model: os.cpus()[0].model,
			cores: os.cpus().length
		},
		emojis: emojis,
		meta: meta,
		originalUsersCount: await Users.count({ host: null }),
		originalNotesCount: await Notes.count({ userHost: null })
	});
});

const override = (source: string, target: string, depth: number = 0) =>
	[, ...target.split('/').filter(x => x), ...source.split('/').filter(x => x).splice(depth)].join('/');

router.get('/othello', async ctx => ctx.redirect(override(ctx.URL.pathname, 'games/reversi', 1)));
router.get('/reversi', async ctx => ctx.redirect(override(ctx.URL.pathname, 'games')));

router.get('/flush', async ctx => {
	await ctx.render('flush');
});

// Render base html for all requests
router.get('(.*)', async ctx => {
	const meta = await fetchMeta();
	await ctx.render('base', {
		img: meta.bannerUrl,
		title: meta.name || 'Groundpolis',
		instanceName: meta.name || 'Groundpolis',
		desc: meta.description,
		icon: meta.iconUrl
	});
	setCache(ctx, 'public, max-age=300');
});

// Register router
app.use(router.routes());

module.exports = app;
