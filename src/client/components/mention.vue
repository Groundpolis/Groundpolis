<template>
<router-link class="ldlomzub" :to="'/notes/' + noteId">
	<span class="main">
		<span class="username">@{{ noteId }}</span>
	</span>
</router-link>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
	props: {
		noteId: {
			type: String,
			required: true
		},
	},
});
</script>

<style lang="scss" scoped>
.ldlomzub {
	color: var(--mention);
}
</style>
