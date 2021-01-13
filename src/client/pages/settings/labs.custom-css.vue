<template>
<FormBase>
	<div class="_formItem">
		<div class="_formLabel" style="font-size: 100%">
			{{ $ts._labs.customCssDesc }}
			<strong style="color: var(--error)">{{$ts._labs.customCssWarn}}</strong>
		</div>
	</div>
	<div class="_formItem">
		<div class="_formPanel editor">
			<PrismEditor class="_cvode code" v-model="css" :highlight="highlighter" line-numbers/>
		</div>
	</div>
	<FormButton primary @click="save">{{$ts.save}}</FormButton>
</FormBase>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import 'prismjs';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-css';
import 'prismjs/themes/prism-okaidia.css';
import { PrismEditor } from 'vue-prism-editor';
import 'vue-prism-editor/dist/prismeditor.min.css';
import FormBase from '@/components/form/base.vue';
import FormButton from '@/components/form/button.vue';

export default defineComponent({
	components: {
		FormBase,
		FormButton,
		PrismEditor,
	},

	data() {
		return {
			css: '/* Input your CSS text! */\n',
		}
	},

	mounted() {
		this.css = localStorage['css'] || this.css;
	},

	methods: {
		highlighter(code) {
			return highlight(code, languages.css, 'css');
		},

		save() {
			localStorage['css'] = this.css;
			window.location.reload();
		},
	},
});
</script>

<style lang="scss" scoped>
.editor {
	padding: 14px 8px;
}
</style>
