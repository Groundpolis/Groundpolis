<template>
<div class="mk-note-page">
	<portal to="avatar" v-if="note"><mk-avatar class="avatar" :user="note.user" :disable-preview="true"/></portal>
	<portal to="title" v-if="note">
		<mfm 
			:text="$t('noteOf', { user: note.user.name || note.user.username })"
			:plain="true" :nowrap="true" :custom-emojis="note.user.emojis" :is-note="false"
		/>
	</portal>

	<div v-if="note">
		<mk-remote-caution v-if="note.user.host != null" :href="note.url || note.uri" style="margin-bottom: var(--margin)"/>
		<mk-tab v-model="tab" class="tab" :items="[
			{ label: $t('quote'), value: 'quotes', icon: faQuoteRight },
			{ label: $t('renote'), value: 'renotes', icon: faRetweet },
		]"
		/>

		<x-notes v-if="tab === 'quotes'" ref="quotes" :pagination="quotes"/>
		<x-users v-else-if="tab === 'renotes'" ref="renotes" :pagination="renotedUsers"/>
	</div>

	<div v-if="error">
		<mk-error @retry="fetch()"/>
	</div>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { faQuoteRight, faRetweet } from '@fortawesome/free-solid-svg-icons';
import Progress from '../scripts/loading';
import XNotes from '../components/notes.vue';
import XUsers from '../components/users.vue';
import MkTab from '../components/tab.vue';
import MkRemoteCaution from '../components/remote-caution.vue';

export default Vue.extend({
	metaInfo() {
		return {
			title: this.$t('note') as string
		};
	},
	components: {
		XNotes,
		XUsers,
		MkTab,
		MkRemoteCaution,
	},
	data() {
		return {
			error: null,
			note: null,
			tab: 'quotes',
			renotedUsers: {
				endpoint: 'notes/renoted-users',
				limit: 10,
				params: init => ({
					noteId: this.note.id,
				})
			},
			quotes: {
				endpoint: 'notes/quotes',
				limit: 10,
				params: init => ({
					noteId: this.note.id,
				})
			},
			faQuoteRight, faRetweet
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

<style lang="scss" scoped>
.tab {
	margin-bottom: var(--margin);
}
</style>
