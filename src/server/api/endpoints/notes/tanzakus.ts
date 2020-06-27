import $ from 'cafy';
import { ID } from '../../../../misc/cafy-id';
import define from '../../define';
import { fetchMeta } from '../../../../misc/fetch-meta';
import { ApiError } from '../../error';
import { Notes } from '../../../../models';
import { generateMuteQuery } from '../../common/generate-mute-query';
import { makePaginationQuery } from '../../common/make-pagination-query';
import { generateVisibilityQuery } from '../../common/generate-visibility-query';
import { activeUsersChart } from '../../../../services/chart';
import { Brackets } from 'typeorm';
import { generateRepliesQuery } from '../../common/generate-replies-query';
import { injectPromo } from '../../common/inject-promo';
import { injectFeatured } from '../../common/inject-featured';

export const meta = {
	desc: {
		'ja-JP': '短冊を取得します。'
	},

	tags: ['notes'],

	params: {
		limit: {
			validator: $.optional.num.range(1, 100),
			default: 10
		},

		sinceId: {
			validator: $.optional.type(ID),
		},

		untilId: {
			validator: $.optional.type(ID),
		},

		sinceDate: {
			validator: $.optional.num,
		},

		untilDate: {
			validator: $.optional.num,
		},
	},

	res: {
		type: 'array' as const,
		optional: false as const, nullable: false as const,
		items: {
			type: 'object' as const,
			optional: false as const, nullable: false as const,
			ref: 'Note',
		}
	},
};

export default define(meta, async (ps, user) => {
	//#region Construct query
	const query = makePaginationQuery(Notes.createQueryBuilder('note'),
			ps.sinceId, ps.untilId, ps.sinceDate, ps.untilDate)
		.leftJoinAndSelect('note.user', 'user');

	// TODO 年を指定できるようにする
	query.andWhere('note."tanabataYear" = :year', { year: new Date().getFullYear() });

	if (user) {
		query.andWhere('note.userId != :userId', { userId: user.id });
	}

	//#endregion

	const timeline = await query.take(ps.limit!).getMany();

	process.nextTick(() => {
		if (user) {
			activeUsersChart.update(user);
		}
	});

	return await Notes.packMany(timeline, user);
});
