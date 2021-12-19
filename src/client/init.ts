/**
 * Client entry point
 */

import '@/style.scss';

// マイグレーション
if (localStorage['vuex'] !== undefined) {
	const vuex = JSON.parse(localStorage['vuex']);

	if (localStorage.getItem('i') !== null) {
		localStorage.setItem('account', JSON.stringify({
			...vuex.i,
			token: localStorage.getItem('i')
		}));
	}
	localStorage.setItem('accounts', JSON.stringify(vuex.device.accounts));
	localStorage.setItem('miux:themes', JSON.stringify(vuex.device.themes));

	for (const [k, v] of 	Object.entries(vuex.device.userData)) {
		localStorage.setItem('pizzax::base::' + k, JSON.stringify({
			widgets: v.widgets
		}));

		if (v.deck) {
			localStorage.setItem('pizzax::deck::' + k, JSON.stringify({
				columns: v.deck.columns,
				layout: v.deck.layout,
			}));
		}
	}

	localStorage.setItem('vuex-old', JSON.stringify(vuex));
	localStorage.removeItem('vuex');
	localStorage.removeItem('i');
	localStorage.removeItem('locale');

	location.reload();
}

import * as Sentry from '@sentry/browser';
import { createApp, nextTick, watch } from 'vue';
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome';

import widgets from '@/widgets';
import directives from '@/directives';
import components from '@/components';
import { version, ui, lang, host, legacyWebkitCompatibleMode } from '@/config';
import { router } from '@/router';
import { applyTheme } from '@/scripts/theme';
import { isDeviceDarkmode } from '@/scripts/is-device-darkmode';
import { i18n } from '@/i18n';
import { stream, isMobile, dialog, post, getAccounts } from '@/os';
import * as sound from '@/scripts/sound';
import { $i, refreshAccount, login, updateAccount, signout } from '@/account';
import { defaultStore, ColdDeviceStorage } from '@/store';
import { fetchInstance, instance } from '@/instance';
import { makeHotkey } from './scripts/hotkey';
import { search } from './scripts/search';
import { getThemes } from './theme-store';
import { initializeSw } from './scripts/initialize-sw';

console.info(`Groundpolis v${version}`);

if (_DEV_) {
	console.warn('Development mode!!!');

	(window as any).$i = $i;
	(window as any).$store = defaultStore;
	(window as any).$instance = instance;
	(window as any).$t = i18n.t;
	(window as any).$ts = i18n.locale;

	window.addEventListener('error', event => {
		console.error(event);
		/*
		dialog({
			type: 'error',
			title: 'DEV: Unhandled error',
			text: event.message
		});
		*/
	});

	window.addEventListener('unhandledrejection', event => {
		console.error(event);
		/*
		dialog({
			type: 'error',
			title: 'DEV: Unhandled promise rejection',
			text: event.reason
		});
		*/
	});
}

const pattern = /iPhone OS (\d+)/;

const matched = navigator.userAgent.match(pattern);

const iOSVersion = !matched ? null : parseInt(matched[1]);

console.log(`UA: ${navigator.userAgent}`);
console.log(`iOS Version ${iOSVersion}`);

if (iOSVersion && iOSVersion < 15 && !legacyWebkitCompatibleMode) {
	dialog({
		type: 'warning',
		title: i18n.locale.legacyWebkitCompatibleModeDialogTitle,
		text: i18n.locale.legacyWebkitCompatibleModeDialogText,
		actions: [{
			text: i18n.locale.yes,
			primary: true,
			callback: () => {
				localStorage.setItem('legacyWebkitCompatibleMode', 'true');
				location.reload();
			},
		}, {
			text: i18n.locale.no,
			callback: () => { },
		}],
	});
}

if (defaultStore.state.reportError && !_DEV_) {
	Sentry.init({
		dsn: 'https://6f81b7c836e840d1aee49be533b0f26a@o502733.ingest.sentry.io/5585379',
		tracesSampleRate: 1.0,
	});

	Sentry.setTag('groundpolis_version', version);
	Sentry.setTag('ui', ui);
	Sentry.setTag('lang', lang);
	Sentry.setTag('host', host);
}

// タッチデバイスでCSSの:hoverを機能させる
document.addEventListener('touchend', () => {}, { passive: true });

//#region SEE: https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
// TODO: いつの日にか消したい
const vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);
window.addEventListener('resize', () => {
	const vh = window.innerHeight * 0.01;
	document.documentElement.style.setProperty('--vh', `${vh}px`);
});
//#endregion

// Get the <head> element
const head = document.getElementsByTagName('head')[0];

const css = localStorage['css'];

if (css) { 
	const style = document.createElement('style');
	style.innerText = css;

	head.appendChild(style);
}

// If mobile, insert the viewport meta tag
if (isMobile || window.innerWidth <= 1024) {
	const viewport = document.getElementsByName('viewport').item(0);
	viewport.setAttribute('content',
		`${viewport.getAttribute('content')},minimum-scale=1,maximum-scale=1,user-scalable=no`);
	head.appendChild(viewport);
}

//#region Set lang attr
const [l] = lang.split('-');
const html = document.documentElement;
html.setAttribute('lang', l);
const metaLang = document.createElement('meta');
metaLang.httpEquiv = 'content-language';
metaLang.content = l;
html.querySelector('head')?.appendChild(metaLang);
//#endregion

//#region Fetch user
if ($i && $i.token) {
	if (_DEV_) {
		console.log('account cache found. refreshing...');
	}

	refreshAccount();
} else {
	if (_DEV_) {
		console.log('no account cache found.');
	}

	// 連携ログインの場合用にCookieを参照する
	const i = (document.cookie.match(/igi=(\w+)/) || [null, null])[1];

	if (i != null && i !== 'null') {
		if (_DEV_) {
			console.log('signing...');
		}

		try {
			document.body.innerHTML = '<div>Please wait...</div>';
			await login(i);
			location.reload();
		} catch (e) {
			// Render the error screen
			// TODO: ちゃんとしたコンポーネントをレンダリングする(v10とかのトラブルシューティングゲーム付きのやつみたいな)
			document.body.innerHTML = '<div id="err">Oops!</div>';
		}
	} else {
		if (_DEV_) {
			console.log('not signed in');
		}
	}
}
//#endregion

fetchInstance().then(() => {
	localStorage.setItem('v', instance.version);

	// Init service worker
	initializeSw();
});

stream.init($i);
await getAccounts();

const app = createApp(await (
	window.location.search === '?zen'     ? import('@/ui/zen.vue') :
	!$i                                   ? import('@/ui/visitor.vue') :
	defaultStore.state.uiMode === 'deck'  ? import('@/ui/deck.vue') :
	import('@/ui/default.vue')
).then(x => x.default));

if (_DEV_) {
	app.config.performance = true;
}

app.config.globalProperties = {
	$i,
	$store: defaultStore,
	$instance: instance,
	$t: i18n.t,
	$ts: i18n.locale,
};

app.use(router);
// eslint-disable-next-line vue/component-definition-name-casing
app.component('Fa', FontAwesomeIcon);
app.component('FaLayers', FontAwesomeLayers);

widgets(app);
directives(app);
components(app);

await router.isReady();

//document.body.innerHTML = '<div id="app"></div>';

app.mount('body');



watch(defaultStore.reactiveState.darkMode, (darkMode) => {
	import('@/scripts/theme').then(({ builtinThemes }) => {
		const themes = builtinThemes.concat(getThemes());
		applyTheme(themes.find(x => x.id === (darkMode ? ColdDeviceStorage.get('darkTheme') : ColdDeviceStorage.get('lightTheme'))));
	});
}, { immediate: localStorage.theme == null });

//#region Sync dark mode
if (ColdDeviceStorage.get('syncDeviceDarkMode')) {
	defaultStore.set('darkMode', isDeviceDarkmode());
}

	//#region Sync dark mode
window.matchMedia('(prefers-color-scheme: dark)').addListener(mql => {
	if (ColdDeviceStorage.get('syncDeviceDarkMode')) {
		defaultStore.set('darkMode', mql.matches);
	}
});
//#endregion

// shortcut
document.addEventListener('keydown', makeHotkey({
	'd': () => {
		defaultStore.set('darkMode', !defaultStore.state.darkMode);
	},
	'p|n': post,
	's': search,
	//TODO: 'h|/': help
}));

watch(defaultStore.reactiveState.useBlurEffectForModal, v => {
	document.documentElement.style.setProperty('--modalBgFilter', v ? 'blur(4px)' : 'none');
}, { immediate: true });

let reloadDialogShowing = false;
stream.on('_disconnected_', async () => {
	if (defaultStore.state.serverDisconnectedBehavior === 'reload') {
		location.reload();
	} else if (defaultStore.state.serverDisconnectedBehavior === 'dialog') {
		if (reloadDialogShowing) return;
		reloadDialogShowing = true;
		const { canceled } = await dialog({
			type: 'warning',
			title: i18n.locale.disconnectedFromServer,
			text: i18n.locale.reloadConfirm,
			showCancelButton: true
		});
		reloadDialogShowing = false;
		if (!canceled) {
			location.reload();
		}
	}
});

stream.on('emojiAdded', data => {
	// TODO
	//store.commit('instance/set', );
});

for (const plugin of ColdDeviceStorage.get('plugins').filter(p => p.active)) {
	import('./plugin').then(({ install }) => {
		install(plugin);
	});
}

if ($i) {
	if ($i.isDeleted) {
		dialog({
			type: 'warning',
			text: i18n.locale.accountDeletionInProgress,
		});
	}

	if ('Notification' in window) {
		// 許可を得ていなかったらリクエスト
		if (Notification.permission === 'default') {
			Notification.requestPermission();
		}
	}

	const main = stream.useSharedConnection('main', 'System');

	// 自分の情報が更新されたとき
	main.on('meUpdated', i => {
		updateAccount(i);
	});

	main.on('readAllNotifications', () => {
		updateAccount({ hasUnreadNotification: false });
	});

	main.on('unreadNotification', () => {
		updateAccount({ hasUnreadNotification: true });
	});

	main.on('unreadMention', () => {
		updateAccount({ hasUnreadMentions: true });
	});

	main.on('readAllUnreadMentions', () => {
		updateAccount({ hasUnreadMentions: false });
	});

	main.on('unreadSpecifiedNote', () => {
		updateAccount({ hasUnreadSpecifiedNotes: true });
	});

	main.on('readAllUnreadSpecifiedNotes', () => {
		updateAccount({ hasUnreadSpecifiedNotes: false });
	});

	main.on('readAllMessagingMessages', () => {
		updateAccount({ hasUnreadMessagingMessage: false });
	});

	main.on('unreadMessagingMessage', () => {
		updateAccount({ hasUnreadMessagingMessage: true });
		sound.play('chatBg');
	});

	main.on('readAllAntennas', () => {
		updateAccount({ hasUnreadAntenna: false });
	});

	main.on('unreadAntenna', () => {
		updateAccount({ hasUnreadAntenna: true });
		sound.play('antenna');
	});

	main.on('readAllAnnouncements', () => {
		updateAccount({ hasUnreadAnnouncement: false });
	});

	main.on('readAllChannels', () => {
		updateAccount({ hasUnreadChannel: false });
	});

	main.on('unreadChannel', () => {
		updateAccount({ hasUnreadChannel: true });
		sound.play('channel');
	});

	main.on('readAllAnnouncements', () => {
		updateAccount({ hasUnreadAnnouncement: false });
	});

	// トークンが再生成されたとき
	// このままではGroundpoliが利用できないので強制的にサインアウトさせる
	main.on('myTokenRegenerated', () => {
		signout();
	});
}
