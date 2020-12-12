<template>
<FormBase>
	<div class="_formItem">
		<div class="_formLabel" style="font-size: 100%">
			Edit the CSS directly to create the look and feel you want.
			<strong style="color: var(--error)">If you are not familiar with CSS, never touch it.</strong>
		</div>
	</div>
	<div class="_formItem">
		<div class="_formPanel">
			<PrismEditor class="_cvode code" v-model="css" :highlight="highlighter" line-numbers/>
		</div>
	</div>
	<FormButton primary @click="save">
		Save
	</FormButton>
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
import * as os from '@/os';

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
