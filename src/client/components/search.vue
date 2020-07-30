<template>
	<mk-input v-model="searchQuery" type="search" v-autocomplete="{ model: 'searchQuery' }" @keydown="searchKeypress">
		<span>{{ $t('search') }}</span>
		<template #prefix><fa :icon="faSearch" /></template>
	</mk-input>
</template>

<script lang="ts">
import Vue from 'vue'

import MkInput from './ui/input.vue';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

export default Vue.extend({
	components: {
		MkInput,
	},
	props: {
		initialQuery: {
			default: '',
		}
	},
	data() {
		return {
			searchQuery: '',
			searchWait: false,
			faSearch,
		}
	},
	mounted() {
		this.searchQuery = this.initialQuery;
	},
	methods: {
		searchKeypress(e) {
			if (e.keyCode === 13) {
				this.$emit('search', this.searchQuery);
			}
		},
	},
});
</script>
