<template>
<div class="_section">
	<div class="_card">
		<div class="_content">
			<MkSwitch v-model:value="isLocked" :disabled="carefulBot" @update:value="save()">{{ $t('makeFollowManuallyApprove') }}</MkSwitch>
			<MkSwitch v-model:value="carefulBot" :disabled="isLocked" @update:value="save()">{{ $t('makeBotFollowManuallyApprove') }}</MkSwitch>
			<MkSwitch v-model:value="autoAcceptFollowed" :disabled="!isLocked && !carefulBot" @update:value="save()">{{ $t('autoAcceptFollowed') }}</MkSwitch>
			<MkSwitch v-model:value="hideFF" @update:value="save()">{{ $t('hideFF') }}</MkSwitch>
			<MkSwitch v-model:value="noindex" @update:value="save()">{{ $t('noindex') }}</MkSwitch>
		</div>
		<div class="_content">
			<MkSwitch v-model:value="rememberNoteVisibility" @update:value="save()">{{ $t('rememberNoteVisibility') }}</MkSwitch>
			<MkSelect v-model:value="defaultNoteVisibility" style="margin-bottom: 8px;" v-if="!rememberNoteVisibility">
				<template #label>{{ $t('defaultNoteVisibility') }}</template>
				<option value="public">{{ $t('_visibility.public') }}</option>
				<option value="home">{{ $t('_visibility.home') }}</option>
				<option value="followers">{{ $t('_visibility.followers') }}</option>
				<option value="specified">{{ $t('_visibility.specified') }}</option>
			</MkSelect>
			<MkSwitch v-model:value="defaultNoteLocalOnly" v-if="!rememberNoteVisibility">{{ $t('_visibility.localOnly') }}</MkSwitch>
		</div>
	</div>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MkSelect from '@/components/ui/select.vue';
import MkSwitch from '@/components/ui/switch.vue';
import * as os from '@/os';

export default defineComponent({
	components: {
		MkSelect,
		MkSwitch,
	},

	data() {
		return {
			isLocked: false,
			carefulBot: false,
			autoAcceptFollowed: false,
			hideFF: false,
			noindex: false,
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
		this.noindex = this.$store.state.i.noindex;
	},

	methods: {
		save() {
			os.api('i/update', {
				isLocked: !!this.isLocked,
				hideFF: !!this.hideFF,
				carefulBot: !!this.carefulBot,
				autoAcceptFollowed: !!this.autoAcceptFollowed,
				noindex: !!this.noindex,
			});
		}
	}
});
</script>
