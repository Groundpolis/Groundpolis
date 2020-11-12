<template>
<div class="_section">
	<div class="_card">
		<div class="_content">
			<MkButton full primary @click="configure"><Fa :icon="faCog"/> {{ $t('notificationSetting') }}</MkButton>
		</div>
		<div class="_content">
			<MkButton full @click="readAllNotifications">{{ $t('markAsReadAllNotifications') }}</MkButton>
			<MkButton full @click="readAllUnreadNotes">{{ $t('markAsReadAllUnreadNotes') }}</MkButton>
			<MkButton full @click="readAllMessagingMessages">{{ $t('markAsReadAllTalkMessages') }}</MkButton>
		</div>
	</div>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import MkButton from '@/components/ui/button.vue';
import MkSwitch from '@/components/ui/switch.vue';
import * as os from '@/os';

export default defineComponent({
	components: {
		MkButton,
		MkSwitch,
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
