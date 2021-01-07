<template>
<div class="vvcocwet" :class="{ wide: !narrow }" ref="el">
	<FormBase class="nav" v-if="!narrow || page == null" :force-wide="!narrow">
		<FormGroup>
			<template #label>{{ $ts.basicSettings }}</template>
			<FormLink v-for="i in basicPages" :key="i.name" :active="page === i.name" replace :to="`/settings/${i.name}`">
				<template #icon><Fa :icon="i.icon"/></template>{{ i.title }}
			</FormLink>
		</FormGroup>
		<FormGroup>
			<template #label>{{ $ts.clientSettings }}</template>
			<FormLink v-for="i in clientPages" :key="i.name" :active="page === i.name" replace :to="`/settings/${i.name}`">
				<template #icon><Fa :icon="i.icon"/></template>{{ i.title }}
			</FormLink>
		</FormGroup>
		<FormGroup>
			<template #label>{{ $ts.otherSettings }}</template>
			<FormLink v-for="i in otherPages" :key="i.name" :active="page === i.name" replace :to="`/settings/${i.name}`">
				<template #icon><Fa :icon="i.icon"/></template>{{ i.title }}
			</FormLink>
		</FormGroup>
		<FormGroup>
			<FormButton @click="clear">{{ $ts.clearCache }}</FormButton>
		</FormGroup>
		<FormGroup>
			<FormButton @click="logout" danger>{{ $ts.logout }}</FormButton>
			<FormButton @click="logoutAll" danger>{{ $ts.logoutAll }}</FormButton>
		</FormGroup>
	</FormBase>
	<div class="main">
		<component :is="component"/>
	</div>
</div>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, onMounted, ref, watch } from 'vue';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { faLaugh, faBell } from '@fortawesome/free-regular-svg-icons';
import { i18n } from '@/i18n';
import { pages } from './index.pages';
import FormLink from '@/components/form/link.vue';
import FormGroup from '@/components/form/group.vue';
import FormBase from '@/components/form/base.vue';
import FormButton from '@/components/form/button.vue';
import { scroll } from '@/scripts/scroll';
import { signout, signoutAll } from '@/account';
import { dialog } from '@/os';

export default defineComponent({
	components: {
		FormBase,
		FormLink,
		FormGroup,
		FormButton,
	},

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
			title: i18n.locale.settings,
			icon: faCog,
		});

		const narrow = ref(false);
		const view = ref(null);
		const el = ref(null);

		const component = computed(() => {
			return page.value ? page.value.component() : null;
		});

		watch(component, () => {
			nextTick(() => {
				scroll(el.value, 0);
			});
		});

		onMounted(() => {
			narrow.value = el.value.offsetWidth < 1025;
		});

		const logoutAll = () => {
			dialog({
				type: 'warning',
				text: i18n.locale.logoutAllConfirm,
				showCancelButton: true
			}).then(({ canceled }) => {
				if (canceled) return;
				signoutAll();
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
			logout: () => {
				signout();
			},
			logoutAll,
			clear: () => {
				localStorage.removeItem('locale');
				localStorage.removeItem('theme');
				location.reload();
			},
			faLaugh, faBell
		};
	},
});
</script>

<style lang="scss" scoped>
.vvcocwet {
	&.wide {
		display: flex;
		max-width: 1100px;
		margin: 0 auto;

		> .nav {
			width: 32%;
			box-sizing: border-box;
			border-right: solid 0.5px var(--divider);
		}

		> .main {
			flex: 1;
			min-width: 0;
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
