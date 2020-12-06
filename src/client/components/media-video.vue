<template>
<div class="media-video-mask" v-if="hide" @click="hide = false" @contextmenu.stop>
	<div>
		<b><Fa :icon="faExclamationTriangle"/> {{ $t('sensitive') }}</b>
		<span>{{ $t('clickToShow') }}</span>
	</div>
</div>
<div class="media-video" v-else @contextmenu.stop>
	<i><Fa :icon="faEyeSlash" @click="hide = true"/></i>
	<a
		v-if="isPreview"
		class="preview"
		:style="imageStyle"
		:title="video.name"
		@click="isPreview = false"
	>
		<Fa :icon="faPlayCircle"/>
	</a>
	<video class="player" v-else :src="video.url" controls autoplay>
		Your browser is not supported.
	</video>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { faPlayCircle } from '@fortawesome/free-regular-svg-icons';
import { faExclamationTriangle, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import * as os from '@/os';

export default defineComponent({
	props: {
		video: {
			type: Object,
			required: true
		}
	},
	data() {
		return {
			hide: true,
			isPreview: true,
			faPlayCircle, faExclamationTriangle, faEyeSlash
		};
	},
	computed: {
		imageStyle(): any {
			return {
				'background-image': `url(${this.video.thumbnailUrl})`
			};
		},
		playerOptions(): any {
			return {
				sources: [{
					type: this.video.type,
					src: this.video.url,
				}],
				playbackRates: [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0],
				fill: true,
				notSupportedMessage: this.$t('thisVideoCannotBePlayed'),
			}
		}
	},
	watch: {
	},
	created() {
		this.hide = (this.$store.state.device.nsfw === 'force') ? true : this.video.isSensitive && (this.$store.state.device.nsfw !== 'ignore');
	},
});
</script>

<style lang="scss" scoped>
.media-video {
	position: relative;
	width: 100%;
	height: 100%;

	> i {
		display: block;
		position: absolute;
		border-radius: 6px;
		background-color: var(--fg);
		color: var(--accentLighten);
		font-size: 14px;
		opacity: 0.8;
		padding: 3px 6px;
		text-align: center;
		cursor: pointer;
		z-index: 100;
		top: 12px;
		right: 12px;
	}

	> .preview {
		display: flex;
		justify-content: center;
		align-items: center;

		font-size: 3.5em;
		overflow: hidden;
		background-position: center;
		background-size: cover;
		width: 100%;
		height: 100%;

		> [data-icon] {
			border-radius: 50%;
			background: var(--panel);
			color: var(--fg);
			opacity: 1;
		}
	}

	> .player {
		width: 100%;
		height: 100%;
		background: #000;
	}
}

.media-video-mask {
	display: flex;
	justify-content: center;
	align-items: center;
	background: #111;
	color: #fff;

	> div {
		display: table-cell;
		text-align: center;
		font-size: 12px;

		> b {
			display: block;
		}
	}
}

.mnhepr3u8r3u9crjciandiivrrnvivjg {
	width: 100%;
	height: 100%;
}
</style>
