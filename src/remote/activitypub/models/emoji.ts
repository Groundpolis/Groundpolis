import Emoji, { IEmoji } from '../../../models/emoji';
import Resolver from '../resolver';
import { isEmoji } from '../type';
import { toSingle } from '../../../prelude/array';

export async function resyncEmoji(emoji: IEmoji, force = false) {
	// skip local
	if (!emoji.uri) return;

	// resolve to AP Emoji
	const resolver = new Resolver();
	const apEmoji = await resolver.resolve(emoji.uri);

	if (!isEmoji(apEmoji)) throw new Error(`Object type is not an Emoji`);

	apEmoji.icon = toSingle(apEmoji.icon);

	if (force || emoji.url !== apEmoji.icon.url) {
		console.log(`update emoji url ${emoji.uri} ${emoji.url} => ${apEmoji.icon.url}`);
		await Emoji.findOneAndUpdate({
			_id: emoji._id
		}, {
			$set: {
				url: apEmoji.icon.url,
				updatedAt: new Date(),
			}
		});
	}
}
