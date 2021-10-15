import { User } from '../../../models/entities/user';
import { Followings } from '../../../models';
import { Brackets, SelectQueryBuilder } from 'typeorm';

export function generateVisibilityQuery(q: SelectQueryBuilder<any>, me?: User | null) {
	if (me == null) {
		q.andWhere(new Brackets(qb => { qb
			.where(`note.visibility = 'public'`)
			.orWhere(`note.visibility = 'home'`);
		}));
	} else {
		const followingQuery = Followings.createQueryBuilder('following')
			.select('following.followeeId')
			.where('following.followerId = :followerId', { followerId: me.id });

		q.andWhere(new Brackets(qb => { qb
			// 公開投稿である
			.where(new Brackets(qb => { qb
				.where(`note.visibility = 'public'`)
				.orWhere(`note.visibility = 'home'`)
				.orWhere(`note.visibility = 'users'`);
			}))
			// または 自分自身
			.orWhere('note.userId = :userId1', { userId1: me.id })
			// または 自分宛て
			.orWhere(`'{"${me.id}"}' <@ note.visibleUserIds`)
			.orWhere(new Brackets(qb => { qb
				// または フォロワー宛ての投稿であり、
				.where('note.visibility = \'followers\'')
				.andWhere(new Brackets(qb => { qb
					// 自分がフォロワーである
					.where(`note.userId IN (${ followingQuery.getQuery() })`)
					// または 自分の投稿へのリプライ
					.orWhere('note.replyUserId = :userId3', { userId3: me.id });
				}));
			}));
		}));

		q.setParameters(followingQuery.getParameters());
	}
}
