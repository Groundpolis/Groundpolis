<template>
<FormBase>
	<FormSwitch v-model:value="useDisplayNameForSidebar">{{ $t('useDisplayNameForSidebar') }}</FormSwitch>
	
	<div class="mcc329a0 _formItem _formPanel">
		<XDraggable class="draggable" v-model="items" :item-key="item => item" animation="150" delay="100" delay-on-touch-only="true">
			<template #item="{element: item}">
				<div class="item">
					<Fa v-if="!item.startsWith('-:')" class="icon" :icon="menuDef[item].icon" />
					<template v-if="item.startsWith('-:')">
						<Fa class="icon" :icon="faMinus" />
						<span v-text="$t('divider')"/>
					</template>
					<span v-else v-text="$t(menuDef[item] ? menuDef[item].title : item)"/>
					<div class="del" @click="del(item)"><Fa :icon="faTimes" /></div>
				</div>
			</template>
		</XDraggable>
	</div>

	<FormTuple>
		<FormButton @click="addItem" primary><Fa :icon="faPlus"/> {{ $t('add') }}</FormButton>
		<FormButton @click="reset()" danger><Fa :icon="faRedo"/> {{ $t('default') }}</FormButton>
	</FormTuple>
</FormBase>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from 'vue';
import { faListUl, faRedo, faPlus, faTimes, faMinus } from '@fortawesome/free-solid-svg-icons';
import { v4 as uuid } from 'uuid';
import FormSwitch from '@/components/form/switch.vue';
import FormRadios from '@/components/form/radios.vue';
import FormBase from '@/components/form/base.vue';
import FormTuple from '@/components/form/tuple.vue';
import FormButton from '@/components/form/button.vue';
import { defaultDeviceUserSettings } from '@/store';
import * as os from '@/os';
import { sidebarDef } from '@/sidebar';

export default defineComponent({
	components: {
		FormBase,
		FormSwitch,
		FormButton,
		FormRadios,
		FormTuple,
		XDraggable: defineAsyncComponent(() => import('vuedraggable').then(x => x.default)),
	},

	emits: ['info'],
	
	data() {
		return {
			INFO: {
				title: this.$t('sidebar'),
				icon: faListUl
			},
			menuDef: sidebarDef,
			items: [],
			faRedo, faPlus, faTimes, faMinus
		}
	},

	computed: {
		useDisplayNameForSidebar: {
			get() { return this.$store.state.settings.useDisplayNameForSidebar; },
			set(value) { this.$store.dispatch('settings/set', { key: 'useDisplayNameForSidebar', value }); }
		},
	},

	created() {
		this.items = this.$store.state.deviceUser.menu.map(it => it === '-' ? '-:' + uuid() : it);
	},

	watch: {
		items: {
			handler() {
				console.log('save');
				this.save();
			},
			deep: true,
		}
	},

	methods: {
		async addItem() {
			const menu = Object.keys(this.menuDef).filter(k => !this.$store.state.deviceUser.menu.includes(k));
			const { canceled, result: item } = await os.dialog({
				type: null,
				title: this.$t('addItem'),
				select: {
					items: [...menu.map(k => ({
						value: k, text: this.$t(this.menuDef[k].title)
					})), ...[{
						value: '-:' + uuid(), text: this.$t('divider')
					}]]
				},
				showCancelButton: true
			});
			if (canceled) return;
			this.items = [...this.items, item];
		},

		del(item) {
			this.items = this.items.filter(it => it !== item);
		},

		save() {
			this.$store.commit('deviceUser/setMenu', this.items.map(it => it.startsWith('-:') ? '-' : it));
		},

		reset() {
			this.items = defaultDeviceUserSettings.menu.map(it => it === '-' ? '-:' + uuid() : it);
		},
	},
});
</script>

<style lang="scss" scoped>

.mcc329a0 {
	padding: 16px;
	> .draggable {
		display: flex;
		flex-direction: column;
	}
}

.item, .otherItem {
	display: flex;
	align-items: center;
	border: solid 1px var(--divider);
	border-bottom: none;
	cursor: move;

	> .icon {
		margin: 0 8px;
	}

	> .del {
		display: flex;
		align-items: center;
		color: var(--error);
		justify-content: center;
		margin-left: auto;
		cursor: pointer;
		width: 36px;
		height: 36px;
	}

	&:last-child {
		border-bottom: solid 1px var(--divider);
	}
}
</style>
