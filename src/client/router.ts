import Vue from 'vue';
import VueRouter from 'vue-router';
import MkIndex from './pages/index.vue';

Vue.use(VueRouter);

const page = (path: string) => () => import(`./pages/${path}.vue`).then(m => m.default);

let indexScrollPos = 0;

export const router = new VueRouter({
	mode: 'history',
	routes: [
		{ path: '/', name: 'index', component: MkIndex, props: { src: 'myself' } },
		{ path: '/everyone', name: 'everyone', component: MkIndex, props: { src: 'everyone' } },
		{ path: '/reacted', name: 'reacted', component: MkIndex, props: { src: 'reacted' } },
		{ path: '/announcements', component: page('announcements') },
		{ path: '/about', component: page('about') },
		{ path: '/about-misskey', component: page('about-misskey') },
		{ path: '/docs', component: page('docs') },
		{ path: '/docs/:doc', component: page('doc'), props: true },
		{ path: '/my/drive', name: 'drive', component: page('drive') },
		{ path: '/my/drive/folder/:folder', component: page('drive') },
		{ path: '/my/settings', component: page('my-settings/index') },
		{ path: '/my/apps', component: page('apps') },
		{ path: '/preferences', component: page('preferences/index') },
		{ path: '/scratchpad', component: page('scratchpad') },
		{ path: '/instance', component: page('instance/index') },
		{ path: '/instance/emojis', component: page('instance/emojis') },
		{ path: '/instance/users', component: page('instance/users') },
		{ path: '/instance/users/:user', component: page('instance/users.user') },
		{ path: '/instance/files', component: page('instance/files') },
		{ path: '/instance/queue', component: page('instance/queue') },
		{ path: '/instance/settings', component: page('instance/settings') },
		{ path: '/instance/federation', component: page('instance/federation') },
		{ path: '/instance/announcements', component: page('instance/announcements') },
		{ path: '/notes/:note', name: 'note', component: page('note') },
		{ path: '/tags/:tag', component: page('tag') },
		{ path: '/auth/:token', component: page('auth') },
		{ path: '/miauth/:session', component: page('miauth') },
		{ path: '/authorize-follow', component: page('follow') },
		{ path: '/share', component: page('share') },
		{ path: '*', component: page('not-found') }
	],
	// なんかHacky
	// 通常の使い方をすると scroll メソッドの behavior を設定できないため、自前で window.scroll するようにする
	scrollBehavior(to) {
		window._scroll = () => { // さらにHacky
			if (to.name === 'index') {
				window.scroll({ top: indexScrollPos, behavior: 'instant' });
				const i = setInterval(() => {
					window.scroll({ top: indexScrollPos, behavior: 'instant' });
				}, 10);
				setTimeout(() => {
					clearInterval(i);
				}, 500);
			} else {
				window.scroll({ top: 0, behavior: 'instant' });
			}
		};
	}
});

router.afterEach((to, from) => {
	if (from.name === 'index') {
		indexScrollPos = window.scrollY;
	}
});
