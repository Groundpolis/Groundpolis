<template>
<div class="_section">
	<div class="_content">
		<XSearch v-model:value="inputQuery" @search="search"/>
		<div class="tab _section _noPad" style="padding: 0">
			<MkTab v-model:value="tab">
				<option value="notes">{{$ts.notes}}</option>
				<option value="users">{{$ts.users}}</option>
			</MkTab>
		</div>
		<template v-if="smartCard">
				<XNote class="smart-card" :note="smartCard.note" v-if="smartCard.type === 'note'"/>
				<XUser class="smart-card" :user="smartCard.user" v-else-if="smartCard.type === 'user'"/>
				<div class="_panel smart-card" v-else-if="smartCard.type === 'custom'">
					<Fa class="icon" :icon="smartCard.icon"/>
					<h1 class="header" v-text="smartCard.header"/>
					<div class="body" v-text="smartCard.body"/>
				</div>
		</template>
		<XNotes v-if="tab === 'notes'" ref="notes" :pagination="notesPagination"/>
		<XUsers v-if="tab === 'users'" ref="users" :pagination="usersPagination"/>
	</div>
</div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { faSearch, faSpinner, faTimesCircle, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import Progress from '@/scripts/loading';
import parseAcct from '../../misc/acct/parse';
import XNotes from '../components/notes.vue';
import XNote from '../components/note.vue';
import XUser from '../components/user.vue';
import XUsers from '../components/users.vue';
import XSearch from '../components/search.vue';
import MkTab from '../components/tab.vue';
import { PackedNote } from '../../models/repositories/note';
import { PackedUser } from '../../models/repositories/user';
import * as os from '@/os';

type SmartCard = {
	type: 'note',
	note: PackedNote,
} | {
	type: 'user',
	user: PackedUser,
} | {
	type: 'custom',
	icon?: IconDefinition,
	header?: string,
	body?: string,
};

export default defineComponent({
	components: {
		XNotes,
		XUsers,
		XNote,
		XUser,
		XSearch,
		MkTab,
	},

	inject: {
		navHook: {
			default: null
		},
		sideViewHook: {
			default: null
		}
	},

	props: {
		q: {
			type: String,
			required: true,
		},
		f: {
			type: String,
			required: true,
		},
	},

	data() {
		return {
			query: this.q,
			inputQuery: this.q,
			tab: this.f || 'notes',
			smartCard: null as SmartCard | null,
			INFO: {
				title: computed(() => this.$t('searchWith', { q: this.query })),
				icon: faSearch
			},
		};
	},

	computed: {
		notesPagination() {
			const query: string = typeof this.query === 'string' ? this.query.trim() : '';
			const isTag = query.startsWith('#') && !/\s/.test(query);
			return isTag ? {
				endpoint: 'notes/search-by-tag',
				limit: 10,
				params: () => ({
					tag: query.trim().substring(1)
				})
			} : {
				endpoint: 'notes/search',
				limit: 10,
				params: () => ({ query })
			};
		},
		usersPagination () {
			const query: string = typeof this.query === 'string' ? this.query.trim() : '';
			const isTag = query.startsWith('#') && !/\s/.test(query);
			return isTag ? {
				endpoint: 'hashtags/users',
				limit: 10,
				params: () => ({
					tag: query.trim().substring(1),
					sort: '+updatedAt',
					origin: 'combined'
				})
			} : {
				endpoint: 'users/search-keyword',
				limit: 10,
				params: () => ({ query })
			};
		},
	},

	watch: {
		$route: 'fetch',
		tab() {
			this.inputQuery = this.query;
			if (this.navHook) return;
			this.$router.push(`/search/${encodeURIComponent(this.tab)}/${encodeURIComponent(this.inputQuery)}`);
		},
		q() {
			this.query = this.inputQuery = this.q;
		},
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

		search() {
			if (this.inputQuery === this.query) return;
			if (this.navHook) {
				this.fetch();
			} else {
				this.$router.push(`/search/${encodeURIComponent(this.tab)}/${encodeURIComponent(this.inputQuery)}`);
			}
		},

		fetch() {
			this.query = this.inputQuery;
			this.generateSmartCard();
		},

		async generateSmartCard() {
			this.smartCard = null;

			const q = (this.query as string || '').trim();

			// ActivityPub Object
			if (q.startsWith('https://')) {
				this.smartCard = {
					type: 'custom',
					body: this.$ts.fetchingAsApObject,
					icon: faSpinner,
				};
				try {
					const res = await os.api('ap/show', { uri: q });
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
							type: 'custom',
							icon: faTimesCircle,
							body: e.info || e.message,
						};
				}
			}

			// User
			if (q.startsWith('@') && !q.includes(' ')) {
				const user = await os.api('users/show', parseAcct(q));
				this.smartCard = {
					type: 'user',
					user,
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
