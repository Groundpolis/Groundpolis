<template>
<FormBase>
	<div class="_formItem">
		{{ $t('_labs.description') }}
	</div>
	<div class="_formItem _formPanel" style="padding: 16px;">
		{{ $t('_labs.notAvailable') }}
	</div>
</FormBase>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import FormBase from '@/components/form/base.vue';

export default defineComponent({
	components: {
		FormBase,
	},

	computed: {
	},

	watch: {
	},

	methods: {
	},
});
</script>
