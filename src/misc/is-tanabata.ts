export function isTanabata() {
	const today = new Date();
	const month = today.getMonth() + 1;
	const day = today.getDate();

	return month === 7 && day <= 7;
}
