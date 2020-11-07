<template>
	<FaLayers>
		<Fa :icon="faCertificate" :style="{ color: 'var(--accent)' }"/>
		<Fa :icon="faCheck" transform="shrink-6" size="xs" :style="{ color: 'var(--panel)' }"/>
	</FaLayers>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { faCertificate, faCheck } from '@fortawesome/free-solid-svg-icons';
export default defineComponent({
	data() {
		return {
			faCertificate, faCheck,
		};
	}
})
</script>
