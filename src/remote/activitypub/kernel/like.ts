import * as mongo from 'mongodb';
import Note from '../../../models/note';
import { IRemoteUser } from '../../../models/user';
import { ILike } from '../type';
import create from '../../../services/note/reaction/create';
import { isSelfHost, extractApHost } from '../../../misc/convert-host';
import { apLogger } from '../logger';

export default async (actor: IRemoteUser, activity: ILike) => {
	const id = typeof activity.object == 'string' ? activity.object : activity.object.id;

	if (!isSelfHost(extractApHost(id))) {
		apLogger.warn(`skip Like to foreign host (${id})`);
		return;
	}

	// Transform:
	// https://misskey.ex/notes/xxxx to
	// xxxx
	const noteId = new mongo.ObjectID(id.split('/').pop());

	const note = await Note.findOne({ _id: noteId });
	if (note === null) {
		throw new Error();
	}

	await create(actor, note, activity._misskey_reaction);
};
