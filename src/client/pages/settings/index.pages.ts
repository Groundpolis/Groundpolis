import { Component, defineAsyncComponent } from 'vue';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

import { faPalette, faPlug, faUser, faListUl, faLock, faMusic, faCogs, faEllipsisH, faBan, faShareAlt, faLockOpen, faKey, faBoxes, faFlask, faFish, faCommentSlash, faMagic, faColumns } from '@fortawesome/free-solid-svg-icons';
import { faLaugh, faBell } from '@fortawesome/free-regular-svg-icons';

import { i18n } from '@/i18n';

export type PageDefinition = {
	component: () => Component,
	name: string,
	type: 'basic' | 'client' | 'other',
	title: string,
	icon: IconProp,
};

const t = i18n.global.t;
export const pages: PageDefinition[] = [
	{
		name: 'profile',
		icon: faUser,
		title: t('profile'),
		type: 'basic',
		component: () => defineAsyncComponent(() => import('./profile.vue')),
	},
	{
		name: 'privacy',
		icon: faLockOpen,
		title: t('privacy'),
		type: 'basic',
		component: () => defineAsyncComponent(() => import('./privacy.vue')),
	},
	{
		name: 'reaciton',
		icon: faLaugh,
		title: t('reaction'),
		type: 'basic',
		component: () => defineAsyncComponent(() => import('./reaction.vue')),
	},
	{
		name: 'notifications',
		icon: faBell,
		title: t('notifications'),
		type: 'basic',
		component: () => defineAsyncComponent(() => import('./notifications.vue')),
	},
	{
		name: 'integration',
		icon: faShareAlt,
		title: t('integration'),
		type: 'basic',
		component: () => defineAsyncComponent(() => import('./integration.vue')),
	},
	{
		name: 'security',
		icon: faLock,
		title: t('security'),
		type: 'basic',
		component: () => defineAsyncComponent(() => import('./security.vue')),
	},

	{
		name: 'behavior',
		icon: faCogs,
		title: t('behavior'),
		type: 'client',
		component: () => defineAsyncComponent(() => import('./general.vue')),
	},
	{
		name: 'appearance',
		icon: faMagic,
		title: t('appearance'),
		type: 'client',
		component: () => defineAsyncComponent(() => import('./appearance.vue')),
	},
	{
		name: 'deck',
		icon: faColumns,
		title: t('deck'),
		type: 'client',
		component: () => defineAsyncComponent(() => import('./deck.vue')),
	},
	{
		name: 'theme',
		icon: faPalette,
		title: t('theme'),
		type: 'client',
		component: () => defineAsyncComponent(() => import('./theme.vue')),
	},
	{
		name: 'sidebar',
		icon: faListUl,
		title: t('sidebar'),
		type: 'client',
		component: () => defineAsyncComponent(() => import('./sidebar.vue')),
	},
	{
		name: 'sounds',
		icon: faMusic,
		title: t('sounds'),
		type: 'client',
		component: () => defineAsyncComponent(() => import('./sounds.vue')),
	},
	{
		name: 'plugins',
		icon: faPlug,
		title: t('plugins'),
		type: 'client',
		component: () => defineAsyncComponent(() => import('./plugins.vue')),
	},
	{
		name: 'gacha',
		icon: faFish,
		title: t('gacha'),
		type: 'client',
		component: () => defineAsyncComponent(() => import('./gacha.vue')),
	},

	{
		name: 'import-export',
		icon: faBoxes,
		title: t('importAndExport'),
		type: 'other',
		component: () => defineAsyncComponent(() => import('./import-export.vue')),
	},
	{
		name: 'mute-block',
		icon: faCommentSlash,
		title: t('muteAndBlock'),
		type: 'other',
		component: () => defineAsyncComponent(() => import('./mute-block.vue')),
	},
	{
		name: 'api',
		icon: faKey,
		title: 'API',
		type: 'other',
		component: () => defineAsyncComponent(() => import('./api.vue')),
	},
	{
		name: 'labs',
		icon: faFlask,
		title: t('_labs.title'),
		type: 'other',
		component: () => defineAsyncComponent(() => import('./labs.vue')),
	},
	{
		name: 'other',
		icon: faEllipsisH,
		title: t('other'),
		type: 'other',
		component: () => defineAsyncComponent(() => import('./other.vue')),
	},
];
