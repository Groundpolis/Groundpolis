import { IRemoteUser } from '../../../models/user';
import { ILike } from '../type';
import create from '../../../services/note/reaction/create';
import { resolveNote } from '../models/note';
import { apLogger } from '../logger';

const logger = apLogger;

export default async (actor: IRemoteUser, activity: ILike) => {
	const id = typeof activity.object == 'string' ? activity.object : activity.object.id;

	// like対象をresolve
	let note;
	try {
		note = await resolveNote(id);
	} catch (e) {
		// 対象が4xxならスキップ
		if (e.statusCode >= 400 && e.statusCode < 500) {
			logger.warn(`Ignored like target ${id} - ${e.statusCode}`);
			return;
		}
		logger.warn(`Error in like target ${id} - ${e.statusCode || e}`);
		throw e;
	}

	logger.info(`Like: ${actor.uri} => ${id}(${note._id})`);

	await create(actor, note, activity._misskey_reaction);
};
