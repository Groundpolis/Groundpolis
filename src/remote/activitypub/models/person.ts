import * as promiseLimit from 'promise-limit';

import config from '../../../config';
import Resolver from '../resolver';
import { resolveImage } from './image';
import { isCollectionOrOrderedCollection, isCollection, IPerson, getApId, getOneApHrefNullable, IObject, isPropertyValue, IApPropertyValue } from '../type';
import { fromHtml } from '../../../mfm/from-html';
import { htmlToMfm } from '../misc/html-to-mfm';
import { resolveNote, extractEmojis } from './note';
import { registerOrFetchInstanceDoc } from '../../../services/register-or-fetch-instance-doc';
import { extractApHashtags } from './tag';
import { apLogger } from '../logger';
import { Note } from '../../../models/entities/note';
import { updateUsertags } from '../../../services/update-hashtag';
import { Users, UserNotePinings, Instances, DriveFiles, Followings, UserProfiles, UserPublickeys } from '../../../models';
import { User, IRemoteUser } from '../../../models/entities/user';
import { Emoji } from '../../../models/entities/emoji';
import { UserNotePining } from '../../../models/entities/user-note-pinings';
import { genId } from '../../../misc/gen-id';
import { instanceChart, usersChart } from '../../../services/chart';
import { UserPublickey } from '../../../models/entities/user-publickey';
import { isDuplicateKeyValueError } from '../../../misc/is-duplicate-key-value-error';
import { toPuny } from '../../../misc/convert-host';
import { UserProfile } from '../../../models/entities/user-profile';
import { validActor } from '../../../remote/activitypub/type';
import { getConnection } from 'typeorm';
import { ensure } from '../../../prelude/ensure';
import { toArray } from '../../../prelude/array';
import { fetchNodeinfo } from '../../../services/fetch-nodeinfo';

const logger = apLogger;

/**
 * Validate Person object
 * @param x Fetched person object
 * @param uri Fetch target URI
 */
function validatePerson(x: any, uri: string) {
	const expectHost = toPuny(new URL(uri).hostname);

	if (x == null) {
		return new Error('invalid person: object is null');
	}

	if (!validActor.includes(x.type)) {
		return new Error(`invalid person: object is not a person or service '${x.type}'`);
	}

	if (typeof x.preferredUsername !== 'string') {
		return new Error('invalid person: preferredUsername is not a string');
	}

	if (typeof x.inbox !== 'string') {
		return new Error('invalid person: inbox is not a string');
	}

	if (!Users.validateRemoteUsername.ok(x.preferredUsername)) {
		return new Error('invalid person: invalid username');
	}

	if (x.name != null && x.name != '') {
		if (!Users.validateName.ok(x.name)) {
			return new Error('invalid person: invalid name');
		}
	}

	if (typeof x.id !== 'string') {
		return new Error('invalid person: id is not a string');
	}

	const idHost = toPuny(new URL(x.id).hostname);
	if (idHost !== expectHost) {
		return new Error('invalid person: id has different host');
	}

	if (typeof x.publicKey.id !== 'string') {
		return new Error('invalid person: publicKey.id is not a string');
	}

	const publicKeyIdHost = toPuny(new URL(x.publicKey.id).hostname);
	if (publicKeyIdHost !== expectHost) {
		return new Error('invalid person: publicKey.id has different host');
	}

	return null;
}

/**
 * Personをフェッチします。
 *
 * Groundpolisに対象のPersonが登録されていればそれを返します。
 */
export async function fetchPerson(uri: string, resolver?: Resolver): Promise<User | null> {
	if (typeof uri !== 'string') throw new Error('uri is not string');

	// URIがこのサーバーを指しているならデータベースからフェッチ
	if (uri.startsWith(config.url + '/')) {
		const id = uri.split('/').pop();
		return await Users.findOne(id).then(x => x || null);
	}

	//#region このサーバーに既に登録されていたらそれを返す
	const exist = await Users.findOne({ uri });

	if (exist) {
		return exist;
	}
	//#endregion

	return null;
}

/**
 * Personを作成します。
 */
export async function createPerson(uri: string, resolver?: Resolver): Promise<User> {
	if (typeof uri !== 'string') throw new Error('uri is not string');

	if (resolver == null) resolver = new Resolver();

	const object = await resolver.resolve(uri) as any;

	const err = validatePerson(object, uri);

	if (err) {
		throw err;
	}

	const person: IPerson = object;

	logger.info(`Creating the Person: ${person.id}`);

	const host = toPuny(new URL(object.id).hostname);

	const { fields } = analyzeAttachments(person.attachment || []);

	const tags = extractApHashtags(person.tag).map(tag => tag.toLowerCase()).splice(0, 32);

	const isBot = object.type === 'Service';

	const bday = person['vcard:bday']?.match(/^\d{4}-\d{2}-\d{2}/);

	// Create user
	let user: IRemoteUser;
	try {
		// Start transaction
		await getConnection().transaction(async transactionalEntityManager => {
			user = await transactionalEntityManager.save(new User({
				id: genId(),
				avatarId: null,
				bannerId: null,
				createdAt: new Date(),
				lastFetchedAt: new Date(),
				name: person.name,
				isLocked: !!person.manuallyApprovesFollowers,
				username: person.preferredUsername,
				usernameLower: person.preferredUsername!.toLowerCase(),
				host,
				inbox: person.inbox,
				sharedInbox: person.sharedInbox || (person.endpoints ? person.endpoints.sharedInbox : undefined),
				featured: person.featured ? getApId(person.featured) : undefined,
				uri: person.id,
				tags,
				isBot,
				isCat: (person as any).isCat === true
			})) as IRemoteUser;

			await transactionalEntityManager.save(new UserProfile({
				userId: user.id,
				description: person.summary ? htmlToMfm(person.summary, person.tag) : null,
				url: getOneApHrefNullable(person.url),
				fields,
				birthday: bday ? bday[0] : null,
				location: person['vcard:Address'] || null,
				userHost: host
			}));

			await transactionalEntityManager.save(new UserPublickey({
				userId: user.id,
				keyId: person.publicKey.id,
				keyPem: person.publicKey.publicKeyPem
			}));
		});
	} catch (e) {
		// duplicate key error
		if (isDuplicateKeyValueError(e)) {
			// /users/@a => /users/:id のように入力がaliasなときにエラーになることがあるのを対応
			const u = await Users.findOne({
				uri: person.id
			});

			if (u) {
				user = u as IRemoteUser;
			} else {
				throw new Error('already registered');
			}
		} else {
			logger.error(e);
			throw e;
		}
	}

	// Register host
	registerOrFetchInstanceDoc(host).then(i => {
		Instances.increment({ id: i.id }, 'usersCount', 1);
		instanceChart.newUser(i.host);
		fetchNodeinfo(i);
	});

	usersChart.update(user!, true);

	// ハッシュタグ更新
	updateUsertags(user!, tags);

	//#region アバターとヘッダー画像をフェッチ
	const [avatar, banner] = await Promise.all([
		person.icon,
		person.image
	].map(img =>
		img == null
			? Promise.resolve(null)
			: resolveImage(user!, img).catch(() => null)
	));

	const avatarId = avatar ? avatar.id : null;
	const bannerId = banner ? banner.id : null;
	const avatarUrl = avatar ? DriveFiles.getPublicUrl(avatar, true) : null;
	const bannerUrl = banner ? DriveFiles.getPublicUrl(banner) : null;
	const avatarColor = avatar && avatar.properties.avgColor ? avatar.properties.avgColor : null;
	const bannerColor = banner && banner.properties.avgColor ? banner.properties.avgColor : null;

	await Users.update(user!.id, {
		avatarId,
		bannerId,
		avatarUrl,
		bannerUrl,
		avatarColor,
		bannerColor
	});

	user!.avatarId = avatarId;
	user!.bannerId = bannerId;
	user!.avatarUrl = avatarUrl;
	user!.bannerUrl = bannerUrl;
	user!.avatarColor = avatarColor;
	user!.bannerColor = bannerColor;
	//#endregion

	//#region カスタム絵文字取得
	const emojis = await extractEmojis(person.tag || [], host).catch(e => {
		logger.info(`extractEmojis: ${e}`);
		return [] as Emoji[];
	});

	const emojiNames = emojis.map(emoji => emoji.name);

	await Users.update(user!.id, {
		emojis: emojiNames
	});
	//#endregion

	await updateFeatured(user!.id).catch(err => logger.error(err));

	return user!;
}

/**
 * Personの情報を更新します。
 * Groundpolisに対象のPersonが登録されていなければ無視します。
 * @param uri URI of Person
 * @param resolver Resolver
 * @param hint Hint of Person object (この値が正当なPersonの場合、Remote resolveをせずに更新に利用します)
 */
export async function updatePerson(uri: string, resolver?: Resolver | null, hint?: object): Promise<void> {
	if (typeof uri !== 'string') throw new Error('uri is not string');

	// URIがこのサーバーを指しているならスキップ
	if (uri.startsWith(config.url + '/')) {
		return;
	}

	//#region このサーバーに既に登録されているか
	const exist = await Users.findOne({ uri }) as IRemoteUser;

	if (exist == null) {
		return;
	}
	//#endregion

	if (resolver == null) resolver = new Resolver();

	const object = hint || await resolver.resolve(uri) as any;

	const err = validatePerson(object, uri);

	if (err) {
		throw err;
	}

	const person: IPerson = object;

	logger.info(`Updating the Person: ${person.id}`);

	// アバターとヘッダー画像をフェッチ
	const [avatar, banner] = await Promise.all([
		person.icon,
		person.image
	].map(img =>
		img == null
			? Promise.resolve(null)
			: resolveImage(exist, img).catch(() => null)
	));

	// カスタム絵文字取得
	const emojis = await extractEmojis(person.tag || [], exist.host).catch(e => {
		logger.info(`extractEmojis: ${e}`);
		return [] as Emoji[];
	});

	const emojiNames = emojis.map(emoji => emoji.name);

	const { fields } = analyzeAttachments(person.attachment || []);

	const tags = extractApHashtags(person.tag).map(tag => tag.toLowerCase()).splice(0, 32);

	const bday = person['vcard:bday']?.match(/^\d{4}-\d{2}-\d{2}/);

	const updates = {
		lastFetchedAt: new Date(),
		inbox: person.inbox,
		sharedInbox: person.sharedInbox || (person.endpoints ? person.endpoints.sharedInbox : undefined),
		featured: person.featured,
		emojis: emojiNames,
		name: person.name,
		tags,
		isBot: object.type === 'Service',
		isCat: (person as any).isCat === true,
		isLocked: !!person.manuallyApprovesFollowers,
	} as Partial<User>;

	if (avatar) {
		updates.avatarId = avatar.id;
		updates.avatarUrl = DriveFiles.getPublicUrl(avatar, true);
		updates.avatarColor = avatar.properties.avgColor ? avatar.properties.avgColor : null;
	}

	if (banner) {
		updates.bannerId = banner.id;
		updates.bannerUrl = DriveFiles.getPublicUrl(banner);
		updates.bannerColor = banner.properties.avgColor ? banner.properties.avgColor : null;
	}

	// Update user
	await Users.update(exist.id, updates);

	await UserPublickeys.update({ userId: exist.id }, {
		keyId: person.publicKey.id,
		keyPem: person.publicKey.publicKeyPem
	});

	await UserProfiles.update({ userId: exist.id }, {
		url: getOneApHrefNullable(person.url),
		fields,
		description: person.summary ? htmlToMfm(person.summary, person.tag) : null,
		birthday: bday ? bday[0] : null,
		location: person['vcard:Address'] || null,
	});

	// ハッシュタグ更新
	updateUsertags(exist, tags);

	// 該当ユーザーが既にフォロワーになっていた場合はFollowingもアップデートする
	await Followings.update({
		followerId: exist.id
	}, {
		followerSharedInbox: person.sharedInbox || (person.endpoints ? person.endpoints.sharedInbox : undefined)
	});

	await updateFeatured(exist.id).catch(err => logger.error(err));
}

/**
 * Personを解決します。
 *
 * Groundpolisに対象のPersonが登録されていればそれを返し、そうでなければ
 * リモートサーバーからフェッチしてGroundpolisに登録しそれを返します。
 */
export async function resolvePerson(uri: string, resolver?: Resolver): Promise<User> {
	if (typeof uri !== 'string') throw new Error('uri is not string');

	//#region このサーバーに既に登録されていたらそれを返す
	const exist = await fetchPerson(uri);

	if (exist) {
		return exist;
	}
	//#endregion

	// リモートサーバーからフェッチしてきて登録
	if (resolver == null) resolver = new Resolver();
	return await createPerson(uri, resolver);
}

const services: {
		[x: string]: (id: string, username: string) => any
	} = {
	'misskey:authentication:twitter': (userId, screenName) => ({ userId, screenName }),
	'misskey:authentication:github': (id, login) => ({ id, login }),
	'misskey:authentication:discord': (id, name) => $discord(id, name)
};

const $discord = (id: string, name: string) => {
	if (typeof name !== 'string')
		name = 'unknown#0000';
	const [username, discriminator] = name.split('#');
	return { id, username, discriminator };
};

function addService(target: { [x: string]: any }, source: IApPropertyValue) {
	const service = services[source.name];

	if (typeof source.value !== 'string')
		source.value = 'unknown';

	const [id, username] = source.value.split('@');

	if (service)
		target[source.name.split(':')[2]] = service(id, username);
}

export function analyzeAttachments(attachments: IObject | IObject[] | undefined) {
	const fields: {
		name: string,
		value: string
	}[] = [];
	const services: { [x: string]: any } = {};

	if (Array.isArray(attachments)) {
		for (const attachment of attachments.filter(isPropertyValue)) {
			if (isPropertyValue(attachment.identifier)) {
				addService(services, attachment.identifier);
			} else {
				fields.push({
					name: attachment.name,
					value: fromHtml(attachment.value)
				});
			}
		}
	}

	return { fields, services };
}

export async function updateFeatured(userId: User['id']) {
	const user = await Users.findOne(userId).then(ensure);
	if (!Users.isRemoteUser(user)) return;
	if (!user.featured) return;

	logger.info(`Updating the featured: ${user.uri}`);

	const resolver = new Resolver();

	// Resolve to (Ordered)Collection Object
	const collection = await resolver.resolveCollection(user.featured);
	if (!isCollectionOrOrderedCollection(collection)) throw new Error(`Object is not Collection or OrderedCollection`);

	// Resolve to Object(may be Note) arrays
	const unresolvedItems = isCollection(collection) ? collection.items : collection.orderedItems;
	const items = await Promise.all(toArray(unresolvedItems).map(x => resolver.resolve(x)));

	// Resolve and regist Notes
	const limit = promiseLimit<Note | null>(2);
	const featuredNotes = await Promise.all(items
		.filter(item => item.type === 'Note')
		.slice(0, 5)
		.map(item => limit(() => resolveNote(item, resolver))));

	// delete
	await UserNotePinings.delete({ userId: user.id });

	// とりあえずidを別の時間で生成して順番を維持
	let td = 0;
	for (const note of featuredNotes.filter(note => note != null)) {
		td -= 1000;
		UserNotePinings.save({
			id: genId(new Date(Date.now() + td)),
			createdAt: new Date(),
			userId: user.id,
			noteId: note!.id
		} as UserNotePining);
	}
}
