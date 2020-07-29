<template>
<div>
	<portal to="icon"><fa :icon="faSearch"/></portal>
	<portal to="title">{{ $t('searchWith', { q: $route.query.q }) }}</portal>
	<div class="tab _panel _noPad">
		<mk-tab v-model="tab" :items="[{ label: $t('notes'), value: 'notes' }, { label: $t('users'), value: 'users' }]"/>
	</div>

	<x-notes v-if="tab === 'notes'" ref="notes" :pagination="notesPagination"/>
	<x-users v-if="tab === 'users'" ref="users" :pagination="usersPagination"/>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import Progress from '../scripts/loading';
import XNotes from '../components/notes.vue';
import XUsers from '../components/users.vue';
import MkTab from '../components/tab.vue';

export default Vue.extend({
	metaInfo() {
		return {
			title: this.$t('searchWith', { q: this.$route.query.q }) as string
		};
	},

	components: {
		XNotes,
		XUsers,
		MkTab,
	},

	data() {
		return {
			tab: this.$route.query.f || 'notes',
			faSearch
		};
	},

	computed: {
		notesPagination () {
			const query: string = typeof this.$route.query.q === 'string' ? this.$route.query.q : '';
			const isTag = query.trim().startsWith('#');
			return isTag ? {
				endpoint: 'notes/search-by-tag',
				limit: 10,
				params: () => ({
					tag: query.substring(1)
				})
			} : {
				endpoint: 'notes/search',
				limit: 10,
				params: () => ({ query })
			};
		},
		usersPagination () {
			const query: string = typeof this.$route.query.q === 'string' ? this.$route.query.q : '';
			const isTag = query.trim().startsWith('#');
			return isTag ? {
				endpoint: 'users/search-by-tag',
				limit: 10,
				params: () => ({
					tag: query.substring(1)
				})
			} : {
				endpoint: 'users/search',
				limit: 10,
				params: () => ({ query })
			};
		},
	},

	watch: {
		$route() {
			(this.$refs.notes as any)?.reload();
			(this.$refs.users as any)?.reload();
		},
		tab() {
			this.$router.push({
				path: this.$route.path,
				query: {
					...this.$route.query,
					f: this.tab,
				}
			});
		}
	},

	methods: {
		before() {
			Progress.start();
		},

		after() {
			Progress.done();
		}
	}
});
</script>

<style lang="scss" scoped>
	.tab {
		margin-bottom: var(--margin);
	}
</style>
