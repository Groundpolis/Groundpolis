<template>
	<div v-html="body" class="mk-markdown" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MarkdownIt from 'markdown-it';

const markdown = MarkdownIt({
	html: true
});

export default defineComponent({
	props: {
		text: {
			type: String,
			required: true,
		},
	},
	data() {
		return {
			body: '',
		}
	},
	watch: {
		text: {
			handler() {
				this.body = markdown.render(this.text);
			},
			immediate: true,
		}
	},
});
</script>

<style lang="scss" scoped>

.mk-markdown {
	> *:first-child {
		margin-top: 0;
	}

	> *:last-child {
		margin-bottom: 0;
	}

	::v-deep(a) {
		color: var(--link);
	}

	::v-deep(blockquote) {
		display: block;
		margin: 8px;
		padding: 6px 0 6px 12px;
		color: var(--fg);
		border-left: solid 3px var(--fg);
		opacity: 0.7;

		p {
			margin: 0;
		}
	}

	::v-deep(h2) {
		font-size: 1.25em;
		padding: 0 0 0.5em 0;
		border-bottom: solid 1px var(--divider);
	}

	::v-deep(table) {
		width: 100%;
		max-width: 100%;
		overflow: auto;
	}

	::v-deep(kbd.group) {
		display: inline-block;
		padding: 2px;
		border: 1px solid var(--divider);
		border-radius: 4px;
		box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
	}

	::v-deep(kbd.key) {
		display: inline-block;
		padding: 6px 8px;
		border: solid 1px var(--divider);
		border-radius: 4px;
		box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
	}
}
</style>
