<template>
<div class="wrmlmaau">
	<div class="body">
		<span v-if="note.deletedAt" style="opacity: 0.5">({{ $t('deleted') }})</span>
		<mfm v-if="note.text" :text="no1te.text" :author="note.user" :i="$store.state.i" :custom-emojis="note.emojis"/>
	</div>
	<details v-if="note.files.length > 0">
		<summary>({{ $t('withNFiles', { n: note.files.length }) }})</summary>
		<x-media-list :media-list="note.files"/>
	</details>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import XMediaList from './media-list.vue';

export default Vue.extend({
	components: {
		XMediaList,
	},
	props: {
		note: {
			type: Object,
			required: true
		}
	}
});
</script>

<style lang="scss" scoped>
.wrmlmaau {
	overflow-wrap: break-word;
}
</style>
