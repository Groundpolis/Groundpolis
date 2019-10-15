<template>
<div class="root">
	<ui-info v-if="!fetching && apps.length == 0">{{ $t('no-apps') }}</ui-info>
	<div class="apps" v-if="apps.length != 0">
		<div v-for="app in apps" :key="app.id">
			<h1>{{ app.name }}</h1>
			<p>{{ app.description }}</p>
		</div>
	</div>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import i18n from '../../../../i18n';
export default Vue.extend({
	i18n: i18n('desktop/views/components/settings.apps.vue'),
	data() {
		return {
			fetching: true,
			apps: []
		};
	},
	mounted() {
		this.$root.api('i/authorized_apps').then(apps => {
			this.apps = apps;
			this.fetching = false;
		});
	},
});
</script>

<style lang="stylus" scoped>
.root
	> .apps
		> div
			padding 16px
			margin 8px
			border-radius 8px
			background var(--bg)
			> h1
				margin-top 0
				font-size 16px
			> p
				font-size 14px
				text-indent 16px
				opacity 0.6
				margin-bottom 0
</style>
