import * as Koa from 'koa';
import * as send from 'koa-send';
import * as mongodb from 'mongodb';
import * as tmp from 'tmp';
import * as fs from 'fs';
import DriveFile, { getDriveFileBucket } from '../../models/drive-file';
import DriveFileThumbnail, { getDriveFileThumbnailBucket } from '../../models/drive-file-thumbnail';
import DriveFileWebpublic, { getDriveFileWebpublicBucket } from '../../models/drive-file-webpublic';
import { serverLogger } from '..';
import { fetch, detectMine } from '../proxy/proxy-media';
import { ConvertToJpeg, ConvertToPng } from '../../services/drive/image-processor';

const assets = `${__dirname}/../../server/file/assets/`;

const commonReadableHandlerGenerator = (ctx: Koa.BaseContext) => (e: Error): void => {
	serverLogger.error(e);
	ctx.status = 500;
};

export default async function(ctx: Koa.BaseContext) {
	// Validate id
	if (!mongodb.ObjectID.isValid(ctx.params.id)) {
		ctx.throw(400, 'incorrect id');
		return;
	}

	const fileId = new mongodb.ObjectID(ctx.params.id);

	// Fetch drive file
	const file = await DriveFile.findOne({ _id: fileId });

	if (file == null) {
		ctx.status = 404;
		await send(ctx as any, '/dummy.png', { root: assets });
		return;
	}

	if (file.metadata.deletedAt) {
		ctx.status = 410;
		await send(ctx as any, '/tombstone.png', { root: assets });
		return;
	}

	if (file.metadata.withoutChunks && (file.metadata.isRemote || file.metadata._user && file.metadata._user.host != null)) {
		// urlは過去のバグで張り替え忘れている可能性があるためuriを優先する
		const url = file.metadata.uri || file.metadata.url;

		// Create temp file
		const [path, cleanup] = await new Promise<[string, any]>((res, rej) => {
			tmp.file((e, path, fd, cleanup) => {
				if (e) return rej(e);
				res([path, cleanup]);
			});
		});

		try {
			await fetch(url, path);

			const [type, ext] = await detectMine(path);

			const convertFile = async () => {
				if ('thumbnail' in ctx.query) {
					if (['image/jpg', 'image/webp'].includes(type)) {
						return await ConvertToJpeg(path, 498, 280);
					} else if (['image/png'].includes(type)) {
						return await ConvertToPng(path, 498, 280);
					}
				}

				return {
					data: fs.readFileSync(path),
					ext,
					type,
				};
			};

			const file = await convertFile();

			ctx.set('Content-Type', type);
			ctx.set('Cache-Control', 'max-age=31536000, immutable');
			ctx.body = file.data;
		} catch (e) {
			serverLogger.error(e);

			if (typeof e == 'number' && e >= 400 && e < 500) {
				ctx.status = e;
			} else {
				ctx.status = 500;
			}
		} finally {
			cleanup();
		}
		return;
	}

	if (file.metadata.withoutChunks) {
		ctx.status = 204;
		return;
	}

	const sendRaw = async () => {
		if (file.metadata && file.metadata.accessKey && file.metadata.accessKey != ctx.query['original']) {
			ctx.status = 403;
			return;
		}

		const bucket = await getDriveFileBucket();
		const readable = bucket.openDownloadStream(fileId);
		readable.on('error', commonReadableHandlerGenerator(ctx));
		ctx.set('Content-Type', file.contentType);
		ctx.body = readable;
	};

	if ('thumbnail' in ctx.query) {
		const thumb = await DriveFileThumbnail.findOne({
			'metadata.originalId': fileId
		});

		if (thumb != null) {
			ctx.set('Content-Type', 'image/jpeg');
			const bucket = await getDriveFileThumbnailBucket();
			ctx.body = bucket.openDownloadStream(thumb._id);
		} else {
			if (file.contentType.startsWith('image/')) {
				await sendRaw();
			} else {
				ctx.status = 404;
				await send(ctx as any, '/dummy.png', { root: assets });
			}
		}
	} else if ('web' in ctx.query) {
		const web = await DriveFileWebpublic.findOne({
			'metadata.originalId': fileId
		});

		if (web != null) {
			ctx.set('Content-Type', file.contentType);

			const bucket = await getDriveFileWebpublicBucket();
			ctx.body = bucket.openDownloadStream(web._id);
		} else {
			await sendRaw();
		}
	} else {
		if ('download' in ctx.query) {
			ctx.set('Content-Disposition', 'attachment');
		}

		await sendRaw();
	}
}
