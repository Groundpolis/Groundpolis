import Resolver from '../../resolver';
import { IRemoteUser } from '../../../../models/user';
import announceNote from './note';
import { IAnnounce, getApId, isNote } from '../../type';
import { apLogger } from '../../logger';

const logger = apLogger;

export default async (actor: IRemoteUser, activity: IAnnounce): Promise<void> => {
	const uri = getApId(activity);

	logger.info(`Announce: ${uri}`);

	const resolver = new Resolver();

	let object;

	try {
		object = await resolver.resolve(activity.object);
	} catch (e) {
		logger.error(`Resolution failed: ${e}`);
		throw e;
	}

	if (isNote(object)) {
		announceNote(resolver, actor, activity, object);
	} else {
		logger.warn(`Unknown announce type: ${object.type}`);
	}
};
