import Emoji from '../models/emoji';
import { toApHost } from '../misc/convert-host';

async function main(): Promise<any> {

	const emojis = await Emoji.find({
		}, {
			sort: {
				md5: 1,
				name: 1,
			}
		});

	for (const emoji of emojis) {
		const name = `${emoji.name}@${toApHost(emoji.host)}`;
		console.log(`${emoji.md5},${name},${emoji.updatedAt ? emoji.updatedAt.toISOString() : ''}`);
	}
}

//const args = process.argv.slice(2);

main().then(() => {
	process.exit(0);
}).catch(e => {
	console.warn(e);
	process.exit(1);
});
