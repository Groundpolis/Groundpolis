import Resolver from '../resolver';
import { INote } from '../../../models/note';
import post from '../../../services/note/create';
import { IObject, getApIds, getOneApId, getApId, isDocumentLike } from '../type';
import { resolvePerson, updatePerson } from './person';
import { IRemoteUser, IUser } from '../../../models/user';
import { fromHtml } from '../../../mfm/fromHtml';
import { extractHashtags } from './tag';
import { apLogger } from '../logger';
import { extractApHost } from '../../../misc/convert-host';

const logger = apLogger;

export function validatePureDocument(object: any, uri: string) {
	const expectHost = extractApHost(uri);

	if (object == null) {
		return new Error('invalid Document: object is null');
	}

	if (object.id && extractApHost(object.id) !== expectHost) {
		return new Error(`invalid Document: id has different host. expected: ${expectHost}, actual: ${extractApHost(object.id)}`);
	}

	if (object.attributedTo && extractApHost(getOneApId(object.attributedTo)) !== expectHost) {
		return new Error(`invalid Document: attributedTo has different host. expected: ${expectHost}, actual: ${extractApHost(object.attributedTo)}`);
	}

	return null;
}

export async function createPureDocument(value: IObject | string, resolver?: Resolver, silent = false): Promise<INote> {
	if (resolver == null) resolver = new Resolver();

	const document = await resolver.resolve(value);

	if (!isDocumentLike(document)) {
		throw new Error(`invalid Document: invalied object type ${document.type}`);
	}

	const err = validatePureDocument(document, getApId(value));
	if (err) {
		logger.error(`${err.message}`, {
			resolver: {
				history: resolver.getHistory()
			},
			value: value,
			object: document
		});
		return null;
	}

	logger.debug(`Document fetched: ${JSON.stringify(document, null, 2)}`);

	logger.info(`Creating the Document: ${document.id}`);

	// 投稿者をフェッチ
	const actor = await resolvePerson(getOneApId(document.attributedTo), null, resolver) as IRemoteUser;

	// 投稿者が凍結されていたらスキップ
	if (actor.isSuspended) {
		return null;
	}

	//#region Visibility
	document.to = getApIds(document.to);
	document.cc = getApIds(document.cc);

	let visibility = 'public';
	let visibleUsers: IUser[] = [];
	if (!document.to.includes('https://www.w3.org/ns/activitystreams#Public')) {
		if (document.cc.includes('https://www.w3.org/ns/activitystreams#Public')) {
			visibility = 'home';
		} else if (document.to.includes(`${actor.uri}/followers`)) {	// TODO: person.followerと照合するべき？
			visibility = 'followers';
		} else {
			visibility = 'specified';
			visibleUsers = await Promise.all(document.to.map(uri => resolvePerson(uri, null, resolver)));
		}
}
	//#endergion

	const apHashtags = await extractHashtags(document.tag);

	const cw = document.summary === '' ? null : document.summary;

	// テキストのパース
	const text = fromHtml(document.content);

	// ユーザーの情報が古かったらついでに更新しておく
	if (actor.lastFetchedAt == null || Date.now() - actor.lastFetchedAt.getTime() > 1000 * 60 * 60 * 24) {
		updatePerson(actor.uri);
	}

	return await post(actor, {
		createdAt: new Date(document.published),
		files: [],
		reply: null,
		renote: null,
		name: document.name,
		cw,
		text,
		viaMobile: false,
		localOnly: false,
		geo: undefined,
		visibility,
		visibleUsers,
		apMentions: [],
		apHashtags,
		apEmojis: [],
		uri: document.id,
		isDocument: true,
	}, silent);
}
