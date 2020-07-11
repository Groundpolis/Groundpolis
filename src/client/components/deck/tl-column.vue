<template>
<x-column :menu="menu" :column="column" :is-stacked="isStacked" :indicated="indicated" @change-active-state="onChangeActiveState">
	<template #header>
		<fa :icon="getIconOfTimeline(column.tl)"/>
		<span style="margin-left: 8px;">{{ column.name }}</span>
	</template>

	<div class="iwaalbte" v-if="disabled">
		<p>
			<fa :icon="faMinusCircle"/>
			{{ $t('disabled-timeline.title') }}
		</p>
		<p class="desc">{{ $t('disabled-timeline.description') }}</p>
	</div>
	<x-timeline v-else-if="column.tl" ref="timeline" :src="column.tl" @after="() => $emit('loaded')" @queue="queueUpdated" @note="onNote" :key="column.tl"/>
</x-column>
</template>

<script lang="ts">
import Vue from 'vue';
import { faMinusCircle, faHome, faComments, faShareAlt, faGlobe, faCog } from '@fortawesome/free-solid-svg-icons';
import XColumn from './column.vue';
import XTimeline from '../timeline.vue';
import { getIconOfTimeline } from '../../scripts/get-icon-of-timeline';

export default Vue.extend({
	components: {
		XColumn,
		XTimeline,
	},

	props: {
		column: {
			type: Object,
			required: true
		},
		isStacked: {
			type: Boolean,
			required: true
		}
	},

	data() {
		return {
			menu: null,
			disabled: false,
			indicated: false,
			columnActive: true,
			faMinusCircle, faHome, faComments, faShareAlt, faGlobe,
		};
	},

	watch: {
		mediaOnly() {
			(this.$refs.timeline as any).reload();
		}
	},

	created() {
		this.menu = [{
			icon: faCog,
			text: this.$t('timeline'),
			action: this.setType
		}];
	},

	mounted() {
		if (this.column.tl == null) {
			this.setType();
		} else {
			this.disabled = !this.$store.state.i.isModerator && !this.$store.state.i.isAdmin && (
				this.$store.state.instance.meta.disableLocalTimeline && ['local', 'social'].includes(this.column.tl) ||
				this.$store.state.instance.meta.disableGlobalTimeline && ['global'].includes(this.column.tl));
		}
	},

	methods: {
		getIconOfTimeline,
		async setType() {
			const { canceled, result: src } = await this.$root.dialog({
				title: this.$t('timeline'),
				type: null,
				select: {
					items: [
						'home',
						'local',
						'social',
						'global', 
						'cat',
						'followers',
						'remoteFollowing',
					].map(value => ({ value, text: this.$t(`_timelines.${value}`) })),
				},
			});
			if (canceled) {
				if (this.column.tl == null) {
					this.setType();
				}
				return;
			}
			Vue.set(this.column, 'tl', src);
			this.$store.commit('deviceUser/updateDeckColumn', this.column);
		},

		queueUpdated(q) {
			if (this.columnActive) {
				this.indicated = q !== 0;
			}
		},

		onNote() {
			if (!this.columnActive) {
				this.indicated = true;
			}
		},

		onChangeActiveState(state) {
			this.columnActive = state;

			if (this.columnActive) {
				this.indicated = false;
			}
		},

		focus() {
			(this.$refs.timeline as any).focus();
		}
	}
});
</script>

<style lang="scss" scoped>
.iwaalbte {
	text-align: center;

	> p {
		margin: 16px;

		&.desc {
			font-size: 14px;
		}
	}
}
</style>
