import Resolver from '../../resolver';
import { IRemoteUser } from '../../../../models/user';
import { createNote, fetchNote } from '../../models/note';
import { getApLock } from '../../../../misc/app-lock';

/**
 * 投稿作成アクティビティを捌きます
 */
export default async function(resolver: Resolver, actor: IRemoteUser, note: any, silent = false): Promise<void> {
	const uri = note.id || note;

	const unlock = await getApLock(uri);

	try {
		const exist = await fetchNote(note);
		if (exist == null) {
			await createNote(note);
		}
	} finally {
		unlock();
	}
}
