import $ from 'cafy';
import { ID } from '../../../../misc/cafy-id';
import define from '../../define';
import { ReportedNotes } from '../../../../models';
import { makePaginationQuery } from '../../common/make-pagination-query';

export const meta = {
	tags: ['admin'],

	requireCredential: true as const,
	requireModerator: true,

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
	}
};

export default define(meta, async (ps) => {
	const query = makePaginationQuery(ReportedNotes.createQueryBuilder('report'), ps.sinceId, ps.untilId);

	const reports = await query.take(ps.limit!).getMany();

	return await ReportedNotes.packMany(reports);
});
