<template>
<div class="mk-home" v-hotkey.global="keymap">
	<portal to="header" v-if="showTitle">
		<div class="_kjvfvyph_">
			<fa v-if="src === 'myself'" :icon="faUser"/>
			<fa v-if="src === 'everyone'" :icon="faUsers"/>
			<span style="margin-left: 8px;">{{ $t('_timelines.' + src) }}</span>
		</div>
	</portal>

	<div class="new" v-if="queue > 0" :style="{ width: width + 'px' }"><button class="_buttonPrimary" @click="top()">{{ $t('newNoteRecived') }}</button></div>

	<template v-if="$store.getters.isSignedIn">
		<x-tutorial class="tutorial" v-if="$store.state.settings.tutorial != -1"/>
		<button class="post-form-toggle _buttonPrimary" :style="toggleStyle" @click="formAppear = !formAppear">
			<fa :icon="formAppear ? faAngleUp : faPencilAlt" />
		</button>
		<x-post-form class="post-form _panel" ref="form" :style="formStyle" fixed/>
	</template>
	<x-timeline ref="tl" class="tl" :key="src" :src="src" :sound="true" @before="before()" @after="after()" @queue="queueUpdated"/>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { faAngleUp, faUser, faUsers, faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import Progress from '../scripts/loading';
import XTimeline from '../components/timeline.vue';
import XPostForm from '../components/post-form.vue';

let observer: any;

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
			queue: 0,
			width: 0,
			formStyle: {},
			toggleStyle: {},
			formAppear: this.$store.state.device.postFormToggle,

			faAngleUp, faUser, faUsers, faPencilAlt
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

	watch: {
		formAppear() {
			this.updateFormState();
			this.$store.commit('device/set', { key: 'postFormToggle', value: this.formAppear });
		}
	},

	mounted() {
		this.width = this.$el.offsetWidth;
		const form = (this.$refs.form as Vue).$el as HTMLElement;

		observer = new ResizeObserver(() => this.updateFormState());
		observer.observe(form);

		this.updateFormState();

		window.addEventListener('resize', this.onResize, { passive: true });
		this.onResize();
	},

	beforeDestroy() {
		observer.disconnect();
		window.removeEventListener('resize', this.onResize);
	},

	methods: {
		before() {
			Progress.start();
		},

		after() {
			Progress.done();
		},

		onResize() {
			this.isMobile = window.innerWidth < 650;
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
		},

		updateFormState() {
			this.isMobile = window.innerWidth < 650;

			if (!this.isMobile) {
				console.log('is not mobile');
				this.formStyle = { transform: undefined };
				return;
			}
			const form = (this.$refs.form as Vue).$el;
			const height = form.getBoundingClientRect().height;
			this.formStyle = {
				transform: `translateY(${this.formAppear ? 0 : height}px)`,
			};
			this.toggleStyle = {
				transform: `rotate(${this.formAppear ? 180 : 0}deg)`,
				bottom: `${this.formAppear ? height + 8 : 8}px`,
			};
		},
	}
});
</script>

<style lang="scss" scoped>
$nav-hide-threshold: 650px;

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

	> .post-form-toggle {
		display: none;
		// transition: bottom 0.5s ease, transform 0.5s ease;
		@media screen and (max-width: $nav-hide-threshold) {
			display: block;
			position: fixed;
			z-index: 100;
			right: 8px;
			width: 48px;
			height: 48px;
			border-radius: 50%;
		}
	}

	> .post-form {
		position: relative;
		margin-bottom: var(--margin);
		// transition: transform 0.5s ease;

		@media screen and (max-width: $nav-hide-threshold) {
			position: fixed;
			bottom: 0;
			left: 0;
			right: 0;
			z-index: 100;
			margin-bottom: 0;
			box-shadow: 0 0 16px rgba(0, 0, 0, 0.5);
		}
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
