<template>
<div class="_section">
	<section class="_card _vMargin">
		<div class="_content">
			<div>{{ $t('defaultNavigationBehaviour') }}</div>
			<MkSwitch v-model:value="deckNavWindow">{{ $t('openInWindow') }}</MkSwitch>
		</div>
		<div class="_content">
			<MkSwitch v-model:value="deckAlwaysShowMainColumn">
				{{ $t('_deck.alwaysShowMainColumn') }}
			</MkSwitch>
		</div>
		<div class="_content">
			<div>{{ $t('_deck.columnAlign') }}</div>
			<MkRadio v-model="deckColumnAlign" value="left">{{ $t('left') }}</MkRadio>
			<MkRadio v-model="deckColumnAlign" value="center">{{ $t('center') }}</MkRadio>
		</div>
	</section>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MkButton from '@/components/ui/button.vue';
import MkSwitch from '@/components/ui/switch.vue';
import MkRadio from '@/components/ui/radio.vue';
import { langs } from '@/config';
import { clientDb, set } from '@/db';
import * as os from '@/os';

export default defineComponent({
	components: {
		MkButton,
		MkSwitch,
		MkRadio,
	},

	data() {
		return {
		}
	},

	computed: {
		deckNavWindow: {
			get() { return this.$store.state.device.deckNavWindow; },
			set(value) { this.$store.commit('device/set', { key: 'deckNavWindow', value }); }
		},

		deckAlwaysShowMainColumn: {
			get() { return this.$store.state.device.deckAlwaysShowMainColumn; },
			set(value) { this.$store.commit('device/set', { key: 'deckAlwaysShowMainColumn', value }); }
		},

		deckColumnAlign: {
			get() { return this.$store.state.device.deckColumnAlign; },
			set(value) { this.$store.commit('device/set', { key: 'deckColumnAlign', value }); }
		},
	},
});
</script>
