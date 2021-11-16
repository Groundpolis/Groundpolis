<template>
<span class="eiwwqkts" :class="[$store.reactiveState.iconShape.value, { cat, animated } ]" :title="acct(user)" v-if="disableLink" v-user-preview="disablePreview ? undefined : user.id" @click="onClick">
	<img class="inner" :class="$store.reactiveState.iconShape.value" :src="url"/>
</span>
<MkA class="eiwwqkts" :class="[$store.reactiveState.iconShape.value, { cat, animated } ]" :to="userPage(user)" :title="acct(user)" :target="target" v-else v-user-preview="disablePreview ? undefined : user.id">
	<img class="inner" :class="$store.reactiveState.iconShape.value" :src="url"/>
</MkA>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { getStaticImageUrl } from '@/scripts/get-static-image-url';
import { extractAvgColorFromBlurhash } from '@/scripts/extract-avg-color-from-blurhash';
import { acct, userPage } from '@/filters/user';

export default defineComponent({
	props: {
		user: {
			type: Object,
			required: true
		},
		target: {
			required: false,
			default: null
		},
		disableLink: {
			type: Boolean,
			required: false,
			default: false
		},
		disablePreview: {
			type: Boolean,
			required: false,
			default: false
		}
	},
	emits: ['click'],
	computed: {
		cat(): boolean {
			return this.user.isCat;
		},
		url(): string {
			return this.$store.state.disableShowingAnimatedImages
				? getStaticImageUrl(this.user.avatarUrl)
				: this.user.avatarUrl;
		},
		animated(): boolean {
			return this.$store.reactiveState.animation.value;
		},
	},
	watch: {
		'user.avatarBlurhash'() {
			if (this.$el == null) return;
			this.$el.style.color = extractAvgColorFromBlurhash(this.user.avatarBlurhash);
		}
	},
	mounted() {
		this.$el.style.color = extractAvgColorFromBlurhash(this.user.avatarBlurhash);
	},
	methods: {
		onClick(e) {
			this.$emit('click', e);
		},
		acct,
		userPage
	}
});
</script>

<style lang="scss" scoped>
@keyframes earwiggleleft {
	from { transform: rotate(37.6deg) skew(30deg); }
	25% { transform: rotate(10deg) skew(30deg); }
	50% { transform: rotate(20deg) skew(30deg); }
	75% { transform: rotate(0deg) skew(30deg); }
	to { transform: rotate(37.6deg) skew(30deg); }
}
@keyframes earwiggleright {
	from { transform: rotate(-37.6deg) skew(-30deg); }
	30% { transform: rotate(-10deg) skew(-30deg); }
	55% { transform: rotate(-20deg) skew(-30deg); }
	75% { transform: rotate(0deg) skew(-30deg); }
	to { transform: rotate(-37.6deg) skew(-30deg); }
}

.eiwwqkts {
	position: relative;
	display: inline-block;
	vertical-align: bottom;
	flex-shrink: 0;
	line-height: 16px;
	transition: border-radius 0.2s ease;

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

		&.animated:hover {
			&:before {
				animation: earwiggleleft 1s infinite;
			}
			&:after {
				animation: earwiggleright 1s infinite;
			}
		}
	}

	.inner {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		top: 0;
		z-index: 1;
		overflow: hidden;
		object-fit: cover;
		width: 100%;
		height: 100%;
		transition: border-radius 0.8s ease-out;
	}
}

.circle {
	border-radius: 50%;
}

.square {
	border-radius: 0;
}

.rounded {
	border-radius: 12%;
}

.droplet {
	border-radius: 50% 50% 0 50%;
}
</style>
