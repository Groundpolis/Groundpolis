import config from '../../../config';
import * as mongo from 'mongodb';
import User, { isLocalUser } from '../../../models/user';

export default async function renderFollowing(followingId: mongo.ObjectID): Promise<any> {

	const user = await User.findOne({
		_id: followingId
	});

	return isLocalUser(user) ? `${config.url}/users/${user._id}` : user.uri;
}
