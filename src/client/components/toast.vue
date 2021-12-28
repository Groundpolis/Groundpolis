<template>
<div class="mk-toast">
	<transition name="notification-slide" appear @after-leave="$emit('closed')">
		<div ref="notification" class="notification _acrylic" :style="isMoving ? `transition: none; transform: translateX(${x}px)` : ''" v-if="showing" @mousedown="startSwipe" @touchstart="startSwipe">
			<XNotification class="inner" :notification="notification"/>
			<button class="_button x _shadow" @click="showing = false">
				<Fa :icon="faTimes" />
			</button>
		</div>
	</transition>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import XNotification from './notification.vue';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

export default defineComponent({
	components: {
		XNotification
	},
	props: {
		notification: {
			type: Object,
			required: true
		}
	},
	emits: ['closed'],
	data() {
		return {
			showing: true,
			x: 0,
			isMoving: false,
			currentTimeout: 0,
			globalWidth: 0,
			previousTouchX: 0,
			faTimes,
		};
	},
	mounted() {
		this.timeout();
		window.addEventListener('mouseup', this.endSwipe, {passive: false});
		window.addEventListener('touchend', this.endSwipe, {passive: false});
		window.addEventListener('mousemove', this.onMouseMove, {passive: false});
		window.addEventListener('touchmove', this.onTouchMove, {passive: false});
	},
	beforeUnmount() {
		window.removeEventListener('mouseup', this.endSwipe);
		window.removeEventListener('touchend', this.endSwipe);
		window.removeEventListener('mousemove', this.onMouseMove);
		window.removeEventListener('touchmove', this.onTouchMove);
	},
	methods: {
		clearTimeout() {
			window.clearTimeout(this.currentTimeout);
		},
		timeout() {
			clearTimeout();
			this.currentTimeout = window.setTimeout(() => {
				this.showing = false;
			}, 5000);
		},
		onMouseMove(ev: MouseEvent) {
			this.processSwipe(ev.movementX);
		},
		onTouchMove(ev: TouchEvent) {
			if (this.previousTouchX === 0) {
				this.previousTouchX = ev.touches[0].clientX;
			}
			this.processSwipe(ev.touches[0].clientX - this.previousTouchX);
			this.previousTouchX = ev.touches[0].clientX;
		},
		startSwipe() {
			this.isMoving = true;
			this.globalWidth = (this.$refs.notification as HTMLElement).clientWidth;
			this.clearTimeout();
		},
		processSwipe(movementX: number) {
			if (!this.isMoving) return;
			this.x = Math.max(0, this.x + movementX);
		},
		endSwipe() {
			this.isMoving = false;
			if (this.x > this.globalWidth / 5 * 2) {
				this.x = 0;
				this.$nextTick(() => this.showing = false);
			} else {
				this.x = 0;
				this.timeout();
			}
			this.previousTouchX = 0;
		},
	},
});
</script>

<style lang="scss" scoped>
.notification-slide-enter-active, .notification-slide-leave-active {
	/* transition: opacity 0.3s, transform 0.3s !important; */
}
.notification-slide-enter-from, .notification-slide-leave-to {
	opacity: 0;
	transform: translateX(250px);
}

.mk-toast {
	position: fixed;
	z-index: 10000;
	right: 0;
	min-width: 250px;
	width: fit-content;
	max-width: 360px;
	top: 32px;
	padding: 0 32px;
	/* pointer-events: none; */

	@media (max-width: 700px) {
		top: initial;
		bottom: 112px;
		padding: 0 16px;
	}

	@media (max-width: 500px) {
		bottom: 92px;
		padding: 0 8px;
	}

	> .notification {
		position: relative;
		height: 100%;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
		border-radius: 8px;
		user-select: none;
		transition: opacity 0.3s, transform 0.3s;
		> .inner {
			pointer-events: none;
			overflow: hidden;
		}
		> .x {
			position: absolute;
			top: -8px;
			left: -8px;
			width: 24px;
			height: 24px;
			opacity: 0;
			border-radius: 100%;
			background: var(--panel);
			border: 1px solid var(--divider);
			pointer-events: none;
			transition: opacity 0.2s ease;
		}
		&:hover > .x {
			opacity: 1;
			pointer-events: unset;
		}
	}
}
</style>
