import define from '../define';
import redis from '../../../db/redis';
import config from '../../../config';

export const meta = {
	tags: ['meta'],

	requireCredential: false as const,

	params: {
	}
};

export default define(meta, (ps, user) => {
	return new Promise((res, rej) => {
		redis.pubsub('numsub', config.host, (_, x) => {
			res({
				count: x[1]
			});
		});
	});
});
