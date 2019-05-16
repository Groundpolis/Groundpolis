import $ from 'cafy';
import { pack, ILocalUser } from '../../../../models/user';
import * as request from 'request-promise-native';
import config from '../../../../config';
import define from '../../define';
import fetchMeta from '../../../../misc/fetch-meta';
import resolveUser from '../../../../remote/resolve-user';
import { getHideUserIds } from '../../common/get-hide-users';
import { apiLogger } from '../../logger';
import Following from '../../../../models/following';

export const meta = {
	desc: {
		'ja-JP': 'おすすめのユーザー一覧を取得します。'
	},

	tags: ['users'],

	requireCredential: false,

	kind: 'account-read',

	params: {
		limit: {
			validator: $.optional.num.range(1, 100),
			default: 10
		},

		offset: {
			validator: $.optional.num.min(0),
			default: 0
		}
	},

	res: {
		type: 'array',
		items: {
			type: 'User',
		}
	},
};

export default define(meta, async (ps, me) => {
	const instance = await fetchMeta();

	if (instance.enableExternalUserRecommendation && me != null) {
		const userName = me.username;
		const hostName = config.hostname;
		const limit = ps.limit;
		const offset = ps.offset;
		const timeout = instance.externalUserRecommendationTimeout;
		const engine = instance.externalUserRecommendationEngine;
		const url = engine
			.replace('{{host}}', hostName)
			.replace('{{user}}', userName)
			.replace('{{limit}}', limit.toString())
			.replace('{{offset}}', offset.toString());

		const users = await request({
			url: url,
			proxy: config.proxy,
			timeout: timeout,
			forever: true,
			json: true,
			followRedirect: true,
			followAllRedirects: true
		})
		.then(body => convertUsers(body, me));

		return users;
	} else {
		// 隠すユーザーを取得
		const hideUserIds = await getHideUserIds(me);

		if (me != null) {
			// 自分のローカルフォロー
			const myFollowings = await Following.find({
				followerId: me._id
			});

			const followingIds = myFollowings.map(f => f.followeeId);

			const localIds = myFollowings.filter(f => f._followee.host == null).map(f => f.followeeId);

			// ローカルフォロワーのフォロー数
			const followings = await Following.aggregate([{
				$match: {
					followerId: { $in: localIds },
					followeeId: { $nin: followingIds.concat(hideUserIds) },
				}
			}, {
				$group: {
					_id: '$followeeId',
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

			if (followings.length >= ps.limit)
				return await Promise.all(followings.map(f => pack(f._id, me, { detail: true })));
		}

		// ローカルからのフォロー数
		const followings = await Following.aggregate([{
			$match: {
				followeeId: { $nin: hideUserIds },
			}
		}, {
			$group: {
				_id: '$followeeId',
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

		return await Promise.all(followings.map(f => pack(f._id, me, { detail: true })));
	}
});

type IRecommendUser = {
	name: string;
	username: string;
	host: string;
	description: string;
	avatarUrl: string;
};

/**
 * Resolve/Pack dummy users
 */
async function convertUsers(src: IRecommendUser[], me: ILocalUser) {
	const packed = await Promise.all(src.map(async x => {
		const user = await resolveUser(x.username, x.host)
			.catch(() => {
				apiLogger.warn(`Can't resolve ${x.username}@${x.host}`);
				return null;
			});

		if (user == null) return x;

		return await pack(user, me, { detail: true });
	}));

	return packed;
}
