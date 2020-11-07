<template>
<div>
	<div class="_section">
		<MkInfo warn>{{ $t('editTheseSettingsMayBreakAccount') }}</MkInfo>
	</div>

	<MkTab v-model:value="tab" :items="[
		{ label: 'Account (readonly)', value: 'settings' },
		{ label: 'Device', value: 'device' },
		{ label: 'Device (per account)', value: 'deviceUser' },
	]"/>

	<div v-if="tab ==='settings'" class="_content">
		<MkTextarea readonly v-model:value="settings" code tall></MkTextarea>
		<!--<MkButton @click="saveSettings">Save</MkButton>-->
	</div>
	<div v-else-if="tab ==='device'" class="_content">
		<MkTextarea v-model:value="deviceSettings" code tall></MkTextarea>
		<MkButton @click="saveDeviceSettings">Save</MkButton>
	</div>
	<div v-else-if="tab ==='deviceUser'" class="_content">
		<MkTextarea v-model:value="deviceUserSettings" code tall></MkTextarea>
		<MkButton @click="saveDeviceUserSettings">Save</MkButton>
	</div>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { faCode } from '@fortawesome/free-solid-svg-icons';
import * as JSON5 from 'json5';
import MkInfo from '@/components/ui/info.vue';
import MkTab from '@/components/tab.vue';
import MkButton from '@/components/ui/button.vue';
import MkTextarea from '@/components/ui/textarea.vue';
import * as os from '@/os';

export default defineComponent({
	components: {
		MkInfo, MkButton, MkTextarea, MkTab
	},

	data() {
		return {
			INFO: {
				title: 'RegEdit',
				icon: faCode
			},
			tab: 'settings',

			settings: JSON5.stringify(this.$store.state.settings, null, '\t'),
			deviceSettings: JSON5.stringify(this.$store.state.device, null, '\t'),
			deviceUserSettings: JSON5.stringify(this.$store.state.deviceUser, null, '\t'),
		};
	},

	methods: {
		saveDeviceSettings() {
			const obj = JSON5.parse(this.deviceSettings);
			this.$store.commit('device/overwrite', obj);
		},

		saveDeviceUserSettings() {
			const obj = JSON5.parse(this.deviceUserSettings);
			this.$store.commit('deviceUser/overwrite', obj);
		},
	}
});
</script>
