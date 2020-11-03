<template>
	<mk-input :value="value" type="search" @keydown="searchKeypress" @input="$emit('input', $event)">
		<span>{{ $t('search') }}</span>
		<template #prefix><fa :icon="faSearch" /></template>
	</mk-input>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import MkInput from './ui/input.vue';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

export default defineComponent({
	components: {
		MkInput,
	},
	props: {
		value: {
			default: '',
		}
	},
	data() {
		return {
			faSearch,
		}
	},
	methods: {
		searchKeypress(e) {
			if (e.keyCode === 13) {
				this.$emit('search');
			}
		},
	},
});
</script>
