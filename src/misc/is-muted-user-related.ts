import { Note } from "../models/entities/note";

export function isMutedUserRelated(note: Note, mutedUserIds: string[], isRenoteMute: boolean): boolean {
	// ノートのユーザーをミュートしている
	if (!isRenoteMute && mutedUserIds.includes(note.userId)) {
		return true;
	}

	// リプライ先のユーザーをミュートしている
	if (!isRenoteMute && note.reply != null && mutedUserIds.includes(note.reply.userId)) {
		return true;
	}

	// 引用先のユーザーをミュートしている
	if (!isRenoteMute && note.renote != null && mutedUserIds.includes(note.renote.userId)) {
		return true;
	}
	
	// ノートのユーザーをリノートミュートしており、ノートがPure Renoteである
	const isPureRenote = note.renote != null && note.text == null && !note.hasPoll && note.fileIds.length === 0;
	if (isRenoteMute && isPureRenote && mutedUserIds.includes(note.userId)) {
		return true;
	}

	return false;
}
