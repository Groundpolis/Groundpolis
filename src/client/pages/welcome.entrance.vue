<template>
<div class="rsqzvsbo _section" v-if="meta">
	<div class="overview _monospace" v-if="stats">
		<div class="stats">
			<div><span>Users</span><span>{{ number(stats.originalUsersCount) }}</span></div>
			<div><span>Notes</span><span>{{ number(stats.originalNotesCount) }}</span></div>
			<div><span>Reactions</span><span>{{ number(stats.reactionsCount) }}</span></div>
		</div>
		<div class="tags">
			<MkA class="tag" v-for="tag in tags" :to="`/tags/${encodeURIComponent(tag.tag)}`">#{{ tag.tag }}</MkA>
		</div>
	</div>
	<template v-if="meta.pinnedClipId">
		<h2># {{ $ts.pinnedNotes }}</h2>
		<MkPagination :pagination="clipPagination" #default="{items}">
			<XNote class="kmkqjgkl" v-for="note in items" :note="note" :key="note.id"/>
		</MkPagination>
	</template>
	<template v-else>
		<h2>
			<Fa :icon="notesIcon" />
			{{ notesHeader }}
		</h2>
		<MkPagination :pagination="pagination" #default="{items}">
			<XNote class="kmkqjgkl" v-for="note in items" :note="note" :key="note.id"/>
		</MkPagination>
	</template>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { toUnicode } from 'punycode';
import XSigninDialog from '@/components/signin-dialog.vue';
import XSignupDialog from '@/components/signup-dialog.vue';
import MkButton from '@/components/ui/button.vue';
import XNote from '@/components/note.vue';
import MkPagination from '@/components/ui/pagination.vue';
import { host, instanceName } from '@/config';
import * as os from '@/os';
import number from '@/filters/number';
import { faComments, faFireAlt, faGlobe } from '@fortawesome/free-solid-svg-icons';
export default defineComponent({
	components: {
		MkButton,
		XNote,
		MkPagination,
	},
	data() {
		return {
			host: toUnicode(host),
			instanceName,
			meta: null,
			stats: null,
			tags: [],
			clipPagination: {
				endpoint: 'clips/notes',
				limit: 10,
				params: () => ({
					clipId: this.meta.pinnedClipId,
				})
			},
		};
	},
	computed: {
		endpoint() {
			return  !this.meta.disableFeatured ? 'notes/featured' :
							!this.meta.disableLocalTimeline ? 'notes/local-timeline' :
							!this.meta.disableGlobalTimeline ? 'notes/global-timeline' : null;
		},
		notesIcon() {
			switch (this.endpoint) {
				case 'notes/featured': return faFireAlt;
				case 'notes/local-timeline': return faComments;
				case 'notes/global-timeline': return faGlobe;
				default: return null;
			}
		},
		notesHeader() {
			return this.$t(this.endpoint === 'notes/featured' ? 'welcomeFeatured' : 'welcomeTimeline');
		},
		pagination() {
			if (this.endpoint === null) return null;
			return {
				endpoint: this.endpoint,
				limit: 10,
				noPaging: true,
			};
		}
	},
	created() {
		os.api('meta', { detail: true }).then(meta => {
			this.meta = meta;
		});
		os.api('stats').then(stats => {
			this.stats = stats;
		});
		os.api('hashtags/list', {
			sort: '+mentionedLocalUsers',
			limit: 8
		}).then(tags => {
			this.tags = tags;
		});
	},
	methods: {
		signin() {
			os.popup(XSigninDialog, {
				autoSet: true
			}, {}, 'closed');
		},
		signup() {
			os.popup(XSignupDialog, {
				autoSet: true
			}, {}, 'closed');
		},
		number
	}
});
</script>

<style lang="scss" scoped>
.rsqzvsbo {
	text-align: center;
	> h2 {
		display: inline-block;
		color: #fff;
		margin: 16px;
		padding: 8px 12px;
		background: rgba(0, 0, 0, 0.5);
	}
	> .overview {
		> .stats, > .tags {
			display: inline-block;
			vertical-align: top;
			width: 100%;
			max-width: 640px;
			padding: 32px;
			margin: 16px;
			box-sizing: border-box;
			@media (max-width: 800px) {
				display: block;
				width: 100%;
				margin: 12px 0;
			}
		}
		> .stats {
			background: var(--accent);
			border-radius: 12px;
			color: #fff;
			font-size: 1.5em;
			> div {
				display: flex;
				> span:first-child {
					opacity: 0.7;
					font-weight: bold;
				}
				> span:last-child {
					margin-left: auto;
				}
			}
		}
		> .tags {
			background: var(--panel);
			border-radius: 12px;
			color: var(--fg);
			font-size: 1.5em;
			> .tag {
				margin-right: 1em;
			}
		}
	}
}
.kmkqjgkl {
	/* display: inline-block; */
	vertical-align: middle;
	/* width: 530px; */
	margin: 16px;
	box-sizing: border-box;
	text-align: left;
	box-shadow: 0 6px 46px rgb(0 0 0 / 25%);
	border-radius: 12px;
	@media (max-width: 800px) {
		display: block;
		width: 100%;
		margin: 12px 0;
	}
}
</style>
