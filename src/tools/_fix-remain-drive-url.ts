import * as promiseLimit from 'promise-limit';
import DriveFile, { IDriveFile } from '../models/drive-file';

const limit = promiseLimit(1);

DriveFile.find({
	// 期限切れ削除リモートファイル
	'metadata._user.host': { $ne: null },
	'metadata.deletedAt': { $ne: null },
	'metadata.isExpired': true
}, {
	fields: {
		_id: true
	}
}).then(async files => {
	console.log(`there is ${files.length} files`);

	await Promise.all(files.map(file => limit(() => job(file))));

	console.log('ALL DONE');
});

async function job(file: IDriveFile): Promise<any> {
	file = await DriveFile.findOne({ _id: file._id });

	console.log(`uri: ${file.metadata.uri}`);
	console.log(`url: ${file.metadata.url}`);

	if (file.metadata.uri != null) {
		await DriveFile.update({ _id: file._id }, {
			$set: {
				'metadata.url': file.metadata.uri
			}
		});
		console.log('done', file._id);
	}
}
