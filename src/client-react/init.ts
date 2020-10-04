import ReactDOM from 'react-dom';

import { version } from './config';
import { App } from './App';
import { initializeThemes } from './init/initializeThemes';
import { initializeI18n } from './init/initializeI18n';
import { initializeStream } from './utils/stream';
import { api } from './utils/api';

(async () => {
	initializeThemes();
	await initializeI18n();

	const token = localStorage['i'];
	initializeStream({ token });

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

	// アプリ基底要素マウント
	document.body.innerHTML = '<div id="app"></div>';
	console.info(`Groundpolis v${version}`);

	ReactDOM.render(App(), document.getElementById('app'));

})();
