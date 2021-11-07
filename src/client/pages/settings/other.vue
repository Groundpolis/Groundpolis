<template>
<FormBase>
	<FormLink to="/settings/update">Groundpolis Update</FormLink>

	<FormSwitch v-model:value="reportError">{{ $ts.sendErrorReports }}<template #desc>{{ $ts.sendErrorReportsDescription }}</template></FormSwitch>
	<FormLink to="/settings/account-info">{{ $ts.accountInfo }}</FormLink>
	<FormLink to="/settings/labs">Groundpolis {{ $ts._labs.title }}</FormLink>

	<FormGroup>
		<template #label>{{ $ts.developer }}</template>
		<FormSwitch v-model:value="debug" @update:value="changeDebug">
			DEBUG MODE
		</FormSwitch>
		<FormButton @click="taskmanager">Task Manager</FormButton>
	</FormGroup>

	<FormGroup>
		<FormSelect v-model:value="stealRule">
			<template #label>{{ $ts.stealingRule }}</template>
			<option :value="0">{{ $ts._steal.textOnly }}</option>
			<option :value="1">{{ $ts._steal.react }}</option>
			<option :value="2">{{ $ts._steal.renote }}</option>
			<option :value="3">{{ $ts._steal.url }}</option>
		</FormSelect>
		<FormButton v-if="stealRule === 1" @click="chooseReaction">
			<mfm :text="$store.state.stealReaction" :plain="true" />
			<span style="margin-left: 16px" v-text="$ts.chooseReaction" />
		</FormButton>
	</FormGroup>

	<FormLink to="/settings/registry"><template #icon><Fa :icon="faCogs"/></template>{{ $ts.registry }}</FormLink>

	<FormGroup>
		<FormSwitch v-model:value="legacyWebkitCompatibleMode" @update:value="changeLegacyWebkitCompatibleMode">
			{{ $ts.legacyWebkitCompatibleMode }}
		</FormSwitch>
		<template #caption>{{ $ts.legacyWebkitCompatibleModeDesc }}</template>
	</FormGroup>

	<FormGroup>
		<template #label>{{ $ts.dangerousSettings }}</template>
		<FormButton danger @click="discardPostFormDraft"><Fa :icon="faTrashAlt"/> {{ $ts.discardPostFormDraft }}</FormButton>
		<template #caption>{{ $ts.discardPostFormDraftDescription }}</template>
	</FormGroup>

	<FormGroup>
		<FormButton @click="closeAccount" danger disabled>{{ $ts.closeAccount }}</FormButton>
		<template #caption>{{ $ts.closeAccountDisabledReason }}</template>
	</FormGroup>

</FormBase>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { faTrashAlt, faCogs } from '@fortawesome/free-solid-svg-icons';
import FormSwitch from '@/components/form/switch.vue';
import FormSelect from '@/components/form/select.vue';
import FormLink from '@/components/form/link.vue';
import FormBase from '@/components/form/base.vue';
import FormGroup from '@/components/form/group.vue';
import FormButton from '@/components/form/button.vue';
import * as os from '@/os';
import { debug, legacyWebkitCompatibleMode } from '@/config';
import { defaultStore } from '@/store';
import { signout } from '@/account';

export default defineComponent({
	components: {
		FormBase,
		FormSelect,
		FormSwitch,
		FormButton,
		FormLink,
		FormGroup,
	},

	data() {
		return {
			debug, faTrashAlt, faCogs, legacyWebkitCompatibleMode,
		}
	},

	computed: {
		stealRule: defaultStore.makeGetterSetter('stealRule'),
		stealReaction: defaultStore.makeGetterSetter('stealReaction'),
		reportError: defaultStore.makeGetterSetter('reportError'),
	},

	methods: {
		async chooseReaction(e) {
			this.stealReaction = (await os.reactionPicker({
				source: e.currentTarget || e.target,
				showFocus: false,
				showDislike: false,
			})).reaction;
		},

		changeDebug(v) {
			localStorage.setItem('debug', v.toString());
			location.reload();
		},

		regedit() {
			os.pageWindow('/regedit');
		},

		taskmanager() {
			os.popup(import('@/components/taskmanager.vue'), {
			}, {}, 'closed');
		},
		
		discardPostFormDraft() {
			os.dialog({
				text: this.$ts.discardPostFormDraftConfirm,
				showCancelButton: true,
			}).then(({ canceled }) => {
				if (canceled) return;
				localStorage.removeItem('drafts');
			});
		},
		
		changeLegacyWebkitCompatibleMode(v) {
			localStorage.setItem('legacyWebkitCompatibleMode', v.toString());
			location.reload();
		},

		closeAccount() {
			os.dialog({
				title: this.$ts.closeAccountConfirm,
				text: this.$ts.closeAccountConfirmDesc,
				input: {
					type: 'password'
				}
			}).then(({ canceled, result: password }) => {
				if (canceled) return;
				os.api('i/delete-account', {
					password: password
				}).then(() => {
					signout();
				});
			});
		}
	}
});
</script>
