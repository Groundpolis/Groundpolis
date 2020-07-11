<template>
<section class="_card">
	<div class="_title"><fa :icon="faTv"/> {{ $t('clinetSettings') }}</div>

	<div class="_content">
		<mk-switch v-model="autoReload">{{ $t('autoReloadWhenDisconnected') }}</mk-switch>
		<mk-switch v-model="enableInfiniteScroll">{{ $t('enableInfiniteScroll') }}</mk-switch>
		<mk-switch v-model="fixedWidgetsPosition">{{ $t('fixedWidgetsPosition') }}</mk-switch>
		<mk-switch v-model="reduceAnimation">{{ $t('reduceUiAnimation') }}</mk-switch>
		<mk-switch v-model="disablePagesScript">{{ $t('disablePagesScript') }}</mk-switch>
		<mk-switch v-model="imageNewTab">{{ $t('openImageInNewTab') }}</mk-switch>
	</div>

	<div class="_content">
		<div><b>{{ $t('timeline') }}</b></div>
		<mk-switch v-model="disableAnimatedMfm">{{ $t('disableAnimatedMfm') }}</mk-switch>
		<mk-switch v-model="showFixedPostForm">{{ $t('showFixedPostForm') }}</mk-switch>
		<mk-switch v-model="useSticker">
			{{ $t('useSticker') }}
			<a class="_link" @click.stop="showHint($t('useSticker'), $t('useStickerDesc'))" style="margin-left: 8px"><fa :icon="faQuestionCircle"/></a>
		</mk-switch>
		<mk-switch v-model="makeCustomEmojisBigger">
			{{ $t('makeCustomEmojisBigger') }}
			<a class="_link" @click.stop="showHint($t('makeCustomEmojisBigger'), $t('makeCustomEmojisBiggerDesc'))" style="margin-left: 8px"><fa :icon="faQuestionCircle"/></a>
		</mk-switch>
		<mk-switch v-model="useOsNativeEmojis">
			{{ $t('useOsNativeEmojis') }}
			<template #desc><mfm text="🍮🍦🍭🍩🍰🍫🍬🥞🍪"/></template>
		</mk-switch>
		<mk-select v-model="noteNameDisplayMode">
			<template #label>{{ $t('noteNameDisplayMode') }}</template>

			<option v-for="(x, i) in [ 'displayNameAndUserName', 'userNameAndDisplayName', 'displayNameOnly', 'userNameOnly' ]" :value="i" :key="x">{{ $t(x) }}</option>
		</mk-select>
		<mk-switch v-model="showFullAcct">{{ $t('showFullAcct') }}</mk-switch>
		<mk-switch v-model="compactMode">{{ $t('compactMode') }}</mk-switch>
		<x-note :note="previewNote" :preview="true" />
	</div>
	<div class="_content">
		<div><b>{{ $t('confirmDialogSetting') }}</b></div>
		<mk-switch v-model="showRenoteConfirm">{{ $t('renote') }}</mk-switch>
		<mk-switch v-model="showNoteConfirm">{{ $t('note') }}</mk-switch>
		<mk-switch v-model="showUnrenoteConfirm">{{ $t('unrenote') }}</mk-switch>
		<mk-switch v-model="showNoteDeleteConfirm">{{ $t('noteDelete') }}</mk-switch>
		<mk-switch v-model="showDeleteAndEditConfirm">{{ $t('revert-to-draft') }}</mk-switch>
		<mk-switch v-model="showDriveFileDeleteConfirm">{{ $t('driveFileDelete') }}</mk-switch>
		<mk-switch v-model="showFollowConfirm">{{ $t('follow') }}</mk-switch>
		<mk-switch v-model="showUnfollowConfirm">{{ $t('unfollow') }}</mk-switch>
		<mk-switch v-model="showBlockConfirm">{{ $t('block') }}</mk-switch>
		<mk-switch v-model="showUnblockConfirm">{{ $t('unblock') }}</mk-switch>
		<mk-switch v-model="showMuteConfirm">{{ $t('mute') }}</mk-switch>
		<mk-switch v-model="showUnMuteConfirm">{{ $t('unmute') }}</mk-switch>
		<mk-switch v-model="showStealConfirm">{{ $t('steal') }}</mk-switch>
	</div>

	<div class="_content">
		<div><b>{{ $t('notifications') }}</b></div>
		<mk-switch v-model="showBrowserNotification">
			{{ $t('showBrowserNotification') }}
		</mk-switch>
		<mk-switch v-model="showToast">
			{{ $t('showToast') }}
		</mk-switch>
	</div>
	<div class="_content">
		<div><b>{{ $t('iconShape') }}</b></div>
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
		<mk-button @click="reloadLang()">{{ $t('reload') }}</mk-button>
	</div>
	<div class="_content">
		<div>{{ $t('fontSize') }}</div>
		<mk-radio v-model="fontSize" value="small"><span style="font-size: 14px;">Aa</span></mk-radio>
		<mk-radio v-model="fontSize" :value="null"><span style="font-size: 16px;">Aa</span></mk-radio>
		<mk-radio v-model="fontSize" value="large"><span style="font-size: 18px;">Aa</span></mk-radio>
		<mk-radio v-model="fontSize" value="veryLarge"><span style="font-size: 20px;">Aa</span></mk-radio>
	</div>
	<div class="_content">
		<div>{{ $t('experimentalFeatures') }}</div>
		<mk-info warn>{{ $t('experimentalFeaturesDescription') }}</mk-info>
		<mk-switch v-model="hideTimelineColumn">
			{{ $t('hideTimelineColumn') }}
		</mk-switch>
	</div>
</section>
	<!-- <mk-button @click="cacheClear()" primary style="margin: var(--margin) auto;">{{ $t('cacheClear') }}</mk-button> -->
</template>

<script lang="ts">
import Vue from 'vue';
import { faTv, faQuestion } from '@fortawesome/free-solid-svg-icons';
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import MkSwitch from '../../components/ui/switch.vue';
import MkSelect from '../../components/ui/select.vue';
import MkButton from '../../components/ui/button.vue';
import MkRadio from '../../components/ui/radio.vue';
import XNote from '../../components/note.vue';
import { langs } from '../../config';
import MkInfo from '../../components/ui/info.vue';
import { clientDb, set } from '../../db';

export default Vue.extend({
	metaInfo() {
		return {
			title: this.$t('settings') as string
		};
	},

	components: {
		MkSwitch,
		MkSelect,
		MkRadio,
		MkButton,
		XNote,
		MkInfo
	},

	data() {
		return {
			langs,
			lang: localStorage.getItem('lang'),
			fontSize: localStorage.getItem('fontSize'),
			faTv, faQuestion, faQuestionCircle
		}
	},

	computed: {
		autoReload: {
			get() { return this.$store.state.device.autoReload; },
			set(value) { this.$store.commit('device/set', { key: 'autoReload', value }); }
		},

		enableInfiniteScroll: {
			get() { return this.$store.state.device.enableInfiniteScroll; },
			set(value) { this.$store.commit('device/setInfiniteScrollEnabling', value); }
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

		disablePagesScript: {
			get() { return this.$store.state.device.disablePagesScript; },
			set(value) { this.$store.commit('device/set', { key: 'disablePagesScript', value }); }
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
			set(value) { this.$store.commit('device/set', { key: 'iconShape', value }); }
		},

		showUnrenoteConfirm: {
			get() { return this.$store.state.device.showUnrenoteConfirm },
			set(value) { this.$store.commit('device/set', { key: 'showUnrenoteConfirm', value }); }
		},

		showNoteDeleteConfirm: {
			get() { return this.$store.state.device.showNoteDeleteConfirm },
			set(value) { this.$store.commit('device/set', { key: 'showNoteDeleteConfirm', value }); }
		},

		showDeleteAndEditConfirm: {
			get() { return this.$store.state.device.showDeleteAndEditConfirm },
			set(value) { this.$store.commit('device/set', { key: 'showDeleteAndEditConfirm', value }); }
		},

		showDriveFileDeleteConfirm: {
			get() { return this.$store.state.device.showDriveFileDeleteConfirm },
			set(value) { this.$store.commit('device/set', { key: 'showDriveFileDeleteConfirm', value }); }
		},

		showRenoteConfirm: {
			get() { return this.$store.state.device.showRenoteConfirm },
			set(value) { this.$store.commit('device/set', { key: 'showRenoteConfirm', value }); }
		},

		showNoteConfirm: {
			get() { return this.$store.state.device.showNoteConfirm },
			set(value) { this.$store.commit('device/set', { key: 'showNoteConfirm', value }); }
		},

		showFollowConfirm: {
			get() { return this.$store.state.device.showFollowConfirm },
			set(value) { this.$store.commit('device/set', { key: 'showFollowConfirm', value }); }
		},

		showUnfollowConfirm: {
			get() { return this.$store.state.device.showUnfollowConfirm },
			set(value) { this.$store.commit('device/set', { key: 'showUnfollowConfirm', value }); }
		},

		showBlockConfirm: {
			get() { return this.$store.state.device.showBlockConfirm },
			set(value) { this.$store.commit('device/set', { key: 'showBlockConfirm', value }); }
		},

		showUnblockConfirm: {
			get() { return this.$store.state.device.showUnblockConfirm },
			set(value) { this.$store.commit('device/set', { key: 'showUnblockConfirm', value }); }
		},

		showMuteConfirm: {
			get() { return this.$store.state.device.showMuteConfirm },
			set(value) { this.$store.commit('device/set', { key: 'showMuteConfirm', value }); }
		},

		showUnMuteConfirm: {
			get() { return this.$store.state.device.showUnMuteConfirm },
			set(value) { this.$store.commit('device/set', { key: 'showUnMuteConfirm', value }); }
		},

		showStealConfirm: {
			get() { return this.$store.state.device.showStealConfirm },
			set(value) { this.$store.commit('device/set', { key: 'showStealConfirm', value }); }
		},

		compactMode: {
			get() { return this.$store.state.device.postStyle === 'compact' },
			set(value) { this.$store.commit('device/set', { key: 'postStyle', value: value ? 'compact' : 'standard' }); }
		},

		hideTimelineColumn: {
			get() { return this.$store.state.deviceUser.hideTimelineColumn },
			set(value) { this.$store.commit('deviceUser/set', { key: 'hideTimelineColumn', value }); }
		},

		noteNameDisplayMode: {
			get() { return this.$store.state.device.noteNameDisplayMode },
			set(value) { this.$store.commit('device/set', { key: 'noteNameDisplayMode', value }) }
		},

		showFullAcct: {
			get() { return this.$store.state.settings.showFullAcct },
			set(value) { this.$store.dispatch('settings/set', { key: 'showFullAcct', value }) }
		},

		fixedWidgetsPosition: {
			get() { return this.$store.state.device.fixedWidgetsPosition; },
			set(value) { this.$store.commit('device/set', { key: 'fixedWidgetsPosition', value }); }
		},

		previewNote () {
			return {
				id: '',
				createdAt: new Date(),
				text: this.$t('previewText'),
				cw: null,
				visibility: 'public',
				user: this.$store.state.i,
				files: [],
				reactions: {
					'🦊': 2,
					'🐶': 1,
				},
				myReaction: '🦊',
			};
		}
	},

	watch: {
		lang() {
			const dialog = this.$root.dialog({
				type: 'waiting',
				iconOnly: true
			});

			localStorage.setItem('lang', this.lang);

			return set('_version_', `changeLang-${(new Date()).toJSON()}`, clientDb.i18n)
				.then(() => location.reload())
				.catch(() => {
					dialog.close();
					this.$root.dialog({
						type: 'error',
						iconOnly: true,
						autoClose: true
					});
				});
		},

		fontSize() {
			if (this.fontSize == null) {
				localStorage.removeItem('fontSize');
			} else {
				localStorage.setItem('fontSize', this.fontSize);
			}
			location.reload();
		},

		showFullAcct() {
			location.reload();
		}
	},

	methods: {
		showHint(title: string, text: string) {
			this.$root.dialog({ title, text, type: 'info' });
		},

		reloadLang() {
			const dialog = this.$root.dialog({
				type: 'waiting',
				iconOnly: true
			});

			return set('_version_', `reload-${(new Date()).toJSON()}`, clientDb.i18n)
				.then(() => location.reload())
				.catch(() => {
					dialog.close();
					this.$root.dialog({
						type: 'error',
						iconOnly: true,
						autoClose: true
					});
				});
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
