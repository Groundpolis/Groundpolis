<template>
	<div class="_section">
		<div class="_title" v-text="title" />
		<div class="_content">
			<p v-text="description" />
			<div class="preview _panel">
				<Mfm :text="preview"/>
				<MkTextarea v-model:value="preview"><span>GPFM</span></MkTextarea>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MkTextarea from '@/components/ui/textarea.vue';

export default defineComponent({
	components: {
		MkTextarea,
	},
	props: {
		title: {
			type: String,
			required: false,
			default: '',
		},
		description: {
			type: String,
			required: false,
			default: '',
		},
		initialPreview: {
			type: String,
			required: false,
			default: '',
		},
	},
	data() {
		return {
			preview: this.initialPreview,
		};
	}
})
</script>

<style lang="scss" scoped>
.preview {
	padding: 16px;
}
</style>
