<template>
<mk-emoji :emoji="reaction.startsWith(':') ? null : reaction" :name="reaction.startsWith(':') ? reaction.substr(1, reaction.length - 2) : null" :is-reaction="true" :normal="true" :no-style="noStyle"/>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
	props: {
		reaction: {
			type: String,
			required: true
		},
		noStyle: {
			type: Boolean,
			required: false,
			default: false
		},
	},
});
</script>
