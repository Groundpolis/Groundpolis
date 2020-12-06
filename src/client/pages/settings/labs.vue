<template>
<FormBase>
	<div class="_formItem">
		{{ $t('_labs.description') }}
	</div>

	<!-- <div class="_formItem _formPanel" style="padding: 16px;">
		{{ $t('_labs.notAvailable') }}
	</div> -->

	<FormSwitch v-model:value="disableReactions">
		Use "Like" instead of Reactions
		<template #desc>
			Turning on this setting replaces the reaction feature to "Like" feature.
			All reactions will be rendered as a "Like" count, and your "Like" will be transformed to the instance's fallback reaction.
		</template>
	</FormSwitch>
</FormBase>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import FormBase from '@/components/form/base.vue';
import FormSwitch from '@/components/form/switch.vue';

export default defineComponent({
	components: {
		FormBase,
		FormSwitch,
	},

	computed: {
		disableReactions: {
			get() { return this.$store.state.settings.disableReactions; },
			set(value) { this.$store.dispatch('settings/set', { key: 'disableReactions', value: value }); }
		},
	},

	watch: {
	},

	methods: {
	},
});
</script>
