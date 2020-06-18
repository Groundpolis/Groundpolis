<template>
<div class="mk-home" v-hotkey.global="keymap">
	<portal to="header" v-if="showTitle">
		<div class="_kjvfvyph_">
			<fa v-if="src === 'myself'" :icon="faUser"/>
			<fa v-if="src === 'everyone'" :icon="faUsers"/>
			<fa v-if="src === 'reacted'" :icon="faStar"/>
			<span style="margin-left: 8px;">{{ $t('_timelines.' + src) }}</span>
		</div>
	</portal>

	<div class="new" v-if="queue > 0" :style="{ width: width + 'px' }"><button class="_buttonPrimary" @click="top()">{{ $t('newNoteRecived') }}</button></div>

	<template v-if="$store.getters.isSignedIn">
		<x-tutorial class="tutorial" v-if="$store.state.settings.tutorial != -1"/>
		<x-post-form class="post-form _panel" fixed/>
	</template>
	<x-timeline ref="tl" :key="src" :src="src" :sound="true" @before="before()" @after="after()" @queue="queueUpdated"/>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { faAngleDown, faAngleUp, faUser, faUsers, faStar } from '@fortawesome/free-solid-svg-icons';
import Progress from '../scripts/loading';
import XTimeline from '../components/timeline.vue';
import XPostForm from '../components/post-form.vue';

export default Vue.extend({
	metaInfo() {
		return {
			title: this.$t('timeline') as string
		};
	},

	components: {
		XTimeline,
		XTutorial: () => import('./index.home.tutorial.vue').then(m => m.default),
		XPostForm,
	},

	props: {
		showTitle: {
			type: Boolean,
			required: true
		},
		src: {
			type: String,
			required: true
		}
	},

	data() {
		return {
			showNav: false,
			menuOpened: false,
			queue: 0,
			width: 0,
			faAngleDown, faAngleUp, faUser, faUsers, faStar
		};
	},

	computed: {
		keymap(): any {
			return {
				't': this.focus
			};
		},

		meta() {
			return this.$store.state.instance.meta;
		},
	},

	mounted() {
		this.width = this.$el.offsetWidth;
	},

	methods: {
		before() {
			Progress.start();
		},

		after() {
			Progress.done();
		},

		queueUpdated(q) {
			if (this.$el.offsetWidth !== 0) this.width = this.$el.offsetWidth;
			this.queue = q;
		},

		top() {
			window.scroll({ top: 0, behavior: 'instant' });
		},

		focus() {
			(this.$refs.tl as any).focus();
		}
	}
});
</script>

<style lang="scss" scoped>
.mk-home {
	> .new {
		position: fixed;
		z-index: 1000;

		> button {
			display: block;
			margin: 0 auto;
			padding: 8px 16px;
			border-radius: 32px;
		}
	}

	> .tutorial {
		margin-bottom: var(--margin);
	}

	> .post-form {
		position: relative;
		margin-bottom: var(--margin);
	}
}

._kjvfvyph_ {
	position: relative;
	height: 100%;
	padding: 0 16px;
	font-weight: bold;

	> i {
		position: absolute;
		top: 16px;
		right: 8px;
		color: var(--indicator);
		font-size: 12px;
		animation: blink 1s infinite;
	}
}
</style>
