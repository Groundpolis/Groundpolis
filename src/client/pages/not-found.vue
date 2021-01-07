<template>
<div class="ipledcug">
	<div class="_fullinfo">
		<div>{{ $ts.notFoundDescription }}</div>
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
				title: this.$ts.notFound,
				icon: faExclamationTriangle
			},
		}
	},
});
</script>
