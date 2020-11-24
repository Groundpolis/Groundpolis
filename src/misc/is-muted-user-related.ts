export function isMutedUserRelated(note: any, mutedUserIds: string[], isRenoteMute:boolean): boolean {
	if (!isRenoteMute && mutedUserIds.includes(note.userId)) {
		return true;
	}

	if (!isRenoteMute && note.reply != null && mutedUserIds.includes(note.reply.userId)) {
		return true;
	}

	if (!isRenoteMute && note.renote != null && mutedUserIds.includes(note.renote.userId)) {
		return true;
	}
	
	if (isRenoteMute && note.renote != null && mutedUserIds.includes(note.userId)) {
		return true;
	}

	return false;
}
