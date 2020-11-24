<template>
<div class="_section">
	<div class="_card">
		<div class="_title" v-text="$t('pinnedTimeline')"/>
		<div class="_content">
			<div class="_caption" style="padding-bottom: 8px;">{{ $t('pinnedTimelineDescription') }}</div>
			<XDraggable class="vmievna2" :list="items" animation="150" delay="100" delay-on-touch-only="true">
				<div class="item" v-for="item in items" :key="item">
					<Fa class="icon" :icon="timelineMenuMap[item].icon" />
					{{ timelineMenuMap[item].name }}
					<div class="del" @click="del(item)"><Fa :icon="faTimes" /></div>
				</div>
			</XDraggable>
			<div class="_caption" style="padding: 8px 0;">{{ $t('pinnedTimelineDescription2') }}</div>
			<div class="otherItem" v-for="item in otherItems" :key="item" @click="add(item)">
				<Fa class="icon" :icon="timelineMenuMap[item].icon" />
				{{ timelineMenuMap[item].name }}
			</div>
		</div>
		<div class="_footer">
			<MkButton inline @click="reset"><Fa :icon="faUndo"/> {{ $t('default') }}</MkButton>
		</div>
	</div>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { faTimes, faBars, faUndo, faPlus } from '@fortawesome/free-solid-svg-icons';
import { VueDraggableNext } from 'vue-draggable-next';
import MkInput from '@/components/ui/input.vue';
import MkButton from '@/components/ui/button.vue';
import MkSwitch from '@/components/ui/switch.vue';
import MkRadios from '@/components/ui/radios.vue';
import { timelineMenuMap, timelineMenuSources } from '../../menus/timeline';
import { defaultDeviceSettings } from '@/store';

export default defineComponent({
	components: {
		MkInput,
		MkButton,
		MkSwitch,
		MkRadios,
		XDraggable: VueDraggableNext,
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
		}
	},
	
	watch: {
		items() {
			console.log('saved to vuex');
			this.$store.commit('device/set', { key: 'timelineTabItems', value: [...this.items] });
		},
	},

	methods: {
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
