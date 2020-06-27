import define from '../../define';
import { Notes } from '../../../../models';

export const meta = {
	desc: {
		'ja-JP': '自分の短冊を取得します。',
		'en-US': 'Get my tanzaku.'
	},

	tags: ['notes'],

	requireCredential: true as const,

	res: {
		type: 'object' as const,
		optional: false as const, nullable: false as const,
		ref: 'Note',
	},
};

export default define(meta, async (ps, user) => {
	const tanzaku = await Notes.findOne({
		userId: user.id,
		tanabataYear: new Date().getFullYear(),
	});

	return tanzaku ? await Notes.pack(tanzaku, user, {
		detail: true
	}) : {};
});
