<template>
<button
	class="hkzvhatu _button"
	:class="{ reacted: note.myReaction == reaction, canToggle }"
	@click="toggleReaction(reaction)"
	v-if="count > 0"
	@touchstart="onMouseover"
	@mouseover="onMouseover"
	@mouseleave="onMouseleave"
	@touchend="onMouseleave"
	ref="reaction"
	v-particle
>
	<x-reaction-icon :reaction="reaction" ref="icon"/>
	<span>{{ count }}</span>
</button>
</template>

<script lang="ts">
import Vue from 'vue';
import XReactionIcon from './reaction-icon.vue';

export default Vue.extend({
	components: {
		XReactionIcon
	},
	props: {
		reaction: {
			type: String,
			required: true,
		},
		count: {
			type: Number,
			required: true,
		},
		isInitial: {
			type: Boolean,
			required: true,
		},
		note: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			details: null,
			detailsTimeoutId: null,
			isHovering: false
		};
	},
	computed: {
		isMe(): boolean {
			return this.$store.getters.isSignedIn && this.$store.state.i.id === this.note.userId;
		},
		canToggle(): boolean {
			return !this.reaction.match(/@\w/);
		},
	},
	watch: {
		count(newCount, oldCount) {
			if (oldCount < newCount) this.anime();
		},
	},
	mounted() {
		if (!this.isInitial) this.anime();
	},
	methods: {
		toggleReaction() {
			if (this.isMe) return;
			if (!this.canToggle) return;

			const oldReaction = this.note.myReaction;
			if (oldReaction) {
				this.$root.api('notes/reactions/delete', {
					noteId: this.note.id
				}).then(() => {
					if (oldReaction !== this.reaction) {
						this.$root.api('notes/reactions/create', {
							noteId: this.note.id,
							reaction: this.reaction
						});
					}
				});
			} else {
				this.$root.api('notes/reactions/create', {
					noteId: this.note.id,
					reaction: this.reaction
				});
			}
		},
		anime() {
			if (document.hidden) return;

			// TODO
		},
	}
});
</script>

<style lang="scss" scoped>
.hkzvhatu {
	display: inline-block;
	height: 32px;
	margin: 2px;
	padding: 0 6px;
	border-radius: 4px;

	&.canToggle {
		background: rgba(0, 0, 0, 0.05);

		&:hover {
			background: rgba(0, 0, 0, 0.1);
		}
	}

	&:not(.canToggle) {
		cursor: default;
	}

	&.reacted {
		background: var(--accent);

		&:hover {
			background: var(--accent);
		}

		> span {
			color: #fff;
		}
	}

	> span {
		font-size: 0.9em;
		line-height: 32px;
	}
}
</style>
