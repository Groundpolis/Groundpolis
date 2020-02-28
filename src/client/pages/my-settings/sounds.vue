<template>
<section class="_card">
	<div class="_title"><fa :icon="faMusic"/> {{ $t('sounds') }}</div>
	<div class="_content">
		{{ $t('volume') }}
		<input type="range" v-model="sfxVolume" min="0" max="1" step="0.1"/>
	</div>
	<div class="_content">
		<mk-select v-model="sfxNote">
			<template #label>{{ $t('_sfx.note') }}</template>
			<option v-for="sound in sounds" :value="sound" :key="sound">{{ sound || $t('none') }}</option>
			<template #text><button class="_textButton" @click="listen(sfxNote)" v-if="sfxNote"><fa :icon="faPlay"/> {{ $t('listen') }}</button></template>
		</mk-select>
		<mk-select v-model="sfxNoteMy">
			<template #label>{{ $t('_sfx.noteMy') }}</template>
			<option v-for="sound in sounds" :value="sound" :key="sound">{{ sound || $t('none') }}</option>
			<template #text><button class="_textButton" @click="listen(sfxNoteMy)" v-if="sfxNoteMy"><fa :icon="faPlay"/> {{ $t('listen') }}</button></template>
		</mk-select>
		<mk-select v-model="sfxNotification">
			<template #label>{{ $t('_sfx.notification') }}</template>
			<option v-for="sound in sounds" :value="sound" :key="sound">{{ sound || $t('none') }}</option>
			<template #text><button class="_textButton" @click="listen(sfxNotification)" v-if="sfxNotification"><fa :icon="faPlay"/> {{ $t('listen') }}</button></template>
		</mk-select>
		<mk-select v-model="sfxChat">
			<template #label>{{ $t('_sfx.chat') }}</template>
			<option v-for="sound in sounds" :value="sound" :key="sound">{{ sound || $t('none') }}</option>
			<template #text><button class="_textButton" @click="listen(sfxChat)" v-if="sfxChat"><fa :icon="faPlay"/> {{ $t('listen') }}</button></template>
		</mk-select>
		<mk-select v-model="sfxChatBg">
			<template #label>{{ $t('_sfx.chatBg') }}</template>
			<option v-for="sound in sounds" :value="sound" :key="sound">{{ sound || $t('none') }}</option>
			<template #text><button class="_textButton" @click="listen(sfxChatBg)" v-if="sfxChatBg"><fa :icon="faPlay"/> {{ $t('listen') }}</button></template>
		</mk-select>
		<mk-select v-model="sfxAntenna">
			<template #label>{{ $t('_sfx.antenna') }}</template>
			<option v-for="sound in sounds" :value="sound" :key="sound">{{ sound || $t('none') }}</option>
			<template #text><button class="_textButton" @click="listen(sfxAntenna)" v-if="sfxAntenna"><fa :icon="faPlay"/> {{ $t('listen') }}</button></template>
		</mk-select>
	</div>
</section>
</template>

<script lang="ts">
import Vue from 'vue';
import { faImage, faCog, faMusic, faPlay } from '@fortawesome/free-solid-svg-icons';
import MkSelect from '../../components/ui/select.vue';
import i18n from '../../i18n';
import { langs } from '../../config';

const sounds = [
	null,
	'syuilo/up',
	'syuilo/down',
	'syuilo/pope1',
	'syuilo/pope2',
	'syuilo/waon',
	'syuilo/popo',
	'syuilo/triple',
	'syuilo/poi1',
	'syuilo/poi2',
	'aisha/1',
	'aisha/2',
	'aisha/3',
	'noizenecio/kick_gaba',
];

export default Vue.extend({
	i18n,

	metaInfo() {
		return {
			title: this.$t('settings') as string
		};
	},

	components: {
		MkSelect,
	},

	data() {
		return {
			langs,
			lang: localStorage.getItem('lang'),
			fontSize: localStorage.getItem('fontSize'),
			sounds,
			faImage, faCog, faMusic, faPlay
		}
	},

	computed: {
		sfxVolume: {
			get() { return this.$store.state.device.sfxVolume; },
			set(value) { this.$store.commit('device/set', { key: 'sfxVolume', value }); }
		},

		sfxNote: {
			get() { return this.$store.state.device.sfxNote; },
			set(value) { this.$store.commit('device/set', { key: 'sfxNote', value }); }
		},

		sfxNoteMy: {
			get() { return this.$store.state.device.sfxNoteMy; },
			set(value) { this.$store.commit('device/set', { key: 'sfxNoteMy', value }); }
		},

		sfxNotification: {
			get() { return this.$store.state.device.sfxNotification; },
			set(value) { this.$store.commit('device/set', { key: 'sfxNotification', value }); }
		},

		sfxChat: {
			get() { return this.$store.state.device.sfxChat; },
			set(value) { this.$store.commit('device/set', { key: 'sfxChat', value }); }
		},

		sfxChatBg: {
			get() { return this.$store.state.device.sfxChatBg; },
			set(value) { this.$store.commit('device/set', { key: 'sfxChatBg', value }); }
		},

		sfxAntenna: {
			get() { return this.$store.state.device.sfxAntenna; },
			set(value) { this.$store.commit('device/set', { key: 'sfxAntenna', value }); }
		},
	},

	methods: {
		listen(sound) {
			const audio = new Audio(`/assets/sounds/${sound}.mp3`);
			audio.volume = this.$store.state.device.sfxVolume;
			audio.play();
		},
	}
});
</script>