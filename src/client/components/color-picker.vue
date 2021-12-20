<template>
<MkModal ref="modal" :src="src" @click="$refs.modal.close()" @closed="$emit('closed')" transparent>
	<div class="col39a0m _popup">
		<!-- <MkTab v-model:value="mode">
			<option value="rgba">RGBA</option>
			<option value="hsva">HSVA</option>
		</MkTab> -->
		<section>
			<template v-if="mode === 'rgba'">
				<MkRange v-model:value="r" :min="0" :max="255" :step="1">
					<template #label><span>R</span></template>
				</MkRange>
				<MkRange v-model:value="g" :min="0" :max="255" :step="1">
					<template #label><span>G</span></template>
				</MkRange>
				<MkRange v-model:value="b" :min="0" :max="255" :step="1">
					<template #label><span>B</span></template>
				</MkRange>
				<MkRange v-model:value="a" :min="0" :max="1" :step="0.01">
					<template #label><span>A</span></template>
				</MkRange>
				<div class="preview" :style="{backgroundColor: toHtmlColor(color)}" />
			</template>
		</section>
		<section>
			<h1 v-text="$ts.preset"/>
			<div class="items">
				<div class="item" @click="add"><Fa :icon="faPlus" /></div>
				<div class="item" :class="{active: isDeleteMode}" @click="del"><Fa :icon="faMinus" /></div>
				<div class="item danger" @click="reset"><Fa :icon="faRedo" /></div>
			</div>
			<div class="items">
				<div class="item" :style="{backgroundColor: toHtmlColor(p), animationDelay: `${i * 2}ms`}" :class="{shake: isDeleteMode}" v-for="(p, i) in preset" :key="i" @mousedown="clickPreset(i)" />
			</div>
		</section>
	</div>
</MkModal>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, ref, watch, watchEffect } from 'vue';
import { faPlus, faMinus, faRedo, } from '@fortawesome/free-solid-svg-icons';
import MkModal from '@/components/ui/modal.vue';
import MkRange from '@/components/ui/range.vue';
import MkTab from '@/components/tab.vue';
import { Rgba, toHtmlColor } from '@/scripts/rgba';
import { defaultStore } from '@/store';
import { i18n } from '@/i18n';
import { dialog } from '@/os';

type Mode = 'rgba' | 'hsva';

export default defineComponent({
	components: {
		MkModal,
		MkRange,
		MkTab,
	},
	props: {
		src: {
			required: false
		},
		color: {
			required: false,
			default: [0, 0, 0, 255],
			type: Object as PropType<Rgba>,
		},
	},
	emits: ['closed', 'changed'],
	setup(props, ctx) {
		const mode = ref<Mode>('rgba');
		const isDeleteMode = ref(false);
		const color = reactive<Rgba>([...props.color]);
		const preset = reactive(defaultStore.state.colorPickerPresets.map(p => [...p] as Rgba));
		const r = ref<string>(color[0].toString());
		const g = ref<string>(color[1].toString());
		const b = ref<string>(color[2].toString());
		const a = ref<string>(color[3].toString());

		const setColor = (c: Rgba, sync = true) => {
			color[0] = c[0];
			color[1] = c[1];
			color[2] = c[2];
			color[3] = c[3];
			if (sync) {
				r.value = color[0].toString();
				g.value = color[1].toString();
				b.value = color[2].toString();
				a.value = color[3].toString();
			}
		};

		const add = () => {
			preset.push([...color]);
		};

		const del = () => {
			isDeleteMode.value = !isDeleteMode.value;
		};

		const reset = async () => {
			const { canceled } = await dialog({
				type: 'warning',
				text: i18n.locale.resetAreYouSure,
				showCancelButton: true
			});
			if (canceled) return;
			defaultStore.reset('colorPickerPresets');
			// preset をクリア
			preset.splice(0, preset.length);
			preset.push(...defaultStore.state.colorPickerPresets.map(p => [...p] as Rgba));
		};

		const clickPreset = (i) => {
			if (isDeleteMode.value) {
				preset.splice(i, 1);
			} else {
				setColor(preset[i]);
			}
		};

		watch(color, () => {
			ctx.emit('changed', color);
		});

		watch(preset, () => {
			defaultStore.set('colorPickerPresets', preset.map(p => [...p] as Rgba));
		});

		watchEffect(() => {
			setColor([
				parseInt(r.value),
				parseInt(g.value),
				parseInt(b.value),
				parseFloat(a.value),
			], false);
		});

		return {
			r, g, b, a,
			mode, color, preset, isDeleteMode,
			toHtmlColor, setColor, clickPreset,
			add, del, reset,
			faPlus, faMinus, faRedo,
		};
	},
});
</script>

<style lang="scss" scoped>
.col39a0m {
	width: 272px;
	padding: 8px 0;
	> section {
		padding: 8px;
		+ section {
			border-top: 1px solid var(--divider);
		}
		> h1 {
			margin: 0;
			padding: 0;
			font-size: 1rem;
		}
		> .preview {
			width: 100%;
			height: 16px;
		}
		> .items {
			display: flex;
			flex-wrap: wrap;
			> .item {
				display: flex;
				align-items: center;
				justify-content: center;
				background: var(--panel);
				width: 24px;
				height: 24px;
				margin: 4px;
				border-radius: 100%;
				&.active {
					color: var(--accent);
				}
				&.danger {
					color: var(--error);
				}
				&.shake {
					animation: shake 1s ease infinite;
				}
				cursor: pointer;

				&:hover {
					filter: brightness(150%);
				}
			}
		}
	}
}
@keyframes shake {
	0% { transform: translate(-3px, -1px) rotate(-8deg) }
	5% { transform: translate(0px, -1px) rotate(-10deg) }
	10% { transform: translate(1px, -3px) rotate(0deg) }
	15% { transform: translate(1px, 1px) rotate(11deg) }
	20% { transform: translate(-2px, 1px) rotate(1deg) }
	25% { transform: translate(-1px, -2px) rotate(-2deg) }
	30% { transform: translate(-1px, 2px) rotate(-3deg) }
	35% { transform: translate(2px, 1px) rotate(6deg) }
	40% { transform: translate(-2px, -3px) rotate(-9deg) }
	45% { transform: translate(0px, -1px) rotate(-12deg) }
	50% { transform: translate(1px, 2px) rotate(10deg) }
	55% { transform: translate(0px, -3px) rotate(8deg) }
	60% { transform: translate(1px, -1px) rotate(8deg) }
	65% { transform: translate(0px, -1px) rotate(-7deg) }
	70% { transform: translate(-1px, -3px) rotate(6deg) }
	75% { transform: translate(0px, -2px) rotate(4deg) }
	80% { transform: translate(-2px, -1px) rotate(3deg) }
	85% { transform: translate(1px, -3px) rotate(-10deg) }
	90% { transform: translate(1px, 0px) rotate(3deg) }
	95% { transform: translate(-2px, 0px) rotate(-3deg) }
	100% { transform: translate(2px, 1px) rotate(2deg) }
}
</style>
