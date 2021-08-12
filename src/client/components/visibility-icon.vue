<template>
	<FaLayers>
		<Fa v-if="visibility === 'public'" :icon="faGlobe" />
		<Fa v-else-if="visibility === 'home'" :icon="faHome" />
		<Fa v-else-if="visibility === 'followers'" :icon="faLock" />
		<Fa v-else-if="visibility === 'specified'" :icon="faEnvelope" />
		<Fa v-else-if="visibility === 'users'" :icon="faUsers" />
		<Fa v-if="localOnly" :icon="faHeart" style="color: var(--error)" size="xs" transform="shrink-1 right-6 down-6" />
		<Fa v-if="remoteFollowersOnly" :icon="faHeartbeat" style="color: var(--error)" size="xs" transform="shrink-1 right-6 down-6" />
	</FaLayers>
</template>

<script lang="ts">
import { NoteVisibility } from '@/../types';
import { defineComponent, PropType } from 'vue';

import {
	faGlobe,
	faHome,
	faLock,
	faEnvelope,
	faUsers,
	faHeart,
	faHeartbeat,
} from '@fortawesome/free-solid-svg-icons';

import { markRawAll } from '@/scripts/mark-raw-all';

markRawAll(
	faGlobe,
	faHome,
	faLock,
	faEnvelope,
	faUsers,
	faHeart,
	faHeartbeat,
);

export default defineComponent({
	name: 'VisibilityIcon',
	props: {
		visibility: {
			type: String as PropType<NoteVisibility>,
			required: true,
		},
		localOnly: {
			type: Boolean,
			default: false,
		},
		remoteFollowersOnly: {
			type: Boolean,
			default: false,
		},
	},
	setup() {
		return {
			faGlobe,
			faHome,
			faLock,
			faEnvelope,
			faUsers,
			faHeart,
			faHeartbeat,
		};
	},
});
</script>
