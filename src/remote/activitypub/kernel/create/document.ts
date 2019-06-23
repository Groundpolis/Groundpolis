import { IRemoteUser } from '../../../../models/user';
import { IObject, getApId } from '../../type';
import { getApLock } from '../../../../misc/app-lock';
import { fetchNote } from '../../models/note';
import { createPureDocument } from '../../models/document';

export async function performCreateDocument(actor: IRemoteUser, document: IObject): Promise<void> {
	const uri = getApId(document);

	const unlock = await getApLock(uri);

	try {
		const exist = await fetchNote(document);
		if (exist == null) {
			await createPureDocument(document);
		}
	} finally {
		unlock();
	}
}
