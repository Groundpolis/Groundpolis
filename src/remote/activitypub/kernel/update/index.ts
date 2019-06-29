import { IRemoteUser } from '../../../../models/user';
import { IUpdate, isPerson } from '../../type';
import { apLogger } from '../../logger';
import { updateQuestion } from '../../models/question';
import Resolver from '../../resolver';
import { updatePerson } from '../../models/person';

/**
 * Updateアクティビティを捌きます
 */
export default async (actor: IRemoteUser, activity: IUpdate): Promise<void> => {
	if ('actor' in activity && actor.uri !== activity.actor) {
		throw new Error('invalid actor');
	}

	apLogger.debug('Update');

	const resolver = new Resolver();

	const object = await resolver.resolve(activity.object).catch(e => {
		apLogger.error(`Resolution failed: ${e}`);
		throw e;
	});

	if (isPerson(object)) {
		await updatePerson(actor.uri, resolver, object);
	} else if (object.type === 'Question') {
		await updateQuestion(object).catch(e => console.log(e));
	} else {
		apLogger.warn(`Unknown type: ${object.type}`);
	}
};
