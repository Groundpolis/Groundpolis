<template>
<div class="mk-note-page">
	<template v-if="renoteState">
		<portal v-if="renoteState.isRenoted && renoteState.isQuoted" to="header">
			<mk-tab v-if="renoteState.isRenoted && renoteState.isQuoted" style="height: 100%" v-model="tab" class="tab" :items="[
				{ label: $t('quote'), value: 'quotes', icon: faQuoteRight },
				{ label: $t('renote'), value: 'renotes', icon: faRetweet },
			]"
			/>
		</portal>
		<template v-else>
			<portal to="icon"><fa :icon="renoteState.isQuoted ? faQuoteRight : faRetweet"/></portal>
			<portal to="title">{{ $t(renoteState.isQuoted ? 'quotes' : 'renotes') }}</portal>
		</template>

		<x-notes v-if="tab === 'quotes'" ref="quotes" :pagination="quotes"/>
		<x-users v-else-if="tab === 'renotes'" ref="renotes" :pagination="renotedUsers"/>
	</template>

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
	},
	data() {
		return {
			error: null,
			tab: 'renotes',
			renoteState: null as { isRenoted: boolean, isQuoted: boolean } | null,
			renotedUsers: {
				endpoint: 'notes/renoted-users',
				limit: 10,
				params: init => ({
					noteId: this.$route.params.note,
				})
			},
			quotes: {
				endpoint: 'notes/quotes',
				limit: 10,
				params: init => ({
					noteId: this.$route.params.note,
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
		async fetch() {
			try {
				Progress.start();
				const state = this.renoteState = await this.$root.api('notes/is-renoted', { noteId: this.$route.params.note }) as { isRenoted: boolean, isQuoted: boolean };
				if (state.isQuoted) {
					this.tab = 'quotes';
				}
			} catch(e) {
				this.error = e;
			} finally {
				Progress.done();
			}
		},
	}
});
</script>

<style lang="scss" scoped>
.tab {
	margin-bottom: var(--margin);
}
</style>
