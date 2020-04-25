<template>
	<mk-button @click="cacheClear()" primary style="margin: var(--margin) auto;">{{ $t('cacheClear') }}</mk-button>
</template>

<script lang="ts">
import Vue from 'vue';
import MkButton from '../../components/ui/button.vue';
import i18n from '../../i18n';

export default Vue.extend({
	i18n,

	components: {
		MkButton,
	},

	methods: {
		cacheClear() {
			// Clear cache (service worker)
			try {
				navigator.serviceWorker.controller.postMessage('clear');

				navigator.serviceWorker.getRegistrations().then(registrations => {
					for (const registration of registrations) registration.unregister();
				});
			} catch (e) {
				console.error(e);
			}

			// Force reload
			location.reload(true);
		}
	}
});
</script>