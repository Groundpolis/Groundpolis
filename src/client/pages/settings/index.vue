<template>
<div class="vvcocwet" :class="{ wide: !narrow }" ref="el">
	<div class="nav" v-if="!narrow || page == null">
		<div class="menu">
			<div class="label">{{ $t('basicSettings') }}</div>
			<MkA v-for="i in basicPages" :key="i.name" class="item" :class="{ active: page === i.name }" replace :to="`/settings/${i.name}`">
				<Fa :icon="i.icon" fixed-width class="icon"/> {{ i.title }}
			</MkA>
		</div>
		<div class="menu">
			<div class="label">{{ $t('clientSettings') }}</div>
			<MkA v-for="i in clientPages" :key="i.name" class="item" :class="{ active: page === i.name }" replace :to="`/settings/${i.name}`">
				<Fa :icon="i.icon" fixed-width class="icon"/> {{ i.title }}
			</MkA>
		</div>
		<div class="menu">
			<div class="label">{{ $t('otherSettings') }}</div>
			<MkA v-for="i in otherPages" :key="i.name" class="item" :class="{ active: page === i.name }" replace :to="`/settings/${i.name}`">
				<Fa :icon="i.icon" fixed-width class="icon"/> {{ i.title }}
			</MkA>
		</div>
		<div class="menu">
			<button class="_button item" @click="logout">{{ $t('logout') }}</button>
			<button class="_button item" @click="logoutAll">{{ $t('logoutAll') }}</button>
		</div>
	</div>
	<div class="main">
		<component :is="component"/>
	</div>
</div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { faLaugh, faBell } from '@fortawesome/free-regular-svg-icons';
import * as os from '@/os';
import { i18n } from '@/i18n';
import { pages } from './index.pages';

export default defineComponent({
	props: {
		page: {
			type: String,
			required: false
		}
	},

	setup(props, context) {
		const page = computed(() => pages.find(p => p.name === props.page));

		const INFO = computed(() => page.value ? {
			title: page.value.title,
			icon: page.value.icon,
		} : {
			title: i18n.global.t('settings'),
			icon: faCog,
		});

		const narrow = ref(false);
		const view = ref(null);
		const el = ref(null);

		const component = computed(() => {
			return page.value ? page.value.component() : null;
		});

		onMounted(() => {
			narrow.value = el.value.offsetWidth < 650;
		});

		const logoutAll = () => {
			os.dialog({
				type: 'warning',
				text: i18n.global.t('logoutAllConfirm'),
				showCancelButton: true
			}).then(({ canceled }) => {
				if (canceled) return;
				os.signoutAll();
			});
		};

		return {
			INFO,
			narrow,
			view,
			el,
			basicPages: pages.filter(p => p.type === 'basic'),
			clientPages: pages.filter(p => p.type === 'client'),
			otherPages: pages.filter(p => p.type === 'other'),
			component,
			logout: () => os.signout(),
			logoutAll,
			faLaugh, faBell
		};
	},
});
</script>

<style lang="scss" scoped>
.vvcocwet {
	> .nav {
		> .menu {
			margin: 16px 0;

			> .label {
				padding: 8px 32px;
				font-size: 80%;
				opacity: 0.7;
			}

			> .item {
				display: block;
				width: 100%;
				box-sizing: border-box;
				padding: 0 32px;
				line-height: 40px;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
				//background: var(--panel);
				//border-bottom: solid 1px var(--divider);
				transition: padding 0.2s ease, color 0.1s ease;

				&:first-of-type {
					//border-top: solid 1px var(--divider);
				}

				&.active {
					color: var(--accent);
					padding-left: 42px;
				}

				&:hover {
					text-decoration: none;
					padding-left: 42px;
				}

				> .icon {
					margin-right: 0.5em;
				}
			}
		}
	}

	&.wide {
		display: flex;

		> .nav {
			width: 30%;
			max-width: 300px;
			font-size: 0.95em;
			border-right: solid 1px var(--divider);
		}

		> .main {
			flex: 1;
			padding: 32px;
			--baseContentWidth: 100%;

			::v-deep(._section) {
				padding: 0 0 32px 0;

				& + ._section {
					padding-top: 32px;
				}
			}
		}
	}
}
</style>
