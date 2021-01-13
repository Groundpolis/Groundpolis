<template>
<div class="mk-note-page">
	<div class="_section" v-if="renoteState">
		<XNotes v-if="tab === 'quotes'" ref="quotes" :pagination="quotes"/>
		<XUsers v-else-if="tab === 'renotes'" ref="renotes" :pagination="renotedUsers"/>
	</div>

	<div v-if="error">
		<MkError @retry="fetch()"/>
	</div>
</div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { faQuoteRight, faRetweet } from '@fortawesome/free-solid-svg-icons';
import Progress from '../scripts/loading';
import XNotes from '../components/notes.vue';
import XUsers from '../components/users.vue';
import MkTab from '../components/tab.vue';
import * as os from '@/os';

export default defineComponent({
	components: {
		XNotes,
		XUsers,
		MkTab,
	},
	props: {
		noteId: {
			required: true,
		},
	},
	computed: {
		INFO(): Record<string, unknown> {
			if (!this.renoteState) {
				return {};
			} else if (this.renoteState.isRenoted && this.renoteState.isQuoted) {
				return {
					tabs: [{
						title: this.$ts.renote,
						icon: faRetweet,
						selected: this.tab === 'renotes',
						onClick: () => this.tab = 'renotes',
					}, {
						title: this.$ts.quotes,
						icon: faQuoteRight,
						selected: this.tab === 'quotes',
						onClick: () => this.tab = 'quotes',
					}],
				};
			} else {
				return {
					title: this.$t(this.renoteState.isQuoted ? 'quotes' : 'renote'),
					icon: this.renoteState.isQuoted ? faQuoteRight : faRetweet,
				};
			}
		},
	},
	data() {
		return {
			error: null,
			tab: 'renotes',
			renoteState: null as { isRenoted: boolean, isQuoted: boolean } | null,
			renotedUsers: {
				endpoint: 'notes/renoted-users',
				limit: 10,
				params: computed(() => ({
					noteId: this.noteId,
				})),
			},
			quotes: {
				endpoint: 'notes/quotes',
				limit: 10,
				params: computed(() => ({
					noteId: this.noteId,
				})),
			},
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
				const state = this.renoteState = await os.api('notes/is-renoted', { noteId: this.noteId }) as { isRenoted: boolean, isQuoted: boolean };
				if (state.isQuoted) {
					this.tab = 'quotes';
				}
			} catch(e) {
				this.error = e;
				console.error(this.error);
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
