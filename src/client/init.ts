/**
 * Client entry point
 */

import Vue from 'vue';
import Vuex from 'vuex';
import VueMeta from 'vue-meta';
import PortalVue from 'portal-vue';
import VAnimateCss from 'v-animate-css';
import VueI18n from 'vue-i18n';
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome';
import VueVideoPlayer from 'vue-video-player';
import 'video.js/dist/video-js.css';
import { AiScript } from '@syuilo/aiscript';
import { deserialize } from '@syuilo/aiscript/built/serializer';

import VueHotkey from './scripts/hotkey';
import App from './app.vue';
import Deck from './deck.vue';
import MiOS from './mios';
import { version, langs, instanceName, getLocale, deckmode } from './config';
import PostFormDialog from './components/post-form-dialog.vue';
import Dialog from './components/dialog.vue';
import Menu from './components/menu.vue';
import Form from './components/form-window.vue';
import { router } from './router';
import { applyTheme, lightTheme } from './scripts/theme';
import { isDeviceDarkmode } from './scripts/is-device-darkmode';
import createStore from './store';
import { clientDb, get, count } from './db';
import { setI18nContexts } from './scripts/set-i18n-contexts';
import { NoteVisibility } from '../types';
import { createPluginEnv } from './scripts/aiscript/api';

Vue.use(Vuex);
Vue.use(VueHotkey);
Vue.use(VueMeta);
Vue.use(PortalVue);
Vue.use(VAnimateCss);
Vue.use(VueVideoPlayer);

Vue.use(VueI18n);
Vue.component('fa', FontAwesomeIcon);
Vue.component('fa-layers', FontAwesomeLayers);

require('./directives');
require('./components');
require('./widgets');
require('./filters');

Vue.mixin({
	methods: {
		destroyDom() {
			this.$destroy();

			if (this.$el.parentNode) {
				this.$el.parentNode.removeChild(this.$el);
			}
		}
	}
});

console.info(`Groundpolis v${version}`);

if (localStorage.getItem('theme') == null) {
	applyTheme(lightTheme);
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

const store = createStore();

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

const os = new MiOS(store);

os.init(async () => {
	//#region Fetch locale data
	const i18n = new VueI18n();

	await count(clientDb.i18n).then(async n => {
		if (n === 0) return setI18nContexts(lang, version, i18n);
		if ((await get('_version_', clientDb.i18n) !== version)) return setI18nContexts(lang, version, i18n, true);

		i18n.locale = lang;
		i18n.setLocaleMessage(lang, await getLocale());
	});
	//#endregion

	// vuex に i があるけど、ストレージに i がない場合用意する(React FE Beta 向け)
	if (!localStorage['i'] !== store.state.i?.token && store.state.i) { 
		localStorage['i'] = store.state.i?.token;
	}
	

	const instances: Record<string, {
		fetchedAt: number,
		instance: Record<string, any>
	}> = {};

	const ticker = localStorage['instanceTicker'];

		if (ticker && ticker !== 'null') {
			// マイグレーション
			console.info('InstanceTicker settings detected, start migrating...');

			const value = (store.state as any).device.hideAcct ? 1 : 2;
			store.commit('device/set', { key: 'userHostDisplayMode', value });
			localStorage.removeItem('instanceTicker');
		}

	const app = new Vue({
		store: store,
		i18n,
		metaInfo: {
			title: null,
			titleTemplate: title => title ? `${title} | ${(instanceName || 'Groundpolis')}` : (instanceName || 'Groundpolis')
		},
		data() {
			return {
				stream: os.stream,
				isMobile: isMobile,
				i18n // TODO: 消せないか考える SEE: https://github.com/syuilo/misskey/pull/6396#discussion_r429511030
			};
		},
		// TODO: ここらへんのメソッド全部Vuexに移したい
		methods: {
			api: (endpoint: string, data: { [x: string]: any } = {}, token?) => store.dispatch('api', { endpoint, data, token }),
			async getInstance (host: string) {
				// キャッシュが無いか、前回取得時から5分以上たっていれば取得してくる
				if (!instances[host] || new Date().getTime() - instances[host].fetchedAt > 1000 * 60 * 5) {
					instances[host] = await this.api('federation/show-instance', { host });
				}
				return instances[host];
			},
			signout: os.signout,
			signoutAll: os.signoutAll,
			new(vm, props) {
				const x = new vm({
					parent: this,
					propsData: props
				}).$mount();
				document.body.appendChild(x.$el);
				return x;
			},
			dialog(opts) {
				const vm = this.new(Dialog, opts);
				const p: any = new Promise((res) => {
					vm.$once('ok', result => res({ canceled: false, result }));
					vm.$once('cancel', () => res({ canceled: true }));
				});
				p.close = () => {
					vm.close();
				};
				return p;
			},
			menu(opts) {
				const vm = this.new(Menu, opts);
				const p: any = new Promise((res) => {
					vm.$once('closed', () => res());
				});
				return p;
			},
			form(title, form) {
				const vm = this.new(Form, { title, form });
				return new Promise((res) => {
					vm.$once('ok', result => res({ canceled: false, result }));
					vm.$once('closed', () => res({ canceled: true }));
				});
			},
			post(opts, cb) {
				if (!this.$store.getters.isSignedIn) return;
				const vm = this.new(PostFormDialog, opts);
				if (cb) vm.$once('closed', cb);
				(vm as any).focus();
			},
			sound(type: string) {
				if (this.$store.state.device.sfxVolume === 0) return;
				const sound = this.$store.state.device['sfx' + type.substr(0, 1).toUpperCase() + type.substr(1)];
				if (sound == null) return;
				const audio = new Audio(`/assets/sounds/${sound}.mp3`);
				audio.volume = this.$store.state.device.sfxVolume;
				audio.play();
			},
			createNoteInstantly(text: string, cw?: string, visibility?: NoteVisibility) {
				const s = this.$store.state.settings;
				const d = this.$store.state.device;
				return this.api('notes/create', {
					text, cw,
					localOnly: s.rememberNoteVisibility ? d.localOnly : s.defaultNoteLocalOnly,
					remoteFollowersOnly: s.rememberNoteVisibility ? false : d.localOnly,
					visibility: visibility ? visibility : s.rememberNoteVisibility ? d.visibility : s.defaultNoteVisibility,
					viaMobile: this.isMobile
				});
			}
		},
		router: router,
		render: createEl => createEl(deckmode ? Deck : App)
	});

	// マウント
	app.$mount('#app');

	store.watch(state => state.device.darkMode, darkMode => {
		import('./scripts/theme').then(({ builtinThemes }) => {
			const themes = builtinThemes.concat(store.state.device.themes);
			applyTheme(themes.find(x => x.id === (darkMode ? store.state.device.darkTheme : store.state.device.lightTheme)));
		});
	});

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
	if (store.state.device.syncDeviceDarkMode) {
		store.commit('device/set', { key: 'darkMode', value: isDeviceDarkmode() });
	}

	window.matchMedia('(prefers-color-scheme: dark)').addListener(mql => {
		if (store.state.device.syncDeviceDarkMode) {
			store.commit('device/set', { key: 'darkMode', value: mql.matches });
		}
	});
	//#endregion

	store.watch(state => state.device.useBlurEffectForModal, v => {
		document.documentElement.style.setProperty('--modalBgFilter', v ? 'blur(4px)' : 'none');
	}, { immediate: true });

	let reloadDialogShowing = false;
	os.stream.on('_disconnected_', async () => {
		if (store.state.device.serverDisconnectedBehavior === 'reload') {
			location.reload();
		} else if (store.state.device.serverDisconnectedBehavior === 'dialog') {
			if (reloadDialogShowing) return;
			reloadDialogShowing = true;
			const { canceled } = await app.dialog({
				type: 'warning',
				title: app.$t('disconnectedFromServer'),
				text: app.$t('reloadConfirm'),
				showCancelButton: true
			});
			reloadDialogShowing = false;
			if (!canceled) {
				location.reload();
			}
		}
	});

	os.stream.on('emojiAdded', data => {
		// TODO
		//store.commit('instance/set', );
	});

	for (const plugin of store.state.deviceUser.plugins.filter(p => p.active)) {
		console.info('Plugin installed:', plugin.name, 'v' + plugin.version);

		const aiscript = new AiScript(createPluginEnv(app, {
			plugin: plugin,
			storageKey: 'plugins:' + plugin.id
		}), {
			in: (q) => {
				return new Promise(ok => {
					app.dialog({
						title: q,
						input: {}
					}).then(({ canceled, result: a }) => {
						ok(a);
					});
				});
			},
			out: (value) => {
				console.log(value);
			},
			log: (type, params) => {
			},
		});

		store.commit('initPlugin', { plugin, aiscript });

		aiscript.exec(deserialize(plugin.ast));
	}

	if (store.getters.isSignedIn) {
		if ('Notification' in window) {
			// 許可を得ていなかったらリクエスト
			if (Notification.permission === 'default') {
				Notification.requestPermission();
			}
		}

		const main = os.stream.useSharedConnection('main');

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

			app.sound('chatBg');
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

			app.sound('antenna');
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

			app.sound('channel');
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
		// このままではGroundpolisが利用できないので強制的にサインアウトさせる
		main.on('myTokenRegenerated', () => {
			os.signout();
		});
	}
});
