import es from '../../db/elasticsearch';
import { publishNotesStream } from '../stream';
import { parse } from '../../mfm/parse';
import { resolveUser } from '../../remote/resolve-user';
import config from '../../config';
import { updateHashtags } from '../update-hashtag';
import { concat } from '../../prelude/array';
import insertNoteUnread from './unread';
import extractMentions from '../../misc/extract-mentions';
import extractEmojis from '../../misc/extract-emojis';
import extractHashtags from '../../misc/extract-hashtags';
import { Note, IMentionedRemoteUsers } from '../../models/entities/note';
import { Users, Notes, UserProfiles } from '../../models';
import { DriveFile } from '../../models/entities/drive-file';
import { App } from '../../models/entities/app';
import { getConnection, In } from 'typeorm';
import { User } from '../../models/entities/user';
import { genId } from '../../misc/gen-id';
import { notesChart, perUserNotesChart, activeUsersChart } from '../chart';
import { Poll, IPoll } from '../../models/entities/poll';
import { isDuplicateKeyValueError } from '../../misc/is-duplicate-key-value-error';
import { ensure } from '../../prelude/ensure';

type Option = {
	createdAt?: Date | null;
	name?: string | null;
	text?: string | null;
	reply?: Note | null;
	renote?: Note | null;
	files?: DriveFile[] | null;
	poll?: IPoll | null;
	viaMobile?: boolean | null;
	localOnly?: boolean | null;
	cw?: string | null;
	visibility?: string;
	visibleUsers?: User[] | null;
	apMentions?: User[] | null;
	apHashtags?: string[] | null;
	apEmojis?: string[] | null;
	uri?: string | null;
	url?: string | null;
	app?: App | null;
	isAnnouncement?: boolean | null;
};

export default async (user: User, data: Option, silent = false) => new Promise<Note>(async (res, rej) => {
	if (data.createdAt == null) data.createdAt = new Date();
	if (data.visibility == null) data.visibility = 'public';
	if (data.viaMobile == null) data.viaMobile = false;
	if (data.localOnly == null) data.localOnly = false;
	if (data.isAnnouncement == null) data.isAnnouncement = false;

	// サイレンス
	if (user.isSilenced && data.visibility === 'public') {
		data.visibility = 'home';
	}

	// Renote対象が「ホームまたは全体」以外の公開範囲ならreject
	if (data.renote && data.renote.visibility !== 'public' && data.renote.visibility !== 'home' && data.renote.userId !== user.id) {
		return rej('Renote target is not public or home');
	}

	// Renote対象がpublicではないならhomeにする
	if (data.renote && data.renote.visibility !== 'public' && data.visibility === 'public') {
		data.visibility = 'home';
	}

	// Renote対象がfollowersならfollowersにする
	if (data.renote && data.renote.visibility === 'followers') {
		data.visibility = 'followers';
	}

	// 返信対象がpublicではないならhomeにする
	if (data.reply && data.reply.visibility !== 'public' && data.visibility === 'public') {
		data.visibility = 'home';
	}

	// ローカルのみをRenoteしたらローカルのみにする
	if (data.renote && data.renote.localOnly) {
		data.localOnly = true;
	}

	// ローカルのみにリプライしたらローカルのみにする
	if (data.reply && data.reply.localOnly) {
		data.localOnly = true;
	}

	if (data.text) {
		data.text = data.text.trim();
	}

	let tags = data.apHashtags;
	let emojis = data.apEmojis;
	let mentionedUsers = data.apMentions;

	// Parse MFM if needed
	if (!tags || !emojis || !mentionedUsers) {
		const tokens = data.text ? parse(data.text)! : [];
		const cwTokens = data.cw ? parse(data.cw)! : [];
		const choiceTokens = data.poll && data.poll.choices
			? concat(data.poll.choices.map(choice => parse(choice)!))
			: [];

		const combinedTokens = tokens.concat(cwTokens).concat(choiceTokens);

		tags = data.apHashtags || extractHashtags(combinedTokens);

		emojis = data.apEmojis || extractEmojis(combinedTokens);

		mentionedUsers = data.apMentions || await extractMentionedUsers(user, combinedTokens);
	}

	tags = tags.filter(tag => Array.from(tag || '').length <= 128).splice(0, 32);

	if (data.reply && (user.id !== data.reply.userId) && !mentionedUsers.some(u => u.id === data.reply!.userId)) {
		mentionedUsers.push(await Users.findOne(data.reply.userId).then(ensure));
	}

	if (data.visibility == 'specified') {
		if (data.visibleUsers == null) throw new Error('invalid param');

		for (const u of data.visibleUsers) {
			if (!mentionedUsers.some(x => x.id === u.id)) {
				mentionedUsers.push(u);
			}
		}

		if (data.reply && !data.visibleUsers.some(x => x.id === data.reply!.userId)) {
			data.visibleUsers.push(await Users.findOne(data.reply.userId).then(ensure));
		}
	}

	const note = await insertNote(user, data, tags, emojis, mentionedUsers);

	res(note);

	// 統計を更新
	notesChart.update(note, true);
	perUserNotesChart.update(user, note, true);

	// ハッシュタグ更新
	if (data.visibility === 'public') {
		updateHashtags(user, tags);
	}

	// Increment notes count (user)
	incNotesCountOfUser(user);

	if (data.reply) {
		saveReply(data.reply, note);
	}

	if (!silent) {
		// ローカルユーザーのチャートはタイムライン取得時に更新しているのでリモートユーザーの場合だけでよい
		if (Users.isRemoteUser(user)) activeUsersChart.update(user);

		// Pack the note
		const noteObj = await Notes.pack(note, user);

		if (user.notesCount === 0) {
			(noteObj as any).isFirstNote = true;
		}

		publishNotesStream(noteObj);
	}

	// Register to search database
	index(note);
});

async function insertNote(user: User, data: Option, tags: string[], emojis: string[], mentionedUsers: User[]) {
	const insert = new Note({
		id: genId(data.createdAt!),
		createdAt: data.createdAt!,
		fileIds: data.files ? data.files.map(file => file.id) : [],
		replyId: data.reply ? data.reply.id : null,
		renoteId: data.renote ? data.renote.id : null,
		name: data.name,
		text: data.text,
		hasPoll: data.poll != null,
		cw: data.cw == null ? null : data.cw,
		tags: tags.map(tag => tag.toLowerCase()),
		emojis,
		userId: user.id,
		viaMobile: data.viaMobile!,
		localOnly: data.localOnly!,
		visibility: data.visibility as any,
		visibleUserIds: data.visibility == 'specified'
			? data.visibleUsers
				? data.visibleUsers.map(u => u.id)
				: []
			: [],

		attachedFileTypes: data.files ? data.files.map(file => file.type) : [],

		isAnnouncement: data.isAnnouncement!,

		// 以下非正規化データ
		replyUserId: data.reply ? data.reply.userId : null,
		replyUserHost: data.reply ? data.reply.userHost : null,
		renoteUserId: data.renote ? data.renote.userId : null,
		renoteUserHost: data.renote ? data.renote.userHost : null,
		userHost: user.host,
	});

	if (data.uri != null) insert.uri = data.uri;
	if (data.url != null) insert.url = data.url;

	// Append mentions data
	if (mentionedUsers.length > 0) {
		insert.mentions = mentionedUsers.map(u => u.id);
		const profiles = await UserProfiles.find({ userId: In(insert.mentions) });
		insert.mentionedRemoteUsers = JSON.stringify(mentionedUsers.filter(u => Users.isRemoteUser(u)).map(u => {
			const profile = profiles.find(p => p.userId == u.id);
			const url = profile != null ? profile.url : null;
			return {
				uri: u.uri,
				url: url == null ? undefined : url,
				username: u.username,
				host: u.host
			} as IMentionedRemoteUsers[0];
		}));
	}

	// 投稿を作成
	try {
		if (insert.hasPoll) {
			// Start transaction
			await getConnection().transaction(async transactionalEntityManager => {
				await transactionalEntityManager.insert(Note, insert);

				const poll = new Poll({
					noteId: insert.id,
					choices: data.poll!.choices,
					expiresAt: data.poll!.expiresAt,
					multiple: data.poll!.multiple,
					votes: new Array(data.poll!.choices.length).fill(0),
					noteVisibility: insert.visibility,
					userId: user.id,
					userHost: user.host
				});

				await transactionalEntityManager.insert(Poll, poll);
			});
		} else {
			await Notes.insert(insert);
		}

		return await Notes.findOneOrFail(insert.id);
	} catch (e) {
		// duplicate key error
		if (isDuplicateKeyValueError(e)) {
			const err = new Error('Duplicated note');
			err.name = 'duplicated';
			throw err;
		}

		console.error(e);

		throw e;
	}
}

function index(note: Note) {
	if (note.text == null || config.elasticsearch == null) return;

	es!.index({
		index: config.elasticsearch.index || 'misskey_note',
		id: note.id.toString(),
		body: {
			text: note.text.toLowerCase(),
			userId: note.userId,
			userHost: note.userHost
		}
	});
}

function saveReply(reply: Note, note: Note) {
	Notes.increment({ id: reply.id }, 'repliesCount', 1);
}

function incNotesCountOfUser(user: User) {
	Users.increment({ id: user.id }, 'notesCount', 1);
	Users.update({ id: user.id }, {
		updatedAt: new Date()
	});
}

async function extractMentionedUsers(user: User, tokens: ReturnType<typeof parse>): Promise<User[]> {
	if (tokens == null) return [];

	const mentions = extractMentions(tokens);

	let mentionedUsers = (await Promise.all(mentions.map(m =>
		resolveUser(m.username, m.host || user.host).catch(() => null)
	))).filter(x => x != null) as User[];

	// Drop duplicate users
	mentionedUsers = mentionedUsers.filter((u, i, self) =>
		i === self.findIndex(u2 => u.id === u2.id)
	);

	return mentionedUsers;
}
