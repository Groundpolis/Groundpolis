<template>
<MkModal ref="modal" :src="src" @click="$refs.modal.close()" @closed="$emit('closed')" transparent>
	<div class="_popup _vstack dense cnv9nwfw">
		<ul class="list">
			<li v-for="item in templates" :key="item.label" class="item" @click="choose(item)">
				<button>{{item.body}}</button>
			</li>
		</ul>
		<MkA to="/settings/template" class="_button edit-button" @click="$refs.modal.close()">{{ $ts._template.edit }}</MkA>
	</div>
</MkModal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MkModal from './ui/modal.vue';
import MkMenu from './ui/menu.vue';
import { Template } from '@/store';

export default defineComponent({
	components: {
		MkModal,
		MkMenu,
	},
	props: {
		src: {
			required: false
		},
	},
	emits: ['closed', 'chosen'],
	data() {
		return {
			templates: this.$store.state.templateList,
		}
	},
	computed: {
		keymap(): any {
			return {
				'esc': () => this.$refs.modal.close(),
			};
		},
	},
	methods: {
		choose(item: Template) {
			this.$emit('chosen', item);
			this.$nextTick(() => {
				this.$refs.modal.close();
			});
		},
	},
});
</script>

<style lang="scss" scoped>
.cnv9nwfw {
	width: 256px;
	.list {
		max-height: 192px;
		overflow: auto;

		list-style: none;
		padding: 0;
		margin: 0;
		> .item {
			> button {
				width: 256px;
				appearance: none;
				overflow: hidden;
				background: var(--panel);
				color: var(--fg);
				border: none;
				text-overflow: ellipsis;
				padding: 8px 16px;
				text-align: left;
				font-size: inherit;
				white-space: nowrap;
				overflow-wrap: normal;

				&:hover {
					color: #fff;
					background: var(--accent);
					text-decoration: none;
				}

				&:active {
					color: #fff;
					background: var(--accentDarken);
				}
			}
		}
	}

	> .edit-button {
		background: var(--panel);
		color: var(--accent);
		border: none;
		padding: 8px 16px;
		&:hover {
			background: var(--panelHighlight);
			text-decoration: none;
		}
	}
}
</style>
