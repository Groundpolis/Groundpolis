<template>
<FormBase>
	<FormGroup>
		<FormSwitch v-model:value="isLocked" :disabled="carefulBot" @update:value="save()">{{ $t('makeFollowManuallyApprove') }}</FormSwitch>
		<FormSwitch v-model:value="carefulBot" :disabled="isLocked" @update:value="save()">{{ $t('makeBotFollowManuallyApprove') }}</FormSwitch>
		<FormSwitch v-model:value="autoAcceptFollowed" :disabled="!isLocked && !carefulBot" @update:value="save()">{{ $t('autoAcceptFollowed') }}</FormSwitch>
		<template #caption>{{ $t('lockedAccountInfo') }}</template>
	</FormGroup>
	<FormGroup>
		<FormSwitch v-model:value="hideFF" @update:value="save()">
			{{ $t('hideFF') }}
		</FormSwitch>
		<FormSwitch v-model:value="noCrawle" @update:value="save()">
			{{ $t('noCrawle') }}
			<template #desc>{{ $t('noCrawleDescription') }}</template>
		</FormSwitch>
		<FormSwitch v-model:value="isExplorable" @update:value="save()">
			{{ $t('makeExplorable') }}
			<template #desc>{{ $t('makeExplorableDescription') }}</template>
		</FormSwitch>
	</FormGroup>
	<FormSwitch v-model:value="rememberNoteVisibility" @update:value="save()">{{ $t('rememberNoteVisibility') }}</FormSwitch>
	<FormGroup v-if="!rememberNoteVisibility">
		<template #label>{{ $t('defaultNoteVisibility') }}</template>
		<FormSelect v-model:value="defaultNoteVisibility">
			<option value="public">{{ $t('_visibility.public') }}</option>
			<option value="home">{{ $t('_visibility.home') }}</option>
			<option value="followers">{{ $t('_visibility.followers') }}</option>
			<option value="specified">{{ $t('_visibility.specified') }}</option>
			<option value="users">{{ $t('_visibility.users') }}</option>
		</FormSelect>
		<FormSwitch v-model:value="defaultNoteLocalOnly">{{ $t('_visibility.localOnly') }}</FormSwitch>
	</FormGroup>
</FormBase>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { faLockOpen } from '@fortawesome/free-solid-svg-icons';
import FormSwitch from '@/components/form/switch.vue';
import FormSelect from '@/components/form/select.vue';
import FormBase from '@/components/form/base.vue';
import FormGroup from '@/components/form/group.vue';
import * as os from '@/os';

export default defineComponent({
	components: {
		FormBase,
		FormSelect,
		FormGroup,
		FormSwitch,
	},

	data() {
		return {
			isLocked: false,
			carefulBot: false,
			autoAcceptFollowed: false,
			hideFF: false,
			noCrawle: false,
			isExplorable: false,
		}
	},

	computed: {
		defaultNoteVisibility: {
			get() { return this.$store.state.settings.defaultNoteVisibility; },
			set(value) { this.$store.dispatch('settings/set', { key: 'defaultNoteVisibility', value }); }
		},

		defaultNoteLocalOnly: {
			get() { return this.$store.state.settings.defaultNoteLocalOnly; },
			set(value) { this.$store.dispatch('settings/set', { key: 'defaultNoteLocalOnly', value }); }
		},

		rememberNoteVisibility: {
			get() { return this.$store.state.settings.rememberNoteVisibility; },
			set(value) { this.$store.dispatch('settings/set', { key: 'rememberNoteVisibility', value }); }
		},
	},

	created() {
		this.isLocked = this.$store.state.i.isLocked;
		this.hideFF = this.$store.state.i.hideFF;
		this.carefulBot = this.$store.state.i.carefulBot;
		this.autoAcceptFollowed = this.$store.state.i.autoAcceptFollowed;
		this.noCrawle = this.$store.state.i.noCrawle;
		this.isExplorable = this.$store.state.i.isExplorable;
	},

	mounted() {
		this.$emit('info', this.INFO);
	},

	methods: {
		save() {
			os.api('i/update', {
				isLocked: !!this.isLocked,
				hideFF: !!this.hideFF,
				carefulBot: !!this.carefulBot,
				autoAcceptFollowed: !!this.autoAcceptFollowed,
				noCrawle: !!this.noCrawle,
				isExplorable: !!this.isExplorable,
			});
		}
	}
});
</script>
