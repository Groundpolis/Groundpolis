<template>
<div>
	<div class="localfedi7" v-if="meta && stats && tag == null" :style="{ backgroundImage: meta.bannerUrl ? `url(${meta.bannerUrl})` : null }">
		<header>{{ $t('explore', { host: meta.name }) }}</header>
		<div>{{ $t('users-info', { users: num(stats.originalUsersCount) }) }}</div>
	</div>

	<template v-if="tag == null">
		<mk-user-list :make-promise="verifiedUsers" :expanded="false">
			<fa :icon="faBookmark" fixed-width/>{{ $t('verified-users') }}
		</mk-user-list>
		<mk-user-list :make-promise="popularUsers" :expanded="false">
			<fa :icon="faChartLine" fixed-width/>{{ $t('popular-users') }}
		</mk-user-list>
		<mk-user-list :make-promise="recentlyUpdatedUsers" :expanded="false">
			<fa :icon="faCommentAlt" fixed-width/>{{ $t('recently-updated-users') }}
		</mk-user-list>
		<mk-user-list :make-promise="recentlyRegisteredUsers" :expanded="false">
			<fa :icon="faPlus" fixed-width/>{{ $t('recently-registered-users') }}
		</mk-user-list>
	</template>

	<div class="localfedi7" v-if="tag == null" :style="{ backgroundImage: `url(/assets/fedi.jpg)` }">
		<header>{{ $t('explore-fediverse') }}</header>
	</div>

	<ui-container :body-togglable="true" :expanded="false" ref="tags">
		<template #header><fa :icon="faHashtag" fixed-width/>{{ $t('popular-tags') }}</template>

		<div class="vxjfqztj">
			<router-link v-for="tag in tagsLocal" :to="`/explore/tags/${tag.tag}`" :key="'local:' + tag.tag" class="local">{{ tag.tag }}</router-link>
			<router-link v-for="tag in tagsRemote" :to="`/explore/tags/${tag.tag}`" :key="'remote:' + tag.tag">{{ tag.tag }}</router-link>
		</div>
	</ui-container>

	<mk-user-list v-if="tag != null" :make-promise="tagUsers" :key="`${tag}`">
		<fa :icon="faHashtag" fixed-width/>{{ tag }}
	</mk-user-list>

	<template v-if="tag == null">
		<mk-user-list :make-promise="recommendedUsers" :expanded="false">
			<fa icon="users" fixed-width/>{{ $t('recommended-users') }}
		</mk-user-list>
		<mk-user-list :make-promise="recentlyRegisteredUsersF" :expanded="false">
			<fa :icon="faPlus" fixed-width/>{{ $t('recently-found-users') }}
		</mk-user-list>
	</template>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import i18n from '../../../i18n';
import { faChartLine, faPlus, faHashtag } from '@fortawesome/free-solid-svg-icons';
import { faBookmark, faCommentAlt } from '@fortawesome/free-regular-svg-icons';

export default Vue.extend({
	i18n: i18n('common/views/pages/explore.vue'),

	props: {
		tag: {
			type: String,
			required: false
		}
	},

	inject: {
		inNakedDeckColumn: {
			default: false
		}
	},

	data() {
		return {
			verifiedUsers: () => this.$root.api('users', {
				state: 'verified',
				origin: 'local',
				sort: '+follower',
				limit: 10
			}),
			recommendedUsers: () => this.$root.api('users/recommendation', {
				limit: 10,
			}),
			popularUsers: () => this.$root.api('users', {
				state: 'alive',
				origin: 'local',
				sort: '+follower',
				limit: 10
			}),
			recentlyUpdatedUsers: () => this.$root.api('users', {
				origin: 'local',
				sort: '+updatedAt',
				limit: 10
			}),
			recentlyRegisteredUsers: () => this.$root.api('users', {
				origin: 'local',
				state: 'alive',
				sort: '+createdAt',
				limit: 10
			}),
			recentlyUpdatedUsersF: () => this.$root.api('users', {
				sort: '+updatedAt',
				limit: 10
			}),
			recentlyRegisteredUsersF: () => this.$root.api('users', {
				sort: '+createdAt',
				limit: 10
			}),
			tagsLocal: [],
			tagsRemote: [],
			stats: null,
			meta: null,
			num: Vue.filter('number'),
			faBookmark, faChartLine, faCommentAlt, faPlus, faHashtag
		};
	},

	computed: {
		tagUsers(): () => Promise<any> {
			return () => this.$root.api('hashtags/users', {
				tag: this.tag,
				state: 'alive',
				sort: '+follower',
				limit: 30
			});
		},
	},

	watch: {
		tag() {
			if (this.$refs.tags) this.$refs.tags.toggleContent(this.tag == null);
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
		this.$root.getMeta().then(meta => {
			this.meta = meta;
		});
	},

	mounted() {
		document.title = this.$root.instanceName;
	},
});
</script>

<style lang="stylus" scoped>
.localfedi7
	overflow hidden
	background var(--face)
	color #fff
	text-shadow 0 0 8px #000
	border-radius 6px
	padding 16px
	margin-top 16px
	margin-bottom 16px
	height 80px
	background-position 50%
	background-size cover

	> header
		font-size 20px
		font-weight bold

	> div
		font-size 14px
		opacity 0.8

.localfedi7:first-child
	margin-top 0

.vxjfqztj
	padding 16px

	> *
		margin-right 16px

		&.local
			font-weight bold

</style>
