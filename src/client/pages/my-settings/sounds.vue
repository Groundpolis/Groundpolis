<template>
<section class="_card">
	<div class="_title">{{ $t('sounds') }}</div>
	<div class="_content">
		<mk-range v-model="sfxVolume" :min="0" :max="1" :step="0.1">
			<fa slot="icon" :icon="volumeIcon"/>
			<span slot="title">{{ $t('volume') }}</span>
		</mk-range>
	</div>
	<div class="_content">
		<mk-select v-model="sfxNote">
			<template #label>{{ $t('_sfx.note') }}</template>
			<option v-for="sound in sounds" :value="sound" :key="sound">{{ sound || $t('none') }}</option>
			<template #text><button class="_textButton" @click="listen(sfxNote)" v-if="sfxNote">{{ $t('listen') }}</button></template>
		</mk-select>
		<mk-select v-model="sfxNoteMy">
			<template #label>{{ $t('_sfx.noteMy') }}</template>
			<option v-for="sound in sounds" :value="sound" :key="sound">{{ sound || $t('none') }}</option>
			<template #text><button class="_textButton" @click="listen(sfxNoteMy)" v-if="sfxNoteMy">{{ $t('listen') }}</button></template>
		</mk-select>
		<mk-select v-model="sfxNotification">
			<template #label>{{ $t('_sfx.notification') }}</template>
			<option v-for="sound in sounds" :value="sound" :key="sound">{{ sound || $t('none') }}</option>
			<template #text><button class="_textButton" @click="listen(sfxNotification)" v-if="sfxNotification">{{ $t('listen') }}</button></template>
		</mk-select>
		<mk-select v-model="sfxChat">
			<template #label>{{ $t('_sfx.chat') }}</template>
			<option v-for="sound in sounds" :value="sound" :key="sound">{{ sound || $t('none') }}</option>
			<template #text><button class="_textButton" @click="listen(sfxChat)" v-if="sfxChat">{{ $t('listen') }}</button></template>
		</mk-select>
		<mk-select v-model="sfxChatBg">
			<template #label>{{ $t('_sfx.chatBg') }}</template>
			<option v-for="sound in sounds" :value="sound" :key="sound">{{ sound || $t('none') }}</option>
			<template #text><button class="_textButton" @click="listen(sfxChatBg)" v-if="sfxChatBg">{{ $t('listen') }}</button></template>
		</mk-select>
		<mk-select v-model="sfxAntenna">
			<template #label>{{ $t('_sfx.antenna') }}</template>
			<option v-for="sound in sounds" :value="sound" :key="sound">{{ sound || $t('none') }}</option>
			<template #text><button class="_textButton" @click="listen(sfxAntenna)" v-if="sfxAntenna">{{ $t('listen') }}</button></template>
		</mk-select>
		<mk-select v-model="sfxChannel">
			<template #label>{{ $t('_sfx.channel') }}</template>
			<option v-for="sound in sounds" :value="sound" :key="sound">{{ sound || $t('none') }}</option>
			<template #text><button class="_textButton" @click="listen(sfxChannel)" v-if="sfxChannel"><fa :icon="faPlay"/> {{ $t('listen') }}</button></template>
		</mk-select>
	</div>
</section>
</template>

<script lang="ts">
import Vue from 'vue';
import { faImage, faCog, faVolumeUp, faVolumeDown, faVolumeOff } from '@fortawesome/free-solid-svg-icons';
import MkSelect from '../../components/ui/select.vue';
import MkRange from '../../components/ui/range.vue';
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
	'syuilo/pirori',
	'syuilo/pirori-wet',
	'syuilo/pirori-square-wet',
	'syuilo/square-pico',
	'syuilo/reverved',
	'syuilo/ryukyu',
	'aisha/1',
	'aisha/2',
	'aisha/3',
	'noizenecio/kick_gaba',
	'xeltica/coin',
	'xeltica/gomadare'
];

export default Vue.extend({
	metaInfo() {
		return {
			title: this.$t('settings') as string
		};
	},

	components: {
		MkSelect,
		MkRange,
	},

	data() {
		return {
			langs,
			lang: localStorage.getItem('lang'),
			fontSize: localStorage.getItem('fontSize'),
			sounds,
			faImage, faCog
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

		sfxChannel: {
			get() { return this.$store.state.device.sfxChannel; },
			set(value) { this.$store.commit('device/set', { key: 'sfxChannel', value }); }
		},

		volumeIcon () {
			return this.sfxVolume > 0.5 ? faVolumeUp : this.sfxVolume > 0 ? faVolumeDown : faVolumeOff;
		}
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
