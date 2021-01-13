<template>
<div class="_section">
	<div v-if="hideFF === null" />
	<section v-else-if="hideFF" class="_section">
		<div class="_content">
			{{ $ts.thisInformationIsNotAvailable }}
		</div>
	</section>
	<MkPagination v-else :pagination="pagination" #default="{items}" class="mk-following-or-followers _content" ref="list">
		<div class="users">
			<MkUserInfo class="user" v-for="user in items.map(x => type === 'following' ? x.followee : x.follower)" :user="user" :key="user.id"/>
		</div>
	</MkPagination>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MkUserInfo from '@/components/user-info.vue';
import MkPagination from '@/components/ui/pagination.vue';
import { userPage, acct } from '../../filters/user';

export default defineComponent({
	components: {
		MkPagination,
		MkUserInfo,
	},

	props: {
		user: {
			type: Object,
			required: true
		},
		type: {
			type: String,
			required: true
		},
	},

	data() {
		return {
			pagination: {
				endpoint: () => this.type === 'following' ? 'users/following' : 'users/followers',
				limit: 20,
				params: {
					userId: this.user.id,
				}
			},
			hideFF: null as boolean | null
		};
	},

	watch: {
		type() {
			this.$refs.list.reload();
		},

		user() {
			this.$refs.list.reload();
		}
	},

	async mounted() {
		const i = this.$i;
		if (i.username === this.user.username && i.host === this.user.host) {
			// 自分自身であれば隠さない
			this.hideFF = false;
			return;
		}
		this.hideFF = this.user.hideFF;
	}, 
	methods: {
		userPage,
		
		acct
	}
});
</script>

<style lang="scss" scoped>
.mk-following-or-followers {
	> .users {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		grid-gap: var(--margin);
	}
}
</style>
