<template>
<MkTab v-model:value="tab" style="margin-bottom: var(--margin);">
	<option value="mute">{{ $ts.mutedUsers }}</option>
	<option value="renote">{{ $ts.renoteMutedUsers }}</option>
	<option value="block">{{ $ts.blockedUsers }}</option>
</MkTab>
<FormBase class="_content" v-if="tab === 'mute'">
	<FormPagination :pagination="mutingPagination" class="muting">
		<template #empty>{{ $ts.noUsers }}</template>
		<template #default="{items}">
			<FormLink v-for="mute in items" :key="mute.id" :to="userPage(mute.mutee)">
				<MkAcct :user="mute.mutee"/>
			</FormLink>
		</template>
	</FormPagination>
</FormBase>
<FormBase class="_content" v-if="tab === 'renote'">
	<FormPagination :pagination="renoteMutingPagination" class="muting">
		<template #empty>{{ $ts.noUsers }}</template>
		<template #default="{items}">
			<FormLink v-for="mute in items" :key="mute.id" :to="userPage(mute.mutee)">
				<MkAcct :user="mute.mutee"/>
			</FormLink>
		</template>
	</FormPagination>
</FormBase>
<FormBase class="_content" v-if="tab === 'block'">
	<FormPagination :pagination="blockingPagination" class="blocking">
		<template #empty>{{ $ts.noUsers }}</template>
		<template #default="{items}">
			<FormLink class="user" v-for="block in items" :key="block.id" :to="userPage(block.blockee)">
				<MkAcct :user="block.blockee"/>
			</FormLink>
		</template>
	</FormPagination>
</FormBase>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MkTab from '@/components/tab.vue';

import FormBase from '@/components/form/base.vue';
import FormPagination from '@/components/form/pagination.vue';
import FormSwitch from '@/components/form/switch.vue';
import FormSelect from '@/components/form/select.vue';
import FormLink from '@/components/form/link.vue';
import FormGroup from '@/components/form/group.vue';
import FormButton from '@/components/form/button.vue';

import { userPage } from '@/filters/user';

export default defineComponent({
	components: {
		FormPagination,
		MkTab,
		MkInfo,
		FormSwitch,
		FormSelect,
		FormLink,
		FormBase,
		FormGroup,
		FormButton,
	},

	data() {
		return {
			tab: 'mute',
			mutingPagination: {
				endpoint: 'mute/list',
				params:{
					isRenoteOnly: false,
				},
				limit: 10,
			},
			renoteMutingPagination: {
				endpoint: 'mute/list',
				params:{
					isRenoteOnly: true,
				},
				limit: 10,
			},
			blockingPagination: {
				endpoint: 'blocking/list',
				limit: 10,
			},
		}
	},

	methods: {
		userPage
	}
});
</script>

<style lang="scss" scoped>
.rrfwjxfl {
	> ._content {
		max-height: 350px;
		overflow: auto;

		> .muting,
		> .blocking {
			> .empty {
				opacity: 0.5 !important;
			}
		}
	}
}
</style>
