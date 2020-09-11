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
			faFlask
		}
	},

	computed: {
		newMobileView: {
			get() { return !this.$store.state.device.useLegacyMobileView; },
			set(value) { this.$store.commit('device/set', { key: 'useLegacyMobileView', value: !value }); }
		},
		injectUnlistedNoteInLTL: {
			get() { return this.$store.state.settings.injectUnlistedNoteInLTL; },
			set(value) { this.$store.dispatch('settings/set', { key: 'injectUnlistedNoteInLTL', value }); }
		},
	},

	watch: {
		injectUnlistedNoteInLTL() {
			location.reload();
		}
	}
});
</script>
