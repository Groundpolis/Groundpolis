<template>
	<MfmCore v-bind="$attrs" class="havbbuyv" :class="{ nowrap: $attrs['nowrap'], sticker: !$attrs['plain'] && !$attrs['no-sticker'] && $store.state.device.useSticker }"/>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MfmCore from './mfm';

export default defineComponent({
	components: {
		MfmCore
	},
	props: {
		once: {
			default: true,
		},
	}
});
</script>

<style lang="scss" scoped>
.havbbuyv {
	white-space: pre-wrap;

	&.nowrap {
		white-space: pre;
		word-wrap: normal; // https://codeday.me/jp/qa/20190424/690106.html
		overflow: hidden;
		text-overflow: ellipsis;
	}


	&:not(.nowrap).sticker > ::v-deep(.mk-emoji:only-child) {
		font-size: 4em;
	}

	::v-deep(.quote) {
		display: block;
		margin: 8px;
		padding: 6px 0 6px 12px;
		color: var(--fg);
		border-left: solid 3px var(--fg);
		opacity: 0.7;
	}

	::v-deep(pre) {
		font-size: 0.8em;
	}

	> ::v-deep(code) {
		font-size: 0.8em;
		word-break: break-all;
		padding: 4px 6px;
	}

	::v-deep(.title) {
		text-align: center;
		border-bottom: solid 1px var(--divider);
	}
}
</style>
