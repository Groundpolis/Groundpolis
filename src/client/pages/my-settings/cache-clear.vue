<template>
	<button class="_panel _buttonPrimary" @click="cacheClear()" style="margin: var(--margin) auto;">{{ $t('cacheClear') }}</button>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
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
