import $ from 'cafy';
import define from '../../define';
import Emoji, { packXEmoji, IEmoji, IXEmoji } from '../../../../models/emoji';
import { toApHost } from '../../../../misc/convert-host';

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

		minInstances: {
			validator: $.optional.num.min(0),
			default: 3
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
		// 使用インスタンス数カウント
		$group: {
			_id: '$_id.md5',
			count: { $sum: 1 }
		}
	}, {
		// あまり採用インスタンスが少ないのは変なのあるので除外
		$match: {
			count: { $gt: ps.minInstances }
		}
	}, {
		// 使用インスタンスが多い順でソート
		$sort: {
			count: -1
		}
	}, {
		$skip: ps.offset
	}, {
		$limit: ps.limit
	}, {
		// join source emojis
		$lookup: {
			from: 'emoji',
			localField: '_id',	// md5
			foreignField: 'md5',
			as: 'emojis',
		}
	}]) as IRes[];

	type IRes = {
		/** MD5 */
		_id: string;
		/** Number of used instances */
		count: number;
		/** Source informations */
		emojis: IEmoji[];
	};

	type IXEmojiWithSources = IXEmoji & {
		/** Sources information */
		sources: {
			/** name */
			name: string,
			/** host (Punycode) */
			host: string
		}[]
	};

	const toTime = (date: Date) => date ? date.getTime() : 0;

	const toEmoji = async (res: IRes) => {
		// updatedAtが一番新しいインスタンスの絵文字ということにする
		const emoji = res.emojis.sort((a, b) => toTime(b.updatedAt) - toTime(a.updatedAt))[0];
		const xemoji = await packXEmoji(emoji) as IXEmojiWithSources;

		xemoji.sources = res.emojis.map(emoji => {
			return {
				name: emoji.name,
				host: toApHost(emoji.host),
			};
		});

		return xemoji;
	};

	const xemojis = await Promise.all(xs.map(x => toEmoji(x)));

	return xemojis.sort((a: any, b: any) => a.name > b.name ? 1 : a.name < b.name ? -1 : 0);
});
