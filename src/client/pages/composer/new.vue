<template>
	<div class="i8hvb3na">
		<header class="tools">
			<button class="_button" v-tooltip="$t('_composer.select')">
				<fa :icon="faMousePointer"></fa>
			</button>
			<button class="_button" v-tooltip="$t('_composer.pen')">
				<fa :icon="faPencilAlt"></fa>
			</button>
			<button class="_button" v-tooltip="$t('_composer.eraser')">
				<fa :icon="faEraser"></fa>
			</button>
			<button class="_button" v-tooltip="$t('_paint.undo')">
				<fa :icon="faUndo"></fa>
			</button>
			<button class="_button" v-tooltip="$t('_paint.redo')">
				<fa :icon="faRedo"></fa>
			</button>
		</header>
		<canvas ref="canvasPiano" class="piano">
			Your browser doesn't support this feature.
		</canvas>
		<canvas ref="canvasPianoRoll" class="piano">
			Your browser doesn't support this feature.
		</canvas>
	</div>
</template>

<script lang="ts">
import { faMusic, faSave, faPencilAlt, faEraser, faPaw, faMousePointer, faUndo, faRedo } from '@fortawesome/free-solid-svg-icons';
import { defineComponent, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
export default defineComponent({
	components: {
		
	},
	setup() {
		const i18n = useI18n();　
		const INFO = {
			title: i18n.t('createNew'),
			icon: faMusic,
			action: {
				icon: faSave,
				handler: () => {
					
				},
			},
		};

		const canvasPiano = ref(null as HTMLCanvasElement | null);
		const canvasRoll = ref(null as HTMLCanvasElement | null);

		const render = () => {
		
		};

		const mounted = onMounted(() => {
			render();
		});

		return {
			INFO,
			canvasPiano, canvasRoll,
			render,
			mounted,
			faPencilAlt, faEraser, faPaw, faMousePointer, faUndo, faRedo
		};
	},
})
</script>

<style lang="scss" scoped>
.i8hvb3na {
	position: relative;
	.tools {
		padding: 16px;
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		display: flex;
		align-items: center;
		flex-wrap: wrap;

		@media (max-width: 500px) {
			padding: 8px;
		}

		> ._button {
			display: inline-block;
			padding: 0;
			margin: 0;
			font-size: 16px;
			min-width: 48px;
			height: 24px;

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

		> .spacer {
			margin: 0 auto;
		}
	}
}
</style>
