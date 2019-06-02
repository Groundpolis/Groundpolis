import * as Koa from 'koa';
import * as tmp from 'tmp';
import * as fs from 'fs';
import { serverLogger } from '..';
import Emoji from '../../models/emoji';
import { detectMine } from '../../misc/detect-mine';
import { downloadUrl } from '../../misc/donwload-url';
import { calcHash } from '../../misc/calc-hash';

export default async function(ctx: Koa.BaseContext) {
	const emoji = await Emoji.findOne({
		name: ctx.params.name,
		host: ctx.params.host,
	});

	if (emoji == null) {
		ctx.status = 404;
		return;
	}

	// Create temp file
	const [path, cleanup] = await new Promise<[string, any]>((res, rej) => {
		tmp.file((e, path, fd, cleanup) => {
			if (e) return rej(e);
			res([path, cleanup]);
		});
	});

	try {
		await downloadUrl(emoji.url, path);

		const [type] = await detectMine(path);

		const md5 = await calcHash(path);

		if (emoji.md5 !== md5) {
			console.log(`Update emoji md5 ${emoji.md5} => ${md5}`);
			Emoji.update({ _id: emoji._id }, {
				$set: {
					md5
				}
			});
		}

		ctx.set('Content-Type', type);
		ctx.set('Cache-Control', 'max-age=604800, immutable');
		ctx.body = fs.readFileSync(path);
	} catch (e) {
		serverLogger.error(e);

		if (typeof e == 'number' && e >= 400 && e < 500) {
			console.log(`Update emoji md5 ${emoji.md5} => null`);
			Emoji.update({ _id: emoji._id }, {
				$set: {
					md5: null
				}
			});

			ctx.status = e;
		} else {
			ctx.status = 500;
		}
	} finally {
		cleanup();
	}
}
