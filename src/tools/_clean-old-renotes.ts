import User from '../models/user';
import Note from '../models/note';
import { ObjectID } from 'mongodb';
import Favorite from '../models/favorite';
import { concat } from '../prelude/array';

async function main() {
	const id = new ObjectID('700000000000000000000000');

	// favs
	const favs = await Favorite.find({
		noteId: { $lt: id }
	});

	// remote users
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

		const exIds = concat([
			favs.map(x => x.noteId),
			(user.pinnedNoteIds || [])
		]);

		const notes = await Note.find({
			$and: [
				{
					userId: user._id
				},

				{
					_id: { $nin: exIds }
				},
				{
					_id: { $lt: id }
				},

				{
					$or: [
						{ renoteCount: { $exists: false } },
						{ renoteCount: 0 },
					],
				},
				{
					repliesCount: { $exists: false }
				},
				{
					reactionCounts: { $exists: false }
				},

				{
					replyId: null,
				},
				{
					renoteId: { $ne: null },
				},
			],
		});

		for (const note of notes) {
			console.log(`${note._id}`);
			await Note.update({ _id: note.renoteId }, {
				$inc: {
					renoteCount: -1
				}
			});

			await Note.remove({ _id: note._id });
		}
	}
}

main().then(() => {
	console.log('Done');
});
