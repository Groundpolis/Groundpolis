<template>
<FormBase>
	<FormSwitch v-model:value="useDisplayNameForSidebar">{{ $t('useDisplayNameForSidebar') }}</FormSwitch>
	
	<FormGroup>
		<div class="rfqxtzch _formItem _formPanel">
			<XDraggable class="mcc329a0" :list="items" animation="150" delay="100" delay-on-touch-only="true">
				<div class="item" v-for="item in items" :key="item">
					<Fa v-if="!item.startsWith('-:')" class="icon" :icon="menuDef[item].icon" />
					<span v-if="item.startsWith('-:')">-----------------</span>
					<span v-else v-text="$t(menuDef[item] ? menuDef[item].title : item)"/>
					<div class="del" @click="del(item)"><Fa :icon="faTimes" /></div>
				</div>
			</XDraggable>
		</div>
	</FormGroup>

	<FormButton @click="additem" primary><Fa :icon="faPlus"/> {{ $t('add') }}</FormButton>
	<FormButton @click="reset()" danger><Fa :icon="faRedo"/> {{ $t('default') }}</FormButton>
</FormBase>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { faListUl, faRedo, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { v4 as uuid } from 'uuid';
import { VueDraggableNext } from 'vue-draggable-next';
import FormSwitch from '@/components/form/switch.vue';
import FormTextarea from '@/components/form/textarea.vue';
import FormRadios from '@/components/form/radios.vue';
import FormBase from '@/components/form/base.vue';
import FormGroup from '@/components/form/group.vue';
import FormButton from '@/components/form/button.vue';
import { defaultDeviceUserSettings } from '@/store';
import * as os from '@/os';
import { sidebarDef } from '@/sidebar';

export default defineComponent({
	components: {
		XDraggable: VueDraggableNext,
		FormBase,
		FormButton,
		FormTextarea,
		FormRadios,
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
			faRedo, faPlus, faTimes
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
	display: flex;
	flex-direction: column;
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
