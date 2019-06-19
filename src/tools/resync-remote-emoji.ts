import Emoji from '../models/emoji';
import { resyncEmoji } from '../remote/activitypub/models/emoji';
import { toDbHost } from '../misc/convert-host';

async function main(x: string): Promise<any> {
	x = x.replace(/:/g, '');
	const m = x.match(/^([^@]+)@(.*)/);

	if (m) {
		const name = m[1];
		const host = toDbHost(m[2]);

		console.log(`resync ${name} ${host}`);

		const emoji = await Emoji.findOne({
			name,
			host
		});

		if (emoji == null) throw 'emoji not found';

		await resyncEmoji(emoji, true);
	}
}

// get args
const args = process.argv.slice(2);
const x = args[0];	// name@host

main(x).then(() => {
	console.log('Done');
}).catch(e => {
	console.warn(e);
});
