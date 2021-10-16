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
				<MkA class="item _button account" active-class="active" :to="userPage($i)">
					<MkAvatar :user="$i" class="avatar"/>
					<MkAcct v-if="!$store.state.useDisplayNameForSidebar" class="text" :user="$i"/>
					<MkUserName v-else class="text" :user="$i"/>
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
						<Fa :icon="faHome" fixed-width/><span class="text">{{ $ts.timeline }}</span>
					</MkA>
					<template v-for="(item, i) in (menu.filter(filterItem))">
						<div :key="'divider-' + i" v-if="item === '-'" class="divider"></div>
						<component :key="item" v-else-if="menuDef[item] && (menuDef[item].show !== false)" :is="menuDef[item].to ? 'MkA' : 'button'" class="item _button" :class="item" active-class="active" v-on="menuDef[item].action ? { click: menuDef[item].action } : {}" :to="menuDef[item].to">
							<Fa :icon="menuDef[item].icon" fixed-width/><span class="text">{{ $ts[menuDef[item].title] }}</span>
							<i v-if="menuDef[item].indicated"><Fa :icon="faCircle"/></i>
						</component>
					</template>
					<div class="divider"></div>
					<button class="item _button" :class="{ active: $route.path === '/instance' || $route.path.startsWith('/instance/') }" v-if="$i.isAdmin || $i.isModerator" @click="oepnInstanceMenu">
						<Fa :icon="faServer" fixed-width/><span class="text">{{ $ts.instance }}</span>
					</button>
					<MkA class="item" active-class="active" to="/settings">
						<Fa :icon="faCog" fixed-width/><span class="text">{{ $ts.settings }}</span>
					</MkA>
					<button class="item _button" @click="more">
						<Fa :icon="faEllipsisH" fixed-width/><span class="text">{{ $ts.more }}</span>
						<i v-if="otherNavItemIndicated"><Fa :icon="faCircle"/></i>
					</button>
					<button class="item _button _mt-2" v-if="!isTablet && !hidden" @click="collapsed = !collapsed">
						<Fa :icon="collapsed ? faArrowRight : faArrowLeft" :key="collapsed ? faArrowRight : faArrowLeft" fixed-width/><span class="text">{{ $ts.collapse }}</span>
					</button>
					<MkA to="/about" class="instance-icon">
					<img :src="meta.iconUrl || '/assets/icon_transparent.svg'"/>
					</MkA>
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
					<button class="item _button" @click="addAcount" v-text="$ts.addAcount"/>
					<button class="item _button" @click="createAccount" v-text="$ts.createAccount"/>
					<button class="item danger _button" @click="signout" v-text="$ts.logout"/>
				</template>
			</div>
		</nav>
	</transition>
</div>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue';
import { faGripVertical, faChevronLeft, faHashtag, faBroadcastTower, faFireAlt, faEllipsisH, faEllipsisV, faPencilAlt, faBars, faTimes, faSearch, faUserCog, faCog, faUser, faHome, faStar, faCircle, faAt, faListUl, faPlus, faUserClock, faUsers, faTachometerAlt, faExchangeAlt, faGlobe, faChartBar, faCloud, faServer, faProjectDiagram, faArrowLeft, faExclamationCircle, faArrowRight, faChevronDown, faChevronUp, faStream } from '@fortawesome/free-solid-svg-icons';
import { faBell, faEnvelope, faLaugh, faComments } from '@fortawesome/free-regular-svg-icons';
import { host } from '@/config';
import { search } from '@/scripts/search';
import * as os from '@/os';
import { sidebarDef } from '@/sidebar';
import { userPage } from '@/filters/user';
import { getAccounts, addAccount, login, signout } from '@/account';
import { defaultStore } from '@/store';

export default defineComponent({
	data() {
		return {
			host: host,
			isAccountMenuMode: false,
			showing: false,
			accounts: [] as readonly Record<string, unknown>[],
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
			return this.$store.reactiveState.menu.value;
		},

		otherNavItemIndicated(): boolean {
			for (const def in this.menuDef) {
				if (this.menu.includes(def)) continue;
				if (this.menuDef[def].indicated) return true;
			}
			return false;
		},

		meta() {
			return this.$instance;
		},

		collapsed: defaultStore.makeGetterSetter('sidebarDisplay', v => v === 'icon', v => v ? 'icon' : 'full'),
	},

	watch: {
		$route(to, from) {
			this.showing = false;
		},

		'$store.reactiveState.sidebarDisplay.value'() {
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
			this.iconOnly = (this.isTablet) || (this.$store.state.sidebarDisplay === 'icon');
			this.hidden = (window.innerWidth <= 650) || (this.$store.state.sidebarDisplay === 'hide');
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
			search();
		},

		async fetchAccounts() {
			this.loadingAccounts = true;
			this.accounts = await os.getAccounts();
			this.loadingAccounts = false;
		},

		toggleMenuMode() {
			this.isAccountMenuMode = !this.isAccountMenuMode;
			if (this.isAccountMenuMode) {
				this.fetchAccounts();
			}
		},

		async openAccountMenu(ev) {
			await this.fetchAccounts();

			const accountItems = this.accounts.map(account => ({
				type: 'user',
				user: account,
				action: () => { this.switchAccount(account); }
			}));

			os.modalMenu([...[...accountItems, {
						text: this.$ts.addAcount,
						action: () => { this.addAcount(); },
					}, {
						text: this.$ts.createAccount,
						action: () => { this.createAccount(); },
					}, {
						text: this.$ts.logout,
						action: this.signout,
						danger: true,
					}]], ev.currentTarget || ev.target, {
				align: 'left'
			});
		},

		signout,

		oepnInstanceMenu(ev) {
			os.modalMenu([{
				type: 'link',
				text: this.$ts.dashboard,
				to: '/instance',
				icon: faTachometerAlt,
			}, null, this.$i.isAdmin ? {
				type: 'link',
				text: this.$ts.settings,
				to: '/instance/settings',
				icon: faCog,
			} : undefined, {
				type: 'link',
				text: this.$ts.customEmojis,
				to: '/instance/emojis',
				icon: faLaugh,
			}, {
				type: 'link',
				text: this.$ts.users,
				to: '/instance/users',
				icon: faUsers,
			}, {
				type: 'link',
				text: this.$ts.files,
				to: '/instance/files',
				icon: faCloud,
			}, {
				type: 'link',
				text: this.$ts.jobQueue,
				to: '/instance/queue',
				icon: faExchangeAlt,
			}, {
				type: 'link',
				text: this.$ts.federation,
				to: '/instance/federation',
				icon: faGlobe,
			}, {
				type: 'link',
				text: this.$ts.relays,
				to: '/instance/relays',
				icon: faProjectDiagram,
			}, {
				type: 'link',
				text: this.$ts.announcements,
				to: '/instance/announcements',
				icon: faBroadcastTower,
			}, {
				type: 'link',
				text: this.$ts.abuseReports,
				to: '/instance/abuses',
				icon: faExclamationCircle,
			}, {
				type: 'link',
				text: this.$ts.logs,
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
					addAccount(res.id, res.i);
					this.switchAccountWithToken(res.i);
				},
			}, 'closed');
		},

		createAccount() {
			os.popup(import('./signup-dialog.vue'), {}, {
				done: res => {
					addAccount(res.id, res.i);
					this.switchAccountWithToken(res.i);
				},
			}, 'closed');
		},

		switchAccount(account: any) {
			const storedAccounts = getAccounts();
			const token = storedAccounts.find(x => x.id === account.id).token;
			this.switchAccountWithToken(token);
		},

		switchAccountWithToken(token: string) {
			login(token);
		},

		userPage
	}
});
</script>

<style lang="scss" scoped>
@mixin clickable($isText: false) {
  transition: transform 0.2s ease;
  transform-origin: center;
  cursor: pointer;

  &:active {
    transform: scale(0.95) translateY(2px);
  }
  &:hover,
  &:active {
    z-index: 9999;
  }
}

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
	$nav-icon-only-width: 86px;
	$right-widgets-hide-threshold: 1090px;
	position: relative;
	border-right: 1px solid var(--divider);

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
						border: 1px solid var(--divider);
					}

					> .item {
						padding-left: 0;
						width: 100%;
						text-align: center;
						font-size: $ui-font-size * 1.1;
						line-height: 3.7rem;
						@include clickable();

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
			background: var(--bg);

			> .divider {
				margin: var(--margin);
				border: 1px solid var(--divider);
			}

			> .item {
				position: relative;
				display: block;
				padding-left: 24px;
				font-size: $ui-font-size;
				line-height: 2.5rem;
				text-overflow: ellipsis;
				overflow: hidden;
				white-space: nowrap;
				width: 100%;
				text-align: left;
				box-sizing: border-box;
				border-radius: var(--radius);
				color: var(--navFg);
				@include clickable();

				> [data-icon] {
					width: ($header-height - ($avatar-margin * 2));
					margin-right: 8px;
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
					background: var(--bg);
					z-index: 1;					
				}

				&:first-child {
					top: 0;
					margin: 32px 0;
				}

				&:last-child {
					bottom: 0;
					margin-top: 32px;
				}
			}

			.instance-icon > img {
				display: block;
				height: 48px;
				margin: 48px auto;
				border-radius: 10px;
				@include clickable;
			}

			.toggler {
				position: absolute;
				right: 0px;
				top: 16px;
				width: 64px;
				height: 64px;
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
