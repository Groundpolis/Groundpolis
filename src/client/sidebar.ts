import { faBell, faComments, faLaugh } from '@fortawesome/free-regular-svg-icons';
import { faCloud, faColumns, faDoorClosed, faFileAlt, faGamepad, faHashtag, faListUl, faPaperclip, faMusic, faPaintBrush, faSatellite, faSatelliteDish, faStar, faTerminal, faUserClock, faUsers } from '@fortawesome/free-solid-svg-icons';
import { computed } from 'vue';
import { store } from '@/store';
import * as os from '@/os';
import { i18n } from '@/i18n';

const whenSignedIn = computed(() => store.getters.isSignedIn);

export const sidebarDef = {
	notifications: {
		title: 'notifications',
		icon: faBell,
		show: whenSignedIn,
		indicated: computed(() => store.getters.isSignedIn && store.state.i.hasUnreadNotification),
		to: '/my/notifications',
	},
	messaging: {
		title: 'messaging',
		icon: faComments,
		show: whenSignedIn,
		indicated: computed(() => store.getters.isSignedIn && store.state.i.hasUnreadMessagingMessage),
		to: '/my/messaging',
	},
	drive: {
		title: 'drive',
		icon: faCloud,
		show: whenSignedIn,
		to: '/my/drive',
	},
	followRequests: {
		title: 'followRequests',
		icon: faUserClock,
		show: computed(() => store.getters.isSignedIn && store.state.i.hasPendingReceivedFollowRequest),
		indicated: computed(() => store.getters.isSignedIn && store.state.i.hasPendingReceivedFollowRequest),
		to: '/my/follow-requests',
	},
	explore: {
		title: 'explore',
		icon: faHashtag,
		to: '/explore',
	},
	lists: {
		title: 'lists',
		icon: faListUl,
		show: whenSignedIn,
		to: '/my/lists',
	},
	groups: {
		title: 'groups',
		icon: faUsers,
		show: whenSignedIn,
		to: '/my/groups',
	},
	antennas: {
		title: 'antennas',
		icon: faSatellite,
		show: whenSignedIn,
		to: '/my/antennas',
	},
	favorites: {
		title: 'favorites',
		icon: faStar,
		show: whenSignedIn,
		to: '/my/favorites',
	},
	pages: {
		title: 'pages',
		icon: faFileAlt,
		to: '/pages',
	},
	clips: {
		title: 'clip',
		icon: faPaperclip,
		show: whenSignedIn,
		to: '/my/clips',
	},
	channels: {
		title: 'channel',
		icon: faSatelliteDish,
		to: '/channels',
	},
	games: {
		title: 'games',
		show: whenSignedIn,
		icon: faGamepad,
		to: '/games/reversi',
	},
	scratchpad: {
		title: 'scratchpad',
		icon: faTerminal,
		to: '/scratchpad',
	},
	rooms: {
		title: 'rooms',
		icon: faDoorClosed,
		show: whenSignedIn,
		to: computed(() => `/@${store.state.i.username}/room`),
	},
	ui: {
		title: 'switchUi',
		icon: faColumns,
		action: (ev) => {
			os.modalMenu([{
				text: i18n.global.t('default'),
				action: () => {
					localStorage.setItem('ui', 'default');
					location.reload();
				}
			}, {
				text: i18n.global.t('deck'),
				action: () => {
					localStorage.setItem('ui', 'deck');
					location.reload();
				}
			}, {
				text: i18n.global.t('desktop') + ' (β)',
				action: () => {
					localStorage.setItem('ui', 'desktop');
					location.reload();
				}
			}], ev.currentTarget || ev.target);
		},
	},
	paint: {
		title: 'paint',
		icon: faPaintBrush,
		show: whenSignedIn,
		to: '/paint',
	},
	emojiSuggestion: {
		title: 'emojiSuggestion',
		icon: faLaugh,
		show: whenSignedIn,
		to: '/emoji-suggestion',
	},
	composer: {
		title: 'composer',
		icon: faMusic,
		show: whenSignedIn,
		to: '/composer',
	},
};
