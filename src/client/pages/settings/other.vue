<template>
<FormBase>
	<FormLink to="/settings/account-info">{{ $t('accountInfo') }}</FormLink>
	<FormLink to="/settings/labs">Groundpolis {{ $t('_labs.title') }}</FormLink>

	<FormGroup>
		<template #label>{{ $t('developer') }}</template>
		<FormSwitch v-model:value="debug" @update:value="changeDebug">
			DEBUG MODE
		</FormSwitch>
		<FormLink to="/settings/regedit">RegEdit</FormLink>
		<FormButton @click="taskmanager">Task Manager</FormButton>
	</FormGroup>

	<FormGroup>
		<FormSelect v-model:value="stealRule">
			<template #label>{{ $t('stealingRule') }}</template>
			<option :value="0">{{ $t('_steal.textOnly') }}</option>
			<option :value="1">{{ $t('_steal.react') }}</option>
			<option :value="2">{{ $t('_steal.renote') }}</option>
			<option :value="3">{{ $t('_steal.url') }}</option>
		</FormSelect>
		<FormButton v-if="stealRule === 1" @click="chooseReaction">
			<mfm :text="$store.state.settings.stealReaction" :plain="true" />
			<span style="margin-left: 16px" v-text="$t('chooseReaction')" />
		</FormButton>
	</FormGroup>

	<FormGroup>
		<template #label>{{ $t('dangerousSettings') }}</template>
		<FormButton danger @click="discardPostFormDraft"><Fa :icon="faTrashAlt"/> {{ $t('discardPostFormDraft') }}</FormButton>
		<template #caption>{{ $t('discardPostFormDraftDescription') }}</template>
	</FormGroup>
</FormBase>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from 'vue';
import { faEllipsisH, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import FormSwitch from '@/components/form/switch.vue';
import FormSelect from '@/components/form/select.vue';
import FormLink from '@/components/form/link.vue';
import FormBase from '@/components/form/base.vue';
import FormGroup from '@/components/form/group.vue';
import FormButton from '@/components/form/button.vue';
import * as os from '@/os';
import { debug } from '@/config';

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
			debug,
			faTrashAlt,
		}
	},

	computed: {
		stealRule: {
			get() { return this.$store.state.settings.stealRule; },
			set(value) { this.$store.dispatch('settings/set', { key: 'stealRule', value }); }
		},
		stealReaction: {
			get() { return this.$store.state.settings.stealReaction; },
			set(value) { this.$store.dispatch('settings/set', { key: 'stealReaction', value }); }
		},
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
			localStorage.removeItem('drafts');
		},
	}
});
</script>
