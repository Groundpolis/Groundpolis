<template>
<div>
	<section class="_section">
		<div class="_content" style="text-align: center;">
			<img src="/assets/icons/512.png" alt="" style="display: block; width: 100px; margin: 0 auto; border-radius: 16px;"/>
			<div style="margin-top: 0.75em;">Groundpolis</div>
			<div style="opacity: 0.5;">v{{ version }}</div>
		</div>
	</section>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { version } from '@/config';

export default defineComponent({
	data() {
		return {
			INFO: {
				title: 'Groundpolis',
				icon: null
			},
			version,
			faInfoCircle
		}
	},
});
</script>
