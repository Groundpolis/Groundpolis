<template>
<div class="mk-app" v-hotkey.global="keymap">
	<header class="header">
		<div class="title" ref="title">
			<transition :name="$store.state.device.animation ? 'header' : ''" mode="out-in" appear>
				<button class="_button back" v-if="canBack" @click="back()"><fa :icon="faArrowLeft"/></button>
				<button class="_button back" v-else-if="isMobile" @click="showNav = true">
					<fa :icon="faBars"/>
					<i v-if="$store.getters.isSignedIn && $store.state.i.hasUnreadAnnouncement">
						<fa :icon="faCircle"/>
					</i>
				</button>
			</transition>
			<transition :name="$store.state.device.animation ? 'header' : ''" mode="out-in" appear>
				<div class="body" :key="pageKey">
					<div class="default">
						<h1 class="title"><portal-target name="icon" slim/><portal-target name="title" slim/></h1>
					</div>
					<div class="custom">
						<portal-target name="header" slim/>
					</div>
				</div>
			</transition>
		</div>
		<div class="sub">
			<button v-if="widgetsEditMode" class="_button edit active" @click="widgetsEditMode = false"><fa :icon="faGripVertical"/></button>
			<button v-else class="_button edit" @click="widgetsEditMode = true"><fa :icon="faGripVertical"/></button>
			<x-clock v-if="isDesktop" class="clock"/>
		</div>
	</header>

	<transition name="nav-back">
		<div class="nav-back"
			v-if="showNav"
			@click="showNav = false"
			@touchstart="showNav = false"
		></div>
	</transition>

	<transition name="nav">
		<nav class="nav" ref="nav" v-show="showNav">
			<div>
				<router-link class="item" active-class="active" to="/" exact>
					<fa :icon="$store.getters.isSignedIn ? faUser : faHome" fixed-width/><span class="text">{{ $store.getters.isSignedIn ? $t('_timelines.myself') : $t('home') }}</span>
				</router-link>
				<template v-if="$store.getters.isSignedIn">
					<router-link class="item" active-class="active" to="/everyone" exact>
						<fa :icon="faUsers" fixed-width/><span class="text">{{ $t('_timelines.everyone') }}</span>
					</router-link>
					<router-link class="item" active-class="active" to="/my/drive">
						<fa :icon="faCloud" fixed-width/><span class="text">{{ $t('drive') }}</span>
					</router-link>
				</template>
				<router-link class="item" active-class="active" to="/announcements">
					<fa :icon="faBroadcastTower" fixed-width/><span class="text">{{ $t('announcements') }}</span>
					<i v-if="$store.getters.isSignedIn && $store.state.i.hasUnreadAnnouncement"><fa :icon="faCircle"/></i>
				</router-link>
				<button class="item _button" :class="{ active: $route.path === '/instance' || $route.path.startsWith('/instance/') }" v-if="$store.getters.isSignedIn && ($store.state.i.isAdmin || $store.state.i.isModerator)" @click="oepnInstanceMenu">
					<fa :icon="faServer" fixed-width/><span class="text">{{ $t('instance') }}</span>
				</button>
				<router-link class="item" active-class="active" to="/docs">
					<fa :icon="faQuestionCircle" fixed-width/><span class="text">{{ $t('help') }}</span>
				</router-link>
				<button class="item _button" @click="more">
					<fa :icon="faEllipsisH" fixed-width/><span class="text">{{ $t('more') }}</span>
					<i v-if="otherNavItemIndicated"><fa :icon="faCircle"/></i>
				</button>
				<div class="divider"></div>
				<router-link class="item" active-class="active" to="/my/settings">
					<fa :icon="faCog" fixed-width/><span class="text">{{ $t('settings') }}</span>
				</router-link>
				<router-link class="item" active-class="active" to="/preferences">
					<fa :icon="faSlidersH" fixed-width/><span class="text">{{ $t('customize') }}</span>
				</router-link>
			</div>
		</nav>
	</transition>

	<div class="contents" ref="contents" :class="{ wallpaper }">
		<main ref="main">
			<div class="content">
				<transition :name="$store.state.device.animation ? 'page' : ''" mode="out-in" @enter="onTransition">
					<keep-alive :include="['index']">
						<router-view></router-view>
					</keep-alive>
				</transition>
			</div>
			<div class="powerd-by" :class="{ visible: !$store.getters.isSignedIn }">
				<b><router-link to="/">{{ host }}</router-link></b>
				<small>
					<a href="https://github.com/xeltica/hitorisskey" class="_link" target="_blank">Powered by Hitorisskey</a>
				</small>
			</div>
		</main>

		<div class="widgets">
			<div ref="widgets" :class="{ edit: widgetsEditMode }">
				<template v-if="isDesktop && $store.getters.isSignedIn">
					<template v-if="widgetsEditMode">
						<mk-button primary @click="addWidget" class="add"><fa :icon="faPlus"/></mk-button>
						<x-draggable
							:list="widgets"
							handle=".handle"
							animation="150"
							class="sortable"
							@sort="onWidgetSort"
						>
							<div v-for="widget in widgets" class="customize-container _panel" :key="widget.id">
								<header>
									<span class="handle"><fa :icon="faBars"/></span>{{ $t('_widgets.' + widget.name) }}<button class="remove _button" @click="removeWidget(widget)"><fa :icon="faTimes"/></button>
								</header>
								<div @click="widgetFunc(widget.id)">
									<component :is="`mkw-${widget.name}`" :widget="widget" :ref="widget.id" :is-customize-mode="true"/>
								</div>
							</div>
						</x-draggable>
					</template>
					<template v-else>
						<component class="widget" v-for="widget in widgets" :is="`mkw-${widget.name}`" :key="widget.id" :ref="widget.id" :widget="widget"/>
					</template>
				</template>
			</div>
		</div>
	</div>

	<stream-indicator v-if="$store.getters.isSignedIn"/>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { faArrowLeft, faGripVertical, faSlidersH, faHashtag, faBroadcastTower, faEllipsisH, faBars, faTimes, faCog, faUser, faHome, faCircle, faPlus, faUsers, faTachometerAlt, faExchangeAlt, faCloud, faServer, faInfoCircle, faQuestionCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { faLaugh, faComments } from '@fortawesome/free-regular-svg-icons';
import { ResizeObserver } from '@juggle/resize-observer';
import { v4 as uuid } from 'uuid';
import { host, instanceName } from './config';

const DESKTOP_THRESHOLD = 1100;

export default Vue.extend({
	components: {
		XClock: () => import('./components/header-clock.vue').then(m => m.default),
		MkButton: () => import('./components/ui/button.vue').then(m => m.default),
		XDraggable: () => import('vuedraggable'),
	},

	data() {
		return {
			host,
			pageKey: 0,
			showNav: false,
			searching: false,
			accounts: [],
			lists: [],
			connection: null,
			searchQuery: '',
			searchWait: false,
			widgetsEditMode: false,
			isDesktop: window.innerWidth >= DESKTOP_THRESHOLD,
			isMobile:  window.innerWidth < 650,
			canBack: false,
			wallpaper: localStorage.getItem('wallpaper') != null,
			faArrowLeft, faGripVertical, faSlidersH, faComments, faHashtag, faBroadcastTower, faEllipsisH, faBars, faTimes, faCog, faUser, faHome, faCircle, faPlus, faLaugh, faUsers, faTachometerAlt, faExchangeAlt, faCloud, faServer, faQuestionCircle
		};
	},

	computed: {
		keymap(): any {
			return {
				'h|/': this.help
			};
		},

		widgets(): any[] {
			return this.$store.state.deviceUser.widgets;
		},

		otherNavItemIndicated(): boolean {
			if (!this.$store.getters.isSignedIn) return false;
			return false;
		},
	},

	watch:{
		$route(to, from) {
			this.pageKey++;
			this.showNav = false;
			this.canBack = (window.history.length > 0 && !['index', 'everyone'].includes(to.name));
		},

		isDesktop() {
			if (this.isDesktop) this.adjustWidgetsWidth();
		}
	},

	created() {
		if (this.$store.getters.isSignedIn) {
			if (this.widgets.length === 0) {
				this.$store.commit('deviceUser/setWidgets', [{
					name: 'calendar',
					id: 'a', data: {}
				}]);
			}
		}
	},

	mounted() {
		if (this.isDesktop) this.adjustWidgetsWidth();

		const adjustTitlePosition = () => {
			const left = this.$refs.main.getBoundingClientRect().left - this.$refs.nav.offsetWidth;
			if (left >= 0) {
				this.$refs.title.style.left = left + 'px';
			}
		};

		adjustTitlePosition();

		const ro = new ResizeObserver((entries, observer) => {
			adjustTitlePosition();
		});

		ro.observe(this.$refs.contents);

		window.addEventListener('resize', () => {
			this.isDesktop = window.innerWidth >= DESKTOP_THRESHOLD;
			adjustTitlePosition();
			this.isMobile = window.innerWidth < 650;
		}, { passive: true });
	},

	methods: {
		adjustWidgetsWidth() {
			// https://stackoverflow.com/questions/33891709/when-flexbox-items-wrap-in-column-mode-container-does-not-grow-its-width
			const adjust = () => {
				const lastChild = this.$refs.widgets.children[this.$refs.widgets.children.length - 1];
				if (lastChild == null) return;

				const width = lastChild.offsetLeft + 300 + 16;
				this.$refs.widgets.style.width = width + 'px';
			};
			setInterval(adjust, 1000);
			setTimeout(adjust, 100);
		},

		top() {
			window.scroll({ top: 0, behavior: 'smooth' });
		},

		help() {
			this.$router.push('/docs');
		},

		back() {
			if (this.canBack) window.history.back();
		},

		onTransition() {
			if (window._scroll) window._scroll();
		},

		post() {
			this.$root.post();
		},

		oepnInstanceMenu(ev) {
			this.$root.menu({
				items: [{
					type: 'link',
					text: this.$t('dashboard'),
					to: '/instance',
					icon: faTachometerAlt,
				}, null, {
					type: 'link',
					text: this.$t('settings'),
					to: '/instance/settings',
					icon: faCog,
				}, {
					type: 'link',
					text: this.$t('customEmojis'),
					to: '/instance/emojis',
					icon: faLaugh,
				}, {
					type: 'link',
					text: this.$t('users'),
					to: '/instance/users',
					icon: faUsers,
				}, {
					type: 'link',
					text: this.$t('files'),
					to: '/instance/files',
					icon: faCloud,
				}, {
					type: 'link',
					text: this.$t('jobQueue'),
					to: '/instance/queue',
					icon: faExchangeAlt,
				}, {
					type: 'link',
					text: this.$t('announcements'),
					to: '/instance/announcements',
					icon: faBroadcastTower,
				}, {
					type: 'link',
					text: this.$t('reportedNotes'),
					to: '/instance/reported-notes',
					icon: faExclamationCircle,
				}],
				align: 'left',
				fixed: true,
				width: 200,
				source: ev.currentTarget || ev.target,
			});
		},

		more(ev) {
			this.$root.menu({
				items: [{
					type: 'link',
					text: this.$t('aboutX', { x: instanceName || host }),
					to: '/about',
					icon: faInfoCircle,
				}, {
					type: 'link',
					text: this.$t('aboutMisskey'),
					to: '/about-misskey',
					icon: faInfoCircle,
				}],
				align: 'left',
				fixed: true,
				width: 200,
				source: ev.currentTarget || ev.target,
			});
		},

		widgetFunc(id) {
			const w = this.$refs[id][0];
			if (w.func) w.func();
		},

		onWidgetSort() {
			this.saveHome();
		},

		addWidget(ev) {
			const widgets = [
				'memo',
				'calendar',
				'rss',
				'clock',
				'activity',
				'photos',
			];

			this.$root.menu({
				items: widgets.map(widget => ({
					text: this.$t('_widgets.' + widget),
					action: () => {
						this.$store.commit('deviceUser/addWidget', {
							name: widget,
							id: uuid(),
							data: {}
						});
					}
				})),
				source: ev.currentTarget || ev.target,
			});
		},

		removeWidget(widget) {
			this.$store.commit('deviceUser/removeWidget', widget);
		},

		saveHome() {
			this.$store.commit('deviceUser/setWidgets', this.widgets);
		}
	}
});
</script>

<style lang="scss" scoped>
.nav-enter-active,
.nav-leave-active {
	opacity: 1;
	transform: translateX(0);
	transition: transform 300ms cubic-bezier(0.23, 1, 0.32, 1), opacity 300ms cubic-bezier(0.23, 1, 0.32, 1);
}
.nav-enter,
.nav-leave-active {
	opacity: 0;
	transform: translateX(-240px);
}

.nav-back-enter-active,
.nav-back-leave-active {
	opacity: 1;
	transition: opacity 300ms cubic-bezier(0.23, 1, 0.32, 1);
}
.nav-back-enter,
.nav-back-leave-active {
	opacity: 0;
}

.mk-app {
	$header-height: 60px;
	$nav-width: 250px;
	$nav-icon-only-width: 80px;
	$main-width: 650px;
	$ui-font-size: 1em;
	$nav-icon-only-threshold: 1300px;
	$nav-hide-threshold: 650px;
	$side-hide-threshold: 1070px;

	min-height: 100vh;
	box-sizing: border-box;
	padding-top: $header-height;

	&, > .header > .body {
		display: flex;
		margin: 0 auto;
	}

	> .header {
		position: fixed;
		z-index: 1000;
		top: 0;
		right: 0;
		height: $header-height;
		width: calc(100% - #{$nav-width});
		//background-color: var(--panel);
		-webkit-backdrop-filter: blur(32px);
		backdrop-filter: blur(32px);
		background-color: var(--header);
		border-bottom: solid 1px var(--divider);

		@media (max-width: $nav-icon-only-threshold) {
			width: calc(100% - #{$nav-icon-only-width});
		}

		@media (max-width: $nav-hide-threshold) {
			width: 100%;
		}

		> .title {
			position: relative;
			line-height: $header-height;
			height: $header-height;
			max-width: $main-width;
			text-align: center;

			> .back {
				position: absolute;
				z-index: 1;
				top: 0;
				left: 0;
				height: $header-height;
				width: $header-height;

				> i {
					position: absolute;
					top: 16px;
					left: 40px;
					color: var(--indicator);
					font-size: 8px;
					animation: blink 1s infinite;
				}
			}

			> .body {
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
				height: $header-height;

				> .default {
					padding: 0 $header-height;

					> .title {
						display: inline-block;
						font-size: $ui-font-size;
						margin: 0;
						line-height: $header-height;

						> [data-icon] {
							margin-right: 8px;
						}
					}
				}

				> .custom {
					position: absolute;
					top: 0;
					left: 0;
					height: 100%;
					width: 100%;
				}
			}
		}

		> .sub {
			$post-button-size: 42px;
			$post-button-margin: (($header-height - $post-button-size) / 2);
			display: flex;
			align-items: center;
			position: absolute;
			top: 0;
			right: 16px;
			height: $header-height;

			@media (max-width: $side-hide-threshold) {
				display: none;
			}

			> .edit {
				padding: 16px;

				&.active {
					color: var(--accent);
				}
			}

			> .clock {
				margin-left: 8px;
			}
		}
	}

	> .nav-back {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 1001;
		width: 100%;
		height: 100%;
		background: var(--modalBg);
	}

	> .nav {
		$avatar-size: 32px;
		$avatar-margin: ($header-height - $avatar-size) / 2;

		flex: 0 0 $nav-width;
		width: $nav-width;
		box-sizing: border-box;

		@media (max-width: $nav-icon-only-threshold) {
			flex: 0 0 $nav-icon-only-width;
			width: $nav-icon-only-width;
		}

		@media (max-width: $nav-hide-threshold) {
			position: fixed;
			top: 0;
			left: 0;
			z-index: 1001;
		}

		@media (min-width: $nav-hide-threshold + 1px) {
			display: block !important;
		}

		> div {
			position: fixed;
			top: 0;
			padding-top: 60px;
			left: 0;
			z-index: 1001;
			width: $nav-width;
			height: 100vh;
			box-sizing: border-box;
			overflow: auto;
			background: var(--navBg);
			border-right: solid 1px var(--divider);

			> .divider {
				margin: 16px 0;
				border-top: solid 1px var(--divider);
			}

			@media (max-width: $nav-icon-only-threshold) and (min-width: $nav-hide-threshold + 1px) {
				width: $nav-icon-only-width;

				> .divider {
					margin: 8px auto;
					width: calc(100% - 32px);
				}

				> .item {
					&:first-child {
						margin-bottom: 8px;
					}
				}
			}

			> .item {
				position: relative;
				display: block;
				padding-left: 32px;
				font-size: $ui-font-size;
				line-height: 3.2rem;
				text-overflow: ellipsis;
				overflow: hidden;
				white-space: nowrap;
				width: 100%;
				text-align: left;
				box-sizing: border-box;
				color: var(--navFg);

				> [data-icon] {
					width: ($header-height - ($avatar-margin * 2));
				}

				.icon {
					margin: auto;
				}

				> i {
					position: absolute;
					top: 0;
					left: 20px;
					color: var(--navIndicator);
					font-size: 8px;
					animation: blink 1s infinite;
				}

				&:hover {
					text-decoration: none;
					color: var(--navHoverFg);
				}

				&.active {
					color: var(--navActive);
				}

				&:last-child {
					position: sticky;
					z-index: 1;
					padding-top: 8px;
					padding-bottom: 8px;
					background: var(--wboyroyc);
					-webkit-backdrop-filter: blur(8px);
					backdrop-filter: blur(8px);
				}

				@media (max-width: $nav-icon-only-threshold) and (min-width: $nav-hide-threshold + 1px) {
					padding-left: 0;
					width: 100%;
					text-align: center;
					font-size: $ui-font-size * 1.2;
					line-height: 3.7rem;

					> i {
						left: 10px;
					}

					> .text {
						display: none;
					}
				}
			}
		}
	}

	> .contents {
		display: flex;
		margin: 0 auto;
		min-width: 0;

		&.wallpaper {
			background: var(--wallpaperOverlay);
		}

		> main {
			width: $main-width;
			min-width: $main-width;
			box-shadow: 1px 0 0 0 var(--divider), -1px 0 0 0 var(--divider);

			@media (max-width: $side-hide-threshold) {
				min-width: 0;
			}

			> .content {
				> * {
					&:not(.full) {
						padding: var(--margin) 0;
					}

					&:not(.naked) {
						background: var(--pageBg);
					}

					&.naked {
						background: var(--bg);
					}
				}
			}

			> .powerd-by {
				font-size: 14px;
				text-align: center;
				margin: 32px 0;
				visibility: hidden;

				&.visible {
					visibility: visible;
				}

				&:not(.visible) {
					@media (min-width: 850px) {
						display: none;
					}
				}

				@media (max-width: 500px) {
					margin-top: 16px;
				}

				> small {
					display: block;
					margin-top: 8px;
					opacity: 0.5;

					@media (max-width: 500px) {
						margin-top: 4px;
					}
				}
			}
		}

		> .widgets {
			box-sizing: border-box;
			margin-left: var(--margin);

			@media (max-width: $side-hide-threshold) {
				display: none;
			}

			> div {
				position: sticky;
				top: calc(#{$header-height} + var(--margin));
				height: calc(100vh - #{$header-height} - var(--margin));

				&.edit {
					overflow: auto;
					width: auto !important;
				}

				&:not(.edit) {
					display: inline-flex;
					flex-wrap: wrap;
					flex-direction: column;
					place-content: flex-start;
				}

				> * {
					margin: 0 var(--margin) var(--margin) 0;
					width: 300px;
				}

				> .add {
					margin: 0 auto;
				}

				.customize-container {
					margin: 8px 0;
					background: #fff;

					> header {
						position: relative;
						line-height: 32px;

						> .handle {
							padding: 0 8px;
							cursor: move;
						}

						> .remove {
							position: absolute;
							top: 0;
							right: 0;
							padding: 0 8px;
							line-height: 32px;
						}
					}

					> div {
						padding: 8px;

						> * {
							pointer-events: none;
						}
					}
				}
			}
		}
	}

	> .post {
		display: none;
		position: fixed;
		z-index: 1000;
		bottom: 32px;
		right: 32px;
		width: 64px;
		height: 64px;
		border-radius: 100%;
		box-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12);
		font-size: 22px;

		@media (min-width: ($nav-hide-threshold + 1px)) {
			display: block;
		}

		@media (min-width: ($side-hide-threshold + 1px)) {
			display: none;
		}
	}
}
</style>
