import $ from 'cafy';
import define from '../../define';
import Emoji, { packXEmoji } from '../../../../models/emoji';

export const meta = {
	tags: ['emojis'],

	requireCredential: false,

	params: {
		limit: {
			validator: $.optional.num.range(1, 1000),
			default: 200
		},

		offset: {
			validator: $.optional.num.min(0),
			default: 0
		},
	},

	res: {
		type: 'array',
		items: {
			type: 'XEmoji',
		}
	},
};

export default define(meta, async (ps, me) => {
	const xs = await Emoji.aggregate([{
		$match: {
			host: { $ne: null },
			md5: { $ne: null }
		}
	}, {
		$group: {
			_id: '$md5',
			count: { $sum: 1 }
		}
	}, {
		$sort: {
			count: -1
		}
	}, {
		$skip: ps.offset
	}, {
		$limit: ps.limit
	}]) as any[];

	const md5s = xs.map(x => x._id);

	const emojis = await Promise.all(md5s.map(md5 => Emoji.findOne({
		md5
	}, {
		sort: { updatedAt: -1 }
	})));

	return await Promise.all(emojis.map(emoji => packXEmoji(emoji)));
});
