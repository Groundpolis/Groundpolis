<template>
<XWindow ref="window" :initial-width="650" :initial-height="420" :can-resize="true" @closed="$emit('closed')">
	<template #header>
		<div class="title">
			<img v-if="icon" :src="icon" alt="favicon"/>
			{{ title || 'Player' }}
		</div>
	</template>
	<div class="inner" :style="`padding: ${(player.height || 0) / (player.width || 1) * 100}% 0 0`">
		<iframe 
			:src="player.url + (player.url.match(/\?/) ? '&autoplay=1&auto_play=1' : '?autoplay=1&auto_play=1')"
			:width="player.width || '100%'"
			:heigth="player.height || 250"
			frameborder="0"
			allow="autoplay; encrypted-media"
			allowfullscreen 
		/>
	</div>
</XWindow>
</template>

<script lang="ts">
import { defineComponent, } from 'vue';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import XWindow from '@/components/ui/window.vue';

export default defineComponent({
	components: {
		XWindow,
	},

	props: {
		player: {
			type: Object,
			required: true,
		},
		icon: {
			type: String,
			required: false,
		},
		title: {
			type: String,
			required: false,
		},
	},

	emits: ['closed'],

	setup() {
		return {
			faPlay,
		};
	},
});
</script>

<style lang="scss" scoped>
.inner {
	position: relative;
	width: 100%;
	height: 0;

	> iframe {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}
}

.title {
	display: flex;
	align-items: center;
	> img {
		margin-right: 8px;
	}
}
</style>
