<template>
<div class="iltifgqe">
	<div class="_vMargin">
		{{ $ts.scratchpadDescription }}
	</div>

	<div class="editor _panel _vMargin">
		<PrismEditor class="_code code" v-model="code" :highlight="highlighter" :line-numbers="true"/>
	</div>

	<MkContainer v-if="error" :body-togglable="true" class="_vMargin">
		<template #header><Fa fixed-width/>{{ $ts.error }}</template>
		<div class="lm92b6x9">
			<div v-text="error.message" />
			<div class="details" v-if="error.details" v-text="error.details" />
		</div>
	</MkContainer>

	<MkContainer :body-togglable="true" class="_vMargin">
		<template #header><Fa fixed-width/>{{ $ts.output }}</template>
		<div class="bepmlvbi">
			<div v-for="log in logs" class="log" :key="log.id" :class="{ print: log.print }">{{ log.text }}</div>
		</div>
	</MkContainer>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { faTerminal, faPlay } from '@fortawesome/free-solid-svg-icons';
import 'prismjs';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-okaidia.css';
import { PrismEditor } from 'vue-prism-editor';
import 'vue-prism-editor/dist/prismeditor.min.css';
import { AiScript, parse, utils, values } from '@syuilo/aiscript';
import MkContainer from '@/components/ui/container.vue';
import MkButton from '@/components/ui/button.vue';
import { createAiScriptEnv } from '@/scripts/aiscript/api';
import * as os from '@/os';

export default defineComponent({
	components: {
		MkContainer,
		MkButton,
		PrismEditor,
	},

	data() {
		return {
			INFO: {
				title: this.$ts.scratchpad,
				icon: faTerminal,
				action: {
					icon: faPlay,
					handler: () => this.run(),
				}
			},
			code: '',
			logs: [],
			error: null as null | {
				message: string;
				details?: string;
			},
		}
	},

	watch: {
		code() {
			localStorage.setItem('scratchpad', this.code);
		}
	},

	created() {
		const saved = localStorage.getItem('scratchpad');
		if (saved) {
			this.code = saved;
		}
	},

	methods: {
		async run() {
			this.error = null;
			this.logs = [];
			const aiscript = new AiScript(createAiScriptEnv({
				storageKey: 'scratchpad'
			}), {
				in: (q) => {
					return new Promise(ok => {
						os.dialog({
							title: q,
							input: {}
						}).then(({ canceled, result: a }) => {
							ok(a);
						});
					});
				},
				out: (value) => {
					this.logs.push({
						id: Math.random(),
						text: value.type === 'str' ? value.value : utils.valToString(value),
						print: true
					});
				},
				log: (type, params) => {
					switch (type) {
						case 'end': this.logs.push({
							id: Math.random(),
							text: utils.valToString(params.val, true),
							print: false
						}); break;
						default: break;
					}
				}
			});


			let ast;
			try {
				ast = parse(this.code);
			} catch (e: any) {
				this.error = {
					message: 'Syntax error :(',
					details: e.message,
				};
				return;
			}
			try {
				await aiscript.exec(ast);
			} catch (e) {
				this.error = {
					message: e.message,
				};
			}
		},

		highlighter(code) {
			return highlight(code, languages.js, 'javascript');
		},
	}
});
</script>

<style lang="scss" scoped>
.iltifgqe {
	padding: 16px;

	> .editor {
		position: relative;
	}
}

.bepmlvbi {
	padding: 16px;

	> .log {
		&:not(.print) {
			opacity: 0.7;
		}
	}
}

.lm92b6x9 {
	padding: 16px;
	.details {
		font-style: italic;
		opacity: 0.8;
	}
}
</style>
