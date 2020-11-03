<template>
<div class="ipledcug">
	<div class="_fullinfo">
		<div>{{ $t('notFoundDescription') }}</div>
	</div>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import * as os from '@/os';

export default defineComponent({
	data() {
		return {
			INFO: {
				header: [{
					title: this.$t('notFound'),
					icon: faExclamationTriangle
				}]
			},
		}
	},
});
</script>
