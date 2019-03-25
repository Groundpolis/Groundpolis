import $ from 'cafy';
import * as mongo from 'mongodb';
import Note from '../../../../models/note';
import { packMany } from '../../../../models/note';
import es from '../../../../db/elasticsearch';
import define from '../../define';
import { ApiError } from '../../error';
import User, { IUser, ILocalUser } from '../../../../models/user';
import { toDbHost } from '../../../../misc/convert-host';
import Following from '../../../../models/following';
const escapeRegexp = require('escape-regexp');

export const meta = {
	desc: {
		'ja-JP': '投稿を検索します。',
		'en-US': 'Search notes.'
	},

	tags: ['notes'],

	requireCredential: false,

	params: {
		query: {
			validator: $.str
		},

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
			type: 'Note',
		},
	},

	errors: {
		searchingNotAvailable: {
			message: 'Searching not available.',
			code: 'SEARCHING_NOT_AVAILABLE',
			id: '7ee9c119-16a1-479f-a6fd-6fab00ed946f'
		}
	}
};

export default define(meta, async (ps, me) => {
	const internal = await searchInternal(me, ps.query, ps.limit, ps.offset).catch(e => console.log(e));
	if (internal !== null) return internal;

	if (es == null) throw new ApiError(meta.errors.searchingNotAvailable);

	const response = await es.search({
		index: 'misskey',
		type: 'note',
		body: {
			size: ps.limit,
			from: ps.offset,
			query: {
				simple_query_string: {
					fields: ['text'],
					query: ps.query,
					default_operator: 'and'
				}
			},
			sort: [
				{ _doc: 'desc' }
			]
		}
	});

	if (response.hits.total === 0) {
		return [];
	}

	const hits = response.hits.hits.map(hit => new mongo.ObjectID(hit._id));

	// Fetch found notes
	const notes = await Note.find({
		_id: {
			$in: hits
		}
	}, {
		sort: {
			_id: -1
		}
	});

	return await packMany(notes, me);
});

async function searchInternal(me: ILocalUser, query: string, limit: number, offset: number) {
	// extract tokens
	const tokens = query.trim().split(/\s+/);
	const words: string[] = [];
	let from: IUser = null;

	for (const token of tokens) {
		// from
		const matchFrom = token.match(/^from:@?([\w-]+)(?:@([\w.-]+))?$/);
		if (matchFrom) {
			const user = await User.findOne({
				usernameLower: matchFrom[1].toLowerCase(),
				host: toDbHost(matchFrom[2]),
			});

			if (user == null) return [];	// fromが存在しないユーザーならno match
			from = user;
			continue;
		}

		words.push(token);
	}

	if (from == null) return null;	// fromが指定されてなかったら検索させない

	// constract query
	const isFollowing = me == null ? false : ((await Following.findOne({
		followerId: me._id,
		followeeId: from._id
	})) != null);

	const visibleQuery = me == null ? [{
		visibility: { $in: ['public', 'home'] }
	}] : [{
		visibility: {
			$in: isFollowing ? ['public', 'home', 'followers'] : ['public', 'home']
		}
	}, {
		// myself (for specified/private)
		userId: me._id
	}, {
		// to me (for specified)
		visibleUserIds: { $in: [ me._id ] }
	}];

	const noteQuery = {
		$and: [ {} ],
		deletedAt: null,
		userId: from._id,
		$or: visibleQuery
	} as any;

	for (const word of words) {
		noteQuery.$and.push({
			text: new RegExp(escapeRegexp(word))
		});
	}

	// console.log(JSON.stringify(noteQuery, null, 2));

	const notes = await Note.find(noteQuery, {
		limit,
		skip: offset,
	});

	return await packMany(notes, me);
}
