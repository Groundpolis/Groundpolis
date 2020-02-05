<template>
<div class="mk-settings-page">
	<portal to="icon"><fa :icon="faUser"/></portal>
	<portal to="title">{{ $t('editProfile') }}</portal>
	<x-profile-setting/>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import MkButton from '../../components/ui/button.vue';
import XProfileSetting from './profile.vue';
import XPrivacySetting from './privacy.vue';

export default Vue.extend({
	metaInfo() {
		return {
			title: this.$t('editProfile') as string
		};
	},

	computed: {
		isSignedIn() {
			return this.$store.getters.isSignedIn;
		}
	},

	components: {
		XProfileSetting,
		XPrivacySetting,
		MkButton,
	},

	data() {
		return {
			faUser
		}
	},
});
</script>
