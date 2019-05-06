import Resolver from '../../resolver';
import { IRemoteUser } from '../../../../models/user';
import { createNote, fetchNote } from '../../models/note';
import redis from '../../../../db/redis';
import { promisify } from 'util';

const lock = promisify(require('redis-lock')(redis));

/**
 * 投稿作成アクティビティを捌きます
 */
export default async function(resolver: Resolver, actor: IRemoteUser, note: any, silent = false): Promise<void> {
	const uri = note.id || note;
	const key = `AP-Create:${uri}`;

	const unlock = await lock(key, 30 * 1000);

	try {
		const exist = await fetchNote(note);
		if (exist == null) {
			await createNote(note);
		}
	} finally {
		unlock();
	}
}
