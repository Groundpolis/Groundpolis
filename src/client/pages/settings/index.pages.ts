import { Component, defineAsyncComponent } from 'vue';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

import { faPalette, faPlug, faUser, faListUl, faLock, faMusic, faCogs, faEllipsisH, faBan, faShareAlt, faLockOpen, faKey, faBoxes, faFlask, faFish, faCommentSlash, faMagic, faColumns, faStream, faDownload, faFolderOpen, faInfoCircle, faCloud, faSyncAlt, faGlobe, faClipboardList } from '@fortawesome/free-solid-svg-icons';
import { faLaugh, faBell, faEnvelope } from '@fortawesome/free-regular-svg-icons';
import { faCss3Alt } from '@fortawesome/free-brands-svg-icons';

import { i18n } from '@/i18n';

export type PageDefinition = {
	component: () => Component,
	type: 'basic' | 'client' | 'other' | 'hidden',
	title?: string,
	icon?: IconProp,
} & ({ name: string } | {pattern: RegExp});

const ts = i18n.locale;
export const pages: PageDefinition[] = [
	{
		name: 'profile',
		icon: faUser,
		title: ts.profile,
		type: 'basic',
		component: () => defineAsyncComponent(() => import('./profile.vue')),
	},
	{
		name: 'privacy',
		icon: faLockOpen,
		title: ts.privacy,
		type: 'basic',
		component: () => defineAsyncComponent(() => import('./privacy.vue')),
	},
	{
		name: 'reaciton',
		icon: faLaugh,
		title: ts.reaction,
		type: 'basic',
		component: () => defineAsyncComponent(() => import('./reaction.vue')),
	},
	{
		name: 'drive',
		icon: faCloud,
		title: ts.drive,
		type: 'basic',
		component: () => defineAsyncComponent(() => import('./drive.vue')),
	},
	{
		name: 'notifications',
		icon: faBell,
		title: ts.notifications,
		type: 'basic',
		component: () => defineAsyncComponent(() => import('./notifications.vue')),
	},
	{
		name: 'email',
		icon: faEnvelope,
		title: ts.email,
		type: 'basic',
		component: () => defineAsyncComponent(() => import('./email.vue')),
	},
	{
		name: 'integration',
		icon: faShareAlt,
		title: ts.integration,
		type: 'basic',
		component: () => defineAsyncComponent(() => import('./integration.vue')),
	},
	{
		name: 'security',
		icon: faLock,
		title: ts.security,
		type: 'basic',
		component: () => defineAsyncComponent(() => import('./security.vue')),
	},
	{
		name: 'general',
		icon: faCogs,
		title: ts.general,
		type: 'client',
		component: () => defineAsyncComponent(() => import('./general.vue')),
	},
	{
		name: 'timeline',
		icon: faStream,
		title: ts.timeline,
		type: 'client',
		component: () => defineAsyncComponent(() => import('./timeline.vue')),
	},
	{
		name: 'theme',
		icon: faPalette,
		title: ts.theme,
		type: 'client',
		component: () => defineAsyncComponent(() => import('./theme.vue')),
	},
	{
		name: 'sidebar',
		icon: faListUl,
		title: ts.sidebar,
		type: 'client',
		component: () => defineAsyncComponent(() => import('./sidebar.vue')),
	},
	{
		name: 'sounds',
		icon: faMusic,
		title: ts.sounds,
		type: 'client',
		component: () => defineAsyncComponent(() => import('./sounds.vue')),
	},
	{
		name: 'plugin',
		icon: faPlug,
		title: ts.plugins,
		type: 'client',
		component: () => defineAsyncComponent(() => import('./plugin.vue')),
	},
	{
		name: 'gacha',
		icon: faFish,
		title: ts.gacha,
		type: 'client',
		component: () => defineAsyncComponent(() => import('./gacha.vue')),
	},
	{
		name: 'template',
		icon: faClipboardList,
		title: ts.template,
		type: 'client',
		component: () => defineAsyncComponent(() => import('./template.vue')),
	},
	{
		name: 'import-export',
		icon: faBoxes,
		title: ts.importAndExport,
		type: 'other',
		component: () => defineAsyncComponent(() => import('./import-export.vue')),
	},
	{
		name: 'mute-block',
		icon: faBan,
		title: ts.muteAndBlock,
		type: 'other',
		component: () => defineAsyncComponent(() => import('./mute-block.vue')),
	},
	{
		name: 'word-mute',
		icon: faCommentSlash,
		title: ts.wordMute,
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
		title: ts._labs.title,
		type: 'other',
		component: () => defineAsyncComponent(() => import('./labs.vue')),
	},
	{
		name: 'other',
		icon: faEllipsisH,
		title: ts.other,
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
		title: ts.twoStepAuthentication,
		icon: faLock,
		component: () => defineAsyncComponent(() => import('./2fa.vue')),
	},
	{
		name: 'theme/install',
		type: 'hidden',
		title: ts._theme.install,
		icon: faDownload,
		component: () => defineAsyncComponent(() => import('./theme.install.vue')),
	},
	{
		name: 'theme/manage',
		type: 'hidden',
		title: ts._theme.manage,
		icon: faFolderOpen,
		component: () => defineAsyncComponent(() => import('./theme.manage.vue')),
	},
	{
		name: 'theme/store',
		type: 'hidden',
		title: ts._theme.explore,
		icon: faGlobe,
		component: () => defineAsyncComponent(() => import('./theme.store.vue')),
	},
	{
		name: 'account-info',
		type: 'hidden',
		title: ts.accountInfo,
		icon: faInfoCircle,
		component: () => defineAsyncComponent(() => import('./account-info.vue')),
	},
	{
		name: 'deck',
		type: 'hidden',
		title: ts.deck,
		icon: faColumns,
		component: () => defineAsyncComponent(() => import('./deck.vue')),
	},
	{
		name: 'apps',
		type: 'hidden',
		title: ts.installedApps,
		icon: faPlug,
		component: () => defineAsyncComponent(() => import('./apps.vue')),
	},
	{
		name: 'labs/custom-css',
		type: 'hidden',
		title: ts._labs.customCss,
		icon: faCss3Alt,
		component: () => defineAsyncComponent(() => import('./labs.custom-css.vue')),
	},
	{
		name: 'registry',
		type: 'hidden',
		title: ts.registry,
		icon: faCogs,
		component: () => defineAsyncComponent(() => import('./registry.vue')),
	},
	{
		pattern: /^registry\/keys\/system\//,
		type: 'hidden',
		title: ts.registry,
		icon: faCogs,
		component: () => defineAsyncComponent(() => import('./registry.keys.vue'))
	},
	{
		pattern: /^registry\/value\/system\//,
		type: 'hidden',
		title: ts.registry,
		icon: faCogs,
		component: () => defineAsyncComponent(() => import('./registry.value.vue'))
	},
	{
		name: 'experimental-features',
		type: 'hidden',
		title: ts.experimentalFeatures,
		icon: faFlask,
		component: () => defineAsyncComponent(() => import('./experimental-features.vue'))
	},
	{
		name: 'update',
		type: 'hidden',
		title: 'Groundpolis Update',
		icon: faSyncAlt,
		component: () => defineAsyncComponent(() => import('./update.vue'))
	},
	{
		name: 'plugin/install',
		title: ts._plugin.install,
		icon: faDownload,
		type: 'hidden',
		component: () => defineAsyncComponent(() => import('./plugin.install.vue')),
	},
	{
		name: 'plugin/manage',
		title: ts._plugin.manage,
		icon: faPlug,
		type: 'hidden',
		component: () => defineAsyncComponent(() => import('./plugin.manage.vue')),
	},
];
