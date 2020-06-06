import $ from 'cafy';
import define from '../../../define';
import * as ms from 'ms';
import { ID } from '../../../../../misc/cafy-id';
import { DriveFiles, Emojis, EmojiRequests } from '../../../../../models';
import { ApiError } from '../../../error';
import { genId } from '../../../../../misc/gen-id';

export const meta = {
	desc: {
		'ja-JP': '絵文字の提案を作成します。'
	},

	tags: ['suggestions'],

	requireCredential: true as const,

	limit: {
		duration: ms('30min'),
		max: 10
	},

	params: {
		fileId: {
			validator: $.type(ID),
		},
		name: {
			validator: $.str,
		},
		aliases: {
			validator: $.arr($.str),
		},
		description: {
			validator: $.str
		},
	},

	errors: {
		noSuchFile: {
			message: 'No such file.',
			code: 'NO_SUCH_FILE',
			id: 'e9f3e270-a7c2-11ea-8619-ebae3e00218c'
		},
		notImage: {
			message: 'The specified file is not an image.',
			code: 'NOT_IMAGE',
			id: 'e0a20fc0-a7c3-11ea-83f1-47ad21540613'
		},
		alreadyExists: {
			message: 'The name is already exists.',
			code: 'ALREADY_EXISTS',
			id: '5c6ae780-a7c4-11ea-9cce-594df8f0a075'
		},
	}
};

export default define(meta, async (ps, user) => {
	const file = await DriveFiles.findOne(ps.fileId);

	if (file == null) throw new ApiError(meta.errors.noSuchFile);
	if (!file.type.startsWith('image')) throw new ApiError(meta.errors.notImage);

	// 既に存在している名前であればエラー
	if (await Emojis.findOne({ name: ps.name, host: null })) throw new ApiError(meta.errors.alreadyExists);

	await EmojiRequests.insert({
		id: genId(),
		createdAt: new Date(),
		name: ps.name,
		aliases: ps.aliases,
		fileId: ps.fileId,
		description: ps.description,
		proposerId: user.id,
	});
});
