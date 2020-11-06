<template>
<div class="mk-note-page">
	<template v-if="renoteState">
		<mk-tab v-if="renoteState.isRenoted && renoteState.isQuoted" style="height: 100%" v-model:value="tab" class="tab" :items="[
			{ label: $t('quote'), value: 'quotes', icon: faQuoteRight },
			{ label: $t('renote'), value: 'renotes', icon: faRetweet },
		]"
		/>
		<template v-else>
			<fa :icon="renoteState.isQuoted ? faQuoteRight : faRetweet"/>
			{{ $t(renoteState.isQuoted ? 'quotes' : 'renotes') }}
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
	data() {
		return {
			INFO: {
				title: this.$t('renote')
			},
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
