<template>
<div>
	<portal to="icon"><fa :icon="faPaintBrush"/></portal>
	<portal to="title">{{ $t('paint') }}</portal>
	<section class="_card">
		<div class="tools">
			<button class="_button" @click="init(512, 512)">
				<fa :icon="farFileAlt"></fa>
			</button>
			<button class="_button" @click="open">
				<fa :icon="farFolderOpen"></fa>
			</button>
			<button class="_button" @click="save">
				<fa :icon="farSave"></fa>
			</button>
		</div>
		<div class="canvas-wrapper">
			<canvas
				ref="canvas"
				:style="canvasStyle"
				@mousedown="onMouseDown"
				@touchstart="onTouchStart"
			>
				Your browser doesn't support this feature.
			</canvas>
		</div>
		<div class="tools">
			<button class="_button" v-for="tool in [ 'hand', 'pen', 'eraser' ]" :key="tool" @click="currentTool = tool" :class="{ active: currentTool === tool }">
				<fa :icon="getToolIconOf(tool)" />
			</button>
			<button class="_button" @click="changeShape" :class="{ active: isShape(currentTool) }">
				<fa :icon="isShape(currentTool) ? currentToolIcon : getToolIconOf('line')"></fa>
			</button>
			<label class="color" :style="{ background: currentColor }">
				<input type="color" v-model="currentColor" />
			</label>
			<button class="_button" :disabled="zoom <= 10" @click="zoom -= 10">
				<fa :icon="faSearchMinus"></fa>
			</button>
			<div v-text="zoom + '%'"/>
			<button class="_button" :disabled="zoom >= 400" @click="zoom += 10">
				<fa :icon="faSearchPlus"></fa>
			</button>
		</div>
	</section>
</div>
</template>

<script lang="ts">
import Vue from 'vue'
import { faPaintBrush, faPaw, faPen, faEraser, faSlash, faSquare, faCircle, faSearchMinus, faSearchPlus } from '@fortawesome/free-solid-svg-icons';
import { faSquare as farSquare, faCircle as farCircle, faSave as farSave, faFolderOpen as farFolderOpen, faFileAlt as farFileAlt } from '@fortawesome/free-regular-svg-icons';

export type ToolType = 'hand'| 'pen' | 'eraser' | 'line' | 'rect' | 'circle' | 'rectFill' | 'circleFill';

export const getToolIconOf = (type: ToolType) => {
	switch (type) {
		case 'hand': return faPaw;
		case 'pen': return faPen;
		case 'eraser': return faEraser;
		case 'line': return faSlash;
		case 'rect': return farSquare;
		case 'circle': return farCircle;
		case 'rectFill': return faSquare;
		case 'circleFill': return faCircle;
	}
};

export default Vue.extend({
	data() {
		return {
			currentTool: 'hand' as ToolType,
			currentColor: '#000000',
			zoom: 100,
			posX: 0,
			posY: 0,
			ctx: null as CanvasRenderingContext2D | null,
			down: false,
			prevPointerPos: { x: 0, y: 0 },
			faPaintBrush, faSearchMinus, faSearchPlus,
			farSquare, farCircle, farSave, farFolderOpen, farFileAlt
		}
	},
	computed: {
		currentToolIcon () {
			return getToolIconOf(this.currentTool);
		},
		canvas () {
			return this.$refs.canvas as HTMLCanvasElement;
		},
		canvasStyle () {
			return { 
				transform: `scale(${this.zoom / 100})`, 
				left: this.posX + 'px',
				top: this.posY + 'px' 
			};
		}
	},
	mounted() {
		this.ctx = this.canvas.getContext('2d');
		if (!this.ctx) return;
		this.init(512, 512);

		document.addEventListener('mousemove', this.onMouseMove);
		document.addEventListener('touchmove', this.onTouchMove);
		document.addEventListener('mouseup', this.onMouseUp);
		document.addEventListener('touchend', this.onTouchEnd);
	},
	beforeDestroy() {

	},
	methods: {
		getToolIconOf,
		genToolMenuItem(type: ToolType)  {
			return {
				text: this.$t('_paint.tools.' + type),
				icon: getToolIconOf(type),
				action: () => this.currentTool = type 
			}
		},
		isShape(type: ToolType) {
			return [ 'line', 'rect', 'circle', 'rectFill', 'circleFill' ].includes(type);
		},
		changeShape(ev: MouseEvent) {
			this.$root.menu({
				items: [
					this.genToolMenuItem('line'),
					this.genToolMenuItem('rect'),
					this.genToolMenuItem('circle'),
					this.genToolMenuItem('rectFill'),
					this.genToolMenuItem('circleFill'),
				],
				fixed: true,
				noCenter: true,
				source: ev.currentTarget || ev.target,
			});
		},
		init(w: number, h: number) {
			this.canvas.width = w;
			this.canvas.height = h;
			if (!this.ctx) return;
			this.ctx.fillStyle = '#ffffff';
			this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
			this.ctx.fillStyle = 'transparent';
			this.ctx.strokeStyle = this.currentColor;
		},
		open() {

		},
		save() {

		},
		onMouseDown(ev: MouseEvent) {
			this.down = true;
			this.prevPointerPos.x = ev.x;
			this.prevPointerPos.y = ev.y;
		},
		onMouseUp(ev: MouseEvent) {
			this.down = false;
		},
		onMouseMove(ev: MouseEvent) {
			if (!this.ctx) return;
			if (!this.down) return;
			// 色を当てる
			this.ctx.strokeStyle = this.currentColor;
			this.ctx.fillStyle = this.currentColor;
			this.ctx.lineWidth = 5;

			const bb = this.canvas.getBoundingClientRect();

			const scale = this.zoom * 0.01;

			const px = (this.prevPointerPos.x - bb.x) / scale;
			const py = (this.prevPointerPos.y - bb.y) / scale;

			const x = (ev.x - bb.x) / scale;
			const y = (ev.y - bb.y) / scale;

			switch (this.currentTool) {
				case 'hand': {
					const dx = ev.x - this.prevPointerPos.x;
					const dy = ev.y - this.prevPointerPos.y;
					this.posX += dx;
					this.posY += dy;
					break;
				}
				case 'pen': {
					this.ctx.beginPath();
					this.ctx.moveTo(px, py);
					this.ctx.lineTo(x, y);
					this.ctx.stroke();
					break;
				}
				case 'eraser': {
					this.ctx.strokeStyle = '#ffffff';
					this.ctx.moveTo(px, py);
					this.ctx.lineTo(x, y);
					this.ctx.stroke();
					break;
				}
			}

			this.prevPointerPos.x = ev.x;
			this.prevPointerPos.y = ev.y;
		},
		onTouchStart(ev: TouchEvent) {
			this.down = true;
		},
		onTouchMove(ev: TouchEvent) {

		},
		onTouchEnd(ev: TouchEvent) {
			this.down = false;
		},
	}
})
</script>

<style lang="scss" scoped>
.tools {
	padding: 16px 16px 16px 16px;
	display: flex;
	align-items: center;
	flex-wrap: wrap;

	@media (max-width: 500px) {
		padding: 0 8px 8px 8px;
	}

	> ._button {
		display: inline-block;
		padding: 0;
		margin: 0;
		font-size: 16px;
		min-width: 48px;
		height: 48px;
		border-radius: 6px;

		&:hover {
			background: var(--geavgsxy);
		}

		&.active {
			color: var(--accent);
		}
	}

	._buttonPrimary {
		display: inline-block;
		padding: 0;
		margin: 0;
		font-size: 16px;
		width: 48px;
		height: 48px;
		border-radius: 6px;
	}

	> .color {
		display: inline-block;
		width: 24px;
		height: 24px;
		margin: 12px;
		box-sizing: border-box;
		border: 1px solid var(--fg);
		cursor: pointer;
		border-radius: 24px;
		> input[type="color"] {
			display: none;
		}
	}

	> .spacer {
		margin: 0 auto;
	}
}

$bg1: #222;
$bg2: #555;

.canvas-wrapper {
	background: $bg1;
	background-image:
		linear-gradient(45deg, $bg2 25%, transparent 0),
		linear-gradient(45deg, transparent 75%, $bg2 0),
		linear-gradient(45deg, $bg2 25%, transparent 0),
		linear-gradient(45deg, transparent 75%, $bg2 0);
	background-size: 16px 16px;
	background-position: 0 0, 8px 8px, 8px 8px, 16px 16px;
	max-width: 100%;
	min-width: 100%;
	resize: vertical;
	height: 256px;
	box-shadow: 0 0 4px black inset;
	animation: canvasWrapperAnimation 0.5s linear infinite;

	position: relative;
	overflow: hidden;

	> canvas {
		position: absolute;
		transform-origin: 0 0;
		box-shadow: 0 0 4px black;
		transition: transform 0.2s ease;
		image-rendering: pixelated;
	}
}

@keyframes canvasWrapperAnimation {
	from {
		background-position: 0 0, 8px 8px, 8px 8px, 16px 16px;
	}
	to {
		background-position: -16px -16px, -8px -8px, -8px -8px, 0px 0px;
	}
}
</style>
