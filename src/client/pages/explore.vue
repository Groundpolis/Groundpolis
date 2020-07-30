<template>
<div>
	<portal v-if="!meta.disableFeatured" to="header">
		<mk-tab v-model="tab" style="height: 100%" :items="[{ label: $t('explore'), value: '/explore', icon: faHashtag }, { label: $t('featured'), value: '/featured', icon: faFireAlt }]"/>
	</portal>
	<template v-else>
		<portal to="icon"><fa :icon="faHashtag"/></portal>
		<portal to="title">{{ $t('explore') }}</portal>
	</template>

	<x-search @search="search"/>

	<template v-if="tab === '/explore'">
		<mk-container :body-togglable="true" :expanded="true" ref="tags">
			<template #header><fa :icon="faHashtag" fixed-width/>{{ $t('popularTags') }}</template>

			<div class="vxjfqztj">
				<router-link v-for="tag in tagsLocal" :to="`/explore/tags/${tag.tag}`" :key="'local:' + tag.tag" class="local">{{ tag.tag }}</router-link>
				<router-link v-for="tag in tagsRemote" :to="`/explore/tags/${tag.tag}`" :key="'remote:' + tag.tag">{{ tag.tag }}</router-link>
			</div>
		</mk-container>

		<div class="localfedi7 _panel" v-if="meta && stats && tag == null" :style="{ backgroundImage: meta.bannerUrl ? `url(${meta.bannerUrl})` : null }">
			<header><span>{{ meta.name || 'Groundpolis' }}</span></header>
			<div><span>{{ $t('exploreUsersCount', { count: num(stats.originalUsersCount) }) }}</span></div>
		</div>

		<template v-if="tag == null">
			<x-user-list :pagination="pinnedUsers" :expanded="false">
				<fa :icon="faBookmark" fixed-width/>{{ $t('pinnedUsers') }}
			</x-user-list>
			<x-user-list :pagination="popularUsers" :expanded="false">
				<fa :icon="faChartLine" fixed-width/>{{ $t('popularUsers') }}
			</x-user-list>
			<x-user-list :pagination="recentlyUpdatedUsers" :expanded="false">
				<fa :icon="faCommentAlt" fixed-width/>{{ $t('recentlyUpdatedUsers') }}
			</x-user-list>
			<x-user-list :pagination="recentlyRegisteredUsers" :expanded="false">
				<fa :icon="faPlus" fixed-width/>{{ $t('recentlyRegisteredUsers') }}
			</x-user-list>
		</template>

		<div class="localfedi7 _panel" v-if="tag == null" :style="{ backgroundImage: `url(/assets/fedi.jpg)`, marginTop: 'var(--margin)' }">
			<header><span>{{ $t('exploreFediverse') }}</span></header>
		</div>

		<x-user-list v-if="tag != null" :pagination="tagUsers" :key="`${tag}`">
			<fa :icon="faHashtag" fixed-width/>{{ tag }}
		</x-user-list>
		<template v-if="tag == null">
			<x-user-list :pagination="popularUsersF" :expanded="false">
				<fa :icon="faChartLine" fixed-width/>{{ $t('popularUsers') }}
			</x-user-list>
			<x-user-list :pagination="recentlyUpdatedUsersF" :expanded="false">
				<fa :icon="faCommentAlt" fixed-width/>{{ $t('recentlyUpdatedUsers') }}
			</x-user-list>
			<x-user-list :pagination="recentlyRegisteredUsersF" :expanded="false">
				<fa :icon="faRocket" fixed-width/>{{ $t('recentlyDiscoveredUsers') }}
			</x-user-list>
		</template>
	</template>

	<template v-if="tab === '/featured'">
		<x-notes ref="notes" :pagination="featuredPagination" @before="before" @after="after"/>
	</template>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { faChartLine, faPlus, faHashtag, faRocket, faFireAlt, faSearch } from '@fortawesome/free-solid-svg-icons';
import { faBookmark, faCommentAlt } from '@fortawesome/free-regular-svg-icons';
import XUserList from '../components/user-list.vue';
import XNotes from '../components/notes.vue';
import XSearch from '../components/search.vue';
import MkContainer from '../components/ui/container.vue';
import MkTab from '../components/tab.vue';
import Progress from '../scripts/loading';

export default Vue.extend({
	metaInfo() {
		return {
			title: this.$t('explore') as string
		};
	},

	components: {
		XUserList,
		XNotes,
		XSearch,
		MkContainer,
		MkTab,
	},

	props: {
		tag: {
			type: String,
			required: false
		}
	},

	data() {
		return {
			pinnedUsers: { endpoint: 'pinned-users' },
			popularUsers: { endpoint: 'users', limit: 10, noPaging: true, params: {
				state: 'alive',
				origin: 'local',
				sort: '+follower',
			} },
			recentlyUpdatedUsers: { endpoint: 'users', limit: 10, noPaging: true, params: {
				origin: 'local',
				sort: '+updatedAt',
			} },
			recentlyRegisteredUsers: { endpoint: 'users', limit: 10, noPaging: true, params: {
				origin: 'local',
				state: 'alive',
				sort: '+createdAt',
			} },
			popularUsersF: { endpoint: 'users', limit: 10, noPaging: true, params: {
				state: 'alive',
				origin: 'remote',
				sort: '+follower',
			} },
			recentlyUpdatedUsersF: { endpoint: 'users', limit: 10, noPaging: true, params: {
				origin: 'combined',
				sort: '+updatedAt',
			} },
			recentlyRegisteredUsersF: { endpoint: 'users', limit: 10, noPaging: true, params: {
				origin: 'combined',
				sort: '+createdAt',
			} },
			featuredPagination: {
				endpoint: 'notes/featured',
				limit: 10,
				offsetMode: true
			},
			tagsLocal: [],
			tagsRemote: [],
			stats: null,
			num: Vue.filter('number'),
			tab: this.$route.path,
			faBookmark, faChartLine, faCommentAlt, faPlus, faHashtag, faRocket, faFireAlt, faSearch,
		};
	},

	computed: {
		meta() {
			return this.$store.state.instance.meta;
		},
		tagUsers(): any {
			return {
				endpoint: 'hashtags/users',
				limit: 30,
				params: {
					tag: this.tag,
					origin: 'combined',
					sort: '+follower',
				}
			};
		},
	},

	watch: {
		tag() {
			if (this.$refs.tags) this.$refs.tags.toggleContent(this.tag == null);
		},
		tab() {
			this.$router.push(this.tab);
		}
	},

	created() {
		this.$root.api('hashtags/list', {
			sort: '+attachedLocalUsers',
			attachedToLocalUserOnly: true,
			limit: 30
		}).then(tags => {
			this.tagsLocal = tags;
		});
		this.$root.api('hashtags/list', {
			sort: '+attachedRemoteUsers',
			attachedToRemoteUserOnly: true,
			limit: 30
		}).then(tags => {
			this.tagsRemote = tags;
		});
		this.$root.api('stats').then(stats => {
			this.stats = stats;
		});
	},

	methods: {
		before() {
			Progress.start();
		},

		after() {
			Progress.done();
		},

		search(q: string) {
			this.$router.push({
				path: '/search',
				query: { q },
			});
		},
	}
});
</script>

<style lang="scss" scoped>
.localfedi7 {
	color: #fff;
	padding: 16px;
	height: 80px;
	background-position: 50%;
	background-size: cover;
	margin: var(--margin) 0;

	> * {
		&:not(:last-child) {
			margin-bottom: 8px;
		}

		> span {
			display: inline-block;
			padding: 6px 8px;
			background: rgba(0, 0, 0, 0.7);
		}
	}

	> header {
		font-size: 20px;
		font-weight: bold;
	}

	> div {
		font-size: 14px;
		opacity: 0.8;
	}
}

.vxjfqztj {
	padding: 16px;

	> * {
		margin-right: 16px;

		&.local {
			font-weight: bold;
		}
	}
}
</style>
