<template>
<div class="icozogqfvdetwohsdglrbswgrejoxbdj" v-if="hide" @click="hide = false">
	<div>
		<b><fa :icon="faExclamationTriangle"/> {{ $t('sensitive') }}</b>
		<span>{{ $t('clickToShow') }}</span>
	</div>
</div>
<div class="kkjnbbplepmiyuadieoenjgutgcmtsvu" v-else>
	<i><fa :icon="faEyeSlash" @click="hide = isPreview = true"/></i>
	<div class="preview" v-if="isPreview" @click="isPreview = false;" :style="imageStyle">
		<fa :icon="faPlayCircle" />
	</div>
	<video-player class="mnhepr3u8r3u9crjciandiivrrnvivjg" ref="videoPlayer" :options="playerOptions"/>
	<!-- <video :src="video.url" class="player" /> -->
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { faPlayCircle } from '@fortawesome/free-regular-svg-icons';
import { faExclamationTriangle, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

export default Vue.extend({
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
		isPreview() {
			if (!this.isPreview) {
				(this.$refs.videoPlayer as any).player.play();
			}
		},
	},
	created() {
		this.hide = this.video.isSensitive && !this.$store.state.device.alwaysShowNsfw;
	},
});
</script>

<style lang="scss" scoped>
.kkjnbbplepmiyuadieoenjgutgcmtsvu {
	position: relative;

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
	}

	> .player {
		width: 100%;
	}
}

.icozogqfvdetwohsdglrbswgrejoxbdj {
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
