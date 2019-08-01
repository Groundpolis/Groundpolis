import { INote } from '../../../../models/note';

export function shouldMuteNote(me, settings, note) {
	const isMyNote = me && (note.userId == me.id);
	const isPureRenote = note.renoteId != null && note.text == null && note.fileIds.length == 0 && note.poll == null;

	const includesMutedWords = (text: string) =>
		text
			? settings.mutedWords.some(q => q.length > 0 && !q.some(word =>
				word.startsWith('/') && word.endsWith('/') ? !(new RegExp(word.substr(1, word.length - 2), 'i').test(text)) : !text.toLowerCase().includes(word.toLowerCase())))
			: false;

	const includesMutedWordsInNote = (note: INote) =>
		(note.text && includesMutedWords(note.text)) || (note.cw && includesMutedWords(note.cw));

	return (
		(!isMyNote && note.reply && includesMutedWordsInNote(note.reply)) ||
		(!isMyNote && note.renote && includesMutedWordsInNote(note.renote)) ||
		(settings.showMyRenotes === false && isMyNote && isPureRenote) ||
		(settings.showRenotedMyNotes === false && isPureRenote && note.renote.userId == me.id) ||
		(settings.showLocalRenotes === false && isPureRenote && note.renote.user.host == null) ||
		(!isMyNote && includesMutedWordsInNote(note))
	);
}
