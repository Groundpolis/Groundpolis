<template>
<div class="ipledcug">
	<portal to="icon"><fa :icon="faFlask"/></portal>
	<portal to="title">{{ $t('_labs.title') }}</portal>

	<div class="_card _vMargin">
		<div class="_content">
			<p v-text="$t('_labs.description')"/>
		</div>
		<div class="_content">
			<mk-switch v-model="newMobileView">
				{{ $t('_labs.newMobileView') }}
				<template #desc>{{ $t('_labs.newMobileViewDescription') }}</template>
			</mk-switch>

			<mk-switch v-model="injectUnlistedNoteInLTL">
				{{ $t('showUnlistedNotesInLTL') }}
				<template #desc>{{ $t('showUnlistedNotesInLTLDesc') }}</template>
			</mk-switch>

			<mk-switch v-model="newAnnouncementUI">
				{{ $t('_labs.newAnnouncementUI') }}
				<template #desc>{{ $t('_labs.newAnnouncementUIDesc') }}</template>
			</mk-switch>

			<mk-switch v-model="reactFrontend">
				{{ $t('_labs.tryNewApp') }}
				<template #desc>{{ $t('_labs.tryNewAppDesc') }}</template>
			</mk-switch>
		</div>
	</div>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { faFlask } from '@fortawesome/free-solid-svg-icons';

import MkSwitch from '../components/ui/switch.vue';

export default Vue.extend({
	metaInfo() {
		return {
			title: this.$t('lab') as string
		};
	},

	components: {
		MkSwitch,
	},

	data() {
		return {
			reactFrontend: localStorage['fe'] === 'react',
			faFlask
		}
	},

	computed: {
		newMobileView: {
			get() { return !this.$store.state.device.useLegacyMobileView; },
			set(value) { this.$store.commit('device/set', { key: 'useLegacyMobileView', value: !value }); }
		},
		newAnnouncementUI: {
			get() { return this.$store.state.device.newAnnouncementUI; },
			set(value) { this.$store.commit('device/set', { key: 'newAnnouncementUI', value }); }
		},
		injectUnlistedNoteInLTL: {
			get() { return this.$store.state.settings.injectUnlistedNoteInLTL; },
			set(value) { this.$store.dispatch('settings/set', { key: 'injectUnlistedNoteInLTL', value }); }
		},
	},

	watch: {
		injectUnlistedNoteInLTL() {
			location.reload();
		},
		async reactFrontend() {
			if (this.reactFrontend) {
				const { canceled } = await this.$root.dialog({
					type: 'warning',
					showCancelButton: true,
					text: this.$t('_labs.tryNewAppConfirm'),
				});
				if (canceled) {
					this.reactFrontend = false;
				} else {
					localStorage['fe'] = 'react';
					location.href = '/';
				}
			}
		},
	}
});
</script>
