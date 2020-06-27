<template>
<div
	class="tanzaku" :class="note.tanzakuColor"
	v-size="[{ max: 500 }, { max: 450 }, { max: 350 }, { max: 300 }]"
>
	<article class="article">
		<div class="main">
			<div class="body">
				<mfm v-if="note.text" :text="note.text" :author="note.user" :i="$store.state.i" :custom-emojis="note.emojis"/>
			</div>
			<footer class="footer">
				<button v-if="canDelete" class="_button button" @click="del()">{{ $t('delete') }}</button>
			</footer>
		</div>
	</article>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import { focusPrev, focusNext } from '../scripts/focus';
export default Vue.extend({

	props: {
		note: {
			type: Object,
			required: true
		},
	},

	data() {
		return {
			faTrashAlt,
		};
	},

	computed: {
		keymap(): any {
			return {
				'up|k|shift+tab': this.focusBefore,
				'down|j|tab': this.focusAfter,
				'esc': this.blur,
			};
		},
		canDelete() { return this.note.isMyNote || (this.$store.state.i && (this.$store.state.i.isModerator || this.$store.state.i.isAdmin)); },
	},

	methods: {
		focus() {
			this.$el.focus();
		},

		blur() {
			this.$el.blur();
		},

		focusBefore() {
			focusPrev(this.$el);
		},

		focusAfter() {
			focusNext(this.$el);
		},

		async del() {
			const { canceled } = await this.$root.dialog({
				type: 'warning',
				text: this.$t('noteDeleteConfirm'),
				showCancelButton: true
			});

			if (canceled) return;

			await this.$root.api('notes/delete', { noteId: this.note.id });
			this.$emit('deleted');
		},
	}
});
</script>

<style lang="scss" scoped>
.tanzaku {
	position: relative;
	transition: box-shadow 0.1s ease;
	overflow: hidden;
	
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

	&.max-width_500px {
		font-size: 0.9em;
	}

	&.max-width_450px {
		> .article {
			padding: 14px 16px 9px;
		}
	}

	&.max-width_350px {
		> .article > .main > .footer > .button:not(:last-child) {
			margin-right: 18px;
		}
	}

	&.max-width_300px {
		font-size: 0.825em;

		> .article > .main > .footer > .button:not(:last-child) {
			margin-right: 12px;
		}
	}

	&:focus {
		outline: none;
		box-shadow: 0 0 0 3px var(--focus);
	}

	&:hover > .article > .main > .footer > .button {
		opacity: 1;
	}

	> .article {
		display: flex;
		padding: 28px 32px 18px;

		> .main {
			flex: 1;
			min-width: 0;

			> .body {
				margin-left: 0.5em;
				overflow-wrap: break-word;
			}

			> .footer {
				margin-top: 8px;
				text-align: right;
				> .button {
					margin: 0;
					padding: 8px;
					color: inherit;
					border-radius: 2px;
					border: none;

					&:not(:last-child) {
						margin-right: 28px;
					}

					&:hover, &:active {
						background: var(--geavgsxy);
					}
				}
			}
		}
	}
}
</style>
