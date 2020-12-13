<template>
<FormBase>
	<div class="_formItem">
		<div class="_formLabel" style="font-size: 100%">{{ $t('_labs.description') }}</div>
	</div>

	<!-- <div class="_formItem _formPanel" style="padding: 16px;">
		{{ $t('_labs.notAvailable') }}
	</div> -->

	<FormSwitch v-model:value="disableReactions">
		{{ $t('_labs.useLike') }}
		<template #desc>{{ $t('_labs.useLikeDesc') }}</template>
	</FormSwitch>
	<FormLink to="labs/custom-css">
		{{ $t('_labs.customCss') }}
	</FormLink>
</FormBase>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import FormBase from '@/components/form/base.vue';
import FormLink from '@/components/form/link.vue';
import FormSwitch from '@/components/form/switch.vue';

export default defineComponent({
	components: {
		FormBase,
		FormLink,
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
