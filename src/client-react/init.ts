import React from 'react';
import ReactDOM from 'react-dom';

import { version, langs, instanceName, getLocale, deckmode } from './config';
import { App } from './App';
import { clientDb, get, count } from './db';
import { applyTheme, oceanTheme } from './scripts/theme';
import { setI18nContexts, setLocale } from './scripts/i18n';

(async () => {
	if (localStorage.getItem('theme') == null) {
		applyTheme(oceanTheme);
	}

	//#region Detect the user language
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
	//#endregion

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

	// Detect the user agent
	const ua = navigator.userAgent.toLowerCase();
	const isMobile = /mobile|iphone|ipad|android/.test(ua);

	// Get the <head> element
	const head = document.getElementsByTagName('head')[0];

	// If mobile, insert the viewport meta tag
	if (isMobile || window.innerWidth <= 1024) {
		const viewport = document.getElementsByName('viewport').item(0);
		viewport.setAttribute('content',
			`${viewport.getAttribute('content')},minimum-scale=1,maximum-scale=1,user-scalable=no`);
		head.appendChild(viewport);
	}

	//#region Set lang attr
	const html = document.documentElement;
	html.setAttribute('lang', lang);
	//#endregion

	// アプリ基底要素マウント
	document.body.innerHTML = '<div id="app"></div>';
	console.info(`Groundpolis v${version}`);

	ReactDOM.render(App(), document.getElementById('app'));
})();
