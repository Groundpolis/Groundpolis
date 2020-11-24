<template>
<div>
	<div class="_section _vMargin">
		<div class="_content">
			<p v-text="$t('_labs.description')"/>
		</div>
		<div class="_card _vMargin">
			<div class="_content">
				{{ $t('_labs.notAvailable') }}
			</div>
		</div>
	</div>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import MkSwitch from '@/components/ui/switch.vue';
import MkButton from '@/components/ui/button.vue';

export default defineComponent({
	components: {
		MkSwitch,
		MkButton,
	},

	computed: {
		injectUnlistedNoteInLTL: {
			get() { return this.$store.state.settings.injectUnlistedNoteInLTL; },
			set(value) { this.$store.dispatch('settings/set', { key: 'injectUnlistedNoteInLTL', value }); }
		},
	},

	watch: {
	},

	methods: {
	},
});
</script>
