import $ from 'cafy';
import * as escapeRegexp from 'escape-regexp';
import User, { pack, validateUsername, IUser } from '../../../../models/user';
import define from '../../define';
import { toDbHost } from '../../../../misc/convert-host';

export const meta = {
	desc: {
		'ja-JP': 'ユーザーを検索します。'
	},

	tags: ['users'],

	requireCredential: false,

	params: {
		query: {
			validator: $.str,
			desc: {
				'ja-JP': 'クエリ'
			}
		},

		offset: {
			validator: $.optional.num.min(0),
			default: 0,
			desc: {
				'ja-JP': 'オフセット'
			}
		},

		limit: {
			validator: $.optional.num.range(1, 100),
			default: 10,
			desc: {
				'ja-JP': '取得する数'
			}
		},

		localOnly: {
			validator: $.optional.bool,
			default: false,
			desc: {
				'ja-JP': 'ローカルユーザーのみ検索対象にするか否か'
			}
		},

		detail: {
			validator: $.optional.bool,
			default: true,
			desc: {
				'ja-JP': '詳細なユーザー情報を含めるか否か'
			}
		},
	},

	res: {
		type: 'array',
		items: {
			type: 'User',
		}
	},
};

export default define(meta, async (ps, me) => {
	const isName = ps.query.replace('@', '').match(/^[\W-]/) != null;
	const isUsername = validateUsername(ps.query.replace('@', ''), !ps.localOnly);
	const isHostname = ps.query.replace('@', '').match(/\./) != null;

	let users: IUser[] = [];

	if (isName) {
		const name = ps.query.replace(/^-/, '');

		users = await User
			.find({
				host: null,
				name: new RegExp('^' + escapeRegexp(name), 'i'),
				isSuspended: { $ne: true }
			}, {
				limit: ps.limit,
				skip: ps.offset
			});

		if (users.length < ps.limit && !ps.localOnly) {
			const otherUsers = await User
				.find({
					host: { $ne: null },
					name: new RegExp('^' + escapeRegexp(name), 'i'),
					isSuspended: { $ne: true }
				}, {
					limit: ps.limit - users.length
				});

			users = users.concat(otherUsers);
		}
	} else if (isUsername) {
		if (users.length < ps.limit && !ps.localOnly) {
			users = await User
				.find({
						usernameLower: ps.query.replace('@', '').toLowerCase(),
						isSuspended: { $ne: true }
					}, {
						limit: ps.limit - users.length,
						skip: ps.offset,
						sort: { updatedAt: -1 },
					});
		}

		const ids = users.map(user => user._id);

		if (users.length < ps.limit) {
			const otherUsers = await User
				.find({
					_id: { $nin: ids },
					host: null,
					usernameLower: new RegExp('^' + escapeRegexp(ps.query.replace('@', '').toLowerCase())),
					isSuspended: { $ne: true }
				}, {
					limit: ps.limit - users.length,
					skip: ps.offset
				});

				users = users.concat(otherUsers);
			}

		if (users.length < ps.limit && !ps.localOnly) {
			const otherUsers = await User
				.find({
					_id: { $nin: ids },
					host: { $ne: null },
					usernameLower: new RegExp('^' + escapeRegexp(ps.query.replace('@', '').toLowerCase())),
					isSuspended: { $ne: true }
				}, {
					limit: ps.limit - users.length,
					skip: ps.offset
				});

			users = users.concat(otherUsers);
		}
	} else if (isHostname) {
		users = await User
		.find({
			host: toDbHost(ps.query.replace('@', '')),
			isSuspended: { $ne: true }
		}, {
			limit: ps.limit - users.length
		});
	}

	return await Promise.all(users.map(user => pack(user, me, { detail: ps.detail })));
});
