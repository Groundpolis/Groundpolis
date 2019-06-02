import $ from 'cafy';
import define from '../define';
import { fallback } from '../../../prelude/symbol';
import Emoji, { packXEmoji } from '../../../models/emoji';

const nonnull = { $ne: null as any };

export const meta = {
	tags: ['emojis'],

	requireCredential: false,

	params: {
		limit: {
			validator: $.optional.num.range(1, 5000),
			default: 500
		},

		offset: {
			validator: $.optional.num.min(0),
			default: 0
		},

		sort: {
			validator: $.optional.str.or([
				'+name',
				'-name',
				'+updatedAt',
				'-updatedAt',
			]),
		},

		origin: {
			validator: $.optional.str.or([
				'combined',
				'local',
				'remote',
			]),
			default: 'local'
		}
	},

	res: {
		type: 'array',
		items: {
			type: 'XEmoji',
		}
	},
};

const origin: any = { // < https://github.com/Microsoft/TypeScript/issues/1863
	'local': { host: null },
	'remote': { host: nonnull },
	[fallback]: {}
};

const sort: any = { // < https://github.com/Microsoft/TypeScript/issues/1863
	'+name': { name: -1 },
	'-name': { name: 1 },
	'+updatedAt': { updatedAt: -1 },
	'-updatedAt': { updatedAt: 1 },
	[fallback]: { _id: -1 }
};

export default define(meta, async (ps, me) => {

	const emojis = await Emoji
		.find({
			$and: [
				origin[ps.origin] || origin[fallback]
			],
		}, {
			limit: ps.limit,
			sort: sort[ps.sort] || sort[fallback],
			skip: ps.offset
		});

	return await Promise.all(emojis.map(emoji => packXEmoji(emoji)));
});
