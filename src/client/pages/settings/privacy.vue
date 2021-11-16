<template>
<FormBase>
	<FormGroup>
		<FormSwitch v-model:value="isLocked" :disabled="carefulBot" @update:value="save()">{{ $ts.makeFollowManuallyApprove }}</FormSwitch>
		<FormSwitch v-model:value="carefulBot" :disabled="isLocked" @update:value="save()">{{ $ts.makeBotFollowManuallyApprove }}</FormSwitch>
		<FormSwitch v-model:value="autoAcceptFollowed" :disabled="!isLocked && !carefulBot" @update:value="save()">{{ $ts.autoAcceptFollowed }}</FormSwitch>
		<template #caption>{{ $ts.lockedAccountInfo }}</template>
	</FormGroup>
	<FormSwitch v-model:value="publicReactions" @update:value="save()">
		{{ $ts.makeReactionsPublic }}
		<template #desc>{{ $ts.makeReactionsPublicDescription }}</template>
	</FormSwitch>
	<FormGroup>
		<FormSwitch v-model:value="hideFF" @update:value="save()">
			{{ $ts.hideFF }}
		</FormSwitch>
		<FormSwitch v-model:value="noCrawle" @update:value="save()">
			{{ $ts.noCrawle }}
			<template #desc>{{ $ts.noCrawleDescription }}</template>
		</FormSwitch>
	</FormGroup>
	<FormSwitch v-model:value="isExplorable" @update:value="save()">
		{{ $ts.makeExplorable }}
		<template #desc>{{ $ts.makeExplorableDescription }}</template>
	</FormSwitch>
	<FormSwitch v-model:value="rememberNoteVisibility" @update:value="save()">{{ $ts.rememberNoteVisibility }}</FormSwitch>
	<FormGroup v-if="!rememberNoteVisibility">
		<template #label>{{ $ts.defaultNoteVisibility }}</template>
		<FormSelect v-model:value="defaultNoteVisibility">
			<option value="public">{{ $ts._visibility.public }}</option>
			<option value="home">{{ $ts._visibility.home }}</option>
			<option value="followers">{{ $ts._visibility.followers }}</option>
			<option value="specified">{{ $ts._visibility.specified }}</option>
			<option value="users">{{ $ts._visibility.users }}</option>
		</FormSelect>
		<FormSwitch v-model:value="defaultNoteLocalOnly">{{ $ts._visibility.localOnly }}</FormSwitch>
		<FormSwitch v-model:value="defaultNoteRemoteFollowersOnly">{{ $ts._visibility.remoteFollowersOnly }}</FormSwitch>
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
import { defaultStore } from '@/store';

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
			publicReactions: false,
		};
	},

	computed: {
		defaultNoteVisibility: defaultStore.makeGetterSetter('defaultNoteVisibility'),
		defaultNoteLocalOnly: defaultStore.makeGetterSetter('defaultNoteLocalOnly'),
		defaultNoteRemoteFollowersOnly: defaultStore.makeGetterSetter('defaultNoteRemoteFollowersOnly'),
		rememberNoteVisibility: defaultStore.makeGetterSetter('rememberNoteVisibility'),
	},

	created() {
		this.isLocked = this.$i.isLocked;
		this.hideFF = this.$i.hideFF;
		this.carefulBot = this.$i.carefulBot;
		this.autoAcceptFollowed = this.$i.autoAcceptFollowed;
		this.noCrawle = this.$i.noCrawle;
		this.isExplorable = this.$i.isExplorable;
		this.publicReactions = this.$i.publicReactions;
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
				publicReactions: !!this.publicReactions,
			});
		}
	}
});
</script>
