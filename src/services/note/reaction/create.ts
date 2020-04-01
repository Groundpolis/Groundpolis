import { publishNoteStream } from '../../stream';
import watch from '../watch';
import { renderLike } from '../../../remote/activitypub/renderer/like';
import DeliverManager from '../../../remote/activitypub/deliver-manager';
import { renderActivity } from '../../../remote/activitypub/renderer';
import { IdentifiableError } from '../../../misc/identifiable-error';
import { toDbReaction } from '../../../misc/reaction-lib';
import { User, IRemoteUser } from '../../../models/entities/user';
import { Note } from '../../../models/entities/note';
import { NoteReactions, Users, NoteWatchings, Notes, UserProfiles } from '../../../models';
import { Not } from 'typeorm';
import { perUserReactionsChart } from '../../chart';
import { genId } from '../../../misc/gen-id';
import { createNotification } from '../../create-notification';
import deleteReaction from './delete';

export default async (user: User, note: Note, reaction?: string) => {
	if (!reaction || !['👍', '❤️', '😆', '😇', '😮', '🎉', '👏', '🍣'].includes(reaction)) {
		reaction = '👍'
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
	const inserted = await NoteReactions.save({
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
		userId: user.id
	});

	// リアクションされたユーザーがローカルユーザーなら通知を作成
	if (note.userHost === null) {
		createNotification(note.userId, 'reaction', {
			notifierId: user.id,
			noteId: note.id,
			reaction: reaction
		});
	}

	// Fetch watchers
	NoteWatchings.find({
		noteId: note.id,
		userId: Not(user.id)
	}).then(watchers => {
		for (const watcher of watchers) {
			createNotification(watcher.userId, 'reaction', {
				notifierId: user.id,
				noteId: note.id,
				reaction: reaction
			});
		}
	});

	const profile = await UserProfiles.findOne(user.id);

	// ユーザーがローカルユーザーかつ自動ウォッチ設定がオンならばこの投稿をWatchする
	if (Users.isLocalUser(user) && profile!.autoWatch) {
		watch(user.id, note);
	}

	//#region 配信
	if (Users.isLocalUser(user) && !note.localOnly) {
		const content = renderActivity(renderLike(inserted, note));
		const dm = new DeliverManager(user, content);
		if (note.userHost !== null) {
			const reactee = await Users.findOne(note.userId)
			dm.addDirectRecipe(reactee as IRemoteUser);
		}
		dm.addFollowersRecipe();
		dm.execute();
	}
	//#endregion
};
