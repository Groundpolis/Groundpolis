<template>
<div>
	<portal to="icon"><fa :icon="faCog"/></portal>
	<portal to="title">{{ $t('settings') }}</portal>

	<x-security/>
	<x-2fa/>
	<x-integration/>
	<x-api/>

	<router-link class="_panel _buttonPrimary" to="/my/apps" style="margin: var(--margin) auto;">{{ $t('installedApps') }}</router-link>

	<button class="_panel _buttonPrimary" @click="$root.signout()" style="margin: var(--margin) auto;">{{ $t('logout') }}</button>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import XSecurity from './security.vue';
import X2fa from './2fa.vue';
import XIntegration from './integration.vue';
import XApi from './api.vue';

export default Vue.extend({
	metaInfo() {
		return {
			title: this.$t('settings') as string
		};
	},

	components: {
		XSecurity,
		X2fa,
		XIntegration,
		XApi,
	},

	data() {
		return {
			faCog
		}
	},
});
</script>
