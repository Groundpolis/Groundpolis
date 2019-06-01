import $ from 'cafy';
import define from '../../define';
import Emoji, { packXEmoji } from '../../../../models/emoji';

export const meta = {
	tags: ['emojis'],

	requireCredential: false,

	params: {
		limit: {
			validator: $.optional.num.range(1, 1000),
			default: 500
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
			md5: { $ne: null },
			updatedAt: { $gt: new Date('2000-01-01') }
		}
	}, {
		// 1インスタンス内で重複登録しているとこがあるので除外
		$group: {
			_id: {
				md5: '$md5',
				host: '$host'
			}
		}
	}, {
		$group: {
			_id: '$_id.md5',
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

	const toEmoji = async (md5: string) => {
		const emoji = await Emoji.find({
			md5
		}, {
			sort: { updatedAt: -1 },
			limit: 1,
		});

		return emoji.shift();
	};

	const emojis = await Promise.all(md5s.map(md5 => toEmoji(md5)));

	return await Promise.all(emojis.sort((a: any, b: any) => a.name > b.name ? 1 : a.name < b.name ? -1 : 0).map(emoji => packXEmoji(emoji)));
});
