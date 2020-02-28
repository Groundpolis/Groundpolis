<template>
<section class="_card">
	<div class="_title"><fa :icon="faTv"/> {{ $t('clinetSettings') }}</div>
	<div class="_content">
		<mk-switch v-model="autoReload">
			{{ $t('autoReloadWhenDisconnected') }}
		</mk-switch>
	</div>
	<div class="_content">
		<mk-switch v-model="imageNewTab">{{ $t('openImageInNewTab') }}</mk-switch>
		<mk-switch v-model="disableAnimatedMfm">{{ $t('disableAnimatedMfm') }}</mk-switch>
		<mk-switch v-model="reduceAnimation">{{ $t('reduceUiAnimation') }}</mk-switch>
		<mk-switch v-model="showFixedPostForm">{{ $t('showFixedPostForm') }}</mk-switch>
		<mk-switch v-model="useSticker">
			{{ $t('useSticker') }}
		</mk-switch>
		<mk-switch v-model="makeCustomEmojisBigger">
			{{ $t('makeCustomEmojisBigger') }}
		</mk-switch>
		<mk-switch v-model="useOsNativeEmojis">
			{{ $t('useOsNativeEmojis') }}
			<template #desc><mfm text="🍮🍦🍭🍩🍰🍫🍬🥞🍪"/></template>
		</mk-switch>
		<mk-switch v-model="useNotificationsPopup">{{ $t('useNotificationsPopup') }}</mk-switch>
	</div>

	<div class="_content">
		<div>{{ $t('notifications') }}</div>
		<mk-switch v-model="showBrowserNotification">
			{{ $t('showBrowserNotification') }}
		</mk-switch>
		<mk-switch v-model="showToast">
			{{ $t('showToast') }}
		</mk-switch>
	</div>
	<div class="_content">
		<div>{{ $t('iconShape') }}</div>
		<mk-radio v-model="iconShape" value="circle">
			<div class="icon-shape circle"/>
			{{ $t('_iconShape.circle') }}
		</mk-radio>
		<mk-radio v-model="iconShape" value="square">
			<div class="icon-shape square"/>
			{{ $t('_iconShape.square') }}
		</mk-radio>
		<mk-radio v-model="iconShape" value="rounded">
			<div class="icon-shape rounded"/>
			{{ $t('_iconShape.rounded') }}
		</mk-radio>
		<mk-radio v-model="iconShape" value="droplet">
			<div class="icon-shape droplet"/>
			{{ $t('_iconShape.droplet') }}
		</mk-radio>
	</div>
	<div class="_content">
		<mk-select v-model="lang">
			<template #label>{{ $t('uiLanguage') }}</template>

			<option v-for="x in langs" :value="x[0]" :key="x[0]">{{ x[1] }}</option>
		</mk-select>
	</div>
	<div class="_content">
		<div>{{ $t('fontSize') }}</div>
		<mk-radio v-model="fontSize" value="small"><span style="font-size: 14px;">Aa</span></mk-radio>
		<mk-radio v-model="fontSize" :value="null"><span style="font-size: 16px;">Aa</span></mk-radio>
		<mk-radio v-model="fontSize" value="large"><span style="font-size: 18px;">Aa</span></mk-radio>
		<mk-radio v-model="fontSize" value="veryLarge"><span style="font-size: 20px;">Aa</span></mk-radio>
	</div>
</section>
	<!-- <mk-button @click="cacheClear()" primary style="margin: var(--margin) auto;">{{ $t('cacheClear') }}</mk-button> -->
</template>

<script lang="ts">
import Vue from 'vue';
import { faTv } from '@fortawesome/free-solid-svg-icons';
import MkSwitch from '../../components/ui/switch.vue';
import MkSelect from '../../components/ui/select.vue';
import MkRadio from '../../components/ui/radio.vue';
import i18n from '../../i18n';
import { langs } from '../../config';

export default Vue.extend({
	i18n,

	metaInfo() {
		return {
			title: this.$t('settings') as string
		};
	},

	components: {
		MkSwitch,
		MkSelect,
		MkRadio,
	},

	data() {
		return {
			langs,
			lang: localStorage.getItem('lang'),
			fontSize: localStorage.getItem('fontSize'),
			faTv,
		}
	},

	computed: {
		autoReload: {
			get() { return this.$store.state.device.autoReload; },
			set(value) { this.$store.commit('device/set', { key: 'autoReload', value }); }
		},

		reduceAnimation: {
			get() { return !this.$store.state.device.animation; },
			set(value) { this.$store.commit('device/set', { key: 'animation', value: !value }); }
		},

		disableAnimatedMfm: {
			get() { return !this.$store.state.device.animatedMfm; },
			set(value) { this.$store.commit('device/set', { key: 'animatedMfm', value: !value }); }
		},

		useOsNativeEmojis: {
			get() { return this.$store.state.device.useOsNativeEmojis; },
			set(value) { this.$store.commit('device/set', { key: 'useOsNativeEmojis', value }); }
		},

		imageNewTab: {
			get() { return this.$store.state.device.imageNewTab; },
			set(value) { this.$store.commit('device/set', { key: 'imageNewTab', value }); }
		},

		showFixedPostForm: {
			get() { return this.$store.state.device.showFixedPostForm; },
			set(value) { this.$store.commit('device/set', { key: 'showFixedPostForm', value }); }
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

		iconShape: {
			get() { return this.$store.state.device.iconShape },
			set(value) { this.$store.state.device.iconShape = value },
		}

		useNotificationsPopup: {
			get() { return this.$store.state.device.useNotificationsPopup; },
			set(value) { this.$store.commit('device/set', { key: 'useNotificationsPopup', value }); }
		},
	},

	watch: {
		lang() {
			localStorage.setItem('lang', this.lang);
			localStorage.removeItem('locale');
			location.reload();
		},

		fontSize() {
			if (this.fontSize == null) {
				localStorage.removeItem('fontSize');
			} else {
				localStorage.setItem('fontSize', this.fontSize);
			}
			location.reload();
		},
	},
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