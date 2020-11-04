<template>
<div class="ipledcug">
	<div class="_section _vMargin">
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
		</div>
	</div>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { faFlask } from '@fortawesome/free-solid-svg-icons';

import MkSwitch from '../components/ui/switch.vue';

export default defineComponent({
	components: {
		MkSwitch,
	},

	data() {
		return {
			INFO: {
				title: this.$t('directNotes'),
				icon: faFlask,
			},
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
	}
});
</script>
