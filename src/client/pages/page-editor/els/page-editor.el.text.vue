<template>
<XContainer @remove="() => $emit('remove')" :draggable="true">
	<template #header><Fa :icon="faAlignLeft"/> {{ $ts._pages.blocks.text }} ({{ formatText }})</template>
	<template #func>
		<button @click="changeFormat()" class="_button">
			<Fa :icon="faCog"/>
		</button>
	</template>

	<section class="vckmsadr">
		<MkInfo warn v-if="value.format === 'html'">{{ $ts._pages.blocks._text.htmlWarning }}</MkInfo>
		<textarea v-model="value.text" ref="text"></textarea>
	</section>
</XContainer>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { faAlignLeft, faCog } from '@fortawesome/free-solid-svg-icons';
import XContainer from '../page-editor.container.vue';
import { Autocomplete } from '@/scripts/autocomplete';
import * as os from '@/os';
import MkInfo from '@/components/ui/info.vue';

export default defineComponent({
	components: {
		XContainer,
		MkInfo,
	},

	props: {
		value: {
			required: true
		},
	},

	data() {
		return {
			faAlignLeft, faCog,
		};
	},

	computed: {
		formatText(): string {
			switch (this.value.format) {
				case 'gpfm': return 'GPFM';
				case 'plainText': return this.$ts._pages.blocks._text.plainText;
				case 'markdown': return 'Markdown';
				case 'html': return 'HTML';
				default: return '謎';
			}
		},
	},

	created() {
		if (this.value.text == null) this.value.text = '';
		if (this.value.format == null) this.value.format = 'gpfm';
	},

	mounted() {
		new Autocomplete(this.$refs.text, this, { model: 'value.text' });
	},

	methods: {
		async changeFormat() {
			const { canceled, result: item } = await os.dialog({
				type: null,
				title: this.$ts._pages.blocks._text.chooseFormat,
				select: {
					items: [
						{ value: 'gpfm', text: 'GPFM' },
						{ value: 'markdown', text: 'Markdown' },
						{ value: 'plainText', text: this.$ts._pages.blocks._text.plainText },
						{ value: 'html', text: 'HTML' },
					],
				},
				showCancelButton: true
			});
			if (canceled) return;
			this.value.format = item;
		},
	},
});
</script>

<style lang="scss" scoped>
.vckmsadr {
	> textarea {
		display: block;
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		width: 100%;
		min-width: 100%;
		min-height: 150px;
		border: none;
		box-shadow: none;
		padding: 16px;
		background: transparent;
		color: var(--fg);
		font-size: 14px;
		box-sizing: border-box;
	}
}
</style>
