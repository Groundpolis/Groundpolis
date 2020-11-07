<template>
<div class="_section">
	<div class="_content">
		<XSearch v-model:value="query" @search="search"/>
		<div class="tab _section _noPad" style="padding: 0">
			<MkTab v-model:value="tab" :items="[{ label: $t('notes'), value: 'notes' }, { label: $t('users'), value: 'users' }]"/>
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
import { defineComponent } from 'vue';
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

	data() {
		return {
			query: this.$route.query.q as string,
			tab: this.$route.query.f || 'notes',
			smartCard: null as SmartCard | null,
			INFO: {
				title: this.$t('searchWith', { q: this.$route.query.q }),
				icon: faSearch
			},
		};
	},

	computed: {
		notesPagination() {
			const query: string = typeof this.$route.query.q === 'string' ? this.$route.query.q.trim() : '';
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
			const query: string = typeof this.$route.query.q === 'string' ? this.$route.query.q.trim() : '';
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
			this.$router.push({
				path: this.$route.path,
				query: {
					q: this.query,
					f: this.tab,
				}
			});
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

		search() {
			if (this.$route.query.q === this.query) return;

			this.$router.push(`${this.$route.path}?q=${encodeURIComponent(this.query)}&f=${encodeURIComponent(this.tab)}`);
		},

		fetch() {
			this.query = this.$route.query.q;
			this.generateSmartCard();
		},

		async generateSmartCard() {
			this.smartCard = null;

			const q = (this.$route.query.q as string || '').trim();

			// ActivityPub Object
			if (q.startsWith('https://')) {
				this.smartCard = {
					type: 'custom',
					body: this.$t('fetchingAsApObject'),
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
