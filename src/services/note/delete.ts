import { publishNoteStream } from '../stream';
import { User } from '../../models/entities/user';
import { Note } from '../../models/entities/note';
import { Notes } from '../../models';
import { notesChart, perUserNotesChart } from '../chart';
import { countSameRenotes } from '../../misc/count-same-renotes';
import { Brackets } from 'typeorm';

/**
 * 投稿を削除します。
 * @param user 投稿者
 * @param note 投稿
 */
export default async function(user: User, note: Note, quiet = false) {
	const deletedAt = new Date();

	// この投稿を除く指定したユーザーによる指定したノートのリノートが存在しないとき
	if (note.renoteId && (await countSameRenotes(user.id, note.renoteId, note.id)) === 0) {
		Notes.decrement({ id: note.renoteId }, 'renoteCount', 1);
		Notes.decrement({ id: note.renoteId }, 'score', 1);
	}

	if (!quiet) {
		publishNoteStream(note.id, 'deleted', {
			deletedAt: deletedAt
		});

		// 統計を更新
		notesChart.update(note, false);
		perUserNotesChart.update(user, note, false);
	}

	await Notes.delete({
		id: note.id,
		userId: user.id
	});
}
