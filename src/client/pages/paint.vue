<template>
<div>
	<section class="_section _vMargin" ref="editor">
		<div class="tools">
			<button class="_button" v-tooltip="$ts._paint.new" @click="init">
				<fa :icon="farFileAlt"></fa>
			</button>
			<button class="_button" v-tooltip="$ts._paint.open" @click="open">
				<fa :icon="farFolderOpen"></fa>
			</button>
			<button class="_button" v-tooltip="$ts._paint.save" @click="save">
				<fa :icon="farSave"></fa>
			</button>
			<span class="progress" v-if="uploadingProgress" v-text="uploadingProgress === 100 ? $ts.done : `${uploadingProgress}%`" />
			<button class="_button" v-tooltip="$ts._paint.undo" @click="undo" :disabled="undoStack.length === 0">
				<fa :icon="faUndo"></fa>
			</button>
			<button class="_button" v-tooltip="$ts._paint.redo" @click="redo" :disabled="redoStack.length === 0">
				<fa :icon="faRedo"></fa>
			</button>
			<button class="_button post" v-tooltip="$ts.post" @click="post">
				<fa :icon="faEdit"></fa>
			</button>
		</div>
		<div class="canvas-wrapper" ref="canvasWrapper" :class="{ animation: $store.state.animation }">
			<canvas
				ref="canvas"
				:class="{ animation: $store.state.animation }"
				:style="canvasStyle"
			>
				Your browser doesn't support this feature.
			</canvas>
			<canvas
				ref="previewCanvas"
				:class="{ animation: $store.state.animation }"
				:style="canvasStyle"
				@mousedown="onMouseDown"
				@touchstart="onTouchStart"
			>
				Your browser doesn't support this feature.
			</canvas>
		</div>
		<div class="tools">
			<button class="_button" v-for="tool in tools" v-tooltip="$ts._paint.tools[tool] || tool" :key="tool" @click="currentTool = tool" :class="{ active: currentTool === tool }">
				<fa :icon="getToolIconOf(tool)" />
			</button>
			<button class="_button" v-tooltip="$ts._paint.tools.pixel" @click="currentTool = 'pixel'" :class="{ active: currentTool === 'pixel' }">
				<svg xmlns="http://www.w3.org/2000/svg" data-icon="pixel" style="width: 1em; height: 1em;">
					<path fill="currentColor" d="M16 6V4h-2V2h-2V0h-2v2H8v2H6v2H4v2H2v4h2v2h4v-2h2v-2h2V8h2V6M2 14H0v2h2"/>
				</svg>
			</button>
			<button class="_button" v-tooltip="$ts._paint.tools.shapes" @click="changeShape" :class="{ active: isShape(currentTool) }">
				<fa :icon="isShape(currentTool) ? currentToolIcon : getToolIconOf('line')"></fa>
			</button>
			<button class="_button color-picker" v-tooltip="$ts._paint.changeColor" @click="pickColor">
				<div class="circle" :style="{backgroundColor: currentColorString}" />
			</button>
			<button class="_button" :disabled="zoom <= 10" @click="zoom -= 10" v-tooltip="$ts._paint.zoomMinus">
				<fa :icon="faSearchMinus"></fa>
			</button>
			<div @click="chooseZoom" class="_link" style="cursor: pointer" v-text="zoom + '%'"/>
			<button class="_button" :disabled="zoom >= 1200" @click="zoom += 10" v-tooltip="$ts._paint.zoomPlus">
				<fa :icon="faSearchPlus"></fa>
			</button>
		</div>
	</section>
	<section class="_section _vMargin">
		<div class="_content">
			<div>
				<MkSwitch v-model:value="usePressure" style="display: inline-flex">{{ $ts.usePressure }}
					<template #desc>{{ $ts.usePressureDescription }}</template>
				</MkSwitch>
			</div>
			<div>
				<MkRange v-model:value="penWidth" :min="1" :max="256" :step="1" style="display: inline-block">
					<template #icon><fa :icon="faPen"/></template>
					<template #label><span v-text="$ts.penWidth"/></template>
				</MkRange>
				<span v-text="penWidth + 'px'"/>
			</div>
			<div>
				<MkRange v-model:value="eraserWidth" :min="1" :max="256" :step="1" style="display: inline-block">
					<template #icon><fa :icon="faEraser"/></template>
					<template #label><span v-text="$ts.eraserWidth"/></template>
				</MkRange>
				<span v-text="eraserWidth + 'px'"/>
			</div>
		</div>
	</section>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { faPaintBrush, faPaw, faPen, faEraser, faSlash, faSquare, faCircle, faSearchMinus, faSearchPlus, faUndo, faRedo, faEdit, faEyeDropper, faFillDrip } from '@fortawesome/free-solid-svg-icons';
import { faSquare as farSquare, faCircle as farCircle, faSave as farSave, faFolderOpen as farFolderOpen, faFileAlt as farFileAlt, faQuestionCircle as farQuestionCircle } from '@fortawesome/free-regular-svg-icons';

import MkSwitch from '../components/ui/switch.vue';
import MkRange from '../components/ui/range.vue';
import { apiUrl } from '../config';
import { selectFile } from '../scripts/select-file';
import { Form } from '../scripts/form';
import { PackedDriveFile } from '../../models/repositories/drive-file';
import * as os from '@/os';
import { defaultStore } from '@/store';
import { Rgba, toHtmlColor } from '@/scripts/rgba';

export const shapes = [ 'line', 'rect', 'circle', 'rectFill', 'circleFill' ] as const;

export const tools = [ 'hand', 'pen', 'eraser', 'fill', 'pixel', 'spoit' ] as const;

export type ShapeType = typeof shapes[number];

export type ToolType = typeof tools[number];

export type ToolAndShapeType = ToolType | ShapeType;

export type InitialColor = 'white' | 'black' | 'transparent';

export type RgbaArray = [r: number, g: number, b: number, a: number];

export type Point = {x: number, y: number};

export const getToolIconOf = (type: ToolAndShapeType) => {
	switch (type) {
		case 'hand': return faPaw;
		case 'pen': return faPen;
		case 'fill': return faFillDrip;
		case 'eraser': return faEraser;
		case 'line': return faSlash;
		case 'rect': return farSquare;
		case 'circle': return farCircle;
		case 'rectFill': return faSquare;
		case 'circleFill': return faCircle;
		case 'spoit': return faEyeDropper;
		default: return null;
	}
};

function drawPixelatedLine(px: number, x: number, py: number, y: number, c: CanvasRenderingContext2D) {
	let [x0, y0, x1, y1] = [px, py, x, y].map(Math.floor);

	const [dx, dy] = [
    Math.abs(x1 - x0),
    Math.abs(y1 - y0),
  ];

	const [sx, sy] = [
    x0 < x1 ? 1 : -1,
    y0 < y1 ? 1 : -1,
  ];

  let err = dx - dy;
  c.fillRect(x0, y0, 1, 1);

  while (x0 !== x1 || y0 !== y1) {
    c.fillRect(x0, y0, 1, 1);
    const e2 = err * 2;

		if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }

		if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }
}

function spoit(x: number, y: number, ctx: CanvasRenderingContext2D): RgbaArray {
	return ctx.getImageData(x, y, 1, 1).data as unknown as RgbaArray;
}

function equalsColor([r1, g1, b1, a1]: RgbaArray, [r2, g2, b2, a2]: RgbaArray, threshold = 1): boolean {
	// TODO: しきい値に対応する
	return r1 === r2 && g1 === g2 && b1 === b2 && a1 === a2;
}

// https://fussy.web.fc2.com/algo/algo3-1.htm
async function paintFill(x: number, y: number, ctx: CanvasRenderingContext2D) {
	const baseColor = spoit(x, y, ctx);
	const queue: Array<Point> = [];


	queue.push({x, y});
	
	while (queue.length > 0) {
		const c = queue.shift()!;

		// 左に走査して壁を探す
		let lp: Point = { x: c.x - 1, y: c.y };

		while (0 <= lp.x && equalsColor(baseColor, spoit(lp.x, lp.y, ctx))) {
			lp.x--;
		}
		lp.x++;
		
		// 右に走査して壁を探す
		let rp: Point = { x: c.x + 1, y: c.y };

		while (rp.x <= ctx.canvas.width && equalsColor(baseColor, spoit(rp.x, rp.y, ctx))) {
			rp.x++;
		}
		rp.x--;

		// 壁から壁を塗る
		console.log(lp);
		console.log(rp);
		// ctx.fillStyle = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;
		ctx.fillRect(lp.x, lp.y, rp.x - lp.x + 1, 1);
		// await sleep(50);


		// 下側のキューイングすべき場所を走査する
		let isInside = false;
		for (let bx = rp.x; bx >= lp.x; bx--) {
			if (equalsColor(baseColor, spoit(bx, c.y + 1, ctx))) {
				if (!isInside) {
					queue.push({ x: bx, y: c.y + 1 });
					isInside = true;
				}
			} else {
				isInside = false;
			}
		}
		console.log(queue.length);


		// 上側のキューイングすべき場所を走査する
		isInside = false;
		for (let tx = rp.x; tx >= lp.x; tx--) {
			if (equalsColor(baseColor, spoit(tx, c.y - 1, ctx))) {
				if (!isInside) {
					queue.push({ x: tx, y: c.y - 1 });
					isInside = true;
				}
			} else {
				isInside = false;
			}
		}
		

	}
}

export default defineComponent({
	components: {
		MkSwitch,
		MkRange,
	},

	beforeRouteLeave(to, from, next) {
		if (this.changed) {
			os.dialog({
				type: 'warning',
				text: this.$ts.leaveConfirm,
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
	data() {
		return {
			INFO: {
				title: this.$ts.paint,
				icon: faPaintBrush
			},
			currentTool: 'hand' as ToolAndShapeType,
			currentColor: [0, 0, 0, 255] as Rgba,
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
			recentFile: null as PackedDriveFile | null,
			uploadingProgress: null as number | null,
			// Note: ドットペンは別途タグを使っているので表示しない
			tools: tools.filter(t => t !== 'pixel'),
			faPaintBrush, faPen, faEraser, faSearchMinus, faSearchPlus, faUndo, faRedo, faEdit,
			farSquare, farCircle, farSave, farFolderOpen, farFileAlt, farQuestionCircle
		}
	},
	metaInfo() {
		return {
			title: (this.$ts.paint as string) + (this.changed ? '*' : ''),
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
		currentColorString () {
			return toHtmlColor(this.currentColor);
		},
		penWidth: defaultStore.makeGetterSetter('penWidth'),
		eraserWidth: defaultStore.makeGetterSetter('eraserWidth'),
		usePressure: defaultStore.makeGetterSetter('usePressure'),
	},
	watch: {
		changed() {
			if (this.changed) {
				this.recentFile = null;
			}
		}
	},
	mounted() {
		this.ctx = this.canvas.getContext('2d');
		this.ctxPreview = this.previewCanvas.getContext('2d');
		if (!this.ctx || !this.ctxPreview) return;
		this.createNew(300, 300, 'white');

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

	beforeUnmount() {
		window.removeEventListener('beforeunload', this.beforeunload);
		window.removeEventListener('keydown', this.keydown);
	},
	methods: {
		getToolIconOf,
		genToolMenuItem(type: ToolAndShapeType)  {
			return {
				text: this.$ts._paint.tools[type],
				icon: getToolIconOf(type),
				action: () => { this.currentTool = type; },
			}
		},
		genZoomMenuItem(num: Number)  {
			return {
				text: num + '%',
				action: () => { this.zoom = num; },
			}
		},
		isShape(type: ToolAndShapeType) {
			return (shapes as readonly string[]).includes(type);
		},
		changeShape(ev: MouseEvent) {
			os.modalMenu(shapes.map(this.genToolMenuItem), ev.currentTarget || ev.target);
		},
		chooseZoom(ev: MouseEvent) {
			os.modalMenu([10, 50, 100, 250, 500, 1000, 1200].map(this.genZoomMenuItem), ev.currentTarget || ev.target);
		},
		pickColor(ev: MouseEvent) {
			os.popup(import('../components/color-picker.vue'), {
				// prop
				src: ev.currentTarget || ev.target,
				color: this.currentColor,
			}, {
				// イベント
				changed: (color: Rgba) => {
					this.currentColor = color;
				},
			}, 'closed');
		},
		async init(confirm = true) {
			if (this.changed && confirm) {
				const { canceled } = await os.dialog({
					type: 'warning',
					text: this.$ts.initConfirm,
					showCancelButton: true
				});
				if (canceled) return false;
			}

			const form: Form = {
				width: {
					type: 'number',
					label: this.$ts._paint.width,
					default: 300,
				},
				height: {
					type: 'number',
					label: this.$ts._paint.height,
					default: 300,
				},
				fillColor: {
					type: 'enum',
					label: this.$ts._paint.canvasColor,
					default: 'white',
					enum: [ 'white', 'black', 'transparent' ].map(c => ({
						label: c,
						value: c,
					})),
					
				},
			};
			const { canceled, result } = await os.form(this.$ts._paint.new, form);

			if (canceled) return false;
			await this.createNew(result.width, result.height, result.fillColor);
			return true;
		},
		async createNew(w: number, h: number, fill: InitialColor) {
			this.previewCanvas.width = this.canvas.width = w;
			this.previewCanvas.height = this.canvas.height = h;

			this.undoStack = [];
			this.redoStack = [];

			if (!this.ctx) return;
			this.ctx.fillStyle = fill;
			this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
			this.ctx.fillStyle = 'transparent';
			this.ctx.strokeStyle = this.currentColorString;
			this.changed = false;
		},
		async open(e) {
			if (this.changed) {
				const { canceled } = await os.dialog({
					type: 'warning',
					text: this.$ts.initConfirm,
					showCancelButton: true
				});
				if (canceled) return;
			}
			const file = await selectFile(e.currentTarget || e.target, this.$ts.selectFile, false) as PackedDriveFile;
			const img = new Image();
			img.crossOrigin = '';
			if (file.type.startsWith('image')) {
				img.src = file.url!;
			} else if (file.thumbnailUrl) {
				img.src = file.thumbnailUrl;
			} else {
				os.dialog({
					type: 'error',
					text: this.$ts.theFileIsNotImage
				});
				return;
			}

			img.onload = async () => {
				await this.createNew(img.naturalWidth, img.naturalHeight, 'transparent');
				this.ctx!.drawImage(img, 0, 0);			
				this.fileName = file.name;
				this.changed = false;
			};
			img.onerror = (err) => {
				os.dialog({
					type: 'error',
					text: this.$ts.failedToLoadImage
				});				
			};
		},
		async save() {
			return new Promise<PackedDriveFile>((res, rej) => {
				os.dialog({
					title: this.$ts.specifyFileName,
					input:  {
						default: this.fileName
					},
					autoComplete: true
				}).then(({ canceled, result }) => {
					if (canceled || !result) return;
					this.fileName = result;

					new Promise<Blob | null>(res => this.canvas.toBlob(res)).then((blob) => {
						if (!blob) return;

						const data = new FormData();
						data.append('i', this.$i.token);
						data.append('force', 'true');
						data.append('file', blob);
						data.append('name', this.fileName);

						const xhr = new XMLHttpRequest();
						xhr.open('POST', apiUrl + '/drive/files/create', true);
						xhr.onload = (e: ProgressEvent) => {
							this.uploadingProgress = 100;
							setTimeout(() => this.uploadingProgress = null, 2000);
							res(JSON.parse(xhr.responseText));
						};

						xhr.upload.onprogress = e => {
							this.uploadingProgress = Math.floor(e.loaded / e.total * 100);
						};

						xhr.send(data);

						this.changed = false;
					});
				});
			});
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
		async post() {
			if (this.recentFile === null) {
				this.recentFile = await this.save();
			}
			os.post({
				initialNote: {
					text: '#GroundpolisPaint ',
					files: [ this.recentFile ],
					cw: null,
					visibility: 'public',
					localOnly: false,
					remoteFollowersOnly: false,
					renote: null,
					reply: null,
				}
			});
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
			if (this.currentTool === 'fill') {
				paintFill(x, y, this.ctx as CanvasRenderingContext2D);
				return;
			}

			this.downPointerPos = { x, y };
			this.onPointerMove(pointerX, pointerY, pressure);
		},
		onPointerUp(pointerX: number, pointerY: number, pressure = 0.5) {
			if (!this.ctx) return;
			if (!this.ctxPreview) return;
			if (!this.down) return;
			const c = this.ctx as CanvasRenderingContext2D;
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
			const c = this.ctx as CanvasRenderingContext2D;
			const cp = this.ctxPreview;
			// 色を当てる
			c.strokeStyle =	cp.strokeStyle = this.currentColorString;
			c.fillStyle = cp.fillStyle = this.currentColorString;
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
				switch (this.currentTool) {
					case 'pen':
					case 'eraser': {
						cp.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
						cp.lineCap = 'round';
						cp.lineJoin = 'round';
						cp.beginPath();
						cp.moveTo(x, y);
						cp.lineTo(x, y);
						cp.stroke();
						break;
					}
					case 'pixel': {
						cp.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
						drawPixelatedLine(x, x, y, y, cp);
						break;
					}
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
					break;
				}

				case 'pixel': {
					// https://ja.wikipedia.org/wiki/%E3%83%96%E3%83%AC%E3%82%BC%E3%83%B3%E3%83%8F%E3%83%A0%E3%81%AE%E3%82%A2%E3%83%AB%E3%82%B4%E3%83%AA%E3%82%BA%E3%83%A0#%E5%8D%98%E7%B4%94%E5%8C%96
					drawPixelatedLine(px, x, py, y, c);
					break;
				}

				case 'spoit': {
					const [r, g, b, a] = spoit(x, y, c);
					this.currentColor = [
						r, g, b, a / 255,
					];
					break;
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
		border-radius: 24px;

		&.color-picker {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			> .circle {
				width: 24px;
				height: 24px;
				outline: 1px solid var(--divider);
			}
		}

		&:hover {
			background: var(--buttonHoverBg);
		}

		&.post {
			background: var(--accent);
			color: white;
		}

		&.active {
			color: var(--accent);
		}
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
		> input[type="color"] {
			display: none;
		}
	}

	> .spacer {
		margin: 0 auto;
	}
}

.canvas-wrapper {
	background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAAAAABX3VL4AAAADklEQVR4AWPo2sywuQsAB3QCe21geuUAAAAASUVORK5CYII=');
	image-rendering: pixelated;
	background-size: 16px 16px;
	background-position: 0 0, 8px 8px, 8px 8px, 16px 16px;
	max-width: 100%;
	min-width: 100%;
	resize: vertical;
	height: 256px;
	box-shadow: 0 0 4px black inset;
	&.animation {
		animation: canvasWrapperAnimation 8s linear infinite;
	}

	position: relative;
	overflow: hidden;

	> canvas {
		position: absolute;
		transform-origin: 0 0;
		box-shadow: 0 0 16px var(--shadow);
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
		background-position: -256px -256px, -264px -264px, -264px -264px, -272px -272px;
	}
}
</style>
