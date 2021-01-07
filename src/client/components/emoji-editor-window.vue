<template>
<XWindow ref="window" :width="400" :height="450" :no-padding="true" @closed="() => { $emit('closed'); destroyDom(); }" :with-ok-button="true" :ok-button-disabled="false" @ok="ok()">
	<template #header>:{{ emoji.name }}:</template>

	<div class="yigymqpb _section">
		<img :src="emoji.url" class="img"/>
		<MkInput v-model:value="name"><span>{{ $t('name') }}</span></MkInput>
		<MkInput v-model:value="category" :datalist="categories"><span>{{ $t('category') }}</span></MkInput>
		<MkInput v-model:value="aliases">
			<span>{{ $t('tags') }}</span>
			<template #desc>{{ $t('setMultipleBySeparatingWithSpace') }}</template>
		</MkInput>
		<MkButton @click="del()"><fa :icon="faTrashAlt"/> {{ $t('delete') }}</MkButton>
	</div>
</XWindow>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import XWindow from './window.vue';
import MkButton from './ui/button.vue';
import MkInput from './ui/input.vue';
import { unique } from '../../prelude/array';

export default defineComponent({
	components: {
		XWindow,
		MkButton,
		MkInput,
	},

	props: {
		emoji: {
			required: true,
		}
	},

data() {
		return {
			name: this.emoji.name,
			category: this.emoji.category,
			aliases: this.emoji.aliases?.join(' '),
			faTrashAlt,
		}
	},

	computed: {
		categories() {
			if (this.$instance) {
				return unique(this.$instance.emojis.map((x: any) => x.category || '').filter((x: string) => x !== ''));
			} else {
				return [];
			}
		}
	},

	methods: {
		ok() {
			this.update();
		},

		async update() {
			await os.api('admin/emoji/update', {
				id: this.emoji.id,
				name: this.name,
				category: this.category,
				aliases: this.aliases.split(' '),
			});
			this.$emit('done', {
				updated: {
					name: this.name,
					category: this.category,
					aliases: this.aliases.split(' '),
				}
			});
			this.$refs.window.close();
		},

		async del() {
			const { canceled } = await os.dialog({
				type: 'warning',
				text: this.$t('removeAreYouSure', { x: this.emoji.name }),
				showCancelButton: true
			});
			if (canceled) return;
			os.api('admin/emoji/remove', {
				id: this.emoji.id
			}).then(() => {
				this.$emit('done', {
					deleted: true
				});
				this.$refs.window.close();
			});
		},
	}
});
</script>

<style lang="scss" scoped>
.yigymqpb {
	> .img {
		display: block;
		height: 64px;
		margin: 0 auto;
	}
}
</style>
