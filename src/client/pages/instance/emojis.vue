<template>
<div class="mk-instance-emojis">
	<portal to="icon"><fa :icon="faLaugh"/></portal>
	<portal to="title">{{ $t('customEmojis') }}</portal>

	<section class="_card _vMargin local">
		<div class="_title"><fa :icon="faLaugh"/> {{ $t('customEmojis') }}</div>
		<div class="_content">
			<mk-pagination :pagination="pagination" class="emojis" ref="emojis">
				<template #empty><span>{{ $t('noCustomEmojis') }}</span></template>
				<template #default="{items}">
					<div class="emoji" v-for="(emoji, i) in items" :key="emoji.id" @click="selected = emoji" :class="{ selected: selected && (selected.id === emoji.id) }">
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
		<div class="_content" v-if="selected">
			<mk-input v-model="name"><span>{{ $t('name') }}</span></mk-input>
			<mk-input v-model="category" :datalist="categories"><span>{{ $t('category') }}</span></mk-input>
			<mk-input v-model="aliases"><span>{{ $t('tags') }}</span></mk-input>
			<mk-button inline primary @click="update"><fa :icon="faSave"/> {{ $t('save') }}</mk-button>
			<mk-button inline :disabled="selected == null" @click="del()"><fa :icon="faTrashAlt"/> {{ $t('delete') }}</mk-button>
		</div>
		<div class="_footer">
			<mk-button inline primary @click="add"><fa :icon="faPlus"/> {{ $t('addEmoji') }}</mk-button>
			<mk-switch v-model="autoReload">{{ $t('autoReloadAfterSaving') }}</mk-switch>
			<mk-button v-if="!autoReload" @click="reload">{{ $t('reload') }}</mk-button>
		</div>
	</section>
	<section class="_card _vMargin suggestions">
		<div class="_title"><fa :icon="faLaugh"/> {{ $t('suggestedEmojis') }}</div>
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
	<section class="_card _vMargin remote">
		<div class="_title"><fa :icon="faLaugh"/> {{ $t('customEmojisOfRemote') }}</div>
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
		MkSwitch
	},

	data() {
		return {
			selected: null,
			selectedRemote: null,
			name: null,
			category: null,
			aliases: null,
			host: '',
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
		},
		autoReload: {
			get () { return this.$store.state.device.instanceEmojisAutoReloadAfterSaving },
			set(value) { this.$store.commit('device/set', { key: 'instanceEmojisAutoReloadAfterSaving', value }) }
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

		async update() {
			await this.$root.api('admin/emoji/update', {
				id: this.selected.id,
				name: this.name,
				category: this.category,
				aliases: this.aliases.split(' '),
			});

			if (this.autoReload) this.$refs.emojis.reload();
		},

		async del() {
			const { canceled } = await this.$root.dialog({
				type: 'warning',
				text: this.$t('removeAreYouSure', { x: this.selected.name }),
				showCancelButton: true
			});
			if (canceled) return;

			await this.$root.api('admin/emoji/remove', { id: this.selected.id });
			if (this.autoReload) this.$refs.emojis.reload();
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
						width: 50px;
						height: 50px;
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
