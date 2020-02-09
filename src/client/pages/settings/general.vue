<template>
	<section class="_card">
		<div class="_title"><fa :icon="faTv"/> {{ $t('userInterface') }}</div>
		<div class="_content">
			<mk-switch v-model="reduceAnimation">
				{{ $t('reduceUiAnimation') }}
			</mk-switch>
			<mk-switch v-model="showFixedPostForm">
				{{ $t('showFixedPostForm') }}
			</mk-switch>
			<mk-switch v-model="useSticker">
				{{ $t('useSticker') }}
			</mk-switch>
			<mk-switch v-model="makeCustomEmojisBigger">
				{{ $t('makeCustomEmojisBigger') }}
			</mk-switch>
		</div>
		<div class="_content">
			<mk-switch v-model="autoReload">
				{{ $t('autoReloadWhenDisconnected') }}
			</mk-switch>
			<mk-switch v-model="$store.state.i.autoWatch" @change="onChangeAutoWatch">
				{{ $t('autoNoteWatch') }}<template #desc>{{ $t('autoNoteWatchDescription') }}</template>
			</mk-switch>
		</div>
		<div class="_title"> {{ $t('notifications') }}</div>
		<div class="_content">
			<mk-switch v-model="showBrowserNotification">
				{{ $t('showBrowserNotification') }}
			</mk-switch>
			<mk-switch v-model="showToast">
				{{ $t('showToast') }}
			</mk-switch>
		</div>
		<div class="_title"> {{ $t('iconShape') }}</div>
		<div class="_content">
			<mk-switch v-model="iconShapeCircle">
				<div class="icon-shape circle"/>
				{{ $t('_iconShape.circle') }}
			</mk-switch>
			<mk-switch v-model="iconShapeSquare">
				<div class="icon-shape square"/>
				{{ $t('_iconShape.square') }}
			</mk-switch>
			<mk-switch v-model="iconShapeRounded">
				<div class="icon-shape rounded"/>
				{{ $t('_iconShape.rounded') }}
			</mk-switch>
			<mk-switch v-model="iconShapeDroplet">
				<div class="icon-shape droplet"/>
				{{ $t('_iconShape.droplet') }}
			</mk-switch>
		</div>
		<div class="_content">
			<mk-input type="file" @change="onWallpaperChange" style="margin-top: 0;">
				<span>{{ $t('wallpaper') }}</span>
				<template #icon><fa :icon="faImage"/></template>
				<template #desc v-if="wallpaperUploading">{{ $t('uploading') }}<mk-ellipsis/></template>
			</mk-input>
			<mk-button primary :disabled="$store.state.settings.wallpaper == null" @click="delWallpaper()">{{ $t('removeWallpaper') }}</mk-button>
		</div>
		<div class="_content">
			<mk-button @click="readAllNotifications">{{ $t('markAsReadAllNotifications') }}</mk-button>
			<mk-button @click="readAllUnreadNotes">{{ $t('markAsReadAllUnreadNotes') }}</mk-button>
			<mk-button @click="readAllMessagingMessages">{{ $t('markAsReadAllTalkMessages') }}</mk-button>
		</div>
	</section>
</template>

<script lang="ts">
import Vue from 'vue';
import { faImage, faTv } from '@fortawesome/free-solid-svg-icons';
import MkInput from '../../components/ui/input.vue';
import MkButton from '../../components/ui/button.vue';
import MkSwitch from '../../components/ui/switch.vue';
import i18n from '../../i18n';
import { apiUrl } from '../../config';

export default Vue.extend({
	i18n,

	components: {
		MkInput,
		MkButton,
		MkSwitch,
	},
	
	data() {
		return {
			wallpaperUploading: false,
			faImage, faTv
		}
	},

	computed: {
		wallpaper: {
			get() { return this.$store.state.settings.wallpaper; },
			set(value) { this.$store.dispatch('settings/set', { key: 'wallpaper', value }); }
		},

		autoReload: {
			get() { return this.$store.state.device.autoReload; },
			set(value) { this.$store.commit('device/set', { key: 'autoReload', value }); }
		},

		reduceAnimation: {
			get() { return !this.$store.state.device.animation; },
			set(value) { this.$store.commit('device/set', { key: 'animation', value: !value }); }
		},

		showFixedPostForm: {
			get() { return this.$store.state.device.showFixedPostForm; },
			set(value) { this.$store.commit('device/set', { key: 'showFixedPostForm', value: value }); }
		},

		showBrowserNotification: {
			get() { return this.$store.state.device.showBrowserNotification; },
			set(value) { this.$store.commit('device/set', { key: 'showBrowserNotification', value: value }); }
		},

		showToast: {
			get() { return this.$store.state.device.showToast; },
			set(value) { this.$store.commit('device/set', { key: 'showToast', value: value }); }
		},

		makeCustomEmojisBigger: {
			get() { return this.$store.state.device.makeCustomEmojisBigger; },
			set(value) { this.$store.commit('device/set', { key: 'makeCustomEmojisBigger', value: value }); }
		},

		useSticker: {
			get() { return this.$store.state.device.useSticker; },
			set(value) { this.$store.commit('device/set', { key: 'useSticker', value: value }); }
		},

		iconShapeCircle: {
			get() { return this.$store.state.device.iconShape === 'circle'; },
			set(value) { this.$store.commit('device/set', { key: 'iconShape', value: 'circle' }); }
		},

		iconShapeSquare: {
			get() { return this.$store.state.device.iconShape === 'square'; },
			set(value) { this.$store.commit('device/set', { key: 'iconShape', value: 'square' }); }
		},

		iconShapeRounded: {
			get() { return this.$store.state.device.iconShape === 'rounded'; },
			set(value) { this.$store.commit('device/set', { key: 'iconShape', value: 'rounded' }); }
		},

		iconShapeDroplet: {
			get() { return this.$store.state.device.iconShape === 'droplet'; },
			set(value) { this.$store.commit('device/set', { key: 'iconShape', value: 'droplet' }); }
		},
	},

	methods: {
		onWallpaperChange([file]) {
			this.wallpaperUploading = true;

			const data = new FormData();
			data.append('file', file);
			data.append('i', this.$store.state.i.token);

			fetch(apiUrl + '/drive/files/create', {
				method: 'POST',
				body: data
			})
			.then(response => response.json())
			.then(f => {
				this.wallpaper = f.url;
				this.wallpaperUploading = false;
				document.documentElement.style.backgroundImage = `url(${this.$store.state.settings.wallpaper})`;
			})
			.catch(e => {
				this.wallpaperUploading = false;
				this.$root.dialog({
					type: 'error',
					text: e
				});
			});
		},

		delWallpaper() {
			this.wallpaper = null;
			document.documentElement.style.backgroundImage = 'none';
		},

		onChangeAutoWatch(v) {
			this.$root.api('i/update', {
				autoWatch: v
			});
		},

		readAllUnreadNotes() {
			this.$root.api('i/read_all_unread_notes');
		},

		readAllMessagingMessages() {
			this.$root.api('i/read_all_messaging_messages');
		},

		readAllNotifications() {
			this.$root.api('notifications/mark_all_as_read');
		}
	}
});
</script>

<style lang="scss" scoped>
	.icon-shape {
		display: inline-block;
		width: 1em;
		height: 1em;
		background: var(--fg);
		margin-right: 8px;

		&.circle {
			border-radius: 0.5em;
		}

		&.rounded {
			border-radius: 0.25em;
		}

		&.droplet {
			border-radius: 0.5em 0.5em 0 0.5em;
		}
	}
</style>