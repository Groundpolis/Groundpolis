import * as fs from 'fs';
import * as Koa from 'koa';
import { serverLogger } from '..';
import { IImage, convertToPng, convertToJpeg } from '../../services/drive/image-processor';
import { createTemp } from '../../misc/create-temp';
import { downloadUrl } from '../../misc/download-url';
import { detectType } from '../../misc/get-file-info';

export async function proxyMedia(ctx: Koa.Context) {
	const url = 'url' in ctx.query ? ctx.query.url : 'https://' + ctx.params.url;

	// Create temp file
	const [path, cleanup] = await createTemp();

	try {
		await downloadUrl(url, path);

		const { mime, ext } = await detectType(path);

		if (!mime.startsWith('image/')) throw 403;

		let image: IImage;

		if ('static' in ctx.query && ['image/png', 'image/gif', 'image/apng', 'image/vnd.mozilla.apng', 'image/webp'].includes(mime)) {
			image = await convertToPng(path, 498, 280);
		} else if ('preview' in ctx.query && ['image/jpeg', 'image/png', 'image/gif', 'image/apng', 'image/vnd.mozilla.apng'].includes(mime)) {
			image = await convertToJpeg(path, 200, 200);
		} else {
			image = {
				data: fs.readFileSync(path),
				ext,
				type: mime,
			};
		}

		ctx.set('Content-Type', image.type);
		ctx.set('Cache-Control', 'max-age=31536000, immutable');
		ctx.body = image.data;
	} catch (e) {
		serverLogger.error(e);

		if (typeof e.statusCode === 'number' && e.statusCode >= 400 && e.statusCode < 500) {
			ctx.status = e.statusCode;
		} else {
			ctx.status = 500;
		}
	} finally {
		cleanup();
	}
}
