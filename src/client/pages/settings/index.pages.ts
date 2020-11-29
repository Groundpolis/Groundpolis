import { Component, defineAsyncComponent } from 'vue';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

import { faPalette, faPlug, faUser, faListUl, faLock, faMusic, faCogs, faEllipsisH, faBan, faShareAlt, faLockOpen, faKey, faBoxes, faFlask, faFish, faCommentSlash, faMagic, faColumns, faStream, faDownload, faFolderOpen, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { faLaugh, faBell } from '@fortawesome/free-regular-svg-icons';

import { i18n } from '@/i18n';

export type PageDefinition = {
	component: () => Component,
	name: string,
	type: 'basic' | 'client' | 'other' | 'hidden',
	title?: string,
	icon?: IconProp,
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
		name: 'email',
		icon: faUser,
		title: t('email'),
		type: 'basic',
		component: () => defineAsyncComponent(() => import('./email.vue')),
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
		name: 'general',
		icon: faCogs,
		title: t('general'),
		type: 'client',
		component: () => defineAsyncComponent(() => import('./general.vue')),
	},
	{
		name: 'timeline',
		icon: faStream,
		title: t('timeline'),
		type: 'client',
		component: () => defineAsyncComponent(() => import('./timeline.vue')),
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
		icon: faBan,
		title: t('muteAndBlock'),
		type: 'other',
		component: () => defineAsyncComponent(() => import('./mute-block.vue')),
	},
	{
		name: 'word-mute',
		icon: faCommentSlash,
		title: t('wordMute'),
		type: 'other',
		component: () => defineAsyncComponent(() => import('./word-mute.vue')),
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
	{
		name: 'email/address',
		type: 'hidden',
		component: () => defineAsyncComponent(() => import('./email-address.vue')),
	},
	{
		name: '2fa',
		type: 'hidden',
		title: t('twoStepAuthentication'),
		icon: faLock,
		component: () => defineAsyncComponent(() => import('./2fa.vue')),
	},
	{
		name: 'theme/install',
		type: 'hidden',
		title: t('_theme.install'),
		icon: faDownload,
		component: () => defineAsyncComponent(() => import('./theme.install.vue')),
	},
	{
		name: 'theme/manage',
		type: 'hidden',
		title: t('_theme.manage'),
		icon: faFolderOpen,
		component: () => defineAsyncComponent(() => import('./theme.manage.vue')),
	},
	{
		name: 'account-info',
		type: 'hidden',
		title: t('accountInfo'),
		icon: faInfoCircle,
		component: () => defineAsyncComponent(() => import('./account-info.vue')),
	},
];
