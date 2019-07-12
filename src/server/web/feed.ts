import config from '../../config';
import Note from '../../models/note';
import User from '../../models/user';
import getDriveFileUrl from '../../misc/get-drive-file-url';
import { transform } from '../../misc/cafy-id';
import getNoteHtml from '../../remote/activitypub/misc/get-note-html';
import parseAcct from '../../misc/acct/parse';
import xmlbuilder = require('xmlbuilder');
const jsonfeedToAtomObject = require('jsonfeed-to-atom/jsonfeed-to-atom-object');
const jsonfeedToRSSObject = require('jsonfeed-to-rss/jsonfeed-to-rss-object');

//#region JSON Feed models
export interface IFeed {
	version: 'https://jsonfeed.org/version/1';
	title: string;
	home_page_url?: string;
	feed_url?: string;
	description?: string;
	user_comment?: string;
	next_url?: string;
	icon?: string;
	author?: IFeedAuthor;
	expired?: boolean;
	items?: IFeedItem[];
	hubs?: IFeedHub[];
}

export interface IFeedAuthor {
	name?: string;
	url?: string;
	avatar?: string;
}

export interface IFeedHub {
	type: string;
	url: string;
}

export interface IFeedItem {
	id: string;
	url?: string;
	external_url ?: string;
	title?: string;
	content_html?: string;
	content_text?: string;
	summary?: string;
	image?: string;
	banner_image?: string;
	date_published?: string;
	date_modified?: string;
	author?: IFeedAuthor;
	tags?: string[];
	attachments?: IFeedAttachment[];
}

export interface IFeedAttachment {
	url: string;
	mime_type: string;
	title?: string;
	size_in_bytes?: number;
	duration_in_seconds?: number;
}
//#endregion

export async function getJSONFeed(acct: string, untilId?: string) {
	const { username, host } = parseAcct(acct);
	const user = await User.findOne({
		usernameLower: username.toLowerCase(),
		host
	});
	if (user == null) return null;

	const query = {
		userId: user._id,
		renoteId: null,
		$or: [
			{ visibility: 'public' },
			{ visibility: 'home' }
		]
	} as any;

	if (untilId) {
		query._id = {
			$lt: transform(untilId)
		};
	}

	const notes = await Note.find(query, {
		sort: { _id: -1 },
		limit: 20
	});

	const url = `${config.url}/@${user.username}`;
	const name = user.name || user.username;
	const fullacct = `@${user.username}@${config.host}`;
	const avatar = user.avatarUrl ? user.avatarUrl : undefined;

	const feed = {
		version: 'https://jsonfeed.org/version/1',
		title: `${name} (${fullacct})`,
		home_page_url: url,
		feed_url: `${url}.json`,
		next_url: notes.length > 0 ? `${url}.json?until_id=${notes[notes.length - 1]._id}` : undefined,
		description: user.description || '',
		icon: avatar,
		author: {
			name,
			url,
			avatar: avatar
		},
		items: []
	} as IFeed;

	for (const note of notes) {
		const noteUrl = `${config.url}/notes/${note._id}`;
		const image = note._files && note._files.find(file => file.contentType.startsWith('image/'));

		const item = {
			id: noteUrl,
			url: noteUrl,
			title: `New note by ${name}`,
			content_text: note.text != null ? note.text : '',
			content_html: note.text != null ? getNoteHtml(note) : '',
			summary: note.cw != null ? note.cw : undefined,
			image: image ? getDriveFileUrl(image) : undefined,
			date_published: note.createdAt ? note.createdAt.toISOString() : undefined
		} as IFeedItem;

		if (note._files) {
			item.attachments = note._files.map(file => {
				return {
					url: getDriveFileUrl(file),
					mime_type: file.contentType,
					size_in_bytes: file.length,
					title: file.filename
				} as IFeedAttachment;
			});
		}

		feed.items.push(item);
	}

	return feed;
}

export async function getAtomFeed(acct: string, untilId?: string): Promise<string> {
	const json = await getJSONFeed(acct, untilId);
	if (!json) return null;

	const atom = jsonfeedToAtomObject(json, {
		feedURLFn: (feedURL: string) => feedURL.replace(/\.json$/, '.atom')
	});

	// replace link next
	if (atom.feed && atom.feed.link) {
		for (const link of atom.feed.link) {
			if (link['@rel'] === 'next') {
				link['@type'] = 'application/atom+xml';
				link['@href'] = link['@href'].replace(/\.xml\?/, '.atom?');
			}
		}
	}

	return objectToXml(atom);
}

export async function getRSSFeed(acct: string, untilId?: string): Promise<string> {
	const json = await getJSONFeed(acct, untilId);
	if (!json) return null;

	const rss = jsonfeedToRSSObject(json, {
		feedURLFn: (feedURL: string) => feedURL.replace(/\.json$/, '.rss')
	});

	return objectToXml(rss);
}

function objectToXml(obj: {}): string {
	const xml = xmlbuilder.create(obj, { encoding: 'utf-8' });
	return xml.end({ pretty: true });
}
