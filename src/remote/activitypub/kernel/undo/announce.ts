import * as mongo from 'mongodb';
import config from '../../../../config';
import { IRemoteUser } from '../../../../models/user';
import { IAnnounce } from '../../type';
import deleteNote from '../../../../services/note/delete';
import Note, { INote } from '../../../../models/note';

export const undoAnnounce = async (actor: IRemoteUser, activity: IAnnounce): Promise<void> => {
	const targetUri = typeof activity.object == 'string' ? activity.object : activity.object.id;

	let note: INote;

	if (targetUri.startsWith(config.url + '/')) {
		// 対象がローカルの場合
		const id = new mongo.ObjectID(targetUri.split('/').pop());
		note = await Note.findOne({
			userId: actor._id,
			renoteId: id,
			deletedAt: { $exists: false }
		});

		if (!note) {
			return null;
		}
	} else {
		// 対象がリモートの場合
		const targetNote = await Note.findOne({
			uri: targetUri
		});

		if (!targetNote) {
			return null;
		}

		note = await Note.findOne({
			userId: actor._id,
			renoteId: targetNote._id,
			deletedAt: { $exists: false }
		});

		if (!note) {
			return null;
		}
	}

	await deleteNote(actor, note);
};
