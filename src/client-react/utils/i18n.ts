import VueI18n from 'vue-i18n';
import { deepEntries, delimitEntry } from 'deep-entries';

import { clientDb, clear, bulkSet } from '../db';
import escapeRegExp from 'escape-regexp';

let i18nMessages: Record<string, string | undefined> = { };
let locale = '';

export function setI18nContexts(lang: string, version: string, cleardb = false) {
	return Promise.all([
		cleardb ? clear(clientDb.i18n) : Promise.resolve(),
		fetch(`/assets/locales/${lang}.${version}.json`)
	])
	.then(([, response]) => response.json())
	.then(l => {
		const flatLocaleEntries = deepEntries(l, delimitEntry) as [string, string][];
		bulkSet(flatLocaleEntries, clientDb.i18n);
		locale = lang;
		i18nMessages = Object.fromEntries(flatLocaleEntries);
	});
	
}

export function setLocale(mes: Record<string, string | undefined>) {
	i18nMessages = mes;
}

export function t(key: string, interpolation?: Record<string, unknown>): string {
	let t = (i18nMessages[key] || key);
	for (const key in interpolation) {
		const value = interpolation[key];
		t = t.replace(new RegExp(escapeRegExp(`{${key}}`), 'g'), () => String(value));
	}
	return t;
}
