<template>
<div class="_section">
	<section class="_card _vMargin">
		<div class="_title">{{$t('behavior')}}</div>
		<div class="_content">
			<div>{{ $t('defaultNavigationBehaviour') }}</div>
			<MkSwitch v-model:value="defaultSideView">{{ $t('openInSideView') }}</MkSwitch>
		</div>
		<div class="_content">
			<div>{{ $t('whenServerDisconnected') }}</div>
			<MkRadio v-model="serverDisconnectedBehavior" value="reload">{{ $t('_serverDisconnectedBehavior.reload') }}</MkRadio>
			<MkRadio v-model="serverDisconnectedBehavior" value="dialog">{{ $t('_serverDisconnectedBehavior.dialog') }}</MkRadio>
			<MkRadio v-model="serverDisconnectedBehavior" value="quiet">{{ $t('_serverDisconnectedBehavior.quiet') }}</MkRadio>
		</div>
		<div class="_content">
			<MkSwitch v-model:value="imageNewTab">{{ $t('openImageInNewTab') }}</MkSwitch>
			<MkSwitch v-model:value="showFixedPostForm">{{ $t('showFixedPostForm') }}</MkSwitch>
			<MkSwitch v-model:value="enableInfiniteScroll">{{ $t('enableInfiniteScroll') }}</MkSwitch>
			<MkSwitch v-model:value="disablePagesScript">{{ $t('disablePagesScript') }}</MkSwitch>
		</div>
		<div class="_content">
			<div>{{ $t('chatOpenBehavior') }}</div>
			<MkRadio v-model="chatOpenBehavior" value="page">{{ $t('showInPage') }}</MkRadio>
			<MkRadio v-model="chatOpenBehavior" value="window">{{ $t('openInWindow') }}</MkRadio>
			<MkRadio v-model="chatOpenBehavior" value="popout">{{ $t('popout') }}</MkRadio>
		</div>
		<div class="_content">
			<MkSelect v-model:value="lang">
				<template #label>{{ $t('uiLanguage') }}</template>

				<option v-for="x in langs" :value="x[0]" :key="x[0]">{{ x[1] }}</option>
			</MkSelect>
		</div>
		<div class="_content">
			<i18n-t keypath="renoteButtonMode" tag="div">
				<template #renote>
					<Fa :icon="faRetweet" />
				</template>
			</i18n-t>
			<mk-select v-model:value="renoteButtonMode">
				<option :value="v" v-for="v in [ 'choose', 'renote', 'quote', 'renoteQuote' ]" :key="v">{{ $t(`_renoteButtonMode.${v}`) }}</option>
			</mk-select>
		</div>
	</section>

	<MkButton @click="cacheClear()" primary style="margin: var(--margin) auto;">{{ $t('cacheClear') }}</MkButton>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { faRetweet } from '@fortawesome/free-solid-svg-icons';
import MkButton from '@/components/ui/button.vue';
import MkSwitch from '@/components/ui/switch.vue';
import MkSelect from '@/components/ui/select.vue';
import MkRadio from '@/components/ui/radio.vue';
import { langs } from '@/config';
import { clientDb, set } from '@/db';
import * as os from '@/os';

export default defineComponent({
	components: {
		MkButton,
		MkSwitch,
		MkSelect,
		MkRadio,
	},

	data() {
		return {
			langs,
			lang: localStorage.getItem('lang'),
			faRetweet
		}
	},

	computed: {
		serverDisconnectedBehavior: {
			get() { return this.$store.state.device.serverDisconnectedBehavior; },
			set(value) { this.$store.commit('device/set', { key: 'serverDisconnectedBehavior', value }); }
		},

		imageNewTab: {
			get() { return this.$store.state.device.imageNewTab; },
			set(value) { this.$store.commit('device/set', { key: 'imageNewTab', value }); }
		},

		disablePagesScript: {
			get() { return this.$store.state.device.disablePagesScript; },
			set(value) { this.$store.commit('device/set', { key: 'disablePagesScript', value }); }
		},

		showFixedPostForm: {
			get() { return this.$store.state.device.showFixedPostForm; },
			set(value) { this.$store.commit('device/set', { key: 'showFixedPostForm', value }); }
		},

		defaultSideView: {
			get() { return this.$store.state.device.defaultSideView; },
			set(value) { this.$store.commit('device/set', { key: 'defaultSideView', value }); }
		},

		chatOpenBehavior: {
			get() { return this.$store.state.device.chatOpenBehavior; },
			set(value) { this.$store.commit('device/set', { key: 'chatOpenBehavior', value }); }
		},

		enableInfiniteScroll: {
			get() { return this.$store.state.device.enableInfiniteScroll; },
			set(value) { this.$store.commit('device/set', { key: 'enableInfiniteScroll', value }); }
		},
		
		renoteButtonMode: {
			get() { return this.$store.state.settings.renoteButtonMode; },
			set(value) { this.$store.dispatch('settings/set', { key: 'renoteButtonMode', value }); }
		},
	},

	watch: {
		lang() {
			localStorage.setItem('lang', this.lang);

			return set('_version_', `changeLang-${(new Date()).toJSON()}`, clientDb.i18n)
				.then(() => location.reload())
				.catch(() => {
					os.dialog({
						type: 'error',
					});
				});
		},

		enableInfiniteScroll() {
			location.reload()
		},
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
