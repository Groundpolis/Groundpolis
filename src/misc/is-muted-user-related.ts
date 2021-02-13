import { Note } from "../models/entities/note";

export function isMutedUserRelated(note: Note, mutedUserIds: Set<string>, isRenoteMute: boolean): boolean {
	// ノートのユーザーをミュートしている
	if (!isRenoteMute && mutedUserIds.has(note.userId)) {
		return true;
	}

	// リプライ先のユーザーをミュートしている
	if (!isRenoteMute && note.reply != null && mutedUserIds.has(note.reply.userId)) {
		return true;
	}

	// 引用先のユーザーをミュートしている
	if (!isRenoteMute && note.renote != null && mutedUserIds.has(note.renote.userId)) {
		return true;
	}
	
	// ノートのユーザーをリノートミュートしており、ノートがPure Renoteである
	const isPureRenote = note.renote != null && note.text == null && !note.hasPoll && note.fileIds.length === 0;
	if (isRenoteMute && isPureRenote && mutedUserIds.has(note.userId)) {
		return true;
	}

	return false;
}
