import { publishNoteStream } from '../../stream';
import watch from '../watch';
import { toDbReaction } from '../../../misc/reaction-lib';
import { User } from '../../../models/entities/user';
import { Note } from '../../../models/entities/note';
import { NoteReactions, Users, Notes, UserProfiles } from '../../../models';
import { perUserReactionsChart } from '../../chart';
import { genId } from '../../../misc/gen-id';
import deleteReaction from './delete';
import { fetchMeta } from '../../../misc/fetch-meta';
import { defaultEmojiReactions } from '../../../misc/default-emoji-reactions';

export default async (user: User, note: Note, reaction?: string) => {
	const meta = await fetchMeta();
	const allowed = [
		...defaultEmojiReactions,
		...meta.allowedEmojiReactions
	];
	if (!reaction || !allowed.includes(reaction)) {
		reaction = '👍';
	}

	reaction = await toDbReaction(reaction);

	const exist = await NoteReactions.findOne({
		noteId: note.id,
		userId: user.id,
	});

	if (exist) {
		if (exist.reaction !== reaction) {
			// 別のリアクションがすでにされていたら置き換える
			await deleteReaction(user, note);
		} else {
			// 同じリアクションがすでにされていたら何もしない
			return;
		}
	}

	// Create reaction
	await NoteReactions.save({
		id: genId(),
		createdAt: new Date(),
		noteId: note.id,
		userId: user.id,
		reaction
	});

	// Increment reactions count
	const sql = `jsonb_set("reactions", '{${reaction}}', (COALESCE("reactions"->>'${reaction}', '0')::int + 1)::text::jsonb)`;
	await Notes.createQueryBuilder().update()
		.set({
			reactions: () => sql,
		})
		.where('id = :id', { id: note.id })
		.execute();

	Notes.increment({ id: note.id }, 'score', 1);

	perUserReactionsChart.update(user, note);

	publishNoteStream(note.id, 'reacted', {
		reaction: reaction,
		userId: user.id,
	});

	const profile = await UserProfiles.findOne(user.id);

	// ユーザーがローカルユーザーかつ自動ウォッチ設定がオンならばこの投稿をWatchする
	if (Users.isLocalUser(user) && profile!.autoWatch) {
		watch(user.id, note);
	}
	//#endregion
};
