import config from '../config';
import { remoteLogger } from './logger';
import { User } from '../models/entities/user';
import { Users } from '../models';
import { toPuny } from '../misc/convert-host';

const logger = remoteLogger.createSubLogger('resolve-user');

export async function resolveUser(username: string, host: string | null, option?: any, resync = false): Promise<User> {
	const usernameLower = username.toLowerCase();

	if (host == null) {
		logger.info(`return local user: ${usernameLower}`);
		return await Users.findOne({ usernameLower, host: null }).then(u => {
			if (u == null) {
				throw new Error('user not found');
			} else {
				return u;
			}
		});
	}

	host = toPuny(host);

	if (config.host == host) {
		logger.info(`return local user: ${usernameLower}`);
		return await Users.findOne({ usernameLower, host: null }).then(u => {
			if (u == null) {
				throw new Error('user not found');
			} else {
				return u;
			}
		});
	}
	logger.error('resolving remote user is not available on Hitorisskey');
	throw new Error('user not found');
}
