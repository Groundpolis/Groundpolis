<template>
<FormBase>
	<div class="_formItem">
		<div class="_formLabel" style="font-size: 100%">{{ $ts._labs.description }}</div>
	</div>

	<!-- <div class="_formItem _formPanel" style="padding: 16px;">
		{{ $ts._labs.notAvailable }}
	</div> -->

	<FormSwitch v-model:value="disableReactions">
		{{ $ts._labs.useLike }}
		<template #desc>{{ $ts._labs.useLikeDesc }}</template>
	</FormSwitch>
	<FormLink to="labs/custom-css">
		{{ $ts._labs.customCss }}
	</FormLink>
	<FormLink to="experimental-features">
		{{ $ts.experimentalFeatures }} (Misskey)
	</FormLink>
</FormBase>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import FormBase from '@/components/form/base.vue';
import FormLink from '@/components/form/link.vue';
import FormSwitch from '@/components/form/switch.vue';
import { defaultStore } from '@/store';

export default defineComponent({
	components: {
		FormBase,
		FormLink,
		FormSwitch,
	},

	computed: {
		disableReactions: defaultStore.makeGetterSetter('disableReactions'),
	},

	watch: {
	},

	methods: {
	},
});
</script>
