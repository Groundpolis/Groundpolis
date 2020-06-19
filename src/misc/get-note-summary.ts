/**
 * 投稿を表す文字列を取得します。
 * @param {*} note (packされた)投稿
 */
const summarize = (note: any, locale: any): string => {
	if (note.deletedAt) {
		return `(${locale['deletedNote']})`;
	}

	if (note.isHidden) {
		return `(${locale['invisibleNote']})`;
	}

	let summary = '';

	// 本文
	if (note.cw != null) {
		summary += note.cw;
	} else {
		summary += note.text ? note.text : '';
	}

	// ファイルが添付されているとき
	if ((note.files || []).length != 0) {
		summary += ` (${locale['withNFiles'].replace('{n}', note.files.length)})`;
	}

	return summary.trim();
};

export default summarize;
