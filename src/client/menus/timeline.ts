import { i18n } from "@/i18n";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faAt, faCat, faCommentAlt, faComments, faEnvelope, faGlobe, faHome, faProjectDiagram, faShareAlt } from "@fortawesome/free-solid-svg-icons";
import { $i } from '@/account';
import { instance } from '@/instance';
import { defaultStore } from '@/store';

const ts = i18n.locale;

export type TimelineMenuitem = {
	src: string,
	icon: IconProp,
	name: string,
	show?: () => boolean,
}

export const timelineMenuItems: TimelineMenuitem[] = [
	{
		src: 'home',
		icon: faHome,
		name: ts._timelines.home,
	}, {
		src: 'local',
		icon: faComments,
		name: ts._timelines.local,
		show: () => !instance.disableLocalTimeline || $i.isModerator || $i.isAdmin,
	}, {
		src: 'social',
		icon: faShareAlt,
		name: ts._timelines.social,
		show: () => !instance.disableLocalTimeline || $i.isModerator || $i.isAdmin,
	}, {
		src: 'global',
		icon: faGlobe,
		name: ts._timelines.global,
		show: () => !instance.disableGlobalTimeline || $i.isModerator || $i.isAdmin,
	}, {
		src: 'cat',
		icon: faCat,
		name: ts._timelines.cat,
		show: () => !instance.disableCatTimeline || $i.isModerator || $i.isAdmin,
	}, {
		src: 'remoteFollowing',
		icon: faProjectDiagram,
		name: ts._timelines.remoteFollowing,
	}, {
		src: 'followers',
		icon: faCommentAlt,
		name: ts._timelines.followers,
	}, {
		src: 'mentions',
		icon: faAt,
		name: ts.mentions,
	}, {
		src: 'direct',
		icon: faEnvelope,
		name: ts.directNotes,
	},
];

export const timelineMenuSources = timelineMenuItems.map(i => i.src);

export const timelineMenuMap = Object.fromEntries(timelineMenuItems.map(it => [it.src, {
	name: it.name,
	icon: it.icon,
	show: it.show,
}]));
