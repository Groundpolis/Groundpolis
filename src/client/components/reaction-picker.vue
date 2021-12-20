<template>
<MkModal ref="modal" :src="src" @click="$refs.modal.close()" @closed="$emit('closed')" transparent>
	<div class="rdfaahpb _popup" v-hotkey="keymap">
		<div class="buttons" ref="buttons" :class="{ showFocus }">
			<button class="_button" v-for="(reaction, i) in rs" :key="reaction" @click="react(reaction)" :tabindex="i + 1" :title="reaction" v-particle><XReactionIcon :reaction="reaction"/></button>
		</div>
		<footer>
			<button class="_button command" style="vertical-align: middle;" @click="openPicker" :tabindex="rs.length + 1"><fa :icon="faLaughSquint"/></button>
			<input class="text" ref="text" v-model.trim="text" :class="{ showDislike }" :placeholder="$ts.input" @keyup.enter="reactText" @input="tryReactText">
			<button v-if="showDislike" class="_button command dislike" :class="{ active: dislike }" style="vertical-align: middle;" @click="dislike = !dislike" :tabindex="rs.length + 2" v-tooltip="$ts.dislike">
				<Fa :icon="faThumbsUp" :class="{ active: dislike }"/>
			</button>
			<button class="_button command" style="vertical-align: middle; overflow-wrap: normal" v-if="latest" @click="react(latest)" :tabindex="rs.length + 3" :title="latest" v-particle>
				<XReactionIcon :reaction="latest"/>
			</button>
		</footer>
	</div>
</MkModal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { faLaughSquint, faThumbsUp } from '@fortawesome/free-regular-svg-icons';
import { emojiRegex } from '../../misc/emoji-regex';
import XReactionIcon from '@/components/reaction-icon.vue';
import MkModal from '@/components/ui/modal.vue';
import { Autocomplete } from '@/scripts/autocomplete';
import * as os from '@/os';

export default defineComponent({
	components: {
		XReactionIcon,
		MkModal,
	},

	props: {
		reactions: {
			required: false
		},

		showDislike: {
			default: true
		},

		showFocus: {
			type: Boolean,
			required: false,
			default: false
		},

		src: {
			required: false
		},
	},

	emits: ['done', 'closed'],

	data() {
		return {
			rs: this.reactions || this.$store.state.reactions,
			text: null,
			focus: null,
			latest: this.$store.state.latestReaction,
			dislike: false,
			faLaughSquint, faThumbsUp,
		};
	},

	computed: {
		keymap(): any {
			return {
				'esc': this.close,
				'enter|space|plus': this.choose,
				'up|k': this.focusUp,
				'left|h|shift+tab': this.focusLeft,
				'right|l|tab': this.focusRight,
				'down|j': this.focusDown,
				'1': () => this.react(this.rs[0]),
				'2': () => this.react(this.rs[1]),
				'3': () => this.react(this.rs[2]),
				'4': () => this.react(this.rs[3]),
				'5': () => this.react(this.rs[4]),
				'6': () => this.react(this.rs[5]),
				'7': () => this.react(this.rs[6]),
				'8': () => this.react(this.rs[7]),
				'9': () => this.react(this.rs[8]),
				'0': () => this.react(this.rs[9]),
			};
		},
	},

	watch: {
		focus(i) {
			this.$refs.buttons.children[i].focus({
				preventScroll: true
			});
		}
	},

	mounted() {
		this.$nextTick(() => {
			this.focus = 0;
		});

		// TODO: detach when unmount
		new Autocomplete(this.$refs.text, this, { model: 'text' });
	},

	methods: {
		close() {
			this.$emit('done');
			this.$refs.modal.close();
		},
	
		react(reaction) {
			this.$emit('done', { reaction, dislike: this.dislike, });
			this.$refs.modal.close();
		},

		reactText() {
			if (!this.text) return;
			this.react(this.text);
		},

		tryReactText() {
			if (!this.text) return;
			if (!this.text.match(emojiRegex)) return;
			this.reactText();
		},

		async openPicker(ev: Event) {
			this.text = await os.pickEmoji(ev.currentTarget || ev.target);
			this.reactText();
		},

		focusUp() {
			this.focus = this.focus == 0 ? 9 : this.focus < 5 ? (this.focus + 4) : (this.focus - 5);
		},

		focusDown() {
			this.focus = this.focus == 9 ? 0 : this.focus >= 5 ? (this.focus - 4) : (this.focus + 5);
		},

		focusRight() {
			this.focus = this.focus == 9 ? 0 : (this.focus + 1);
		},

		focusLeft() {
			this.focus = this.focus == 0 ? 9 : (this.focus - 1);
		},

		choose() {
			this.$refs.buttons.children[this.focus].click();
		},
	}
});
</script>

<style lang="scss" scoped>
.rdfaahpb {
	--XReactionPickerButtonSize: 40px;
		@media (max-width: 1025px) {
			--XReactionPickerButtonSize: 48px;
		}
	
	> .buttons {
		padding: 6px 6px 0 6px;
		width: 212px;
		box-sizing: border-box;
		text-align: center;

		@media (max-width: 1025px) {
			padding: 8px 8px 0 8px;
			width: 256px;
		}

		&.showFocus {
			> button:focus {
				position: relative;
				z-index: 1;

				&:after {
					content: "";
					pointer-events: none;
					position: absolute;
					top: 0;
					right: 0;
					bottom: 0;
					left: 0;
					border: 2px solid var(--focus);
					border-radius: 4px;
				}
			}
		}
	}

	> footer {
		padding: 0 6px 6px 6px;

		> .text {
			width: calc(var(--XReactionPickerButtonSize) * 3);
			padding: 8px;
			margin: 0 0 6px 0;
			display: inline-block;
			box-sizing: border-box;
			text-align: left;
			font-size: 16px;
			outline: none;
			border: none;
			border-bottom: 1px solid var(--inputBorder);
			background: transparent;
			color: var(--fg);

			&.showDislike {
				width: calc(var(--XReactionPickerButtonSize) * 2);
			}

			@media (max-width: 1025px) {
				margin: 4px 0 8px 0;
			}
		}
	}

	button {
		padding: 0;
		width: var(--XReactionPickerButtonSize);
		height: var(--XReactionPickerButtonSize);
		font-size: 24px;
		border-radius: 100%;
		display: inline-flex;
		justify-content: center;
		align-items: center;

		@media (max-width: 1025px) {
			font-size: 26px;

			&.command {
				font-size: 24px;
			}
		}

		> * {
			height: 1em;
		}

		&:hover {
			background: rgba(0, 0, 0, 0.05);
		}

		&:active {
			background: rgba(0, 0, 0, 0.1);
		}

		&.command {
			font-size: 20px;

			&.dislike > [data-icon] {
				transform-origin: 50%;
				transition: transform 0.2s ease;

				&.active {
					transform: rotateX(180deg);
				}

			}

			&.active {
				color: var(--accent);
			}
		}
	}
}
</style>
