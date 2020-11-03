<template>
<header class="kkwtjztg">
	<MkA class="name-set" :to="userPage(note.user)" v-user-preview="note.user.id">
		<template v-if="$store.state.device.noteNameDisplayMode === 0">
				<MkUserName class="name" :user="note.user"/>
				<span class="is-bot" v-if="note.user.isBot">bot</span>
				<span class="username"><MkAcct :user="note.user"/></span>
		</template>
		<template v-else>
				<span v-if="$store.state.device.noteNameDisplayMode !== 2" class="username"><MkAcct :user="note.user"/></span>
				<MkUserName class="name" v-if="$store.state.device.noteNameDisplayMode !== 3" :user="note.user"/>
				<span class="is-bot" v-if="note.user.isBot">bot</span>
		</template>
	</MkA>
	<span class="admin" v-if="note.user.isAdmin"><Fa :icon="faBookmark"/></span>
	<span class="verified" v-if="note.user.isVerified">
		<FaLayers>
			<Fa :icon="faCertificate" :style="{ color: 'var(--accent)' }"/>
			<Fa :icon="faCheck" transform="shrink-6" size="xs" :style="{ color: 'var(--panel)' }"/>
		</FaLayers>
	</span>
	<span class="premium" v-if="note.user.isPremium"><Fa :icon="faCrown"/></span>
	<div class="info">
		<span class="mobile" v-if="note.viaMobile"><Fa :icon="faMobileAlt"/></span>
		<MkA class="created-at" :to="notePage(note)">
			<MkTime :time="note.createdAt"/>
		</MkA>
		<span class="visibility" v-if="note.visibility !== 'public'">
			<Fa v-if="note.visibility === 'home'" :icon="faHome"/>
			<Fa v-if="note.visibility === 'followers'" :icon="faUnlock"/>
			<Fa v-if="note.visibility === 'specified'" :icon="faEnvelope"/>
			<Fa v-if="note.visibility === 'users'" :icon="faUsers"/>
		</span>
		<span class="localOnly" v-if="note.localOnly"><Fa :icon="faHeart"/></span>
		<span class="remoteFollowersOnly" v-if="note.remoteFollowersOnly"><Fa :icon="faHeartbeat"/></span>
	</div>
</header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { faHome, faUnlock, faEnvelope, faMobileAlt, faBookmark, faCertificate, faCheck, faUsers, faHeart, faHeartbeat, faCrown } from '@fortawesome/free-solid-svg-icons';
import { faBookmark as farBookmark } from '@fortawesome/free-regular-svg-icons';
import notePage from '../filters/note';
import { userPage } from '../filters/user';
import * as os from '@/os';

export default defineComponent({
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
	},

	methods: {
		notePage,
		userPage
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
