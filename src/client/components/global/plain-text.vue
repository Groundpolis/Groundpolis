<template>
	<span>
		<template v-for="(line, i) in lines" :key="i">
			{{ line }} <br/>
		</template>
	</span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
	props: {
		text: {
			type: String,
			required: true,
		},
	},
	computed: {
		lines(): string[] {
			return this.text.split('\n');
		},
	},
})
</script>
