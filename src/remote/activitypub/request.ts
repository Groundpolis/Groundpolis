import * as https from 'https';
import { sign } from 'http-signature';
import { URL } from 'url';
import * as crypto from 'crypto';
import * as cache from 'lookup-dns-cache';

import config from '../../config';
import { ILocalUser } from '../../models/user';
import { publishApLogStream } from '../../services/stream';
import { apLogger } from './logger';
import Instance from '../../models/instance';
import { toDbHost } from '../../misc/convert-host';
import * as httpsProxyAgent from 'https-proxy-agent';

export const logger = apLogger.createSubLogger('deliver');

const agent = config.proxy
	? new httpsProxyAgent(config.proxy)
	: new https.Agent({
			lookup: cache.lookup,
		});

export default async (user: ILocalUser, url: string, object: any) => {
	const timeout = 10 * 1000;

	const { protocol, host, hostname, port, pathname, search } = new URL(url);

	// ブロック/閉鎖してたら中断
	// TODO: いちいちデータベースにアクセスするのはコスト高そうなのでどっかにキャッシュしておく
	const instance = await Instance.findOne({ host: toDbHost(host) });
	if (instance && instance.isBlocked) {
		logger.info(`skip (blocked) ${url}`);
		return;
	}
	if (instance && instance.isMarkedAsClosed) {
		logger.info(`skip (closed) ${url}`);
		return;
	}

	logger.info(`--> ${url}`);

	const data = JSON.stringify(object);

	const sha256 = crypto.createHash('sha256');
	sha256.update(data);
	const hash = sha256.digest('base64');

	await new  Promise((resolve, reject) => {
		const req = https.request({
			agent,
			protocol,
			hostname,
			port,
			method: 'POST',
			path: pathname + search,
			timeout,
			headers: {
				'User-Agent': config.userAgent,
				'Content-Type': 'application/activity+json',
				'Digest': `SHA-256=${hash}`
			}
		}, res => {
			if (res.statusCode >= 400) {
				logger.warn(`${url} --> ${res.statusCode}`);
				reject(res);
			} else {
				logger.succ(`${url} --> ${res.statusCode}`);
				resolve();
			}
		});

		sign(req, {
			authorizationHeaderName: 'Signature',
			key: user.keypair,
			keyId: `${config.url}/users/${user._id}/publickey`,
			headers: ['date', 'host', 'digest']
		});

		// Signature: Signature ... => Signature: ...
		let sig = req.getHeader('Signature').toString();
		sig = sig.replace(/^Signature /, '');
		req.setHeader('Signature', sig);

		req.on('timeout', () => req.abort());

		req.on('error', e => {
			if (req.aborted) reject('timeout');
			reject(e);
		});

		req.end(data);
	});

	//#region Log
	publishApLogStream({
		direction: 'out',
		activity: object.type,
		host: null,
		actor: user.username
	});
	//#endregion
};
