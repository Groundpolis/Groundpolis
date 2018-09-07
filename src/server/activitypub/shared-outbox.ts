import * as Router from 'koa-router';
import config from '../../config';
import $ from 'cafy'; import ID from '../../misc/cafy-id';
import pack from '../../remote/activitypub/renderer';
import renderOrderedCollection from '../../remote/activitypub/renderer/ordered-collection';
import renderOrderedCollectionPage from '../../remote/activitypub/renderer/ordered-collection-page';
import { setResponseType } from '../activitypub';
import { packActivity } from './outbox';
import Note from '../../models/note';
import { countIf } from '../../prelude/array';
import Meta from '../../models/meta';

export default async (ctx: Router.IRouterContext) => {
	// Get 'sinceId' parameter
	const [sinceId, sinceIdErr] = $.type(ID).optional.get(ctx.request.query.since_id);

	// Get 'untilId' parameter
	const [untilId, untilIdErr] = $.type(ID).optional.get(ctx.request.query.until_id);

	// Get 'page' parameter
	const pageErr = !$.str.optional.or(['true', 'false']).ok(ctx.request.query.page);
	const page: boolean = ctx.request.query.page === 'true';

	// Validate parameters
	if (sinceIdErr || untilIdErr || pageErr || countIf(x => x != null, [sinceId, untilId]) > 1) {
		ctx.status = 400;
		return;
	}

	const limit = 20;
	const partOf = `${config.url}/outbox`;

	const meta = await Meta.findOne();
	const count = meta ? meta.stats.originalNotesCount : 0;

	if (page) {
		//#region Construct query
		const sort = {
			_id: -1
		};

		const query = {
			'_user.host': null,
			$or: [ { visibility: 'public' }, { visibility: 'home' } ]
		} as any;

		if (sinceId) {
			sort._id = 1;
			query._id = {
				$gt: sinceId
			};
		} else if (untilId) {
			query._id = {
				$lt: untilId
			};
		}
		//#endregion

		// Issue query
		const notes = await Note
			.find(query, {
				limit: limit,
				sort: sort
			});

		if (sinceId) notes.reverse();

		const activities = await Promise.all(notes.map(note => packActivity(note)));
		const rendered = renderOrderedCollectionPage(
			`${partOf}?page=true${sinceId ? `&since_id=${sinceId}` : ''}${untilId ? `&until_id=${untilId}` : ''}`,
			count, activities, partOf,
			notes.length > 0 ? `${partOf}?page=true&since_id=${notes[0]._id}` : null,
			notes.length > 0 ? `${partOf}?page=true&until_id=${notes[notes.length - 1]._id}` : null
		);

		ctx.body = pack(rendered);
		setResponseType(ctx);
	} else {
		// index page
		const rendered = renderOrderedCollection(partOf, count,
			`${partOf}?page=true`,
			`${partOf}?page=true&since_id=000000000000000000000000`
		);
		ctx.body = pack(rendered);
		setResponseType(ctx);
	}
};
