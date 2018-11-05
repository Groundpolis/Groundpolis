import { IUser, isLocalUser } from '../models/user';
import fetchMeta from '../misc/fetch-meta';

export default async function(user: IUser): Promise<number> {
	const instance = await fetchMeta();

	let mb = isLocalUser(user) ? instance.localDriveCapacityMb : instance.remoteDriveCapacityMb;

	if (user != null && isLocalUser(user) && instance.localDriveCapacityFactor) {
		let age = user.createdAt != null ? Date.now() - user.createdAt.getTime() : 0;
		if (age < 0) age = 0;

		mb += (age / 1000 / 86400) * instance.localDriveCapacityFactor;
	}

	return Math.ceil(mb * 1024 * 1024);
}
