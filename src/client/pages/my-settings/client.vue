<template>
<section class="_card">
	<div class="_title"><fa :icon="faCog"/> {{ $t('general') }}</div>

	<div class="_content">
		<mk-switch v-model="autoReload">{{ $t('autoReloadWhenDisconnected') }}</mk-switch>
		<mk-switch v-model="enableInfiniteScroll">{{ $t('enableInfiniteScroll') }}</mk-switch>
		<mk-switch v-model="fixedWidgetsPosition">{{ $t('fixedWidgetsPosition') }}</mk-switch>
		<mk-switch v-model="reduceAnimation">{{ $t('reduceUiAnimation') }}</mk-switch>
		<mk-switch v-model="disablePagesScript">{{ $t('disablePagesScript') }}</mk-switch>
		<mk-switch v-model="imageNewTab">{{ $t('openImageInNewTab') }}</mk-switch>
	</div>
</section>
</template>

<script lang="ts">
import Vue from 'vue';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import MkSwitch from '../../components/ui/switch.vue';

export default Vue.extend({
	metaInfo() {
		return {
			title: this.$t('settings') as string
		};
	},

	components: {
		MkSwitch,
	},

	data() {
		return {
			faCog,
		}
	},

	computed: {
		autoReload: {
			get() { return this.$store.state.device.autoReload; },
			set(value) { this.$store.commit('device/set', { key: 'autoReload', value }); }
		},

		enableInfiniteScroll: {
			get() { return this.$store.state.device.enableInfiniteScroll; },
			set(value) { this.$store.commit('device/setInfiniteScrollEnabling', value); }
		},

		reduceAnimation: {
			get() { return !this.$store.state.device.animation; },
			set(value) { this.$store.commit('device/set', { key: 'animation', value: !value }); }
		},

		disablePagesScript: {
			get() { return this.$store.state.device.disablePagesScript; },
			set(value) { this.$store.commit('device/set', { key: 'disablePagesScript', value }); }
		},

		imageNewTab: {
			get() { return this.$store.state.device.imageNewTab; },
			set(value) { this.$store.commit('device/set', { key: 'imageNewTab', value }); }
		},

		fixedWidgetsPosition: {
			get() { return this.$store.state.device.fixedWidgetsPosition; },
			set(value) { this.$store.commit('device/set', { key: 'fixedWidgetsPosition', value }); }
		},
	},
});
</script>
