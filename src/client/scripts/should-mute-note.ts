export default function(me, settings, note) {
	// ユーザーが指定されていて、ノートのIDと同じである
	const isMyNote = me && (note.userId == me.id);

	const includesMutedWords = (text: string) =>
		text
			? settings.mutedWords.some(q => q.length > 0 && !q.some(word =>
				word.startsWith('/') && word.endsWith('/') ? !(new RegExp(word.substr(1, word.length - 2)).test(text)) : !text.includes(word)))
			: false;

	return (
		// 自分の投稿でない、ミュートワードを含むリプライ
		(!isMyNote && note.reply && includesMutedWords(note.reply.text)) ||
		// 自分の投稿でない、ミュートワードを含むリノート
		(!isMyNote && note.renote && includesMutedWords(note.renote.text)) ||
		// 自分の投稿でない、ミュートワードを含むノート
		(!isMyNote && includesMutedWords(note.text))
	);
}