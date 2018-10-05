import $ from 'cafy';
import getParams from '../../get-params';
import config from '../../../../config';
import * as mongo from 'mongodb';
import User, { pack as packUser, IUser } from '../../../../models/user';
import { createPerson } from '../../../../remote/activitypub/models/person';
import Note, { pack as packNote, INote } from '../../../../models/note';
import { createNote } from '../../../../remote/activitypub/models/note';
import Resolver from '../../../../remote/activitypub/resolver';

export const meta = {
	desc: {
		'ja-JP': 'ActivityPubオブジェクトを参照します。'
	},

	requireCredential: false,

	params: {
		uri: $.str.note({
			desc: {
				'ja-JP': 'URI'
			}
		}),
	},
};

export default (params: any) => new Promise(async (res, rej) => {
	const [ps, psErr] = getParams(meta, params);
	if (psErr) return rej(psErr);

	const object = await fetchAny(ps.uri, true);
	if (object !== null) res(object);

	return rej('object not found');
});

async function fetchAny(uri: string, searchUrl: boolean = true) {
	// URIがこのサーバーを指しているなら、ローカルユーザーIDとしてDBからフェッチ
	if (uri.startsWith(config.url + '/')) {
		const id = new mongo.ObjectID(uri.split('/').pop());
		const [ user, note ] = await Promise.all([
			User.findOne({ _id: id }),
			Note.findOne({ _id: id })
		]);

		const packed = await mergePack(user, note);
		if (packed !== null) return packed;
	}

	// uri(AP Object id)としてDB検索
	{
		const [ user, note ] = await Promise.all([
			User.findOne({ uri: uri }),
			Note.findOne({ uri: uri })
		]);

		const packed = await mergePack(user, note);
		if (packed !== null) return packed;
	}

	// オプションによりurlからもDB検索
	if (searchUrl) {
		const [ user, note ] = await Promise.all([
			User.findOne({ url: uri }),
			null // TODO: Note.url は蓄積してないためここで取得不可
		]);

		const packed = await mergePack(user, note);
		if (packed !== null) return packed;
	}

	// リモートからフェッチ
	// /@user のような正規id以外で取得できるURLのために、一度fetchしてidに正規化する
	const resolver = new Resolver();
	const object = await resolver.resolve(uri) as any;

	if (object.type === 'Person') {
		const user = await createPerson(object.id);
		return {
			type: 'User',
			object: user
		};
	}

	if (object.type === 'Note') {
		// TODO: URIが正規idでなかった && DB上では正規idが既存だった 場合にduplicate keyでエラーになる
		const note = await createNote(object.id);
		return {
			type: 'Note',
			object: note
		};
	}

	return null;
}

async function mergePack(user: IUser, note: INote) {
	if (user !== null) {
		return {
			type: 'User',
			object: await packUser(user, null, { detail: true })
		};
	}

	if (note !== null) {
		return {
			type: 'Note',
			object: await packNote(note, null, { detail: true })
		};
	}

	return null;
}
