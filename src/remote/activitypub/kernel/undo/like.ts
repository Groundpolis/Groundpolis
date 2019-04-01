import { IRemoteUser } from '../../../../models/user';
import { ILike } from '../../type';
import deleteReaction from '../../../../services/note/reaction/delete';
import { resolveNote } from '../../models/note';
import { apLogger } from '../../logger';

const logger = apLogger;

/**
 * Process Undo.Like activity
 */
export default async (actor: IRemoteUser, activity: ILike): Promise<void> => {
	const id = typeof activity.object == 'string' ? activity.object : activity.object.id;

	// undo like対象をresolve
	let note;
	try {
		note = await resolveNote(id);
	} catch (e) {
		// Undo対象がresolveできなければスキップ
		return;
	}

	logger.info(`Undo Like: ${actor.uri} => ${id}(${note._id})`);

	await deleteReaction(actor, note);
};
