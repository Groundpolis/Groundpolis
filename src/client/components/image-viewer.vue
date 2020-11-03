<template>
<MkModal ref="modal" @click="$refs.modal.close()" @closed="$emit('closed')">
	<div class="xubzgfga">
		<header>{{ image.name }}</header>
		<img :src="image.url" :alt="image.name" :title="image.name" @click="$refs.modal.close()"/>
		<footer>
			<span>{{ image.type }}</span>
			<span>{{ bytes(image.size) }}</span>
			<span v-if="image.properties && image.properties.width">{{ number(image.properties.width) }}px × {{ number(image.properties.height) }}px</span>
		</footer>
	</div>
</MkModal>
</template>

<script lang="ts">
// TODO: Groundpolis 拡張を再実装する
import { defineComponent } from 'vue';
import bytes from '@/filters/bytes';
import number from '@/filters/number';
import MkModal from '@/components/ui/modal.vue';

export default defineComponent({
	components: {
		MkModal,
	},

	props: {
		image: {
			type: Object,
			required: true
		},
		other: {
			type: Array,
			required: false
		},
	},

	data() {
		return {
			index: 0,
			faChevronLeft, faChevronRight,
		};
	},

	computed: {
		current() {
			if (!this.other) return this.image;
			return this.other[this.index];
		},
		hasPrev() {
			return this.other && this.index > 0;
		},
		hasNext() {
			return this.other && this.index < this.other.length - 1;
		},
	},

	emits: ['closed'],

	methods: {
		bytes,
		number,
	}
});
</script>

<style lang="scss" scoped>
.xubzgfga {
	max-width: 1024px;

	> header,
	> footer {
		display: inline-block;
		padding: 6px 9px;
		font-size: 90%;
		background: rgba(0, 0, 0, 0.5);
		border-radius: 6px;
		color: #fff;
	}

	> header {
		margin-bottom: 8px;
		opacity: 0.9;
	}

	> img {
		display: block;
		max-width: 100%;
		cursor: zoom-out;
		image-orientation: from-image;
	}

	> footer {
		margin-top: 8px;
		opacity: 0.8;

		> span + span {
			margin-left: 0.5em;
			padding-left: 0.5em;
			border-left: solid 1px rgba(255, 255, 255, 0.5);
		}
	}
}

.k9cj3n2a, .uvv3m2na {
	position: fixed;
	z-index: 5;
	background: none;
	border: none;
	color: var(--fg);
	font-size: 48px;
	width: 64px;
	height: 64px;
	margin: auto 0;
	top: 100%;
	bottom: 100%;
	cursor: pointer;
}

.k9cj3n2a {
	left: 0;
} 

.uvv3m2na {
	right: 0;
}
</style>
