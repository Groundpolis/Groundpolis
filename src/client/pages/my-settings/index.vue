<template>
<div>
	<portal to="icon"><fa :icon="faCog"/></portal>
	<portal to="title">{{ $t('settings') }}</portal>

	<router-link to="/my/settings/profile" class="_panel _buttonPrimary">
		{{ $t('editProfile') }}
	</router-link>

	<x-privacy-setting/>
	<x-reaction-setting/>

	<section class="_card">
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
		</div>
	</section>

	<x-sounds/>
	<x-gacha/>
	<x-theme/>
	<x-sidebar/>

	<section class="_card">
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

	<x-client-settings/>

	<x-import-export/>
	<x-drive/>
	<x-mute-block/>
	<x-security/>
	<x-2fa/>
	<x-integration/>
	<x-api/>

	<x-cache-clear/>
	<router-link class="_panel _buttonPrimary" to="/my/apps" style="margin: var(--margin) auto;">{{ $t('installedApps') }}</router-link>

	<button class="_panel _buttonPrimary" @click="$root.signout()" style="margin: var(--margin) auto;">{{ $t('logout') }}</button>
	<button class="_panel _buttonPrimary" @click="signoutAll()" style="margin: var(--margin) auto;">{{ $t('logoutAll') }}</button>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import XCacheClear from './cache-clear.vue';
import XClientSettings from './client-settings.vue';
import XSounds from './sounds.vue';
import XGacha from './gacha.vue';
import XPrivacySetting from './privacy.vue';
import XImportExport from './import-export.vue';
import XDrive from './drive.vue';
import XReactionSetting from './reaction.vue';
import XMuteBlock from './mute-block.vue';
import XTheme from './theme.vue';
import XSidebar from './sidebar.vue';
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
		XClientSettings,
		XCacheClear,
		XSounds,
		XGacha,
		XPrivacySetting,
		XImportExport,
		XDrive,
		XReactionSetting,
		XMuteBlock,
		XSecurity,
		X2fa,
		XIntegration,
		XApi,
		XTheme,
		XSidebar,
		MkButton,
		MkSwitch,
		MkSelect,
		MkRadio
	},

	data() {
		return {
			faCog
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
		}
	}
});
</script>
