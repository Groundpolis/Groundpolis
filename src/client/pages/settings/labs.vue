<template>
<div>
	<div class="_section">
		<div class="_content">
			<p v-text="$t('_labs.description')"/>
		</div>
		<div class="_content">
			<MkSwitch v-model="newMobileView">
				{{ $t('_labs.newMobileView') }}
				<template #desc>{{ $t('_labs.newMobileViewDescription') }}</template>
			</MkSwitch>

			<MkSwitch v-model="injectUnlistedNoteInLTL">
				{{ $t('showUnlistedNotesInLTL') }}
				<template #desc>{{ $t('showUnlistedNotesInLTLDesc') }}</template>
			</MkSwitch>
		</div>
	</div>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { faFlask } from '@fortawesome/free-solid-svg-icons';

import MkSwitch from '@/components/ui/switch.vue';

export default defineComponent({
	components: {
		MkSwitch,
	},

	emits: [ 'info' ],

	data() {
		return {
			INFO: {
				title: this.$t('_labs.title'),
				icon: faFlask,
			},
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
		},
	},

	mounted() {
		this.$emit('info', this.INFO);
	}
});
</script>
