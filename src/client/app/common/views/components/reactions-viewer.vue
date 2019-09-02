<template>
<div class="mk-reactions-viewer">
	<x-reaction v-for="(count, reaction) in reactions" :reaction="reaction" :count="count" :note="note" :key="reaction"/>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import XReaction from './reactions-viewer.reaction.vue';

export default Vue.extend({
	components: {
		XReaction
	},
	props: {
		note: {
			type: Object,
			required: true
		},
	},
	computed: {
		reactions(): any {
			return this.note.reactionCounts;
		},
	},
});
</script>

<style lang="stylus" scoped>
.mk-reactions-viewer
	margin: 4px -2px

	&:empty
		display none
</style>
