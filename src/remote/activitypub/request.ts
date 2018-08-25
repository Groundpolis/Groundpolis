import { request } from 'https';
const { sign } = require('http-signature');
import { URL } from 'url';
import * as debug from 'debug';

import config from '../../config';
import { ILocalUser } from '../../models/user';

const log = debug('misskey:activitypub:deliver');

export default (user: ILocalUser, url: string, object: any) => new Promise((resolve, reject) => {
	log(`--> ${url}`);

	const { protocol, hostname, port, pathname, search } = new URL(url);

	const req = request({
		protocol,
		hostname,
		port,
		method: 'POST',
		path: pathname + search,
		headers: {
			'Content-Type': 'application/activity+json'
		}
	}, res => {
		log(`${url} --> ${res.statusCode}`);

		if (res.statusCode >= 400) {
			reject();
		} else {
			resolve();
		}
	});

	sign(req, {
		authorizationHeaderName: 'Signature',
		key: user.keypair,
		keyId: hasResolveBug(hostname) ? `acct:${user.username}@${config.host}` : `${config.url}/users/${user._id}/publickey`
	});

	// Signature: Signature ... => Signature: ...
	let sig = req.getHeader('Signature').toString();
	sig = sig.replace(/^Signature /, '');
	req.setHeader('Signature', sig);

	req.end(JSON.stringify(object));
});

const hasResolveBug = (host: string) => {
	return host.match(/^(misskey\.cercle\.jp|tri\.cash|misskey\.tmin\.ml|misskey\.xps2\.net|diary\.yukimochi\.jp|misskey\.nsa\.ovh|msky\.cafe|s\.nzws\.me|misskey\.xyz|mi-chan\.work|misskey\.ranranhome\.info|mewl\.me|mk\.odakyu\.app|msky\.tokyo|misskey\.jp|misskey\.ketsuben\.red|msk\.kirigakure\.net)$/i);
};
