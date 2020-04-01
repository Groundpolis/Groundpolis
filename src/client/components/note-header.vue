<template>
<header class="kkwtjztg">
	<router-link :to="note | notePage" class="username">ID: {{ note.id }}</router-link>
	<span class="is-myself" v-if="note.user.id === $store.state.i.id">{{ $t('you') }}</span>
	<div class="info">
		<mk-time :time="note.createdAt"/>
	</div>
</header>
</template>

<script lang="ts">
import Vue from 'vue';
import { faHome, faUnlock, faEnvelope, faMobileAlt, faBookmark } from '@fortawesome/free-solid-svg-icons';
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
			faHome, faUnlock, faEnvelope, faMobileAlt, faBookmark, farBookmark
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
	> .moderator {
		margin-right: 0.5em;
		color: var(--badge);
	}

	> .username {
		margin: 0 .5em 0 0;
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
	}
}
</style>
