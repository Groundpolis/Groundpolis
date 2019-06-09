import * as redis from 'redis';
import config from '../config';

export default config.redis ? redis.createClient(
	config.redis.port,
	config.redis.host,
	{
		password: config.redis.pass,
		prefix: config.redis.prefix,
		db: config.redis.db || 0
	}
) : null;
