<template>
<div class="mvcprjjd">
	<transition name="nav-back">
		<div class="nav-back _modalBg"
			v-if="showing"
			@click="showing = isAccountMenuMode = false"
			@touchstart.passive="showing = isAccountMenuMode = false"
		></div>
	</transition>

	<transition name="nav">
		<nav class="nav" :class="{ iconOnly, hidden }" v-show="showing">
			<div>
				<MkA class="item _button account" active-class="active" :to="userPage($store.state.i)">
					<MkAvatar :user="$store.state.i" class="avatar"/>
					<MkAcct v-if="!$store.state.settings.useDisplayNameForSidebar" class="text" :user="$store.state.i"/>
					<MkUserName v-else class="text" :user="$store.state.i"/>
				</MkA>
				<button v-if="iconOnly && !hidden" class="item _button" @click="openAccountMenu">
					<Fa :icon="faEllipsisV"/>
				</button>
				<button v-else class="_button toggler" @click="toggleMenuMode">
					<Fa v-if="isAccountMenuMode" :icon="faChevronUp"/>
					<Fa v-else :icon="faChevronDown"/>
				</button>
				<div class="divider" />
				<template v-if="!isAccountMenuMode">
					<MkA class="item index" active-class="active" to="/" exact>
						<Fa :icon="faHome" fixed-width/><span class="text">{{ $t('timeline') }}</span>
					</MkA>
					<template v-for="(item, i) in (menu.filter(filterItem))">
						<div :key="'divider-' + i" v-if="item === '-'" class="divider"></div>
						<component :key="item" v-else-if="menuDef[item] && (menuDef[item].show !== false)" :is="menuDef[item].to ? 'MkA' : 'button'" class="item _button" :class="item" active-class="active" v-on="menuDef[item].action ? { click: menuDef[item].action } : {}" :to="menuDef[item].to">
							<Fa :icon="menuDef[item].icon" fixed-width/><span class="text">{{ $t(menuDef[item].title) }}</span>
							<i v-if="menuDef[item].indicated"><Fa :icon="faCircle"/></i>
						</component>
					</template>
					<div class="divider"></div>
					<button class="item _button" :class="{ active: $route.path === '/instance' || $route.path.startsWith('/instance/') }" v-if="$store.state.i.isAdmin || $store.state.i.isModerator" @click="oepnInstanceMenu">
						<Fa :icon="faServer" fixed-width/><span class="text">{{ $t('instance') }}</span>
					</button>
					<MkA class="item" active-class="active" to="/settings">
						<Fa :icon="faCog" fixed-width/><span class="text">{{ $t('settings') }}</span>
					</MkA>
					<button class="item _button" @click="more">
						<Fa :icon="faEllipsisH" fixed-width/><span class="text">{{ $t('more') }}</span>
						<i v-if="otherNavItemIndicated"><Fa :icon="faCircle"/></i>
					</button>
				</template>
				<template v-else>
					<button v-for="acct in accounts" :key="acct.id" @click="switchAccount(acct)" class="item account _button">
						<div class="name">
							<MkAvatar :user="acct" class="avatar" :disable-preview="true"/>
							<MkUser-name class="text" :user="acct" :nowrap="true"/>
						</div>
					</button>
					<MkEllipsis v-if="loadingAccounts" class="item" />
					<div class="divider" v-if="accounts.length > 0"></div>
					<button class="item _button" @click="addAcount" v-text="$t('addAcount')"/>
					<button class="item _button" @click="createAccount" v-text="$t('createAccount')"/>
					<button class="item danger _button" @click="os.signout()" v-text="$t('logout')"/>
				</template>
			</div>
		</nav>
	</transition>
</div>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue';
import { faGripVertical, faChevronLeft, faHashtag, faBroadcastTower, faFireAlt, faEllipsisH, faEllipsisV, faPencilAlt, faBars, faTimes, faSearch, faUserCog, faCog, faUser, faHome, faStar, faCircle, faAt, faListUl, faPlus, faUserClock, faUsers, faTachometerAlt, faExchangeAlt, faGlobe, faChartBar, faCloud, faServer, faInfoCircle, faQuestionCircle, faProjectDiagram, faArrowLeft, faExclamationCircle, faArrowRight, faFlask, faChevronDown, faChevronUp, faStream } from '@fortawesome/free-solid-svg-icons';
import { faBell, faEnvelope, faLaugh, faComments } from '@fortawesome/free-regular-svg-icons';
import { host } from '@/config';
import { search } from '@/scripts/search';
import * as os from '@/os';
import { sidebarDef } from '@/sidebar';
import { userPage } from '@/filters/user';

export default defineComponent({
	data() {
		return {
			host: host,
			isAccountMenuMode: false,
			showing: false,
			searching: false,
			accounts: [],
			menuDef: sidebarDef,
			connection: null,
			iconOnly: false,
			hidden: false,
			isTablet: false,
			loadingAccounts: false,
			faGripVertical, faChevronLeft, faComments, faHashtag, faBroadcastTower, faFireAlt, faEllipsisH, faEllipsisV, faPencilAlt, faBars, faTimes, faBell, faSearch, faUserCog, faCog, faUser, faHome, faStar, faCircle, faAt, faEnvelope, faListUl, faPlus, faUserClock, faLaugh, faUsers, faTachometerAlt, faExchangeAlt, faGlobe, faChartBar, faCloud, faServer, faProjectDiagram, faArrowLeft, faArrowRight, faChevronDown, faChevronUp
		};
	},

	computed: {
		menu(): string[] {
			return this.$store.state.deviceUser.menu;
		},

		otherNavItemIndicated(): boolean {
			for (const def in this.menuDef) {
				if (this.menu.includes(def)) continue;
				if (this.menuDef[def].indicated) return true;
			}
			return false;
		},

		meta() {
			return this.$store.state.instance.meta;
		},
	},

	watch: {
		$route(to, from) {
			this.showing = false;
		},

		'$store.state.device.sidebarDisplay'() {
			this.calcViewState();
		},

		iconOnly() {
			this.isAccountMenuMode = false;
			this.$nextTick(() => {
				this.$emit('change-view-mode');
			});
		},

		hidden() {
			this.$nextTick(() => {
				this.$emit('change-view-mode');
			});
		}
	},

	created() {
		window.addEventListener('resize', this.calcViewState);
		this.calcViewState();
	},

	methods: {
		calcViewState() {
			this.isTablet = window.innerWidth <= 1279;
			this.iconOnly = (this.isTablet) || (this.$store.state.device.sidebarDisplay === 'icon');
			this.hidden = (window.innerWidth <= 650) || (this.$store.state.device.sidebarDisplay === 'hide');
		},

		show() {
			this.showing = true;
		},

		filterItem(name: string) {
			if (!this.hidden) return true;
			return !([
				'notifications',
				'explore',
				'messaging',
			].includes(name));
		},

		search() {
			if (this.searching) return;

			os.dialog({
				title: this.$t('search'),
				input: true,
				autoComplete: true
			}).then(async ({ canceled, result: query }) => {
				if (canceled || query == null || query === '') return;

				this.searching = true;
				search(this, query).finally(() => {
					this.searching = false;
				});
			});
		},

		async fetchAccounts() {
			this.loadingAccounts = true;
			this.accounts = (await os.api('users/show', { userIds: this.$store.state.device.accounts.map(x => x.id) })).filter(x => x.id !== this.$store.state.i.id);
			this.loadingAccounts = false;
		},

		toggleMenuMode() {
			this.isAccountMenuMode = !this.isAccountMenuMode;
			console.log(this.isAccountMenuMode);
			if (this.isAccountMenuMode) {
				this.fetchAccounts();
			}
		},

		async openAccountMenu(ev) {
			const accounts = (await os.api('users/show', { userIds: this.$store.state.device.accounts.map(x => x.id) })).filter(x => x.id !== this.$store.state.i.id);

			const accountItems = accounts.map(account => ({
				type: 'user',
				user: account,
				action: () => { this.switchAccount(account); }
			}));

			os.modalMenu([...[...accountItems, {
						text: this.$t('addAcount'),
						action: () => { this.addAcount(); },
					}, {
						text: this.$t('createAccount'),
						action: () => { this.createAccount(); },
					}, {
						text: this.$t('logout'),
						action: () => { os.signout() },
						danger: true,
					}]], ev.currentTarget || ev.target, {
				align: 'left'
			});
		},

		oepnInstanceMenu(ev) {
			os.modalMenu([{
				type: 'link',
				text: this.$t('dashboard'),
				to: '/instance',
				icon: faTachometerAlt,
			}, null, this.$store.state.i.isAdmin ? {
				type: 'link',
				text: this.$t('settings'),
				to: '/instance/settings',
				icon: faCog,
			} : undefined, {
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
				text: this.$t('federation'),
				to: '/instance/federation',
				icon: faGlobe,
			}, {
				type: 'link',
				text: this.$t('relays'),
				to: '/instance/relays',
				icon: faProjectDiagram,
			}, {
				type: 'link',
				text: this.$t('announcements'),
				to: '/instance/announcements',
				icon: faBroadcastTower,
			}, {
				type: 'link',
				text: this.$t('abuseReports'),
				to: '/instance/abuses',
				icon: faExclamationCircle,
			}, {
				type: 'link',
				text: this.$t('logs'),
				to: '/instance/logs',
				icon: faStream,
			}], ev.currentTarget || ev.target);
		},

		more(ev) {
			os.popup(import('./launch-pad.vue'), {}, {
			}, 'closed');
		},

		addAcount() {
			os.popup(import('./signin-dialog.vue'), {}, {
				done: res => {
					this.$store.dispatch('addAcount', res);
					this.switchAccountWithToken(res.i);
				},
			}, 'closed');
		},

		createAccount() {
			os.popup(import('./signup-dialog.vue'), {}, {
				done: res => {
					this.$store.dispatch('addAcount', res);
					this.switchAccountWithToken(res.i);
				},
			}, 'closed');
		},

		switchAccount(account: any) {
			const token = this.$store.state.device.accounts.find((x: any) => x.id === account.id).token;
			this.switchAccountWithToken(token);
		},

		switchAccountWithToken(token: string) {
			os.waiting();

			os.api('i', {}, token).then((i: any) => {
				this.$store.dispatch('switchAccount', {
					...i,
					token: token
				}).then(() => {
					location.reload();
				});
			});
		},

		userPage
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
.nav-enter-from,
.nav-leave-active {
	opacity: 0;
	transform: translateX(-240px);
}

.nav-back-enter-active,
.nav-back-leave-active {
	opacity: 1;
	transition: opacity 300ms cubic-bezier(0.23, 1, 0.32, 1);
}
.nav-back-enter-from,
.nav-back-leave-active {
	opacity: 0;
}

.mvcprjjd {
	$header-height: 60px;
	$ui-font-size: 1em; // TODO: どこかに集約したい
	$nav-width: 250px;
	$nav-icon-only-width: 80px;
	$right-widgets-hide-threshold: 1090px;
	position: relative;

	> .nav-back {
		z-index: 1001;
	}

	> .nav {
		$avatar-size: 32px;
		$avatar-margin: ($header-height - $avatar-size) / 2;

		flex: 0 0 $nav-width;
		width: $nav-width;
		box-sizing: border-box;

		&.iconOnly {
			flex: 0 0 $nav-icon-only-width;
			width: $nav-icon-only-width;

			&:not(.hidden) {
				> div {
					width: $nav-icon-only-width;

					> .divider {
						margin: 8px auto;
						width: calc(100% - 32px);
					}

					> .item {
						padding-left: 0;
						width: 100%;
						text-align: center;
						font-size: $ui-font-size * 1.1;
						line-height: 3.7rem;

						&.account {
							flex-direction: column;
							align-items: center;

							&.active {
								border: 2px solid var(--accent);
							}
						}

						[data-icon],
						.avatar {
							margin-right: 0;
						}

						.text {
							display: none;
						}

						> .more {
							margin-left: 0;
						}

						> i {
							left: 10px;
						}

						> .text {
							display: none;
						}

						&:first-child {
							margin-bottom: 8px;
						}

						&:last-child {
							margin-top: 8px;
						}
					}
				}
			}
		}

		&.hidden {
			position: fixed;
			top: 0;
			left: 0;
			z-index: 1001;

			> div {
				> .index,
				> .notifications {
					display: none;
				}
			}
		}

		&:not(.hidden) {
			display: block !important;
		}

		> div {
			position: fixed;
			top: 0;
			left: 0;
			z-index: 1001;
			width: $nav-width;
			// ほんとは単に 100vh と書きたいところだが... https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
			height: calc(var(--vh, 1vh) * 100);
			box-sizing: border-box;
			overflow: auto;
			background: var(--navBg);
			border-right: solid 1px var(--divider);
			-webkit-backdrop-filter: blur(4px);
			backdrop-filter: blur(4px);
			padding: 16px;

			> .divider {
				margin: 16px 0;
				border-top: solid 1px var(--divider);
			}

			> .item {
				position: relative;
				display: block;
				padding-left: 24px;
				font-size: $ui-font-size;
				line-height: 3rem;
				text-overflow: ellipsis;
				overflow: hidden;
				white-space: nowrap;
				width: 100%;
				text-align: left;
				box-sizing: border-box;
				border-radius: var(--radius);
				color: var(--navFg);

				> [data-icon] {
					width: ($header-height - ($avatar-margin * 2));
				}

				&.account {
					display: flex;
					flex-direction: row;
					align-items: center;

					> .name {
						overflow: hidden;
						text-overflow: ellipsis;
						width: 100%;
					}

					> .text {
						line-height: initial;
					}

					a.active {
						color: var(--navActive);
					}

					.more {
						margin-left: auto;
					}

					[data-icon],
					.avatar {
						margin-right: $avatar-margin;
					}

					.avatar {
						width: $avatar-size;
						height: $avatar-size;
						vertical-align: middle;
					}
				}

				> [data-icon] {
					width: ($header-height - ($avatar-margin * 2));
				}

				&.danger {
					color: red;
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

				&:first-child, &:last-child {
					position: sticky;
					background: var(--navBg);
					z-index: 1;					
				}

				&:first-child {
					top: 0;
					margin-bottom: 16px;
				}

				&:last-child {
					bottom: 0;
					margin-top: 16px;
				}
			}

			.toggler {
				position: absolute;
				right: 24px;
				top: 20px;
				width: 24px;
				height: 24px;
				z-index: 400;
			}
		}
	}
	.hide-on-pc {
		display: none !important;

		@media (max-width: $right-widgets-hide-threshold) {
			display: inherit !important;
		}
	}
}
</style>
