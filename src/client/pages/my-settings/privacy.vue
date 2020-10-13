<template>
<section class="_card">
	<div class="_title"><fa :icon="faLock"/> {{ $t('privacy') }}</div>
	<div class="_content">
		<mk-switch v-model="isLocked" :disabled="carefulBot" @change="save()">{{ $t('makeFollowManuallyApprove') }}</mk-switch>
		<mk-switch v-model="carefulBot" :disabled="isLocked" @change="save()">{{ $t('makeBotFollowManuallyApprove') }}</mk-switch>
		<mk-switch v-model="autoAcceptFollowed" v-if="isLocked || carefulBot" @change="save()">{{ $t('autoAcceptFollowed') }}</mk-switch>
		<mk-switch v-model="hideFF" @change="save()">{{ $t('hideFF') }}</mk-switch>
		<mk-switch v-model="noindex" @change="save()">{{ $t('noindex') }}</mk-switch>
	</div>
	<div class="_content">
		<mk-switch v-model="rememberNoteVisibility" @change="save()">{{ $t('rememberNoteVisibility') }}</mk-switch>
		<mk-select v-model="defaultNoteVisibility" style="margin-bottom: 8px;" v-if="!rememberNoteVisibility">
			<template #label>{{ $t('defaultNoteVisibility') }}</template>
			<option value="public">{{ $t('_visibility.public') }}</option>
			<option value="home">{{ $t('_visibility.home') }}</option>
			<option value="followers">{{ $t('_visibility.followers') }}</option>
			<option value="specified">{{ $t('_visibility.specified') }}</option>
		</mk-select>
		<mk-switch v-model="defaultNoteLocalOnly" v-if="!rememberNoteVisibility">{{ $t('_visibility.localOnly') }}</mk-switch>
	</div>
</section>
</template>

<script lang="ts">
import Vue from 'vue';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import MkSelect from '../../components/ui/select.vue';
import MkSwitch from '../../components/ui/switch.vue';

export default Vue.extend({
	components: {
		MkSelect,
		MkSwitch,
	},
	
	data() {
		return {
			isLocked: false,
			autoAcceptFollowed: false,
			carefulBot: false,
			hideFF: false,
			noindex: false,
			faLock
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
			this.$root.api('i/update', {
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
