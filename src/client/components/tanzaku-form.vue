<template>
<div class="gafaadew" :class="color">
	<div class="form">
		<textarea v-model="text" class="text" ref="text" :disabled="posting" :placeholder="placeholder" v-autocomplete="{ model: 'text' }" @keydown="onKeydown"></textarea>
		<footer>
			<button class="_button" v-tooltip="$t('emoji')" @click="insertEmoji"><fa :icon="faLaughSquint"/></button>
			<button class="_button" v-tooltip="$t('_tanabata.chooseTanzakuColor')" @click="chooseColor"><fa :icon="faStickyNote"/></button>
			<div class="right">
				<span class="text-count" :class="{ over: trimmedLength(text) > max }">{{ max - trimmedLength(text) }}</span>
				<button class="submit _button" :disabled="!canPost" @click="post"><fa :icon="faPaperPlane"/></button>
			</div>
		</footer>
	</div>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { faStickyNote, faLaughSquint } from '@fortawesome/free-regular-svg-icons';
import insertTextAtCursor from 'insert-text-at-cursor';
import { length } from 'stringz';
import { tanzakuColors } from '../../types';

export default Vue.extend({
	data() {
		return {
			posting: false,
			text: '',
			autocomplete: null,
			color: 'red' as typeof tanzakuColors[number],
			faPaperPlane, faStickyNote, faLaughSquint
		};
	},

	computed: {
		placeholder() {
			return this.$t('_tanabata.placeholder');
		},

		canPost(): boolean {
			return !this.posting && !!this.text && (length(this.text.trim()) <= this.max);
		},

		max(): number {
			return 50;
		}
	},

	mounted() {
		this.focus();

		this.$nextTick(() => {
			this.focus();
		});
	},

	methods: {
		trimmedLength(text: string) {
			return length(text.trim());
		},

		chooseColor(ev: MouseEvent) {
			const items = tanzakuColors.map(color => ({
				text: this.$t(`_tanabata.colors.${color}`),
				action: () => { this.color = color },
			}));

			this.$root.menu({ items, source: ev.currentTarget || ev.target });
		},

		addTag(tag: string) {
			insertTextAtCursor(this.$refs.text, ` #${tag} `);
		},

		focus() {
			(this.$refs.text as any).focus();
		},

		clear() {
			this.text = '';
		},

		onKeydown(e) {
			if ((e.which == 10 || e.which == 13) && (e.ctrlKey || e.metaKey) && this.canPost) this.post();
		},

		post() {
			this.posting = true;
			this.$root.api('notes/create', {
				text: this.text == '' ? undefined : this.text,
				tanzakuColor: this.color,
			}).then(data => {
				this.clear();
				this.$emit('posted');
			}).catch(err => {
				this.$root.dialog({
					type: 'error',
					text: err.message
				});
			}).then(() => {
				this.posting = false;
			});
		},

		cancel() {
			this.$emit('cancel');
		},

		async insertEmoji(ev) {
			const vm = this.$root.new(await import('./emoji-picker.vue').then(m => m.default), {
				source: ev.currentTarget || ev.target
			}).$once('chosen', emoji => {
				insertTextAtCursor(this.$refs.text, emoji);
				vm.close();
			});
		},
	}
});
</script>

<style lang="scss" scoped>
.gafaadew {
	background: var(--panel);

	&.purple {
		color: white;
		background: #AB47BC;
	}

	&.red {
		color: white;
		background: #f06249;
	}

	&.white {
		color: black;
		background: #fafafa;
	}

	&.yellow {
		color: black;
		background: #FFF176;
	}

	&.blue {
		color: white;
		background: #5C6BC0;
	}

	> .form {
		max-width: unset;
		margin: 0 auto;
		padding-top: 16px;

		> .text {
			display: block;
			box-sizing: border-box;
			padding: 0 24px;
			margin: 0;
			width: 100%;
			font-size: 16px;
			border: none;
			border-radius: 0;
			background: transparent;
			color: inherit;
			font-family: inherit;

			@media (max-width: 500px) {
				padding: 0 16px;
			}

			&:focus {
				outline: none;
			}

			&:disabled {
				opacity: 0.5;
			}

			&::placeholder {
				color: inherit;
				opacity: 0.5;
			}
		}

		> .cw {
			z-index: 1;
			padding-bottom: 8px;
		}

		> .text {
			max-width: 100%;
			min-width: 100%;
			min-height: 90px;

			@media (max-width: 500px) {
				min-height: 80px;
			}

			&.withCw {
				padding-top: 8px;
			}
		}

		> .mk-uploader {
			margin: 8px 0 0 0;
			padding: 8px;
		}

		> .file {
			display: none;
		}

		> footer {
			padding: 0 16px 16px 16px;
			position: relative;

			@media (max-width: 500px) {
				padding: 0 8px 8px 8px;
			}

			> button {
				display: inline-block;
				padding: 0;
				margin: 0;
				margin-right: 8px;
				font-size: 16px;
				width: 32px;
				height: 32px;
				color: inherit;

				border: 1px solid rgba(black, 0.1);

				&:hover {
					background: var(--geavgsxy);
				}
			}

		> .right {
			position: absolute;
			bottom: 0;
			right: 0;

			> .text-count {
				opacity: 0.7;
				line-height: 66px;

				@media (max-width: 500px) {
					line-height: 50px;
				}
			}

			> .submit {
				margin: 16px;
				font-size: 16px;
				width: 32px;
				height: 32px;
				vertical-align: bottom;
				color: inherit;
				border: 1px solid rgba(black, 0.1);


				@media (max-width: 500px) {
					margin: 8px;
				}

				&:not(:disabled):hover {
					background: var(--geavgsxy);
				}

				&:disabled {
					border: none;
					opacity: 0.7;
				}
			}
		}
		}
	}
}
</style>
