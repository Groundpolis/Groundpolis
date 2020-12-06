<template>
<FormBase>
	<FormGroup>
		<FormSwitch v-model:value="$store.state.i.injectFeaturedNote" @update:value="onChangeInjectFeaturedNote">
			{{ $t('showFeaturedNotesInTimeline') }}
		</FormSwitch>
		<FormSwitch v-model:value="injectUnlistedNoteInLTL">
			{{ $t('showUnlistedNotesInLTL') }}
			<template #desc>{{ $t('showUnlistedNotesInLTLDesc') }}</template>
		</FormSwitch>
	</FormGroup>
	<FormGroup>
		<div class="_formItem _formPanel" style="padding: 16px;">
			<h2>{{ $t('pinnedTimeline') }}</h2>
			<div class="_caption" v-if="items.length > 0" style="padding-bottom: 8px;">{{ $t('pinnedTimelineDescription') }}</div>
			<XDraggable class="vmievna2" v-model="items" :item-key="item => item" animation="150" delay="100" delay-on-touch-only="true">
				<template #item="{element: item}">
					<div class="item">
						<Fa class="icon" :icon="timelineMenuMap[item].icon" />
						{{ timelineMenuMap[item].name }}
						<div class="del" @click="del(item)"><Fa :icon="faTimes" /></div>
					</div>
				</template>
			</XDraggable>
			<div class="_caption" style="padding: 8px 0;">{{ $t(otherItems.length > 0 ? 'pinnedTimelineDescription2' : 'pinnedTimelineEverything') }}</div>
			<div class="otherItem" v-for="item in otherItems" :key="item" @click="add(item)">
				<Fa class="icon" :icon="timelineMenuMap[item].icon" />
				{{ timelineMenuMap[item].name }}
			</div>
		</div>
	</FormGroup>
	<FormButton @click="reset" danger><Fa :icon="faRedo"/> {{ $t('default') }}</FormButton>
</FormBase>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from 'vue';
import { faTimes, faBars, faUndo, faPlus } from '@fortawesome/free-solid-svg-icons';
import FormGroup from '@/components/form/group.vue';
import FormSwitch from '@/components/form/switch.vue';
import FormBase from '@/components/form/base.vue';
import FormButton from '@/components/form/button.vue';
import { timelineMenuMap, timelineMenuSources } from '../../menus/timeline';
import { defaultDeviceSettings } from '@/store';
import * as os from '@/os';

export default defineComponent({
	components: {
		FormBase,
		FormSwitch,
		FormGroup,
		FormButton,
		XDraggable: defineAsyncComponent(() => import('vuedraggable').then(x => x.default)),
	},

	data() {
		return {
			items: this.$store.state.device.timelineTabItems.filter(it => it != null),
			changed: false,
			timelineMenuMap,
			faTimes, faBars, faUndo, faPlus
		}
	},

	computed: {
		otherItems() {
			return timelineMenuSources.filter(m => !this.items.includes(m));
		},

		injectUnlistedNoteInLTL: {
			get() { return this.$store.state.settings.injectUnlistedNoteInLTL; },
			set(value) { this.$store.dispatch('settings/set', { key: 'injectUnlistedNoteInLTL', value }); }
		},
	},
	
	watch: {
		items: {
			handler() {
				console.log('saved to vuex');
				this.$store.commit('device/set', { key: 'timelineTabItems', value: [...this.items] });
			},
			deep: true,
		},
		injectUnlistedNoteInLTL() {
			location.reload();
		},
	},

	methods: {
		onChangeInjectFeaturedNote(v) {
			os.api('i/update', {
				injectFeaturedNote: v
			});
		},
		add(item: string) {
			if (this.items.includes(item)) return;
			console.log('added');
			this.items = [...this.items, item];
		},
		del(item: string) {
			console.log('deleted');
			this.items = this.items.filter(it => it !== item);
		},
		reset() {
			console.log('reset');
			this.items = defaultDeviceSettings.timelineTabItems;
		},
	}
});
</script>

<style lang="scss" scoped>
.vmievna2 {
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

.otherItem {
	cursor: pointer;
	height: 36px;
}
</style>
