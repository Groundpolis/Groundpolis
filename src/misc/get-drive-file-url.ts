import { IDriveFile } from '../models/drive-file';
import config from '../config';

export default function(file: IDriveFile, thumbnail = false): string {
	if (file == null) return null;

	const isImage = file.contentType && file.contentType.startsWith('image/');

	if (file.metadata.withoutChunks && file.metadata.isRemote) {
		if (thumbnail) {
			return `${config.driveUrl}/${file._id}/${generateFilename(file, true)}?thumbnail`;
		} else {
			return `${config.driveUrl}/${file._id}/${generateFilename(file)}?web`;
		}
	} else if (file.metadata.withoutChunks) {
		if (thumbnail) {
			return file.metadata.thumbnailUrl || file.metadata.webpublicUrl || (isImage ? file.metadata.url : null);
		} else {
			return file.metadata.webpublicUrl || file.metadata.url;
		}
	} else {
		if (thumbnail) {
			return `${config.driveUrl}/${file._id}/${generateFilename(file, true)}?thumbnail`;
		} else {
			return `${config.driveUrl}/${file._id}/${generateFilename(file)}?web`;
		}
	}
}

/**
 * 拡張子付きのファイル名を生成する
 */
function generateFilename(file: IDriveFile, thumbnail = false) {
	let ext = '';

	if (thumbnail && file.contentType !== 'image/png') {
		ext = '.jpg';
	} else {
		if (file.filename) {
			[ext] = (file.filename.match(/\.(\w+)$/) || ['']);
		}

		if (ext === '' && file.contentType) {
			if (file.contentType === 'image/jpeg') ext = '.jpg';
			if (file.contentType === 'image/png') ext = '.png';
			if (file.contentType === 'image/webp') ext = '.webp';
		}
	}

	return `${file._id}${ext}`;
}

export function getOriginalUrl(file: IDriveFile) {
	if (file.metadata && file.metadata.url) {
		return file.metadata.url;
	}

	const accessKey = file.metadata ? file.metadata.accessKey : null;
	return `${config.driveUrl}/${file._id}${accessKey ? '?original=' + accessKey : ''}`;
}
