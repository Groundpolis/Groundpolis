import config from '../../config';
import Note from '../../models/note';
import { IUser } from '../../models/user';
import { getOriginalUrl } from '../../misc/get-drive-file-url';
import { transform } from '../../misc/cafy-id';
import getNoteHtml from '../../remote/activitypub/misc/get-note-html';

//#region JSON feed models
export interface IFeed {
	version: 'https://jsonfeed.org/version/1';
	id?: string;	// 本当は存在しない
	title: string;
	home_page_url?: string;
	feed_url?: string;
	description?: string;
	user_comment?: string;
	next_url?: string;
	icon?: string;
	author?: IAuthor;
	expired?: boolean;
	items?: IItem[];
	hubs?: IHub[];
}

export interface IAuthor {
	name?: string;
	url?: string;
	avatar?: string;
}

export interface IHub {
	type: string;
	url: string;
}

export interface IItem {
	id: string;
	url?: string;
	external_url ?: string;
	title?: string;
	content_html?: string;
	content_text?: string;
	summary?: string;
	image?: string;
	banner_image?: string;
	date_published?: Date;
	date_modified?: Date;
	author?: IAuthor;
	tags?: string[];
	attachments?: IAttachments[];
}

export interface IAttachments {
	url: string;
	mime_type: string;
	title?: string;
	size_in_bytes?: number;
	duration_in_seconds?: number;
}
//#endregion JSON feed models

export async function getJSONFeed(user: IUser, untilId?: string) {
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
	const acct = `@${user.username}@${config.host}`;
	const avatar = user.avatarUrl ? user.avatarUrl : undefined;

	const feed = {
		version: 'https://jsonfeed.org/version/1',
		title: `${name} (${acct})`,
		home_page_url: url,
		feed_url: `${url}.json`,
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
		const file = note._files && note._files.find(file => file.contentType.startsWith('image/'));

		const item = {
			id: noteUrl,
			url: noteUrl,
			title: `New note by ${name}`,
			content_text: note.text != null ? note.text : '',
			content_html: note.text != null ? getNoteHtml(note) : '',
			summary: note.cw != null ? note.cw : undefined,
			image: file ? getOriginalUrl(file) : undefined,
			date_published: note.createdAt
		} as IItem;

		feed.items.push(item);
	}

	return feed;
}
