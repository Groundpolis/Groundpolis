/**
 * Client entry point
 */

import '@/style.scss';

import { createApp } from 'vue';
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome';

import widgets from './widgets';
import directives from './directives';
import components from '@/components';
import { version, apiUrl, ui } from '@/config';
import { store } from './store';
import { router } from './router';
import { applyTheme } from '@/scripts/theme';
import { isDeviceDarkmode } from '@/scripts/is-device-darkmode';
import { i18n, lang } from './i18n';
import { stream, sound, isMobile, dialog } from '@/os';

console.info(`Groundpolis v${version}`);

if (_DEV_) {
	console.warn('Development mode!!!');

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

// タッチデバイスでCSSの:hoverを機能させる
document.addEventListener('touchend', () => {}, { passive: true });

if (localStorage.getItem('theme') == null) {
	applyTheme(require('@/themes/d-groundpolis.json5'));
}

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

//#region Fetch user
const signout = () => {
	store.dispatch('logout');
	location.href = '/';
};

// ユーザーをフェッチしてコールバックする
const fetchme = (token) => new Promise((done, fail) => {
	// Fetch user
	fetch(`${apiUrl}/i`, {
		method: 'POST',
		body: JSON.stringify({
			i: token
		})
	})
	.then(res => {
		// When failed to authenticate user
		if (res.status !== 200 && res.status < 500) {
			return signout();
		}

		// Parse response
		res.json().then(i => {
			i.token = token;
			done(i);
		});
	})
	.catch(fail);
});

// キャッシュがあったとき
if (store.state.i != null) {
	// TODO: i.token が null になるケースってどんな時だっけ？
	if (store.state.i.token == null) {
		signout();
	}

	// 後から新鮮なデータをフェッチ
	fetchme(store.state.i.token).then(freshData => {
		store.dispatch('mergeMe', freshData);
	});
} else {
	// Get token from localStorage
	let i = localStorage.getItem('i');

	// 連携ログインの場合用にCookieを参照する
	if (i == null || i === 'null') {
		i = (document.cookie.match(/igi=(\w+)/) || [null, null])[1];
	}

	if (i != null && i !== 'null') {
		try {
			document.body.innerHTML = '<div>Please wait...</div>';
			const me = await fetchme(i);
			await store.dispatch('login', me);
			location.reload();
		} catch (e) {
			// Render the error screen
			// TODO: ちゃんとしたコンポーネントをレンダリングする(v10とかのトラブルシューティングゲーム付きのやつみたいな)
			document.body.innerHTML = '<div id="err">Oops!</div>';
		}
	}
}
//#endregion

store.dispatch('instance/fetch').then(() => {
	// Init service worker
	//if (this.store.state.instance.meta.swPublickey) this.registerSw(this.store.state.instance.meta.swPublickey);
});

stream.init(store.state.i);

const app = createApp(await (
	window.location.search === '?zen' ? import('@/ui/zen.vue') :
	!store.getters.isSignedIn         ? import('@/ui/visitor.vue') :
	ui === 'deck'                     ? import('@/ui/deck.vue') :
	ui === 'desktop'                  ? import('@/ui/desktop.vue') :
	import('@/ui/default.vue')
).then(x => x.default));

if (_DEV_) {
	app.config.performance = true;
}

app.use(store);
app.use(router);
app.use(i18n);
// eslint-disable-next-line vue/component-definition-name-casing
app.component('Fa', FontAwesomeIcon);
app.component('FaLayers', FontAwesomeLayers);

widgets(app);
directives(app);
components(app);

await router.isReady();

//document.body.innerHTML = '<div id="app"></div>';

app.mount('body');

// 他のタブと永続化されたstateを同期
window.addEventListener('storage', e => {
	if (e.key === 'vuex') {
		store.replaceState({
			...store.state,
			...JSON.parse(e.newValue)
		});
	} else if (e.key === 'i') {
		location.reload();
	}
}, false);

store.watch(state => state.device.darkMode, darkMode => {
	import('@/scripts/theme').then(({ builtinThemes }) => {
		const themes = builtinThemes.concat(store.state.device.themes);
		applyTheme(themes.find(x => x.id === (darkMode ? store.state.device.darkTheme : store.state.device.lightTheme)));
	});

	const ticker = localStorage['instanceTicker'];

	if (ticker && ticker !== 'null') {
		// マイグレーション
		console.info('InstanceTicker settings detected, start migrating...');

		const value = (store.state as any).device.hideAcct ? 1 : 2;
		store.commit('device/set', { key: 'userHostDisplayMode', value });
		localStorage.removeItem('instanceTicker');
	}
});

//#region Sync dark mode
if (store.state.device.syncDeviceDarkMode) {
	store.commit('device/set', { key: 'darkMode', value: isDeviceDarkmode() });
}

// v2 リアクションの移行
const reactions = store.state.settings.reactions.map(r => {
	switch (r) {
		case 'like': return '👍';
		case 'love': return '❤️';
		case 'laugh': return '😆';
		case 'hmm': return '🤔';
		case 'surprise': return '😮';
		case 'congrats': return '🎉';
		case 'angry': return '💢';
		case 'confused': return '😥';
		case 'rip': return '😇';
		case 'pudding': return '🍮';
		default: return r;
	}
});
store.dispatch('settings/set', { key: 'reactions', value: reactions });

	//#region Sync dark mode
window.matchMedia('(prefers-color-scheme: dark)').addEventListener(mql => {
	if (store.state.device.syncDeviceDarkMode) {
		store.commit('device/set', { key: 'darkMode', value: mql.matches });
	}
});
//#endregion

store.watch(state => state.device.useBlurEffectForModal, v => {
	document.documentElement.style.setProperty('--modalBgFilter', v ? 'blur(4px)' : 'none');
}, { immediate: true });

let reloadDialogShowing = false;
stream.on('_disconnected_', async () => {
	if (store.state.device.serverDisconnectedBehavior === 'reload') {
		location.reload();
	} else if (store.state.device.serverDisconnectedBehavior === 'dialog') {
		if (reloadDialogShowing) return;
		reloadDialogShowing = true;
		const { canceled } = await dialog({
			type: 'warning',
			title: i18n.global.t('disconnectedFromServer'),
			text: i18n.global.t('reloadConfirm'),
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

for (const plugin of store.state.deviceUser.plugins.filter(p => p.active)) {
	import('./plugin').then(({ install }) => {
		install(plugin);
	});
}

if (store.getters.isSignedIn) {
	if ('Notification' in window) {
		// 許可を得ていなかったらリクエスト
		if (Notification.permission === 'default') {
			Notification.requestPermission();
		}
	}

	const main = stream.useSharedConnection('main', 'System');

	// 自分の情報が更新されたとき
	main.on('meUpdated', i => {
		store.dispatch('mergeMe', i);
	});

	main.on('readAllNotifications', () => {
		store.dispatch('mergeMe', {
			hasUnreadNotification: false
		});
	});

	main.on('unreadNotification', () => {
		store.dispatch('mergeMe', {
			hasUnreadNotification: true
		});
	});

	main.on('unreadMention', () => {
		store.dispatch('mergeMe', {
			hasUnreadMentions: true
		});
	});

	main.on('readAllUnreadMentions', () => {
		store.dispatch('mergeMe', {
			hasUnreadMentions: false
		});
	});

	main.on('unreadSpecifiedNote', () => {
		store.dispatch('mergeMe', {
			hasUnreadSpecifiedNotes: true
		});
	});

	main.on('readAllUnreadSpecifiedNotes', () => {
		store.dispatch('mergeMe', {
			hasUnreadSpecifiedNotes: false
		});
	});

	main.on('readAllMessagingMessages', () => {
		store.dispatch('mergeMe', {
			hasUnreadMessagingMessage: false
		});
	});

	main.on('unreadMessagingMessage', () => {
		store.dispatch('mergeMe', {
			hasUnreadMessagingMessage: true
		});

		sound('chatBg');
	});

	main.on('readAllAntennas', () => {
		store.dispatch('mergeMe', {
			hasUnreadAntenna: false
		});
	});

	main.on('unreadAntenna', () => {
		store.dispatch('mergeMe', {
			hasUnreadAntenna: true
		});

		sound('antenna');
	});

	main.on('readAllAnnouncements', () => {
		store.dispatch('mergeMe', {
			hasUnreadAnnouncement: false
		});
	});

	main.on('readAllChannels', () => {
		store.dispatch('mergeMe', {
			hasUnreadChannel: false
		});
	});

	main.on('unreadChannel', () => {
		store.dispatch('mergeMe', {
			hasUnreadChannel: true
		});

		sound('channel');
	});

	main.on('readAllAnnouncements', () => {
		store.dispatch('mergeMe', {
			hasUnreadAnnouncement: false
		});
	});

	main.on('clientSettingUpdated', x => {
		store.commit('settings/set', {
			key: x.key,
			value: x.value
		});
	});

	// トークンが再生成されたとき
	// このままではGroundpoliが利用できないので強制的にサインアウトさせる
	main.on('myTokenRegenerated', () => {
		signout();
	});
}

