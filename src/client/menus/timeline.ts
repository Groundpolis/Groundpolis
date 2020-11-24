import { i18n } from "@/i18n";
import { store } from "@/store";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faAt, faCat, faCommentAlt, faComments, faEnvelope, faGlobe, faHome, faProjectDiagram, faShareAlt } from "@fortawesome/free-solid-svg-icons";

const { t } = i18n.global;

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
		name: t('_timelines.home'),
	}, {
		src: 'local',
		icon: faComments,
		name: t('_timelines.local'),
		show: () => !store.state.instance.meta.disableLocalTimeline || store.state.i.isModerator || store.state.i.isAdmin,
	}, {
		src: 'social',
		icon: faShareAlt,
		name: t('_timelines.social'),
		show: () => !store.state.instance.meta.disableLocalTimeline || store.state.i.isModerator || store.state.i.isAdmin,
	}, {
		src: 'global',
		icon: faGlobe,
		name: t('_timelines.global'),
		show: () => !store.state.instance.meta.disableGlobalTimeline || store.state.i.isModerator || store.state.i.isAdmin,
	}, {
		src: 'cat',
		icon: faCat,
		name: t('_timelines.cat'),
		show: () => !store.state.instance.meta.disableCatTimeline || store.state.i.isModerator || store.state.i.isAdmin,
	}, {
		src: 'remoteFollowing',
		icon: faProjectDiagram,
		name: t('_timelines.remoteFollowing'),
	}, {
		src: 'followers',
		icon: faCommentAlt,
		name: t('_timelines.followers'),
	}, {
		src: 'mentions',
		icon: faAt,
		name: t('mentions'),
	}, {
		src: 'direct',
		icon: faEnvelope,
		name: t('directNotes'),
	},
];

export const timelineMenuSources = timelineMenuItems.map(i => i.src);

export const timelineMenuMap = Object.fromEntries(timelineMenuItems.map(it => [it.src, {
	name: it.name,
	icon: it.icon,
	show: it.show,
}]));
