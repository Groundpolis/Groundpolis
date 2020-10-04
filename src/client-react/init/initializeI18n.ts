import { getLocale, langs, version } from '../config';
import { clientDb, count, get } from '../db';
import { setI18nContexts, setLocale } from '../utils/i18n';

export async function initializeI18n() { 
	let lang = localStorage.getItem('lang');

	if (lang == null) {
		if (langs.map(x => x[0]).includes(navigator.language)) {
			lang = navigator.language;
		} else {
			lang = langs.map(x => x[0]).find(x => x.split('-')[0] == navigator.language);

			if (lang == null) {
				// Fallback
				lang = 'en-US';
			}
		}

		localStorage.setItem('lang', lang);
	}

	await count(clientDb.i18n).then(async n => {
		if (n === 0) {
			await setI18nContexts(lang, version);
			return;
		}
		if ((await get('_version_', clientDb.i18n) !== version)) {
			await setI18nContexts(lang, version);
			return;
		}

		setLocale(await getLocale());
	});

	document.documentElement.setAttribute('lang', lang);
}
