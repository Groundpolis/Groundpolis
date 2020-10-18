<template>
<div class="mk-instance-emojis">
	<portal to="icon"><fa :icon="faLaugh"/></portal>
	<portal to="title">{{ $t('customEmojis') }}</portal>

	<mk-tab class="_section" v-model="tab" style="padding: 0" :items="[
			{ label: $t('local'), value: 'local' }, 
			{ label: $t('emojiSuggestion'), value: 'suggestion', icon: faHeart },
			{ label: $t('remote'), value: 'remote' }, 
		]"
	/>

	<section class="_section _vMargin local" v-if="tab === 'local'">
		<div class="_content">
			<mk-button inline primary @click="add"><fa :icon="faPlus"/> {{ $t('addEmoji') }}</mk-button>
			<mk-input v-model="q" :debounce="true"><span>{{ $t('search') }}</span></mk-input>
			<mk-pagination :pagination="pagination" class="emojis" ref="emojis">
				<template #empty><span>{{ $t('noCustomEmojis') }}</span></template>
				<template #default="{items}">
					<div class="emoji _card" v-for="(emoji, i) in items" :key="emoji.id" @click="edit(emoji)" :class="{ selected: selected && (selected.id === emoji.id) }">
						<img :src="emoji.url" class="img" :alt="emoji.name"/>
						<div class="body">
							<span class="name">{{ emoji.name }}</span>
							<span class="info">
								<b class="category">{{ emoji.category }}</b>
								<span class="aliases">{{ emoji.aliases.join(' ') }}</span>
							</span>
						</div>
					</div>
				</template>
			</mk-pagination>
		</div>
		<!-- <div class="_content" v-if="selected">
			<mk-input v-model="name"><span>{{ $t('name') }}</span></mk-input>
			<mk-input v-model="category" :datalist="categories"><span>{{ $t('category') }}</span></mk-input>
			<mk-input v-model="aliases"><span>{{ $t('tags') }}</span></mk-input>
			<mk-button inline primary @click="update"><fa :icon="faSave"/> {{ $t('save') }}</mk-button>
			<mk-button inline :disabled="selected == null" @click="del()"><fa :icon="faTrashAlt"/> {{ $t('delete') }}</mk-button>
		</div> -->
	</section>

	<section class="_section _vMargin suggestions" v-else-if="tab === 'suggestion'">
		<div class="_content">
			<mk-switch v-model="pendingOnly">{{ $t('pendingOnly') }}</mk-switch>
			<mk-pagination :pagination="suggestionPagination" class="emojis" ref="suggestions">
				<template #empty><span>{{ $t('noSuggestions') }}</span></template>
				<template #default="{items}">
					<div class="emoji" v-for="req in items" :key="req.id">
						<img :src="req.file.url" class="img" :alt="req.name"/>
						<div class="body">
							<div>
								<span class="name">{{ req.name }}</span>
								<span class="alias" v-for="a in req.aliases" :key="a" v-text="a"/>
							</div>
							<div class="proposer">
								{{ $t('proposer') }}: 
								<router-link :to="req.proposer | userPage"><mk-acct :user="req.proposer"/></router-link>
							</div>
							<mfm class="description" :text="req.description" />
							<span class="state" v-if="req.state !== 'pending'">
								<fa :icon="req.state === 'accepted' ? faCheck : faTimes" />
								{{ $t(req.state) }}
							</span>
							<mk-button inline primary v-if="req.state !== 'accepted'" @click="accept(req.id)">
								<fa :icon="faCheck" />
								{{ $t('accept') }}
							</mk-button>
							<mk-button inline v-if="req.state === 'pending'" @click="reject(req.id)">
								<fa :icon="faTimes" />
								{{ $t('reject') }}
							</mk-button>
						</div>
					</div>
				</template>
			</mk-pagination>
		</div>
	</section>

	<section class="_section _vMargin remote" v-else-if="tab === 'remote'">
		<div class="_content">
			<mk-input v-model="host" :debounce="true"><span>{{ $t('host') }}</span></mk-input>
			<mk-pagination :pagination="remotePagination" class="emojis" ref="remoteEmojis">
				<template #empty><span>{{ $t('noCustomEmojis') }}</span></template>
				<template #default="{items}">
					<div class="emoji" v-for="(emoji, i) in items" :key="emoji.id" @click="selectedRemote = emoji" :class="{ selected: selectedRemote && (selectedRemote.id === emoji.id) }">
						<img :src="emoji.url" class="img" :alt="emoji.name"/>
						<div class="body">
							<span class="name">{{ emoji.name }}</span>
							<span class="info">{{ emoji.host }}</span>
						</div>
					</div>
				</template>
			</mk-pagination>
		</div>
		<div class="_footer">
			<mk-button inline primary :disabled="selectedRemote == null" @click="im()"><fa :icon="faPlus"/> {{ $t('import') }}</mk-button>
		</div>
	</section>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { faPlus, faSave, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { faTrashAlt, faLaugh } from '@fortawesome/free-regular-svg-icons';
import MkButton from '../../components/ui/button.vue';
import MkInput from '../../components/ui/input.vue';
import MkSwitch from '../../components/ui/switch.vue';
import MkPagination from '../../components/ui/pagination.vue';
import { selectFile } from '../../scripts/select-file';
import { unique } from '../../../prelude/array';
import MkTab from '../../components/tab.vue';

export default Vue.extend({
	metaInfo() {
		return {
			title: `${this.$t('customEmojis')} | ${this.$t('instance')}`
		};
	},

	components: {
		MkButton,
		MkInput,
		MkPagination,
		MkSwitch,
		MkTab,
	},

	data() {
		return {
			selected: null,
			selectedRemote: null,
			name: null,
			category: null,
			aliases: null,
			host: '',
			q: '',
			tab: 'local',
			pendingOnly: true,
			pagination: {
				endpoint: 'admin/emoji/list',
				limit: 10,
			},
			suggestionPagination: {
				endpoint: 'suggestions/emojis/list',
				limit: 10,
				params: () => ({
					includingStates: this.pendingOnly ? [ 'pending' ] : [],
				})
			},
			remotePagination: {
				endpoint: 'admin/emoji/list-remote',
				limit: 10,
				params: () => ({
					host: this.host ? this.host : null
				})
			},
			faTrashAlt, faPlus, faLaugh, faSave, faCheck, faTimes
		}
	},

	computed: {
		categories() {
			if (this.$store.state.instance.meta) {
				return unique(this.$store.state.instance.meta.emojis.map((x: any) => x.category || '').filter((x: string) => x !== ''));
			} else {
				return [];
			}
		}
	},

	watch: {
		host() {
			this.$refs.remoteEmojis.reload();
		},

		pendingOnly() {
			this.$refs.suggestions.reload();
		},

		selected() {
			this.name = this.selected ? this.selected.name : null;
			this.category = this.selected ? this.selected.category : null;
			this.aliases = this.selected ? this.selected.aliases.join(' ') : null;
		}
	},

	methods: {
		async add(e) {
			const files = await selectFile(this, e.currentTarget || e.target, null, true);

			const dialog = this.$root.dialog({
				type: 'waiting',
				text: this.$t('doing') + '...',
				showOkButton: false,
				showCancelButton: false,
				cancelableByBgClick: false
			});
			
			Promise.all(files.map(file => this.$root.api('admin/emoji/add', {
				fileId: file.id,
			})))
			.then(() => {
				if (this.autoReload) this.$refs.emojis.reload();
				this.$root.dialog({
					type: 'success',
					iconOnly: true, autoClose: true
				});
			})
			.finally(() => {
				dialog.close();
			});
		},

		async edit(emoji: Record<string, any>) {
			this.$root.new(await import('../../components/emoji-editor-window.vue').then(m => m.default), { emoji }).$once('done', result => {
				if (result.updated) {
					this.$refs.emojis.replaceItem(item => item.id === emoji.id, {
						...emoji,
						...result.updated
					});
				} else if (result.deleted) {
					this.$refs.emojis.removeItem(item => item.id === emoji.id);
				}
			});136
		},

		async del() {
			const { canceled } = await this.$root.dialog({
				type: 'warning',
				text: this.$t('removeAreYouSure', { x: this.selected.name }),
				showCancelButton: true
			});
			if (canceled) return;

			await this.$root.api('admin/emoji/remove', { id: this.selected.id });
		},

		async accept(suggestionId: string) {
			await this.$root.api('admin/suggestions/emojis/accept', { suggestionId });
			if (this.autoReload) this.$refs.suggestions.reload();
		},

		async reject(suggestionId: string) {
			const { canceled, result: comment } = await this.$root.dialog({
				title: this.$t('writeRejectReason'),
				input: true,
				autoComplete: true
			});

			if (canceled) return;

			await this.$root.api('admin/suggestions/emojis/reject', { suggestionId, comment });
			if (this.autoReload) this.$refs.suggestions.reload();
		},

		im() {
			this.$root.api('admin/emoji/copy', {
				emojiId: this.selectedRemote.id,
			}).then(() => {
				if (this.autoReload) this.$refs.emojis.reload();
				this.$root.dialog({
					type: 'success',
					iconOnly: true, autoClose: true
				});
			}).catch(e => {
				this.$root.dialog({
					type: 'error',
					text: e
				});
			});
		},

		reload() {
			this.$refs.emojis.reload();
		}
	}
});
</script>

<style lang="scss" scoped>
.mk-instance-emojis {
	> .local {
		> ._content {
			> .emojis {
				display: grid;
				grid-template-columns: repeat(auto-fill,minmax(190px,1fr));
				grid-gap: var(--margin);
				> .emoji {
					display: flex;
					padding: 16px;
					align-items: center;
					cursor: pointer;

					> .img {
						width: 48px;
						height: 48px;
					}

					> .body {
						padding: 8px;

						> .name {
							display: block;
						}

						> .info {
							opacity: 0.5;

							> .category {
								margin-right: 16px;
							}

							> .aliases {
								font-style: oblique;
							}
						}
					}
				}
			}
		}
	}

	> .suggestions {
		> ._content {
			max-height: 300px;
			overflow: auto;
			> .emojis {
				> .emoji {
					display: flex;
					align-items: center;

					> .img {
						width: 50px;
						height: 50px;
					}

					> .body {
						padding: 8px;
						div {
							> .name {
								font-weight: bold;
							}
							> .alias {
								opacity: 0.5;
								margin: 0 0.25em;
							}
						}
						> .proposer {
							opacity: 0.5;
						}
						> .description {
							display: block;
							margin: 8px;
							padding: 6px 0 6px 12px;
							color: var(--fg);
							border-left: solid 3px var(--fg);
							opacity: 0.7;
						}
						> .state {
							opacity: 0.5;
						}
					}
				}
			}
		}
	}

	> .remote {
		> ._content {
			max-height: 300px;
			overflow: auto;
			
			> .emojis {
				> .emoji {
					display: flex;
					align-items: center;

					&.selected {
						background: var(--accent);
						box-shadow: 0 0 0 8px var(--accent);
						color: #fff;
					}

					> .img {
						width: 32px;
						height: 32px;
					}

					> .body {
						padding: 0 8px;

						> .name {
							display: block;
						}

						> .info {
							opacity: 0.5;
						}
					}
				}
			}
		}
	}
}
</style>
