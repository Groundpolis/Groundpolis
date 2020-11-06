<template>
<mk-pagination :pagination="pagination" class="users" ref="list">
	<template #empty><span>{{ $t('noUsers') }}</span></template>
	<template #default="{items}">
		<x-user v-for="user in items" :user="user" :key="user.id" />
	</template>
</mk-pagination>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import XUser from './user.vue';
import MkPagination from './ui/pagination.vue';

export default defineComponent({
	components: {
		XUser,
		MkPagination,
	},

	props: {
		pagination: {
			required: true
		},
	},
});
</script>
