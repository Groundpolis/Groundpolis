import Resolver from '../../resolver';
import post from '../../../../services/note/create';
import { IRemoteUser, IUser } from '../../../../models/user';
import { IAnnounce, IApNote, getApId, getApIds } from '../../type';
import { fetchNote, resolveNote } from '../../models/note';
import { resolvePerson } from '../../models/person';
import { apLogger } from '../../logger';
import { extractDbHost } from '../../../../misc/convert-host';
import Instance from '../../../../models/instance';
import { getApLock } from '../../../../misc/app-lock';

const logger = apLogger;

/**
 * アナウンスアクティビティを捌きます
 */
export default async function(resolver: Resolver, actor: IRemoteUser, activity: IAnnounce, note: IApNote): Promise<void> {
	const uri = getApId(activity);

	// アナウンサーが凍結されていたらスキップ
	if (actor.isSuspended) {
		return;
	}

	// アナウンス先をブロックしてたら中断
	// TODO: いちいちデータベースにアクセスするのはコスト高そうなのでどっかにキャッシュしておく
	const instance = await Instance.findOne({ host: extractDbHost(uri) });
	if (instance && instance.isBlocked) return;

	const unlock = await getApLock(uri);

	try {
		// 既に同じURIを持つものが登録されていないかチェック
		const exist = await fetchNote(uri);
		if (exist) {
			return;
		}

		// Announce対象をresolve
		let renote;
		try {
			renote = await resolveNote(note);
		} catch (e) {
			// 対象が4xxならスキップ
			if (e.statusCode >= 400 && e.statusCode < 500) {
				logger.warn(`Ignored announce target: ${uri} => ${note.id || note} - ${e.statusCode}`);
				return;
			}
			logger.warn(`Error in announce target: ${uri} => ${note.id || note} - ${e.statusCode || e}`);
			throw e;
		}

		// skip unavailable
		if (renote == null) {
			logger.warn(`announce target is null: ${uri} => ${note.id || note}`);
			throw new Error(`announce target is null: ${uri} => ${note.id || note}`);
		}

		logger.info(`Creating the (Re)Note: ${uri}`);

		//#region Visibility
		const to = getApIds(activity.to);
		const cc = getApIds(activity.cc);

		const visibility = getVisibility(to, cc, actor);

		let visibleUsers: IUser[] = [];
		if (visibility == 'specified') {
			visibleUsers = await Promise.all(to.map(uri => resolvePerson(uri)));
		}
		//#endergion

		await post(actor, {
			createdAt: new Date(activity.published),
			renote,
			visibility,
			visibleUsers,
			uri
		});
	} finally {
		unlock();
	}
}

type visibility = 'public' | 'home' | 'followers' | 'specified';

function getVisibility(to: string[], cc: string[], actor: IRemoteUser): visibility {
	const PUBLIC = 'https://www.w3.org/ns/activitystreams#Public';

	to = to || [];
	cc = cc || [];

	if (to.includes(PUBLIC)) {
		return 'public';
	} else if (cc.includes(PUBLIC)) {
		return 'home';
	} else if (to.includes(`${actor.uri}/followers`)) {
		return 'followers';
	} else {
		return 'specified';
	}
}
