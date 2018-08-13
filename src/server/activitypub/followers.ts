import * as mongo from 'mongodb';
import * as Koa from 'koa';
import config from '../../config';
import User from '../../models/user';
import Following from '../../models/following';
import pack from '../../remote/activitypub/renderer';
import renderOrderedCollection from '../../remote/activitypub/renderer/ordered-collection';
import renderOrderedCollectionPage from '../../remote/activitypub/renderer/ordered-collection-page';
import renderFollowing from '../../remote/activitypub/renderer/following';

export default async (ctx: Koa.Context) => {
	const userId = new mongo.ObjectID(ctx.params.user);

	// Get querystring
	const page = ctx.request.query.page == null ? 0 : Number(ctx.request.query.page) > 0 ? Number(ctx.request.query.page) : -2;

	if (page < 0) {
		ctx.status = 400;
		return;
	}

	// Verify user
	const user = await User.findOne({
		_id: userId,
		host: null
	});

	if (user === null) {
		ctx.status = 404;
		return;
	}

	// Construct query
	const query = {
		followeeId: user._id
	} as any;

	const limit = 10;
	const partOf = `${config.url}/users/${userId}/followers`;

	if (page > 0) {
		// Get followers
		const followings = await Following
			.find(query, {
				limit: limit + 1,
				sort: { _id: -1 },
				skip: (page - 1) * limit
			});

		// 「次のページ」があるかどうか
		const inStock = followings.length === limit + 1;
		if (inStock) followings.pop();

		const renderedFollowers = await Promise.all(followings.map(following => renderFollowing(following.followerId)));
		const rendered = renderOrderedCollectionPage(`${partOf}?page=${page}`, user.followersCount, renderedFollowers, partOf,
			page > 1 ? `${partOf}?page=${page - 1}` : null,
			inStock  ? `${partOf}?page=${page + 1}` : null
		);

		ctx.body = pack(rendered);
	} else {
		// index page
		const rendered = renderOrderedCollection(partOf, user.followersCount, `${partOf}?page=1`, null);
		ctx.body = pack(rendered);
	}
};
