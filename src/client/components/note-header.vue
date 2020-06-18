<template>
<header class="kkwtjztg">
	<span class="username">{{ $t('note') }} ID: {{ note.id }}</span>
	<span class="is-myself" v-if="note.isMyNote">{{ $t('you') }}</span>
	<span class="announcement" v-tooltip="$t('thisIsAnnouncement')" v-if="note.isAnnouncement"><fa :icon="faBullhorn" /></span>
	<div class="info">
		<router-link :to="note | notePage" class="username"><mk-time :time="note.createdAt"/></router-link>

		<span class="visibility" v-if="note.visibility !== 'public'">
			<fa v-if="note.visibility === 'followers'" :icon="faLock"/>
		</span>
	</div>
</header>
</template>

<script lang="ts">
import Vue from 'vue';
import { faLock, faMicrophoneAltSlash, faMobileAlt, faBookmark, faBiohazard, faBullhorn } from '@fortawesome/free-solid-svg-icons';
import { faBookmark as farBookmark } from '@fortawesome/free-regular-svg-icons';

export default Vue.extend({
	props: {
		note: {
			type: Object,
			required: true
		},
	},

	data() {
		return {
			faLock, faMicrophoneAltSlash, faMobileAlt, faBookmark, farBookmark, faBiohazard, faBullhorn
		};
	}
});
</script>

<style lang="scss" scoped>
.kkwtjztg {
	display: flex;
	align-items: baseline;
	white-space: nowrap;
	margin-bottom: 12px;

	> .name {
		display: block;
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

	> .is-myself {
		flex-shrink: 0;
		align-self: center;
		margin: 0 .5em 0 0;
		padding: 1px 6px;
		font-size: 80%;
		border: solid 1px var(--divider);
		border-radius: 3px;
	}

	> .admin,
	> .moderator,
	> .announcement {
		margin-right: 0.5em;
		color: var(--badge);
	}

	> .username {
		margin: 0 .5em 0 0;
		font-weight: bold;
		overflow: hidden;
		text-overflow: ellipsis;
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
	}
}
</style>
