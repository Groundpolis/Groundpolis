<template>
<x-window ref="window" :width="400" :height="450" :no-padding="true" @closed="() => { $emit('closed'); destroyDom(); }" :with-ok-button="false" :can-close="true">
	<template #header>{{ $t('announcements') }}</template>
	<div class="vnue729s">
		<div class="title">{{ currentAnnouncement.title }}</div>
		<div class="content">
			<mfm :text="currentAnnouncement.text" :once="false"/>
			<img v-if="currentAnnouncement.imageUrl" :src="currentAnnouncement.imageUrl"/>
		</div>
		<div class="navigation">
			<button class="_button arrow" @click="currentAnnouncementIndex--" :disabled="currentAnnouncementIndex == 0">
				<fa :icon="faChevronLeft"/>
			</button>
			<span>{{ currentAnnouncementIndex + 1 }} / {{ announcements.length }}</span>
			<button class="_button arrow" @click="currentAnnouncementIndex++" :disabled="currentAnnouncementIndex == announcements.length - 1">
				<fa :icon="faChevronRight"/>
			</button>
		</div>
	</div>
</x-window>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { faChevronLeft, faChevronRight, faCheck } from '@fortawesome/free-solid-svg-icons';
import { kinds } from '../../misc/api-permissions';
import XWindow from './window.vue';
import MkButton from './ui/button.vue';

export default Vue.extend({
	components: {
		XWindow,
		MkButton,
	},

	props: {
		announcements: {
			type: Array as PropType<string[]>,
			required: false,
			default: null
		},
	},

	data() {
		return {
			currentAnnouncementIndex: 0,
			faChevronLeft, faChevronRight, faCheck,
		};
	},

	computed: {
		currentAnnouncement() {
			if (this.announcements.length > 0) {
				if (this.currentAnnouncementIndex < 0)
					this.currentAnnouncementIndex = 0;
				if (this.currentAnnouncementIndex >= this.announcements.length)
					this.currentAnnouncementIndex = this.announcements.length - 1;
				
				return this.announcements[this.currentAnnouncementIndex];
			}
			return null;
		},
	},

	watch: {
		currentAnnouncementIndex() {
			this.$emit('read', this.currentAnnouncement);
		}
	},

	mounted() {
		this.$nextTick(() =>
			this.$emit('read', this.currentAnnouncement)
		);
	},

	methods: {
		
	}
});
</script>

<style lang="scss" scoped>
.vnue729s {
		padding: 24px;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		height: 100%;

		> .title {
			font-weight: bold;
			margin-bottom: 1em;
			font-size: 1.5em;
		}
		> .content {
			overflow: auto;
			> img {
				margin-top: 16px;
				display: block;
				border-radius: var(--radius);
			}
		}
		> .navigation {
			margin-top: auto;
			font-size: 24px;
			> * {
				margin-right: 16px;
			}
		}
}
</style>
