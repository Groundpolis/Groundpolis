<template>
<header class="kkwtjztg">
	<router-link class="name-set" :to="note.user | userPage" v-user-preview="note.user.id">
		<template v-if="$store.state.device.noteNameDisplayMode === 0">
			<mk-user-name class="name" :user="note.user"/>
			<span class="username"><mk-acct :user="note.user"/></span>
		</template>
		<template v-else>
			<span v-if="$store.state.device.noteNameDisplayMode !== 2" class="username"><mk-acct :user="note.user"/></span>
			<mk-user-name v-if="$store.state.device.noteNameDisplayMode !== 3" class="name" :user="note.user"/>
		</template>
	</router-link>
	<span class="is-bot" v-if="note.user.isBot">bot</span>
	<span class="admin" v-if="note.user.isAdmin"><fa :icon="faBookmark"/></span>
	<span class="moderator" v-if="!note.user.isAdmin && note.user.isModerator"><fa :icon="farBookmark"/></span>
	<span class="verified" v-if="note.user.isVerified">
		<fa-layers>
			<fa :icon="faCertificate" :style="{ color: 'var(--accent)' }"/>
			<fa :icon="faCheck" transform="shrink-6" size="xs" :style="{ color: 'var(--panel)' }"/>
		</fa-layers>
	</span>
	<span class="premium" v-if="note.user.isPremium"><fa :icon="faCrown"/></span>
	<div class="info">
		<span class="mobile" v-if="note.viaMobile"><fa :icon="faMobileAlt"/></span>
		<router-link v-if="!detail" class="created-at" :to="note | notePage">
			<mk-time :time="note.createdAt"/>
		</router-link>
		<span class="visibility" v-if="note.visibility !== 'public'">
			<fa v-if="note.visibility === 'home'" :icon="faHome"/>
			<fa v-if="note.visibility === 'followers'" :icon="faUnlock"/>
			<fa v-if="note.visibility === 'specified'" :icon="faEnvelope"/>
			<fa v-if="note.visibility === 'users'" :icon="faUsers"/>
		</span>
		<span class="localOnly" v-if="note.localOnly"><fa :icon="faHeart"/></span>
		<span class="remoteFollowersOnly" v-if="note.remoteFollowersOnly"><fa :icon="faHeartbeat"/></span>
	</div>
</header>
</template>

<script lang="ts">
import Vue from 'vue';
import { faHome, faUnlock, faEnvelope, faMobileAlt, faBookmark, faCertificate, faCheck, faUsers, faHeart, faGlobeAmericas, faHeartbeat, faCrown, faProjectDiagram } from '@fortawesome/free-solid-svg-icons';
import { faBookmark as farBookmark } from '@fortawesome/free-regular-svg-icons';

export default Vue.extend({
	props: {
		note: {
			type: Object,
			required: true
		},
		detail: {
			type: Boolean,
			default: false,
		}
	},

	data() {
		return {
			faHome, faUnlock, faEnvelope, faMobileAlt, faBookmark, farBookmark, faCertificate, faCheck, faUsers, faHeart, faGlobeAmericas, faHeartbeat, faCrown, faProjectDiagram
		};
	}
});
</script>

<style lang="scss" scoped>
.kkwtjztg {
	display: flex;
	align-items: baseline;
	white-space: nowrap;

	.name-set {
		overflow: hidden;
		font-size: 1em;
		font-weight: bold;
		text-decoration: none;
		text-overflow: ellipsis;
		> .name {
			margin: 0 .5em 0 0;
			padding: 0;
			overflow: hidden;
			color: var(--noteHeaderName);
			font-size: 1em;
			font-weight: bold;
			text-decoration: none;
			text-overflow: ellipsis;

			&:hover {
				text-decoration: underline;
			}
		}

		> .username {
			margin: 0 .5em 0 0;
			overflow: hidden;
			text-overflow: ellipsis;
		}
	}

	> .is-bot {
		flex-shrink: 0;
		align-self: center;
		margin: 0 .5em 0 0;
		padding: 1px 6px;
		font-size: 80%;
		border: solid 1px var(--divider);
		border-radius: 3px;
	}

	> .admin,
	> .moderator {
		margin-right: 0.5em;
		color: var(--badge);
	}

	> .premium {
		margin-right: 0.5em;
		color: var(--premium);
	}

	> .verified {
		margin-right: 0.5em;
	}

	> .info {
		margin-left: auto;
		font-size: 0.9em;

		> .mobile {
			margin-right: 8px;
		}

		> .visibility {
			margin-left: 8px;
		}

		> .localOnly {
			margin-left: 8px;
		}

		> .remoteFollowersOnly {
			margin-left: 8px;
		}

		> .global {
			margin-left: 8px;
			color: var(--accent);
		}
	}
}
</style>
