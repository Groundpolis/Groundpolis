<template>
<MkModal ref="modal" @click="$refs.modal.close()" @closed="$emit('closed')">
	<div class="xubzgfga">
		<header v-if="hasPrev || hasNext">
			<button class="_button command" @click="index--" :disabled="!hasPrev">
				<Fa :icon="faChevronLeft" />
			</button>
			{{ index + 1 }} / {{ other.length }}
			<button class="_button command" @click="index++" :disabled="!hasNext">
				<Fa :icon="faChevronRight" />
			</button>
		</header>
		<img :src="current.url" :alt="current.name" :title="current.name" @click="$refs.modal.close()"/>
		<footer v-if="current.name || current.type || current.size || current.properties">
			<span v-if="current.name">{{ current.name }}</span>
			<span v-if="current.type">{{ current.type }}</span>
			<span v-if="current.size">{{ bytes(current.size) }}</span>
			<span v-if="current.properties && current.properties.width">{{ number(current.properties.width) }}px × {{ number(current.properties.height) }}px</span>
		</footer>
	</div>
</MkModal>
</template>

<script lang="ts">
// TODO: Groundpolis 拡張を再実装する
import { defineComponent } from 'vue';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
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

	emits: ['closed'],

	data() {
		return {
			index: this.other ? this.other.indexOf(this.image) : 0,
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

	methods: {
		bytes,
		number,
	}
});
</script>

<style lang="scss" scoped>
.xubzgfga {
	display: flex;
	flex-direction: column;
	height: 100%;

	> header,
	> footer {
		align-self: center;
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
		font-size: 24px;
		> .command {
			color: #fff;
			width: 32px;
		}
	}

	> img {
		display: block;
		flex: 1;
		min-height: 0;
		object-fit: contain;
		width: 100%;
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
</style>
