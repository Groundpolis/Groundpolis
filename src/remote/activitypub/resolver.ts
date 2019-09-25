import * as request from 'request-promise-native';
import { IObject, isCollection, isOrderedCollection, isCollectionPage, isOrderedCollectionPage } from './type';
import config from '../../config';
import { registerOrFetchInstanceDoc } from '../../services/register-or-fetch-instance-doc';
import { extractDbHost } from '../../misc/convert-host';
import Instance from '../../models/instance';
import { detectSystem } from './misc/detect-system';

export default class Resolver {
	private history: Set<string>;
	private timeout = 10 * 1000;

	constructor() {
		this.history = new Set();
	}

	public getHistory(): string[] {
		return Array.from(this.history);
	}

	public async resolveCollection(value: string | IObject) {
		const collection = typeof value === 'string'
			? await this.resolve(value)
			: value;

		if (isCollection(collection) || isOrderedCollection(collection) || isCollectionPage(collection) || isOrderedCollectionPage(collection)) {
			return collection;
		} else {
			throw new Error(`unknown collection type: ${collection.type}`);
		}
	}

	public async resolve(value: string | IObject): Promise<IObject> {
		if (value == null) {
			throw new Error('resolvee is null (or undefined)');
		}

		if (typeof value !== 'string') {
			return value;
		}

		if (this.history.has(value)) {
			throw new Error('cannot resolve already resolved one');
		}

		this.history.add(value);

		console.log(`ResolveRequest: ${value}`);
		const object = await request({
			url: value,
			proxy: config.proxy,
			timeout: this.timeout,
			forever: true,
			headers: {
				'User-Agent': config.userAgent,
				Accept: 'application/activity+json, application/ld+json'
			},
			json: true
		});

		if (object === null || (
			Array.isArray(object['@context']) ?
				!object['@context'].includes('https://www.w3.org/ns/activitystreams') :
				object['@context'] !== 'https://www.w3.org/ns/activitystreams'
		)) {
			throw new Error('invalid response');
		}

		updateInstanceSystem(value, object);

		return object;
	}
}

async function updateInstanceSystem(url: string, obj: any) {
	const system = detectSystem(obj);

	if (system != null) {
		registerOrFetchInstanceDoc(extractDbHost(url)).then(i => {
			Instance.update({ _id: i._id }, {
				$set: {
					system,
				}
			});
		});
	}
}
