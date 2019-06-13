import DriveFile from '../models/drive-file';
import User from '../models/user';
import delFile from '../services/drive/delete-file';

async function main() {
	const users = await User.find({
		host: { $ne: null },
	}, {
		fields: {
			_id: true
		}
	});

	let prs = 0;

	for (const u of users) {
		prs++;

		const user = await User.findOne({
			_id: u._id
		});

		console.log(`user(${prs}/${users.length}): ${user.username}@${user.host}`);

		const files = await DriveFile.find({
			_id: {
				$nin: [user.avatarId, user.bannerId]
			},
			'metadata.userId': user._id
		});

		for (const file of files) {
			if (file.metadata.url && file.metadata.url.match('PATTERN HERE')) {
				console.log(`delete file: ${file._id} ${file.metadata.url}`);
				await delFile(file, true);
			} else {
				console.log(`unmatch file: ${file._id} ${file.metadata.url}`);
			}
		}
	}
}

main().then(() => {
	console.log('Done');
});
