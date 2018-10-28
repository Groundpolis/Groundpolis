import config from '../config';
import { IUser, isLocalUser } from '../models/user';

export default function(user: IUser): number {
	let mb = isLocalUser(user) ? config.localDriveCapacityMb : config.remoteDriveCapacityMb;

	if (user != null && isLocalUser(user) && config.localDriveCapacityFactor) {
		let age = user.createdAt != null ? Date.now() - user.createdAt.getTime() : 0;
		if (age < 0) age = 0;

		mb += (age / 1000 / 86400) * config.localDriveCapacityFactor;
	}

	return Math.ceil(mb * 1024 * 1024);
}
