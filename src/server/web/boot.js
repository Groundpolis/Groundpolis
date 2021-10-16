/**
 * BOOT LOADER
 * サーバーからレスポンスされるHTMLに埋め込まれるスクリプトで、以下の役割を持ちます。
 * - 翻訳ファイルをフェッチする。
 * - バージョンに基づいて適切なメインスクリプトを読み込む。
 * - キャッシュされたコンパイル済みテーマを適用する。
 * - クライアントの設定値に基づいて対応するHTMLクラス等を設定する。
 * テーマをこの段階で設定するのは、メインスクリプトが読み込まれる間もテーマを適用したいためです。
 * 注: webpackは介さないため、このファイルではrequireやimportは使えません。
 */

'use strict';

// ブロックの中に入れないと、定義した変数がブラウザのグローバルスコープに登録されてしまい邪魔なので
(async () => {
	const v = localStorage.getItem('v') || VERSION;

	const splashText = document.getElementById('splash');

	function printSplash(data) {
		splashText.innerText = String(data);
	}

	printSplash('Booting');

	const res = await fetch('/api/meta', {
		method: 'POST',
		cache: 'no-cache'
	}).catch(e => {
		printSplash(e);
	});

	if (res.status !== 200) {
		printSplash(res.statusText);
		return;
	}

	const meta = await res.json().catch(e => {
		printSplash(e);
	});

	let version = meta.version;
	
	const updateRequired = v !== version;

	if (updateRequired) {
		localStorage.removeItem('locale');
		printSplash('Updating Groundpolis');

		localStorage.removeItem('theme');
	}

	//#region Detect language & fetch translations
	if (localStorage.hasOwnProperty('locale')) {
		// TODO: 非同期でlocaleの更新処理をする
	} else {
		const supportedLangs = LANGS;
		let lang = localStorage.getItem('lang');
		if (lang == null || !supportedLangs.includes(lang)) {
			if (supportedLangs.includes(navigator.language)) {
				lang = navigator.language;
			} else {
				lang = supportedLangs.find(x => x.split('-')[0] === navigator.language);

				// Fallback
				if (lang == null) lang = 'en-US';
			}
		}

		const res = await fetch(`/assets/locales/${lang}.${version}.json`);
		localStorage.setItem('lang', lang);
		localStorage.setItem('locale', await res.text());
	}
	//#endregion

	//#region Script
	const salt = localStorage.getItem('salt')
		? `?salt=${localStorage.getItem('salt')}`
		: '';

	const head = document.getElementsByTagName('head')[0];

	const script = document.createElement('script');
	script.setAttribute('src', `/assets/app.${version}.js${salt}`);
	script.setAttribute('async', 'true');
	script.setAttribute('defer', 'true');
	script.addEventListener('error', async (e) => {
		printSplash('Error: ' + e.message);
	});
	head.appendChild(script);
	//#endregion

	//#region Theme
	const theme = localStorage.getItem('theme');
	if (theme) {
		for (const [k, v] of Object.entries(JSON.parse(theme))) {
			document.documentElement.style.setProperty(`--${k}`, v.toString());

			// HTMLの theme-color 適用
			if (k === 'htmlThemeColor') {
				for (const tag of document.head.children) {
					if (tag.tagName === 'META' && tag.getAttribute('name') === 'theme-color') {
						tag.setAttribute('content', v);
						break;
					}
				}
			}
		}
	}
	//#endregion

	const fontSize = localStorage.getItem('fontSize');
	if (fontSize) {
		document.documentElement.classList.add('f-' + fontSize);
	}

	const wallpaper = localStorage.getItem('wallpaper');
	if (wallpaper) {
		document.documentElement.style.backgroundImage = `url(${wallpaper})`;
	}

	// eslint-disable-next-line no-inner-declarations
	function refresh() {
		// Random
		localStorage.setItem('salt', Math.random().toString().substr(2, 8));

		// Clear cache (service worker)
		try {
			navigator.serviceWorker.controller.postMessage('clear');
			navigator.serviceWorker.getRegistrations().then(registrations => {
				registrations.forEach(registration => registration.unregister());
			});
		} catch (e) {
			console.error(e);
		}

		location.reload();
	}
})();

