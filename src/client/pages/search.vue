<template>
<div>
	<portal to="icon"><fa :icon="faSearch"/></portal>
	<portal to="title">{{ $t('search') }}</portal>

	<x-search :initial-query="$route.query.q" @search="search"/>

	<div class="tab _panel _noPad">
		<mk-tab v-model="tab" :items="[{ label: $t('notes'), value: 'notes' }, { label: $t('users'), value: 'users' }]"/>
	</div>

	<template v-if="smartCard">
			<x-note class="smart-card" :note="smartCard.note" v-if="smartCard.type === 'note'"/>
			<x-user class="smart-card" :user="smartCard.user" v-else-if="smartCard.type === 'user'"/>
			<div class="_panel smart-card" v-else-if="smartCard.type === 'apFetching'">
				<fa class="icon" :icon="faSpinner" pulse/>
				<div class="body" v-text="$t('fetchingAsApObject') + '...'"/>
			</div>
			<div class="_panel smart-card" v-else-if="smartCard.type === 'apError'">
				<fa class="icon" :icon="faTimesCircle"/>
				<div class="body" v-text="smartCard.message"/>
			</div>
	</template>

	<x-notes v-if="tab === 'notes'" ref="notes" :pagination="notesPagination"/>
	<x-users v-if="tab === 'users'" ref="users" :pagination="usersPagination"/>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { faSearch, faSpinner, faTimesCircle, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import Progress from '../scripts/loading';
import parseAcct from '../../misc/acct/parse';
import XNotes from '../components/notes.vue';
import XNote from '../components/note.vue';
import XUser from '../components/user.vue';
import XUsers from '../components/users.vue';
import XSearch from '../components/search.vue';
import MkTab from '../components/tab.vue';
import { PackedNote } from '../../models/repositories/note';
import { PackedUser } from '../../models/repositories/user';

type SmartCard = {
	type: 'note',
	note: PackedNote,
} | {
	type: 'user',
	user: PackedUser,
} | {
	type: 'apFetching'
}| {
	type: 'apError',
	message?: string,
} | {
	type: 'custom',
	icon?: IconDefinition,
	header?: string,
	body?: string,
};

export default Vue.extend({
	metaInfo() {
		return {
			title: this.$t('searchWith', { q: this.$route.query.q }) as string
		};
	},

	components: {
		XNotes,
		XUsers,
		XNote,
		XUser,
		XSearch,
		MkTab,
	},

	data() {
		return {
			tab: this.$route.query.f || 'notes',
			smartCard: null as SmartCard | null,
			faSearch, faSpinner, faTimesCircle,
		};
	},

	computed: {
		notesPagination() {
			const query: string = typeof this.$route.query.q === 'string' ? this.$route.query.q : '';
			const isTag = query.trim().startsWith('#');
			return isTag ? {
				endpoint: 'notes/search-by-tag',
				limit: 10,
				params: () => ({
					tag: query.substring(1)
				})
			} : {
				endpoint: 'notes/search',
				limit: 10,
				params: () => ({ query })
			};
		},
		usersPagination () {
			const query: string = typeof this.$route.query.q === 'string' ? this.$route.query.q : '';
			const isTag = query.trim().startsWith('#');
			return isTag ? {
				endpoint: 'users/search-by-tag',
				limit: 10,
				params: () => ({
					tag: query.substring(1)
				})
			} : {
				endpoint: 'users/search',
				limit: 10,
				params: () => ({ query })
			};
		},
	},

	watch: {
		$route() {
			// (this.$refs.notes as any)?.reload();
			// (this.$refs.users as any)?.reload();
		},
		tab() {
			this.$router.push({
				path: this.$route.path,
				query: {
					...this.$route.query,
					f: this.tab,
				}
			});
			this.generateSmartCard();
		}
	},

	mounted() {
		this.generateSmartCard();
	},

	methods: {
		before() {
			Progress.start();
		},

		after() {
			Progress.done();
		},

		search(q: string) {
			if (this.$route.query.q === q) return;

			this.$router.push({
				path: this.$route.path,
				query: {
					q,
					f: this.tab,
				}
			});
			this.generateSmartCard();
		},

		async generateSmartCard() {
			this.smartCard = null;

			if (this.tab !== 'notes') return;
			const q = (this.$route.query.q as string || '').trim();

			// ActivityPub Object
			if (q.startsWith('https://')) {
				this.smartCard = { type: 'apFetching' };
				try {
					const res = await this.$root.api('ap/show', { uri: q });
					if (res.type === 'User') {
						this.smartCard = {
							type: 'user',
							user: res.object
						};
					} else if (res.type === 'Note') {
						this.smartCard = {
							type: 'note',
							note: res.object
						};
					}
				} catch (e) {
					this.smartCard = {
						type: 'apError',
						message: e.message,
					};
				}
			}

			// User
			if (q.startsWith('@') && !q.includes(' ')) {
				const user = await this.$root.api('users/show', parseAcct(q));
				this.smartCard = {
					type: 'user',
					user
				};
			}
			
		},
	}
});
</script>

<style lang="scss" scoped>
	.tab {
		margin-bottom: var(--margin);
	}

	.smart-card {
		margin-bottom: var(--margin);
		padding: var(--margin);
		> .icon {
			font-size: 32px;
			margin-bottom: var(--margin);
		}
	}
</style>
