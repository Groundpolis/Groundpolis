<template>
	<div class="user _panel">
		<mk-avatar class="avatar" :user="user"/>
			<div class="body">
				<div class="name">
					<router-link class="name" :to="user | userPage" v-user-preview="user.id"><mk-user-name :user="user"/></router-link>
					<span class="username"><mk-acct :user="user"/></span>
				</div>
				<div class="description">
					<mfm v-if="user.description" :text="user.description" :is-note="false" :author="user" :i="$store.state.i" :custom-emojis="user.emojis"/>
					<span v-else class="empty">{{ $t('noAccountDescription') }}</span>
				</div>
			</div>
			<mk-follow-button class="koudoku-button" v-if="$store.getters.isSignedIn && user.id != $store.state.i.id" :user="user" mini/>
	</div>
</template>

<script lang="ts">
import Vue from 'vue';
import MkFollowButton from './follow-button.vue';

export default Vue.extend({
	components: {
		MkFollowButton,
	},

	props: {
		user: {
			required: true
		},
	},
});
</script>

<style lang="scss" scoped>
.user {
	position: relative;
	display: flex;
	padding: 16px;
	border-bottom: solid 1px var(--divider);

	&:last-child {
		border-bottom: none;
	}

	> .avatar {
		display: block;
		flex-shrink: 0;
		margin: 0 12px 0 0;
		width: 42px;
		height: 42px;
		border-radius: 8px;
	}

	> .body {
		flex: 1;

		> .name {
			font-weight: bold;
					
			> .name {
				margin-right: 8px;
			}

			> .username {
				opacity: 0.7;
			}
		}

		> .description {
			font-size: 90%;

			> .empty {
				opacity: 0.7;
			}
		}
	}

	> .koudoku-button {
		flex-shrink: 0;
	}
}
</style>
