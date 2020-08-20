<template>
<div>
	<portal to="icon"><fa :icon="faCog"/></portal>
	<portal to="title">{{ $t('settings') }}</portal>

	<router-link to="/my/settings/profile" class="_panel _buttonPrimary">
		{{ $t('editProfile') }}
	</router-link>

	<x-reaction-setting class="_vMargin"/>

	<section class="_card _vMargin">
		<div class="_title"><fa :icon="faCog"/> {{ $t('general') }}</div>
		<div class="_content">
			<mk-switch v-model="$store.state.i.autoWatch" @change="onChangeAutoWatch">
				{{ $t('autoNoteWatch') }}<template #desc>{{ $t('autoNoteWatchDescription') }}</template>
			</mk-switch>
			<mk-switch v-model="$store.state.i.injectFeaturedNote" @change="onChangeInjectFeaturedNote">
				{{ $t('showFeaturedNotesInTimeline') }}
			</mk-switch>
		</div>
		<div class="_content">
			<mk-button @click="readAllNotifications">{{ $t('markAsReadAllNotifications') }}</mk-button>
			<mk-button @click="readAllUnreadNotes">{{ $t('markAsReadAllUnreadNotes') }}</mk-button>
			<mk-button @click="readAllMessagingMessages">{{ $t('markAsReadAllTalkMessages') }}</mk-button>
		</div>
		<div class="_content">
			<mk-button @click="configure">{{ $t('notificationSetting') }}</mk-button>
			<div>{{ $t('stealingRule') }}</div>
			<mk-select v-model="stealRule">
				<option :value="0">{{ $t('_steal.textOnly') }}</option>
				<option :value="1">{{ $t('_steal.react') }}</option>
				<option :value="2">{{ $t('_steal.renote') }}</option>
				<option :value="3">{{ $t('_steal.url') }}</option>
			</mk-select>
			<mk-button v-if="stealRule === 1" @click="chooseReaction">
				<mfm :text="$store.state.settings.stealReaction" :plain="true" />&nbsp;
				{{ $t('chooseReaction') }}
			</mk-button>
			<mk-button @click="configure">{{ $t('notificationSetting') }}</mk-button>
		</div>
	</section>

	<x-theme class=" _vMargin"/>
	<x-plugins class=" _vMargin"/>
	<x-sidebar class=" _vMargin"/>
	<x-sounds class=" _vMargin"/>
	<x-gacha class=" _vMargin"/>

	<section class="_card _vMargin">
		<div class="_title"><fa :icon="faColumns"/> {{ $t('deck') }}</div>
		<div class="_content">
			<mk-switch v-model="deckAlwaysShowMainColumn">
				{{ $t('_deck.alwaysShowMainColumn') }}
			</mk-switch>
		</div>
		<div class="_content">
			<div>{{ $t('_deck.columnAlign') }}</div>
			<mk-radio v-model="deckColumnAlign" value="left">{{ $t('left') }}</mk-radio>
			<mk-radio v-model="deckColumnAlign" value="center">{{ $t('center') }}</mk-radio>
		</div>
	</section>

	<x-appearance class=" _vMargin"/>
	<x-client class=" _vMargin"/>

	<x-import-export class=" _vMargin"/>
	<x-drive class=" _vMargin"/>
	<x-mute-block class=" _vMargin"/>
	<x-word-mute class=" _vMargin"/>

	<x-privacy-setting class=" _vMargin"/>
	<x-security class=" _vMargin"/>
	<x-2fa class=" _vMargin"/>

	<x-integration class=" _vMargin"/>

	<x-api class=" _vMargin"/>

	<x-cache-clear/>

	<router-link class="_panel _buttonPrimary" to="/my/apps" style="margin: var(--margin) auto;">{{ $t('installedApps') }}</router-link>
	<button class="_panel _buttonPrimary" @click="$root.signout()" style="margin: var(--margin) auto;">{{ $t('logout') }}</button>
	<button class="_panel _buttonPrimary" @click="signoutAll()" style="margin: var(--margin) auto;">{{ $t('logoutAll') }}</button>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { faCog, faColumns } from '@fortawesome/free-solid-svg-icons';
import XCacheClear from './cache-clear.vue';
import XAppearance from './appearance.vue';
import XClient from './client.vue';
import XSounds from './sounds.vue';
import XGacha from './gacha.vue';
import XPrivacySetting from './privacy.vue';
import XImportExport from './import-export.vue';
import XDrive from './drive.vue';
import XReactionSetting from './reaction.vue';
import XMuteBlock from './mute-block.vue';
import XTheme from './theme.vue';
import XSidebar from './sidebar.vue';
import XPlugins from './plugins.vue';
import XWordMute from './word-mute.vue';
import XSecurity from './security.vue';
import X2fa from './2fa.vue';
import XIntegration from './integration.vue';
import XApi from './api.vue';
import MkReactionPicker from '../../components/reaction-picker.vue';
import MkButton from '../../components/ui/button.vue';
import MkSwitch from '../../components/ui/switch.vue';
import MkSelect from '../../components/ui/select.vue';
import MkRadio from '../../components/ui/radio.vue';

export default Vue.extend({
	metaInfo() {
		return {
			title: this.$t('settings') as string
		};
	},

	components: {
		XAppearance,
		XClient,
		XCacheClear,
		XSounds,
		XGacha,
		XPrivacySetting,
		XImportExport,
		XDrive,
		XReactionSetting,
		XMuteBlock,
		XWordMute,
		XSecurity,
		X2fa,
		XIntegration,
		XApi,
		XTheme,
		XSidebar,
		XPlugins,
		MkButton,
		MkSwitch,
		MkSelect,
		MkRadio
	},

	data() {
		return {
			faCog, faColumns
		}
	},

	computed: {
		stealRule: {
			get() { return this.$store.state.settings.stealRule; },
			set(value) { this.$store.dispatch('settings/set', { key: 'stealRule', value }); }
		},
		stealReaction: {
			get() { return this.$store.state.settings.stealReaction; },
			set(value) { this.$store.dispatch('settings/set', { key: 'stealReaction', value }); }
		},
		deckAlwaysShowMainColumn: {
			get() { return this.$store.state.device.deckAlwaysShowMainColumn; },
			set(value) { this.$store.commit('device/set', { key: 'deckAlwaysShowMainColumn', value }); }
		},
		deckColumnAlign: {
			get() { return this.$store.state.device.deckColumnAlign; },
			set(value) { this.$store.commit('device/set', { key: 'deckColumnAlign', value }); }
		},
	},

	methods: {
		onChangeAutoWatch(v) {
			this.$root.api('i/update', {
				autoWatch: v
			});
		},

		onChangeInjectFeaturedNote(v) {
			this.$root.api('i/update', {
				injectFeaturedNote: v
			});
		},

		readAllUnreadNotes() {
			this.$root.api('i/read-all-unread-notes');
		},

		readAllMessagingMessages() {
			this.$root.api('i/read-all-messaging-messages');
		},

		readAllNotifications() {
			this.$root.api('notifications/mark-all-as-read');
		},

		chooseReaction(e) {
			const picker = this.$root.new(MkReactionPicker, {
				source: e.currentTarget || e.target,
				showFocus: false,
			});
			picker.$once('chosen', (reaction: string) => {
				this.stealReaction = reaction;
				picker.close();
			});
		},

		signoutAll() {
			this.$root.dialog({
				type: 'warning',
				text: this.$t('logoutAllConfirm'),
				showCancelButton: true
			}).then(({ canceled }) => {
				if (canceled) return;
				this.$root.signoutAll();
			});
		},

		async configure() {
			this.$root.new(await import('../../components/notification-setting-window.vue').then(m => m.default), {
				includingTypes: this.$store.state.i.includingNotificationTypes,
				showGlobalToggle: false,
			}).$on('ok', async ({ includingTypes: value }: any) => {
				await this.$root.api('i/update', {
					includingNotificationTypes: value,
				}).then(i => {
					this.$store.state.i.includingNotificationTypes = i.includingNotificationTypes;
				}).catch(err => {
					this.$root.dialog({
						type: 'error',
						text: err.message
					});
				});
			});
		}
	}
});
</script>
