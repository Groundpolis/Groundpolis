<template>
<a class="mk-media-image"
	:href="image.url"
	@mousemove="onMousemove"
	@mouseleave="onMouseleave"
	@click.prevent="onClick"
	:style="style"
	:title="image.name"
></a>
</template>

<script lang="ts">
import Vue from 'vue';
import MkMediaImageDialog from './media-image-dialog.vue';

export default Vue.extend({
	props: {
		image: {
			type: Object,
			required: true
		},
		raw: {
			default: false
		}
	},
	computed: {
		style(): any {
			return {
				'background-color': this.image.properties.avgColor && this.image.properties.avgColor.length == 3 ? `rgb(${this.image.properties.avgColor.join(',')}, 0.3)` : 'transparent',
				'background-image': this.raw ? `url(${this.image.url})` : `url(${this.image.url}?thumbnail&size=512)`
			};
		}
	},
	methods: {
		onMousemove() {
		},

		onMouseleave() {
		},

		onClick() {
			(this as any).os.new(MkMediaImageDialog, {
				image: this.image
			});
		}
	}
});
</script>

<style lang="stylus" scoped>
.mk-media-image
	display block
	cursor zoom-in
	overflow hidden
	width 100%
	height 100%
	background-position center
	background-size contain
	background-repeat no-repeat
	border-radius 4px

</style>
