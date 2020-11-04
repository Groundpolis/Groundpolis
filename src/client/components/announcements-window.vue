<template>
<XWindow ref="window" :initial-width="400" :initial-height="500" :can-resize="true" @closed="$emit('closed')">
	<template #header>{{ $t('announcements') }}</template>
	<div class="vnue729s">
		<div class="title">{{ currentAnnouncement.title }}</div>
		<div class="content">
			<mfm :text="currentAnnouncement.text" :once="false"/>
			<img v-if="currentAnnouncement.imageUrl" :src="currentAnnouncement.imageUrl"/>
		</div>
		<div class="navigation">
			<button class="_button arrow" @click="currentAnnouncementIndex--" :disabled="currentAnnouncementIndex == 0">
				<Fa :icon="faChevronLeft"/>
			</button>
			<span>{{ currentAnnouncementIndex + 1 }} / {{ announcements.length }}</span>
			<button class="_button arrow" @click="currentAnnouncementIndex++" :disabled="currentAnnouncementIndex == announcements.length - 1">
				<Fa :icon="faChevronRight"/>
			</button>
		</div>
	</div>
</XWindow>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { faChevronLeft, faChevronRight, faCheck } from '@fortawesome/free-solid-svg-icons';
import XWindow from './ui/window.vue';
import MkButton from './ui/button.vue';

export default defineComponent({
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
