<template>
	<div class="v93n3na0">
		<section class="_section">
			<div class="_content">
				<div class="preview">
					<mk-button inline @click="selectFile">{{ $t('selectFile') }}</mk-button>
					<img v-if="file" :src="file.url" :alt="file.name" />
				</div>
				<mk-input v-model:value="name"><span>{{ $t('name') }}</span></mk-input>
				<mk-input v-model:value="aliases">
					<span>{{ $t('tags') }}</span>
					<template #desc>{{ $t('tagsDescription') }}</template>
				</mk-input>
				<mk-textarea v-model:value="description" :useAutocomplete="true" :max="500">
					<span>{{ $t('emojiSuggestionMessage') }}</span>
					<template #desc>{{ $t('emojiSuggestionMessageDescription') }}</template>
				</mk-textarea>
			</div>
			<div class="_footer">
				<mk-button inline primary :disabled="!canSend" @click="send"><fa :icon="faPaperPlane" fixed-width />{{ $t('sendSuggestion') }}</mk-button>
			</div>
		</section>
		<section class="_section _vMargin">
			<div class="_title"><fa :icon="faHistory"/> {{ $t('history') }}</div>
			<div class="_content filter">
				<mk-switch v-model:value="includesPending"><fa :icon="faClock" fixed-width />{{ $t('pending') }}</mk-switch>
				<mk-switch v-model:value="includesRejected"><fa :icon="faTimesCircle" fixed-width />{{ $t('rejected') }}</mk-switch>
				<mk-switch v-model:value="includesAccepted"><fa :icon="faCheckCircle" fixed-width />{{ $t('accepted') }}</mk-switch>
			</div>
			<div class="_content">
				<mk-pagination :pagination="pagination" class="suggestions" ref="pagination">
					<template #empty><span>{{ $t('noSuggestions') }}</span></template>
					<template #default="{items}">
						<div class="item" v-for="item in items" :key="item.id">
							<img :src="item.file.url" class="img" :alt="item.name"/>
							<div class="body">
								<div class="name">
									<fa :icon="getIconOf(item.state)" :title="$t(item.state)" fixed-width/>
									{{ item.name }}
								</div>
								<div class="aliases" v-if="item.aliases.length > 0">
									<span class="alias" v-for="a in item.aliases" :key="a" v-text="a"/>
								</div>
								<mfm class="description" :text="item.description"/>
								<div class="moderator-comment" v-if="item.moderatorComment">
									<h1 v-text="$t('commentFromModerators')" />
									<mfm class="description" :text="item.moderatorComment"/>
								</div>
							</div>
							<button class="delete" @click.stop="del(item.id)">
								<fa :icon="faTimes" />
							</button>
						</div>
					</template>
				</mk-pagination>
			</div>
		</section>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { faLaugh, faHistory, faPaperPlane, faClock, faTimes, faTimesCircle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import MkButton from '../components/ui/button.vue';
import MkInput from '../components/ui/input.vue';
import MkTextarea from '../components/ui/textarea.vue';
import MkSwitch from '../components/ui/switch.vue';
import MkPagination from '../components/ui/pagination.vue';
import { PackedDriveFile } from '../../models/repositories/drive-file';
import { selectFile } from '../scripts/select-file';
import { PackedEmojiRequest } from '../../models/repositories/emoji-request';
import * as os from '@/os';

export default defineComponent({
	components: {
		MkButton,
		MkInput,
		MkTextarea,
		MkSwitch,
		MkPagination
	},
	data() {
			return {
				INFO: {
					header: [{
						title: this.$t('emojiSuggestion'),
						icon: faLaugh,
					}],
				},
				name: '',
				aliases: '',
				description: '',
				includesPending: true,
				includesRejected: true,
				includesAccepted: true,
				file: null as PackedDriveFile | null,
				pagination: {
					endpoint: 'suggestions/emojis/list',
					limit: 10,
					params: () => ({
						proposerId: this.$store.state.i.id,
						includingStates: this.includingStates,
					})
				},
				autocomplete: null,
				selectedRequest: null as PackedEmojiRequest | null,
				faLaugh, faHistory, faPaperPlane, faClock, faTimes, faTimesCircle, faCheckCircle
			}
	},
	computed: {
		includingStates() {
			const r = [] as string[];
			if (this.includesPending) r.push('pending');
			if (this.includesRejected) r.push('rejected');
			if (this.includesAccepted) r.push('accepted');
			return r;
		},
		canSend() {
			return this.file && this.name && this.description;
		}
	},
	watch: {
		includesPending() { this.$refs.pagination.reload(); },
		includesAccepted() { this.$refs.pagination.reload(); },
		includesRejected() { this.$refs.pagination.reload(); },
	},
	methods: {
		getIconOf(state: string) {
			switch (state) {
				case 'pending': return faClock;
				case 'rejected': return faTimesCircle;
				case 'accepted': return faCheckCircle;
				default: return null;
			}
		},
		async selectFile(e: any) {
			this.file = await selectFile(e.currentTarget || e.target, null, false) as PackedDriveFile;
			// 画像じゃなければエラー
			if (!this.file.type.startsWith('image')) {
				this.file = null;
				os.dialog({
					type: 'error',
					text: this.$t('theFileIsNotImage'),
				});
			}
		},
		send() {
			if (!this.file) return;
			os.api('suggestions/emojis/create', {
				name: this.name,
				aliases: this.aliases.split(' ').filter(a => a),
				fileId: this.file.id,
				description: this.description
			}).then(() => {
				os.dialog({
					type: 'success',
					text: this.$t('emojiSuggestionSent')
				});
				this.name = this.aliases = this.description = '';
				this.file = null;
				this.$refs.pagination.reload();
			}).catch(e => {
				os.dialog({
					type: 'error',
					text: e.message
				});
			});
		},
		async del(id: string) {
			const { canceled } = await os.dialog({
				type: 'warning',
				showCancelButton: true,
				text: this.$t('emojiSuggestionDeleteConfirm'),
			});
			if (canceled) return;

			try {
				await os.api('suggestions/emojis/delete', { id });
				this.$refs.pagination.reload();
			} catch (e) {
				os.dialog({
					type: 'error',
					text: e.message
				});
			}
		}
	}
})
</script>

<style lang="scss" scoped>
.v93n3na0 {
	.preview {
		display: flex;
		> img {
			height: 32px;
			margin-left: 8px;
		}
	}

	.filter {
		display: flex;

		> * {
			margin: 0 16px;
		}
	}

	.suggestions {
		width: 100%;
		height: 256px;
		overflow: auto;
		> .item {
			display: flex;
			align-items: flex-start;
			&.selected {
				background: var(--accent);
				box-shadow: 0 0 0 8px var(--accent);
				color: #fff;

				> .delete {
					color: #fff;
				}
			}
			> .img {
				width: 50px;
				height: 50px;
			}
			> .body {
				padding: 8px;
				> .name {
					display: block;
					font-weight: bold;
				}
				> .aliases {
					opacity: 0.5;
					> .alias {
						margin-right: 0.5em;
					}
				}
				.description {
					display: block;
					margin: 8px;
					padding: 6px 0 6px 12px;
					color: var(--fg);
					border-left: solid 3px var(--fg);
					opacity: 0.7;
				}
				> .moderator-comment {
					> h1 {
						font-size: 1em;
						margin: 0;
					}
				}
			}
			> .delete {
				margin-left: auto;
				border: none;
				background: transparent;
				color: var(--accent);
				cursor: pointer;
				height: 32px;
				width: 32px;
				outline: none;
				
				&:hover {
					background: rgba(0, 0, 0, 0.05);
				}

				&:active {
					background: rgba(0, 0, 0, 0.1);
				}
			}
		}
	}
}
</style>
