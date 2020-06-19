<template>
	<span class="eiwwqkts" :class="{ cat }" :title="user | acct" @click="onClick">
		<span class="inner" :style="icon"></span>
	</span>
</template>

<script lang="ts">
import Vue from 'vue';
import { getStaticImageUrl } from '../scripts/get-static-image-url';

export default Vue.extend({
	props: {
		user: {
			type: Object,
			required: true
		},
		target: {
			required: false,
			default: null
		},
	},
	computed: {
		cat(): boolean {
			return this.user.isCat;
		},
		url(): string {
			return this.$store.state.device.disableShowingAnimatedImages
				? getStaticImageUrl(this.user.avatarUrl)
				: this.user.avatarUrl;
		},
		icon(): any {
			return {
				backgroundColor: this.user.avatarColor,
				backgroundImage: `url(${this.url})`,
			};
		}
	},
	watch: {
		'user.avatarColor'() {
			this.$el.style.color = this.user.avatarColor;
		}
	},
	mounted() {
		if (this.user.avatarColor) {
			this.$el.style.color = this.user.avatarColor;
		}
	},
	methods: {
		onClick(e) {
			this.$emit('click', e);
		}
	}
});
</script>

<style lang="scss" scoped>
.eiwwqkts {
	position: relative;
	display: inline-block;
	vertical-align: bottom;
	flex-shrink: 0;
	border-radius: 100%;
	line-height: 16px;

	&.cat {
		&:before, &:after {
			background: #df548f;
			border: solid 4px currentColor;
			box-sizing: border-box;
			content: '';
			display: inline-block;
			height: 50%;
			width: 50%;
		}

		&:before {
			border-radius: 0 75% 75%;
			transform: rotate(37.5deg) skew(30deg);
		}

		&:after {
			border-radius: 75% 0 75% 75%;
			transform: rotate(-37.5deg) skew(-30deg);
		}
	}
	
	.inner {
		background-position: center center;
		background-size: cover;
		bottom: 0;
		left: 0;
		position: absolute;
		right: 0;
		top: 0;
		border-radius: 100%;
		z-index: 1;
	}
}
</style>
