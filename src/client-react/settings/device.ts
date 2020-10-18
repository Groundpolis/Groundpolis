import { Reducer, useReducer } from 'react';

export interface DeviceSetting { 
	loadRawImages: boolean;
	alwaysShowNsfw: boolean;
	useOsNativeEmojis: boolean;
	showBrowserNotification: boolean;
	showToast: boolean;
	useSticker: boolean;
	makeCustomEmojisBigger: boolean;
	iconShape: 'circle' | 'square' | 'rounded' | 'droplet';
	serverDisconnectedBehavior: 'reload' | 'dialog' | 'quiet';
	accounts: [];
	recentEmojis: [];
	themes: [];
	darkTheme: string;
	lightTheme: string;
	darkMode: boolean;
	deckMode: boolean;
	syncDeviceDarkMode: boolean;
	animation: boolean;
	enableSounds: boolean;
	enableSoundsInTimeline: boolean;
	enableSoundsInNotifications: boolean;
	soundVolume: number;
	mediaVolume: number;
	postStyle: 'standard' | 'compact';
	showPostPreview: boolean;
	animatedMfm: boolean;
	imageNewTab: boolean;
	showFixedPostForm: boolean;
	disablePagesScript: boolean;
	enableInfiniteScroll: boolean;
	fixedWidgetsPosition: boolean;
	useBlurEffectForModal: boolean;
	sidebarDisplay: 'full' | 'icon' | 'hide';
	roomGraphicsQuality: 'cheep' | 'low' | 'medium' | 'high' | 'ultra';
	roomUseOrthographicCamera: boolean;
	deckColumnAlign: 'left' | 'center' | 'right' | 'stretched';
	deckAlwaysShowMainColumn: boolean;
	deckMainColumnPlace: 'left';
	sfxVolume: number;
	sfxNote: string;
	sfxNoteMy: string;
	sfxNotification: string;
	sfxChat: string;
	sfxChatBg: string;
	sfxAntenna: string;
	sfxChannel: string;
	showUnrenoteConfirm: boolean;
	showNoteDeleteConfirm: boolean;
	showDeleteAndEditConfirm: boolean;
	showDriveFileDeleteConfirm: boolean;
	showRenoteConfirm: boolean;
	showNoteConfirm: boolean;
	showFollowConfirm: boolean;
	showUnfollowConfirm: boolean;
	showBlockConfirm: boolean;
	showUnblockConfirm: boolean;
	showMuteConfirm: boolean;
	showUnMuteConfirm: boolean;
	showStealConfirm: boolean;
	userData: Record<string, unknown>;
	penWidth: number;
	eraserWidth: number;
	usePressure: boolean;
	collapseNav: boolean;
	noteNameDisplayMode: 'nameAcct' | 'acctName' | 'name' | 'acct';
	instanceEmojisAutoReloadAfterSaving: boolean;
	hideHostName: boolean;
	userHostDisplayMode: 'sticker' | 'acct' | 'both';
	collapseLongNote: boolean;
	migratedFromVuex: false;
}

type SettingKey = keyof DeviceSetting;

const defaultSetting: DeviceSetting = {
	loadRawImages: false,
	alwaysShowNsfw: false,
	useOsNativeEmojis: false,
	showBrowserNotification: true,
	showToast: true,
	useSticker: true,
	makeCustomEmojisBigger: true,
	iconShape: 'circle',
	serverDisconnectedBehavior: 'quiet',
	accounts: [],
	recentEmojis: [],
	themes: [],
	darkTheme: '8c539dc1-0fab-4d47-9194-39c508e9bfe1',
	lightTheme: '4eea646f-7afa-4645-83e9-83af0333cd37',
	darkMode: false,
	deckMode: false,
	syncDeviceDarkMode: true,
	animation: true,
	enableSounds: true,
	enableSoundsInTimeline: false,
	enableSoundsInNotifications: true,
	soundVolume: 0.5,
	mediaVolume: 0.5,
	postStyle: 'standard' as 'standard' | 'compact',
	showPostPreview: true,
	animatedMfm: true,
	imageNewTab: false,
	showFixedPostForm: false,
	disablePagesScript: true,
	enableInfiniteScroll: true,
	fixedWidgetsPosition: false,
	useBlurEffectForModal: true,
	sidebarDisplay: 'full', // full, icon, hide
	roomGraphicsQuality: 'medium',
	roomUseOrthographicCamera: true,
	deckColumnAlign: 'left',
	deckAlwaysShowMainColumn: true,
	deckMainColumnPlace: 'left',
	sfxVolume: 0.3,
	sfxNote: 'syuilo/down',
	sfxNoteMy: 'syuilo/up',
	sfxNotification: 'syuilo/pope2',
	sfxChat: 'syuilo/pope1',
	sfxChatBg: 'syuilo/waon',
	sfxAntenna: 'syuilo/triple',
	sfxChannel: 'syuilo/square-pico',
	showUnrenoteConfirm: true,
	showNoteDeleteConfirm: true,
	showDeleteAndEditConfirm: true,
	showDriveFileDeleteConfirm: true,
	showRenoteConfirm: false,
	showNoteConfirm: false,
	showFollowConfirm: false,
	showUnfollowConfirm: true,
	showBlockConfirm: true,
	showUnblockConfirm: true,
	showMuteConfirm: true,
	showUnMuteConfirm: true,
	showStealConfirm: true,
	userData: {},
	penWidth: 4,
	eraserWidth: 32,
	usePressure: false,
	collapseNav: false,
	noteNameDisplayMode: 'nameAcct',
	instanceEmojisAutoReloadAfterSaving: true,
	hideHostName: false,
	userHostDisplayMode: 'both',
	collapseLongNote: true,
	migratedFromVuex: false,
};

export default class DeviceSettingManager { 
	static migrateFromVuex() { 
		const vuex = localStorage.getItem('vuex');
		if (!vuex) return;
		
		Object.entries(JSON.parse(vuex).device)
			.forEach(([k, v]) => {
				DeviceSettingManager._set(k, v);
			});
	}

	static get<V extends SettingKey>(k: V): DeviceSetting[V] {
		if (!Object.keys(localStorage).includes('deviceSetting:' + k)) return defaultSetting[k];
		const value = localStorage.getItem('deviceSetting:' + k);
		switch (typeof defaultSetting[k]) { 
			case 'bigint':
				return BigInt(value) as any;
			case 'string':
				return value as any;
			case 'object':
				return JSON.parse(value);
			case 'boolean':
				return (value.toLowerCase() === 'true') as any;
			case 'number':
				return Number(value) as any;
			case 'undefined':
				return undefined as any;
			default:
				throw new Error('Type mismatch! ' + typeof defaultSetting[k] + ' type required');	
		}
	}

	static getAll(): DeviceSetting {
		const set = <T extends SettingKey>(s: DeviceSetting, k: T, value: DeviceSetting[T]) => { s[k] = value; };

		const a = { ...defaultSetting } as DeviceSetting;
		for (const key of Object.keys(defaultSetting) as unknown as SettingKey[]) {
			const value = DeviceSettingManager.get(key);
			set(a, key, value);
		}
		return a;
	}

	static setAll(opts: Partial<DeviceSetting>) { 
		for (const key of Object.keys(opts) as unknown as SettingKey[]) {
			const value = opts[key];
			DeviceSettingManager.set(key, value);
		}
	}

	static set(k: SettingKey, v: unknown) { 
		DeviceSettingManager._set(k, v);
	}

	private static _set(k: string, v: unknown) { 
		const value = JSON.stringify(v);
		if (value === undefined) return;

		localStorage['deviceSetting:' + k] = value;
	}
}

export function useDeviceSetting() { 
	const deviceSettingReducer: Reducer<DeviceSetting, Partial<DeviceSetting>> = (prev, partial) => {
		const newState = {
			...prev, ...partial
		} as DeviceSetting;

		DeviceSettingManager.setAll(partial);
		return newState;
	};

	return useReducer(deviceSettingReducer, DeviceSettingManager.getAll());
}
