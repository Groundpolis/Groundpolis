<template>
<component :is="$store.getters.isSignedIn || src === 'everyone' ? 'home' : 'welcome'" :show-title="showTitle" :src="src"></component>
</template>

<script lang="ts">
import Vue from 'vue';
import Home from './index.home.vue';

export default Vue.extend({
	name: 'Index',

	components: {
		Home,
		Welcome: () => import('./index.welcome.vue').then(m => m.default),
	},

	props: [ 'src' ],

	data() {
		return {
			showTitle: true,
		}
	},

	activated() {
		this.showTitle = true;
	},

	deactivated() {
		this.showTitle = false;
	}
});
</script>
