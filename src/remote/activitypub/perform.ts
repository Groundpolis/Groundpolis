import { IActivity } from './type';
import { IRemoteUser } from '../../models/user';
import { performActivity } from './kernel';

export default async (actor: IRemoteUser, activity: IActivity): Promise<void> => {
	await performActivity(actor, activity);
};
