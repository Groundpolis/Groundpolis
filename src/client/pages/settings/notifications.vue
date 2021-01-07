<template>
<FormBase>
	<FormLink @click="configure">{{ $ts.notificationSetting }}</FormLink>
	<FormGroup>
		<FormButton @click="readAllNotifications">{{ $ts.markAsReadAllNotifications }}</FormButton>
		<FormButton @click="readAllUnreadNotes">{{ $ts.markAsReadAllUnreadNotes }}</FormButton>
		<FormButton @click="readAllMessagingMessages">{{ $ts.markAsReadAllTalkMessages }}</FormButton>
	</FormGroup>
</FormBase>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import FormButton from '@/components/form/button.vue';
import FormLink from '@/components/form/link.vue';
import FormBase from '@/components/form/base.vue';
import FormGroup from '@/components/form/group.vue';
import * as os from '@/os';

export default defineComponent({
	components: {
		FormBase,
		FormLink,
		FormButton,
		FormGroup,
	},
	
	data() {
		return {
			faCog
		}
	},

	methods: {
		readAllUnreadNotes() {
			os.api('i/read-all-unread-notes');
		},

		readAllMessagingMessages() {
			os.api('i/read-all-messaging-messages');
		},

		readAllNotifications() {
			os.api('notifications/mark-all-as-read');
		},

		configure() {
			os.openGlobalNotificationSetting();
		},
	}
});
</script>
