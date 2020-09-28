<template>
<x-modal ref="modal" @closed="() => { $emit('closed'); destroyDom(); }">
	<div class="vh83b2a9" @click="close">
		<button class="k9cj3n2a" v-if="hasPrev" @click.stop="index--">
			<fa :icon="faChevronLeft"/>
		</button>
		<img class="xubzgfga" ref="img" :src="current.url" :alt="current.name" :title="current.name" tabindex="-1"/>
		<button class="uvv3m2na" v-if="hasNext" @click.stop="index++">
			<fa :icon="faChevronRight"/>
		</button>
	</div>
</x-modal>
</template>

<script lang="ts">
import Vue from 'vue';
import { faChevronLeft, faChevronRight, } from '@fortawesome/free-solid-svg-icons';

import XModal from './modal.vue';

export default Vue.extend({
	components: {
		XModal,
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
			return this.index > 0;
		},
		hasNext() {
			return this.index < this.other.length - 1;
		},
	},

	mounted() {
		if (this.other) {
			this.index = this.other.findIndex(img => img.id === this.image.id)
		}
		this.$nextTick(() => {
			this.$refs.img.focus();
		});
	},

	methods: {
		close() {
			this.$refs.modal.close();
		},
	}
});
</script>

<style lang="scss" scoped>
.vh83b2a9 {
	position: fixed;
	z-index: 2;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	max-width: 100%;
	max-height: 100%;
	margin: auto;
	cursor: zoom-out;
}
.xubzgfga {
	position: fixed;
	z-index: 2;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	max-width: calc(100% - 128px);
	max-height: 100%;
	margin: auto;
	image-orientation: from-image;
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
