<template>
<ui-card>
	<template #title><fa :icon="faLightbulb"/> {{ $t('extended-notification') }}</template>

	<section>
		<header>{{ $t('highlighted-words') }}</header>
		<ui-textarea v-model="highlightedWords">
			{{ $t('highlighted-words') }}<template #desc>{{ $t('highlighted-words-description') }}</template>
		</ui-textarea>
		<ui-button @click="save">{{ $t('save') }}</ui-button>
	</section>
</ui-card>
</template>

<script lang="ts">
import Vue from 'vue';
import i18n from '../../../../i18n';
import { faLightbulb } from '@fortawesome/free-regular-svg-icons';

export default Vue.extend({
	i18n: i18n('common/views/components/settings/extended-notification.vue'),

	data() {
		return {
			highlightedWords: '',
			faLightbulb,
		};
	},

	computed: {
		_highlightedWords: {
			get() { return this.$store.state.settings.highlightedWords; },
			set(value) { this.$store.dispatch('settings/set', { key: 'highlightedWords', value }); }
		},
	},

	mounted() {
		this.highlightedWords = this._highlightedWords.join('\n');
	},

	methods: {
		save() {
			this._highlightedWords = this.highlightedWords.split('\n').filter((x: string) => x != '');
		}
	}
});
</script>
