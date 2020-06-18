import $ from 'cafy';
import * as ms from 'ms';
import { length } from 'stringz';
import create from '../../../../services/note/create';
import define from '../../define';
import { fetchMeta } from '../../../../misc/fetch-meta';
import { ApiError } from '../../error';
import { ID } from '../../../../misc/cafy-id';
import { DriveFiles, Notes } from '../../../../models';
import { DriveFile } from '../../../../models/entities/drive-file';
import { DB_MAX_NOTE_TEXT_LENGTH } from '../../../../misc/hard-limits';

let maxNoteTextLength = 500;

setInterval(() => {
	fetchMeta().then(m => {
		maxNoteTextLength = m.maxNoteTextLength;
	});
}, 3000);

export const meta = {
	desc: {
		'ja-JP': '投稿します。'
	},

	tags: ['notes'],

	requireCredential: true as const,

	limit: {
		duration: ms('1hour'),
		max: 300
	},

	kind: 'write:notes',

	params: {
		text: {
			validator: $.optional.nullable.str.pipe(text =>
				text.trim() != ''
					&& length(text.trim()) <= maxNoteTextLength
					&& Array.from(text.trim()).length <= DB_MAX_NOTE_TEXT_LENGTH	// DB limit
			),
			default: null as any,
			desc: {
				'ja-JP': '投稿内容'
			}
		},

		cw: {
			validator: $.optional.nullable.str.pipe(Notes.validateCw),
			desc: {
				'ja-JP': 'コンテンツの警告。このパラメータを指定すると設定したテキストで投稿のコンテンツを隠す事が出来ます。'
			}
		},

		announcement: {
			validator: $.optional.nullable.boolean,
		},

		viaMobile: {
			validator: $.optional.bool,
			default: false,
			desc: {
				'ja-JP': 'モバイルデバイスからの投稿か否か。'
			}
		},

		noExtractMentions: {
			validator: $.optional.bool,
			default: false,
			desc: {
				'ja-JP': '本文からメンションを展開しないか否か。'
			}
		},

		noExtractHashtags: {
			validator: $.optional.bool,
			default: false,
			desc: {
				'ja-JP': '本文からハッシュタグを展開しないか否か。'
			}
		},

		noExtractEmojis: {
			validator: $.optional.bool,
			default: false,
			desc: {
				'ja-JP': '本文からカスタム絵文字を展開しないか否か。'
			}
		},

		fileIds: {
			validator: $.optional.arr($.type(ID)).unique().range(1, 4),
			desc: {
				'ja-JP': '添付するファイル'
			}
		},

		mediaIds: {
			validator: $.optional.arr($.type(ID)).unique().range(1, 4),
			deprecated: true,
			desc: {
				'ja-JP': '添付するファイル (このパラメータは廃止予定です。代わりに fileIds を使ってください。)'
			}
		},
	},

	res: {
		type: 'object' as const,
		optional: false as const, nullable: false as const,
		properties: {
			createdNote: {
				type: 'object' as const,
				optional: false as const, nullable: false as const,
				ref: 'Note',
				description: '作成した投稿'
			}
		}
	},

	errors: {
		contentRequired: {
			message: 'Content required. You need to set text or fileIds.',
			code: 'CONTENT_REQUIRED',
			id: '6f57e42b-c348-439b-bc45-993995cc515a'
		},

		notModerator: {
			message: 'Access denied.',
			code: 'ACCESS_DENIED',
			id: '56f35758-7dd5-468b-8439-5d6fb8ec9b8e',
			reason: 'You are not a moderator.'
		},
	}
};

export default define(meta, async (ps, user) => {
	let files: DriveFile[] = [];
	const fileIds = ps.fileIds != null ? ps.fileIds : ps.mediaIds != null ? ps.mediaIds : null;
	if (fileIds != null) {
		files = (await Promise.all(fileIds.map(fileId =>
			DriveFiles.findOne({
				id: fileId,
				userId: user.id
			})
		))).filter(file => file != null) as DriveFile[];
	}

	// テキストが無いかつ添付ファイルが無かったらエラー
	if (!(ps.text || files.length)) {
		throw new ApiError(meta.errors.contentRequired);
	}

	if (ps.announcement && !user.isAdmin && !user.isModerator) {
		throw new ApiError(meta.errors.notModerator);
	}

	// 投稿を作成
	const note = await create(user, {
		createdAt: new Date(),
		files: files,
		text: ps.text || undefined,
		cw: ps.cw,
		viaMobile: ps.viaMobile,
		isAnnouncement: ps.announcement,
	});

	return {
		createdNote: await Notes.pack(note, user)
	};
});
