import * as mongo from 'mongodb';
import db from '../db/mongodb';
import config from '../config';
import * as deepcopy from 'deepcopy';
import isObjectid from '../misc/is-objectid';
import { toApHost } from '../misc/convert-host';

const Emoji = db.get<IEmoji>('emoji');
Emoji.createIndex('name');
Emoji.createIndex('host');
Emoji.createIndex('md5');
Emoji.createIndex(['name', 'host'], { unique: true });

export default Emoji;

export type IEmoji = {
	_id: mongo.ObjectID;
	name: string;
	host: string;
	url: string;
	aliases?: string[];
	updatedAt?: Date;
	/** AP object id */
	uri?: string;
	type?: string;
	md5?: string;
};

export type IXEmoji = {
	name: string,
	url: string,
};

/**
 * Pack custom emojis for render
 */
export async function packXEmoji(emoji: any): Promise<IXEmoji> {
	let _emoji: IEmoji;

	// Populate if ID
	if (isObjectid(emoji)) {
		_emoji = await Emoji.findOne({
			_id: emoji
		});
	} else if (typeof emoji === 'string') {
		_emoji = await Emoji.findOne({
			_id: new mongo.ObjectID(emoji)
		});
	} else {
		_emoji = deepcopy(emoji);
	}

	// リモートは /files/ で Proxyさせる
	const url = _emoji.host ? `${config.url}/files/${_emoji.name}@${_emoji.host}/${_emoji.updatedAt ? _emoji.updatedAt.getTime().toString(16) : '0'}.png` : _emoji.url;

	const name = _emoji.name + (_emoji.host ? `@${toApHost(_emoji.host)}` : '');

	return {
		name,
		url,
	};
}
