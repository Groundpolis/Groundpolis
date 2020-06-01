<template>
<div>
	<portal to="icon"><fa :icon="faPaintBrush"/></portal>
	<portal to="title">{{ $t('paint') }}</portal>
	<section class="_card" ref="editor">
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
			<span class="progress" v-if="uploadingProgress" v-text="uploadingProgress === 100 ? $t('done') : `${uploadingProgress}%`" />
			<button class="_button" @click="undo" :disabled="undoStack.length === 0">
				<fa :icon="faUndo"></fa>
			</button>
			<button class="_button" @click="redo" :disabled="redoStack.length === 0">
				<fa :icon="faRedo"></fa>
			</button>
		</div>
		<div class="canvas-wrapper" ref="canvasWrapper" :class="{ animation: $store.state.device.animation }">
			<canvas
				ref="canvas"
				:class="{ animation: $store.state.device.animation }"
				:style="canvasStyle"
			>
				Your browser doesn't support this feature.
			</canvas>
			<canvas
				ref="previewCanvas"
				:class="{ animation: $store.state.device.animation }"
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
			<input type="color" class="color" v-model="currentColor" />
			<button class="_button" :disabled="zoom <= 10" @click="zoom -= 10">
				<fa :icon="faSearchMinus"></fa>
			</button>
			<div v-text="zoom + '%'"/>
			<button class="_button" :disabled="zoom >= 400" @click="zoom += 10">
				<fa :icon="faSearchPlus"></fa>
			</button>
		</div>
	</section>
	<section class="_card">
		<div class="_content">
			<div>
				<mk-switch v-model="usePressure" style="display: inline-flex">{{ $t('usePressure') }}</mk-switch>
				<a class="_link" @click="showUsePressureHint" style="margin-left: 8px"><fa :icon="farQuestionCircle"/></a>
			</div>
			<div>
				<mk-range v-model="penWidth" :min="1" :max="256" :step="1" style="display: inline-block">
					<fa slot="icon" :icon="faPen"/>
					<span slot="title">{{ $t('penWidth') }}</span>
				</mk-range>
				<span v-text="penWidth + 'px'"/>
			</div>
			<div>
				<mk-range v-model="eraserWidth" :min="1" :max="256" :step="1" style="display: inline-block">
					<fa slot="icon" :icon="faEraser"/>
					<span slot="title">{{ $t('eraserWidth') }}</span>
				</mk-range>
				<span v-text="eraserWidth + 'px'"/>
			</div>
		</div>
	</section>
</div>
</template>

<script lang="ts">
import Vue from 'vue'
import { faPaintBrush, faPaw, faPen, faEraser, faSlash, faSquare, faCircle, faSearchMinus, faSearchPlus, faUndo, faRedo } from '@fortawesome/free-solid-svg-icons';
import { faSquare as farSquare, faCircle as farCircle, faSave as farSave, faFolderOpen as farFolderOpen, faFileAlt as farFileAlt, faQuestionCircle as farQuestionCircle } from '@fortawesome/free-regular-svg-icons';

import MkSwitch from '../components/ui/switch.vue';
import MkRange from '../components/ui/range.vue';
import { selectDriveFile } from '../scripts/select-drive-file';
import { apiUrl } from '../config';
import { selectFile } from '../scripts/select-file';


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
	components: {
		MkSwitch,
		MkRange,
	},
	data() {
		return {
			currentTool: 'hand' as ToolType,
			currentColor: '#000000',
			zoom: 100,
			canvasX: 0,
			canvasY: 0,
			ctx: null as CanvasRenderingContext2D | null,
			ctxPreview: null as CanvasRenderingContext2D | null,
			down: false,
			prevPressure: 0,
			prevPointerPos: { x: 0, y: 0 },
			downPointerPos: { x: 0, y: 0 },
			undoStack: [] as ImageData[],
			redoStack: [] as ImageData[],
			changed: false,
			fileName: '',
			uploadingProgress: null as number | null,
			faPaintBrush, faPen, faEraser, faSearchMinus, faSearchPlus, faUndo, faRedo,
			farSquare, farCircle, farSave, farFolderOpen, farFileAlt, farQuestionCircle
		}
	},
	metaInfo() {
		return {
			title: (this.$t('paint') as string) + (this.changed ? '*' : ''),
		};
},
	computed: {
		currentToolIcon () {
			return getToolIconOf(this.currentTool);
		},
		canvas () {
			return this.$refs.canvas as HTMLCanvasElement;
		},
		previewCanvas () {
			return this.$refs.previewCanvas as HTMLCanvasElement;
		},
		canvasStyle () {
			return { 
				transform: `scale(${this.zoom / 100})`, 
				left: this.canvasX + 'px',
				top: this.canvasY + 'px' 
			};
		},
		penWidth: {
			get() { return parseInt(this.$store.state.device.penWidth); },
			set(value) { this.$store.commit('device/set', { key: 'penWidth', value }) }
		},
		eraserWidth: {
			get() { return parseInt(this.$store.state.device.eraserWidth); },
			set(value) { this.$store.commit('device/set', { key: 'eraserWidth', value }) }
		},
		usePressure: {
			get() { return this.$store.state.device.usePressure; },
			set(value) { this.$store.commit('device/set', { key: 'usePressure',value }) }
		},
	},
	mounted() {
		this.ctx = this.canvas.getContext('2d');
		this.ctxPreview = this.previewCanvas.getContext('2d');
		if (!this.ctx || !this.ctxPreview) return;
		this.init(512, 512);

		// adjust editor size
		const editor = this.$refs.editor as HTMLElement;
		const wrapper = this.$refs.canvasWrapper as HTMLElement;

		const editorHeightWithoutWrapper = editor.getBoundingClientRect().height - wrapper.getBoundingClientRect().height;
		const prefferedWrapperHeight = window.innerHeight - 60 - editorHeightWithoutWrapper - 64;

		wrapper.style.height = prefferedWrapperHeight + 'px';
		
		window.addEventListener('beforeunload', this.beforeunload);
		window.addEventListener('keydown', this.keydown);
		document.addEventListener('mousemove', this.onMouseMove);
		document.addEventListener('touchmove', this.onTouchMove);
		document.addEventListener('mouseup', this.onMouseUp);
		document.addEventListener('touchend', this.onTouchEnd);
	},

	beforeRouteLeave(to, from, next) {
		if (this.changed) {
			this.$root.dialog({
				type: 'warning',
				text: this.$t('leaveConfirm'),
				showCancelButton: true
			}).then(({ canceled }: any) => {
				if (canceled) {
					next(false);
				} else {
					next();
				}
			});
		} else {
			next();
		}
	},

	beforeDestroy() {
		window.removeEventListener('beforeunload', this.beforeunload);
		window.removeEventListener('keydown', this.keydown);
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
		async init(w: number, h: number, confirm = true) {
			if (this.changed && confirm) {
				const { canceled } = await this.$root.dialog({
					type: 'warning',
					text: this.$t('initConfirm'),
					showCancelButton: true
				});
				if (canceled) return;
			}
			this.previewCanvas.width = this.canvas.width = w;
			this.previewCanvas.height = this.canvas.height = h;

			this.undoStack = [];
			this.redoStack = [];

			if (!this.ctx) return;
			this.ctx.fillStyle = '#ffffff';
			this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
			this.ctx.fillStyle = 'transparent';
			this.ctx.strokeStyle = this.currentColor;
			this.changed = false;
		},
		async open(e) {
			if (this.changed) {
				const { canceled } = await this.$root.dialog({
					type: 'warning',
					text: this.$t('initConfirm'),
					showCancelButton: true
				});
				if (canceled) return;
			}
			const file = await selectFile(this, e.currentTarget || e.target, this.$t('selectFile'), false);
			const img = new Image();
			if (file.type.startsWith('image')) {
				img.src = file.url;
			} else if (file.thumbnailUrl) {
				img.src = file.thumbnailUrl;
			} else {
				this.$root.dialog({
					type: 'error',
					text: this.$t('theFileIsNotImage')
				});
				return;
			}
			const dialog = this.$root.dialog({
				type: 'waiting',
				iconOnly: true,
				cancelableByBgClick: false
			});

			img.onload = async () => {
				dialog.close();
				await this.init(img.naturalWidth, img.naturalHeight, false);
				this.ctx!.drawImage(img, 0, 0);			
				this.fileName = file.name;
				this.changed = false;
			};
			img.onerror = (err) => {
				dialog.close();
				this.$root.dialog({
					type: 'error',
					text: this.$t('failedToLoadImage')
				});				
			};
		},
		async save() {
			const { canceled, result } = await this.$root.dialog({
				title: this.$t('specifyFileName'),
				input:  {
					default: this.fileName
				},
				autoComplete: true
			});
			if (canceled || !result) return;
			this.fileName = result;

			const blob = await new Promise<Blob | null>(res => this.canvas.toBlob(res));

			if (!blob) return;

			const data = new FormData();
				data.append('i', this.$store.state.i.token);
				data.append('force', 'true');
				data.append('file', blob);
				data.append('name', this.fileName);

				const xhr = new XMLHttpRequest();
				xhr.open('POST', apiUrl + '/drive/files/create', true);
				xhr.onload = (e: any) => {
					this.uploadingProgress = 100;
					setTimeout(() => this.uploadingProgress = null, 2000);
				};

				xhr.upload.onprogress = e => {
					this.uploadingProgress = Math.floor(e.loaded / e.total * 100);
				};

				xhr.send(data);


			this.changed = false;
				
		},
		undo() {
			const data = this.undoStack.pop();
			if (!data) return;
			this.redoStack.push(this.ctx!.getImageData(0, 0, this.canvas.width, this.canvas.height));
			this.ctx!.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.ctx!.putImageData(data, 0, 0);
			this.changed = true;
		},
		redo() {
			const data = this.redoStack.pop();
			if (!data) return;
			this.undoStack.push(this.ctx!.getImageData(0, 0, this.canvas.width, this.canvas.height));
			this.ctx!.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.ctx!.putImageData(data, 0, 0);
			this.changed = true;
		},
		onPointerDown(pointerX: number, pointerY: number, pressure = 0.5) {
			this.down = true;
			this.prevPointerPos.x = pointerX;
			this.prevPointerPos.y = pointerY;

			const bb = this.canvas.getBoundingClientRect();
			const scale = this.zoom * 0.01;

			const x = (pointerX - bb.x) / scale;
			const y = (pointerY - bb.y) / scale;


			if (this.currentTool !== 'hand') {
				this.undoStack.push(this.ctx!.getImageData(0, 0, this.canvas.width, this.canvas.height));
				this.redoStack = [];
				this.changed = true;
			}

			this.downPointerPos = { x, y };
			this.onPointerMove(pointerX, pointerY, pressure);
		},
		onPointerUp(pointerX: number, pointerY: number, pressure = 0.5) {
			if (!this.ctx) return;
			if (!this.ctxPreview) return;
			if (!this.down) return;
			const c = this.ctx;
			const cp = this.ctxPreview;
			this.down = false;

			cp.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);

			const bb = this.canvas.getBoundingClientRect();
			const scale = this.zoom * 0.01;

			const x = (pointerX - bb.x) / scale;
			const y = (pointerY - bb.y) / scale;
	
			const left = Math.min(this.downPointerPos.x, x);
			const top = Math.min(this.downPointerPos.y, y);
			const width = Math.abs(x - this.downPointerPos.x);
			const height = Math.abs(y - this.downPointerPos.y);

			c.beginPath();
			switch (this.currentTool) {
				case 'rect': {
					c.rect(left, top, width, height);
					c.stroke();
					break;
				}
				case 'rectFill': {
					c.rect(left, top, width, height);
					c.fill();
					break;
				}
				case 'circle': {
					c.ellipse(left + width / 2, top + height / 2, width / 2 , height / 2, 0, 0, 2 * Math.PI);
					c.stroke();
					break;
				}
				case 'circleFill': {
					c.ellipse(left + width / 2, top + height / 2, width / 2 , height / 2, 0, 0, 2 * Math.PI);
					c.fill();
					break;
				}
				case 'line': {
					c.moveTo(this.downPointerPos.x, this.downPointerPos.y);
					c.lineTo(x, y);
					c.stroke();
					break;
				}
			}
		},
		onPointerMove(pointerX: number, pointerY: number, pressure = 0.5) {

			if (!this.ctx) return;
			if (!this.ctxPreview) return;
			const c = this.ctx;
			const cp = this.ctxPreview;
			// 色を当てる
			c.strokeStyle =	cp.strokeStyle = this.currentColor;
			c.fillStyle = cp.fillStyle = this.currentColor;
			c.lineWidth = cp.lineWidth = this.penWidth;

			if (this.usePressure && (this.currentTool === 'pen' || this.currentTool === 'eraser')) {
				// 稀に pressure が 0 になることがあるので、0のときは0.001にする
				c.lineWidth *= Math.max(pressure, 0.001) * 2;
			}

			const bb = this.canvas.getBoundingClientRect();

			const scale = this.zoom * 0.01;

			const px = (this.prevPointerPos.x - bb.x) / scale;
			const py = (this.prevPointerPos.y - bb.y) / scale;
			const x = (pointerX - bb.x) / scale;
			const y = (pointerY - bb.y) / scale;

			cp.lineCap = c.lineCap = 'butt';
			cp.lineJoin = c.lineJoin = 'miter';

			if (this.currentTool === 'eraser') {
				c.lineWidth = cp.lineWidth = this.eraserWidth;
				c.strokeStyle = cp.strokeStyle = '#fff';
			}

			const drawPen = () => {
					c.lineCap = 'round';
					c.lineJoin = 'round';
					c.beginPath();
					c.moveTo(px, py);
					c.lineTo(x, y);
					c.stroke();
			};

			if (!this.down) {
				if (this.currentTool !== 'hand') {
					cp.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
					cp.lineCap = 'round';
					cp.lineJoin = 'round';
					cp.beginPath();
					cp.moveTo(x, y);
					cp.lineTo(x, y);
					cp.stroke();
				}
				return;
			}

			// ドラッグによる操作
			switch (this.currentTool) {
				case 'hand': {
					const dx = pointerX - this.prevPointerPos.x;
					const dy = pointerY - this.prevPointerPos.y;
					this.canvasX += dx;
					this.canvasY += dy;
					break;
				}
				case 'pen':
				case 'eraser': {
					drawPen();
				}
			}

			// プレビューの更新
			cp.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
	
			const left = Math.min(this.downPointerPos.x, x);
			const top = Math.min(this.downPointerPos.y, y);
			const width = Math.abs(x - this.downPointerPos.x);
			const height = Math.abs(y - this.downPointerPos.y);

			cp.beginPath();
			switch (this.currentTool) {
				case 'rect': {
					cp.rect(left, top, width, height);
					cp.stroke();
					break;
				}
				case 'rectFill': {
					cp.rect(left, top, width, height);
					cp.fill();
					break;
				}
				case 'circle': {
					cp.ellipse(left + width / 2, top + height / 2, width / 2 , height / 2, 0, 0, 2 * Math.PI);
					cp.stroke();
					break;
				}
				case 'circleFill': {
					cp.ellipse(left + width / 2, top + height / 2, width / 2 , height / 2, 0, 0, 2 * Math.PI);
					cp.fill();
					break;
				}
				case 'line': {
					cp.moveTo(this.downPointerPos.x, this.downPointerPos.y);
					cp.lineTo(x, y);
					cp.stroke();
					break;
				}
			}

			this.prevPointerPos.x = pointerX;
			this.prevPointerPos.y = pointerY;
		},
		onMouseDown(ev: MouseEvent) {
			this.onPointerDown(ev.x, ev.y);
		},
		onMouseUp(ev: MouseEvent) {
			this.onPointerUp(ev.x, ev.y);
		},
		onMouseMove(ev: MouseEvent) {
			this.onPointerMove(ev.x, ev.y);
		},
		onTouchStart(ev: TouchEvent) {
			const x = ev.touches[0].clientX;
			const y = ev.touches[0].clientY;
			const pressure = ev.touches[0].force;
			this.prevPressure = pressure;
			this.onPointerDown(x, y, pressure);
			ev.preventDefault();
		},
		onTouchMove(ev: TouchEvent) {
			const x = ev.touches[0].clientX;
			const y = ev.touches[0].clientY;
			const pressure = ev.touches[0].force;
			this.onPointerMove(x, y, pressure);
			this.prevPressure = pressure;
			if (this.down) {
				ev.preventDefault();
			}
		},
		onTouchEnd(ev: TouchEvent) {
			const { x, y } = this.prevPointerPos;
			this.onPointerUp(x, y, this.prevPressure);
		},
		showUsePressureHint() {
			this.$root.dialog({
				text: this.$t('usePressureDescription'),
				type: 'info'
			});
		},
		beforeunload(e: BeforeUnloadEvent) {
			if (this.changed) {
				e.preventDefault();
				e.returnValue = '';
			}
		},
		keydown(e: KeyboardEvent) {
			let prevent = false;
			if (e.metaKey || e.ctrlKey) {
				prevent = true;
				switch (e.key) {
					case 'z':
						if (e.shiftKey) this.redo(); else this.undo();
						break;
					case 'o':
						this.open();
						break;
					case 'n':
						this.init(512, 512);
						break;
					case 's':
						this.save();
						break;
					default:
							prevent = false;
				}
			}
			if (prevent) e.preventDefault();
		}
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
		background: none;
		padding: 0;
		box-sizing: border-box;
		border: 1px solid var(--fg);
		-webkit-appearance: none;
		appearance: none;
		cursor: pointer;
		// border-radius: 24px;
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
	&.animation {
		animation: canvasWrapperAnimation 0.5s linear infinite;
	}

	position: relative;
	overflow: hidden;

	> canvas {
		position: absolute;
		transform-origin: 0 0;
		box-shadow: 0 0 4px black;
		image-rendering: pixelated;

		&.animation {
			transition: transform 0.2s ease;
		}
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
