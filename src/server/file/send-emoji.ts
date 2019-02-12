import * as Koa from 'koa';
import * as tmp from 'tmp';
import * as fs from 'fs';
import { serverLogger } from '..';
import { fetch } from '../proxy/proxy-media';
import Emoji from '../../models/emoji';

export default async function(ctx: Koa.BaseContext) {
	const emoji = await Emoji.findOne({
		name: ctx.params.name,
		host: ctx.params.host,
	});

	if (emoji == null) {
		ctx.status = 404;
		return;
	}

	// Create temp file
	const [path, cleanup] = await new Promise<[string, any]>((res, rej) => {
		tmp.file((e, path, fd, cleanup) => {
			if (e) return rej(e);
			res([path, cleanup]);
		});
	});

	try {
		await fetch(emoji.url, path);

		ctx.set('Content-Type', 'image/png');
		ctx.set('Cache-Control', 'max-age=31536000, immutable');
		ctx.body = fs.readFileSync(path);
	} catch (e) {
		serverLogger.error(e);

		if (typeof e == 'number' && e >= 400 && e < 500) {
			ctx.status = e;
		} else {
			ctx.status = 500;
		}
	} finally {
		cleanup();
	}
}
