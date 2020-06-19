<template>
<div class="mk-note-page">
	<portal to="title" v-if="note">
		<mfm 
			:text="$t('noteOf')"
			:plain="true" :nowrap="true" :custom-emojis="note.user.emojis" :is-note="false"
		/>
	</portal>

	<div v-if="note">
		<x-note :note="note" :key="note.id" :detail="true"/>
		<div v-if="error">
			<mk-error @retry="fetch()"/>
		</div>
	</div>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import Progress from '../scripts/loading';
import XNote from '../components/note.vue';

export default Vue.extend({
	metaInfo() {
		return {
			title: this.$t('note') as string
		};
	},
	components: {
		XNote,
	},
	data() {
		return {
			note: null,
			error: null,
		};
	},
	watch: {
		$route: 'fetch'
	},
	created() {
		this.fetch();
	},
	methods: {
		fetch() {
			Progress.start();
			this.$root.api('notes/show', {
				noteId: this.$route.params.note
			}).then(note => {
				this.note = note;
			}).catch(e => {
				this.error = e;
			}).finally(() => {
				Progress.done();
			});
		}
	}
});
</script>
