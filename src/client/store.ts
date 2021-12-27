import { markRaw, ref } from 'vue';
import { Storage } from './pizzax';
import defaultFaces from './scripts/default-faces';
import { Theme } from './scripts/theme';
import { Rgba } from './scripts/rgba';
import { NoteVisibility } from '../types';

export type Template = {
	label: string;
	body: string;
};

export const postFormActions = [];
export const userActions = [];
export const noteActions = [];
export const noteViewInterruptors = [];
export const notePostInterruptors = [];

// TODO: それぞれいちいちwhereとかdefaultというキーを付けなきゃいけないの冗長なのでなんとかする(ただ型定義が面倒になりそう)
//       あと、現行の定義の仕方なら「whereが何であるかに関わらずキー名の重複不可」という制約を付けられるメリットもあるからそのメリットを引き継ぐ方法も考えないといけない
export const defaultStore = markRaw(new Storage('base', {
	tutorial: {
		where: 'account',
		default: 0
	},
	keepCw: {
		where: 'account',
		default: false
	},
	showFullAcct: {
		where: 'account',
		default: false
	},
	rememberNoteVisibility: {
		where: 'account',
		default: false
	},
	defaultNoteVisibility: {
		where: 'account',
		default: 'public' as NoteVisibility
	},
	defaultNoteLocalOnly: {
		where: 'account',
		default: false
	},
	uploadFolder: {
		where: 'account',
		default: null
	},
	pastedFileName: {
		where: 'account',
		default: 'yyyy-MM-dd HH-mm-ss [{{number}}]'
	},
	memo: {
		where: 'account',
		default: null
	},
	reactions: {
		where: 'account',
		default: ['👍', '❤️', '😆', '🤔', '😮', '🎉', '💢', '😥', '😇', '🍮']
	},
	mutedWords: {
		where: 'account',
		default: []
	},

	menu: {
		where: 'deviceAccount',
		default: [
			'notifications',
			'explore',
			'messaging',
			'drive',
			'followRequests',
		]
	},
	visibility: {
		where: 'deviceAccount',
		default: 'public' as NoteVisibility
	},
	localOnly: {
		where: 'deviceAccount',
		default: false
	},
	widgets: {
		where: 'deviceAccount',
		default: [] as {
			name: string;
			id: string;
			data: Record<string, any>;
		}[]
	},
	tl: {
		where: 'deviceAccount',
		default: {
			src: 'home',
			arg: null
		}
	},

	serverDisconnectedBehavior: {
		where: 'device',
		default: 'quiet' as 'quiet' | 'reload' | 'dialog'
	},
	nsfw: {
		where: 'device',
		default: 'respect' as 'respect' | 'force' | 'ignore'
	},
	animation: {
		where: 'device',
		default: true
	},
	animatedMfm: {
		where: 'device',
		default: true
	},
	loadRawImages: {
		where: 'device',
		default: false
	},
	imageNewTab: {
		where: 'device',
		default: false
	},
	disableShowingAnimatedImages: {
		where: 'device',
		default: false
	},
	disablePagesScript: {
		where: 'device',
		default: false
	},
	useOsNativeEmojis: {
		where: 'device',
		default: false
	},
	useBlurEffectForModal: {
		where: 'device',
		default: true
	},
	showFixedPostForm: {
		where: 'device',
		default: false
	},
	enableInfiniteScroll: {
		where: 'device',
		default: true
	},
	showGapBetweenNotesInTimeline: {
		where: 'device',
		default: false
	},
	darkMode: {
		where: 'device',
		default: false
	},
	instanceTicker: {
		where: 'device',
		default: 'remote' as 'none' | 'remote' | 'always'
	},
	reactionPickerWidth: {
		where: 'device',
		default: 1
	},
	reactionPickerHeight: {
		where: 'device',
		default: 1
	},
	recentlyUsedEmojis: {
		where: 'device',
		default: [] as string[]
	},
	recentlyUsedUsers: {
		where: 'device',
		default: [] as string[]
	},
	defaultSideView: {
		where: 'device',
		default: false
	},
	sidebarDisplay: {
		where: 'device',
		default: 'full' as 'full' | 'icon'
	},
	titlebar: {
		where: 'device',
		default: true
	},
	reportError: {
		where: 'device',
		default: false
	},
	aiChanMode: {
		where: 'device',
		default: false
	},

	//#region Groundpolis

	defaultNoteRemoteFollowersOnly: {
		where: 'account',
		default: false
	},
	faces: {
		where: 'account',
		default: defaultFaces
	},
	stealRule: {
		where: 'account',
		default: 1 as 1 | 2 | 3 | 4
	},
	stealReaction: {
		where: 'account',
		default: '⭐️'
	},
	injectUnlistedNoteInLTL: {
		where: 'account',
		default: false
	},
	renoteButtonMode: {
		where: 'account',
		default: 'choose' as 'choose' | 'renote' | 'quote' | 'renoteQuote'
	},
	useDisplayNameForSidebar: {
		where: 'account',
		default: true
	},
	disableReactions: {
		where: 'account',
		default: false
	},
	remoteFollowersOnly: {
		where: 'deviceAccount',
		default: false
	},
	useSticker: {
		where: 'device',
		default: true
	},
	makeCustomEmojisBigger: {
		where: 'device',
		default: true
	},
	iconShape: {
		where: 'device',
		default: 'circle' as 'circle' | 'square' | 'rounded' | 'droplet'
	},
	showPostPreview: {
		where: 'device',
		default: true
	},
	penWidth: {
		where: 'device',
		default: 4
	},
	eraserWidth: {
		where: 'device',
		default: 32
	},
	usePressure: {
		where: 'device',
		default: false
	},
	noteNameDisplayMode: {
		where: 'device',
		default: 0
	},
	hideHostName: {
		where: 'device',
		default: false
	},
	userHostDisplayMode: {
		where: 'device',
		default: 0
	},
	collapseLongNote: {
		where: 'device',
		default: true
	},
	alwaysPlayMediaInWindow: {
		where: 'device',
		default: false
	},
	emojiPickerHidePinnedEmojis: {
		where: 'device',
		default: false
	},
	emojiPickerHideRecentEmojis: {
		where: 'device',
		default: false
	},
	timelineTabItems: {
		where: 'device',
		default: ['home', 'local']
	},
	noteCollapseThreshold: {
		where: 'device',
		default: 192,
	},
	colorPickerPresets: {
		where: 'device',
		default: [
			[0, 0, 0, 255],
			[64, 64, 64, 255],
			[128, 128, 128, 255],
			[255, 255, 255, 255],
			[255, 0, 0, 255],
			[255, 128, 0, 255],
			[255, 255, 0, 255],
			[128, 255, 0, 255],
			[0, 255, 0, 255],
			[0, 255, 128, 255],
			[0, 255, 255, 255],
			[0, 128, 255, 255],
			[0, 0, 255, 255],
			[128, 0, 255, 255],
			[255, 0, 255, 255],
			[255, 0, 128, 255],
		] as Rgba[],
	},
	confirmBeforePost: {
		where: 'account',
		default: false
	},

	tryNewPostForm: {
		where: 'device',
		default: false
	},

	uiMode: {
		where: 'deviceAccount',
		default: 'basic' as 'basic' | 'deck',
	},

	templates: {
		where: 'deviceAccount',
		default: [] as Template[],
	},

	templateList: {
		where: 'account',
		default: [] as Template[],
	},

	useDefaultNoteVisibilityOnRenote: {
		where: 'account',
		default: false
	},

	defaultRenoteVisibility: {
		where: 'account',
		default: 'public' as NoteVisibility
	},

	defaultRenoteLocalOnly: {
		where: 'account',
		default: false
	},

	defaultRenoteRemoteFollowersOnly: {
		where: 'account',
		default: false
	},

	//#endregion
}));

// TODO: 他のタブと永続化されたstateを同期

const PREFIX = 'miux:';

type Plugin = {
	id: string;
	name: string;
	active: boolean;
	configData: Record<string, any>;
	token: string;
	ast: any[];
};

/**
 * 常にメモリにロードしておく必要がないような設定情報を保管するストレージ(非リアクティブ)
 */
export class ColdDeviceStorage {
	public static default = {
		themes: [] as Theme[], // TODO: そのうち消す
		darkTheme: '8050783a-7f63-445a-b270-36d0f6ba1677',
		lightTheme: '4eea646f-7afa-4645-83e9-83af0333cd37',
		syncDeviceDarkMode: true,
		chatOpenBehavior: 'page' as 'page' | 'window' | 'popout',
		plugins: [] as Plugin[],
		mediaVolume: 0.5,
		sound_masterVolume: 0.3,
		sound_note: { type: 'syuilo/down', volume: 1 },
		sound_noteMy: { type: 'syuilo/up', volume: 1 },
		sound_notification: { type: 'syuilo/pope2', volume: 1 },
		sound_chat: { type: 'syuilo/pope1', volume: 1 },
		sound_chatBg: { type: 'syuilo/waon', volume: 1 },
		sound_antenna: { type: 'syuilo/triple', volume: 1 },
		sound_channel: { type: 'syuilo/square-pico', volume: 1 },
		sound_reversiPutBlack: { type: 'syuilo/kick', volume: 0.3 },
		sound_reversiPutWhite: { type: 'syuilo/snare', volume: 0.3 },
		roomGraphicsQuality: 'medium' as 'cheep' | 'low' | 'medium' | 'high' | 'ultra',
		roomUseOrthographicCamera: true,
	};

	public static watchers = [];

	public static get<T extends keyof typeof ColdDeviceStorage.default>(key: T): typeof ColdDeviceStorage.default[T] {
		// TODO: indexedDBにする
		//       ただしその際はnullチェックではなくキー存在チェックにしないとダメ
		//       (indexedDBはnullを保存できるため、ユーザーが意図してnullを格納した可能性がある)
		const value = localStorage.getItem(PREFIX + key);
		if (value == null) {
			return ColdDeviceStorage.default[key];
		} else {
			return JSON.parse(value);
		}
	}

	public static set<T extends keyof typeof ColdDeviceStorage.default>(key: T, value: typeof ColdDeviceStorage.default[T]): void {
		localStorage.setItem(PREFIX + key, JSON.stringify(value));

		for (const watcher of this.watchers) {
			if (watcher.key === key) watcher.callback(value);
		}
	}

	public static watch(key, callback) {
		this.watchers.push({ key, callback });
	}

	// TODO: VueのcustomRef使うと良い感じになるかも
	public static ref<T extends keyof typeof ColdDeviceStorage.default>(key: T) {
		const v = ColdDeviceStorage.get(key);
		const r = ref(v);
		// TODO: このままではwatcherがリークするので開放する方法を考える
		this.watch(key, v => {
			r.value = v;
		});
		return r;
	}

	/**
	 * 特定のキーの、簡易的なgetter/setterを作ります
	 * 主にvue場で設定コントロールのmodelとして使う用
	 */
	public static makeGetterSetter<K extends keyof typeof ColdDeviceStorage.default>(key: K) {
		// TODO: VueのcustomRef使うと良い感じになるかも
		const valueRef = ColdDeviceStorage.ref(key);
		return {
			get: () => {
				return valueRef.value;
			},
			set: (value: unknown) => {
				const val = value;
				ColdDeviceStorage.set(key, val);
			}
		};
	}
}

// このファイルに書きたくないけどここに書かないと何故かVeturが認識しない
declare module '@vue/runtime-core' {
	interface ComponentCustomProperties {
		$store: typeof defaultStore;
	}
}
