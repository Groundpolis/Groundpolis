import $ from 'cafy';
import define from '../../define';
import { Notes } from '../../../../models';
import { ApiError } from '../../error';
import { tanzakuColors } from '../../../../types';

export const meta = {
	desc: {
		'ja-JP': '自分の短冊を編集します。',
		'en-US': 'Edit my tanzaku.'
	},

	tags: ['notes'],

	requireCredential: true as const,

	params: {
		tanzakuColor: {
			validator: $.str.or(tanzakuColors as unknown as string[]),
		},
	},

	errors: {
		noSuchTanzaku: {
			message: 'You have no owned tanzaku.',
			code: 'NO_SUCH_TANZAKU',
			id: 'b5c90186-4ab0-49c8-9bba-a1f76c282ba4'
		},
	}
};

export default define(meta, async (ps, user) => {
	const tanzaku = await Notes.findOne({
		userId: user.id,
		tanabataYear: new Date().getFullYear(),
	});

	if (!tanzaku) throw new ApiError(meta.errors.noSuchTanzaku);

	await Notes.update(tanzaku.id, {
		tanzakuColor: ps.tanzakuColor as typeof tanzakuColors[number],
	});
});
