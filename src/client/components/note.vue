<template>
<div
	class="note _panel"
	v-show="!isDeleted && !hideThisNote"
	:tabindex="!isDeleted ? '-1' : null"
	:class="{ renote: isRenote }"
	v-hotkey="keymap"
	v-size="[{ max: 500 }, { max: 450 }, { max: 350 }, { max: 300 }]"
>
	<article class="article">
		<div class="main">
			<x-note-header class="header" :note="appearNote" :mini="true"/>
			<div class="body" v-if="appearNote.deletedAt == null" ref="noteBody">
				<p v-if="appearNote.cw != null" class="cw">
					<mfm v-if="appearNote.cw != ''" class="text" :text="appearNote.cw" :author="appearNote.user" :i="$store.state.i" :custom-emojis="appearNote.emojis" />
					<x-cw-button v-model="showContent" :note="appearNote"/>
				</p>
				<div class="content" v-show="appearNote.cw == null || showContent">
					<div class="text">
						<router-link class="reply" v-if="appearNote.replyId" :to="`/notes/${appearNote.replyId}`"><fa :icon="faReply"/></router-link>
						<mfm v-if="appearNote.text" :text="appearNote.text" :author="appearNote.user" :i="$store.state.i" :custom-emojis="appearNote.emojis"/>
					</div>
					<div class="files" v-if="appearNote.files.length > 0">
						<x-media-list :media-list="appearNote.files" :parent-element="noteBody"/>
					</div>
					<mk-url-preview v-for="url in urls" :url="url" :key="url" :compact="true" class="url-preview"/>
				</div>
			</div>
			<footer v-if="appearNote.deletedAt == null" class="footer">
				<x-reactions-viewer :note="appearNote" ref="reactionsViewer"/>
				<button v-if="appearNote.myReaction == null" class="button _button" @click="react()" ref="reactButton">
					<fa :icon="faSmile" fixed-width/>
					<fa :icon="faPlus" fixed-width/>
				</button>
				<button v-if="appearNote.myReaction != null" class="button _button reacted" @click="undoReact(appearNote)">
					<fa :icon="faSmile" fixed-width/>
					<fa :icon="faMinus" fixed-width/>
				</button>
				<button v-if="appearNote.isMyNote" class="button _button" @click="delEdit()">
					<fa :icon="faEdit"/>						
				</button>
				<button v-if="appearNote.isMyNote || ($store.state.i && ($store.state.i.isModerator || $store.state.i.isAdmin))" class="button _button" @click="del()">
					<fa :icon="faTrashAlt"/>						
				</button>
				<button class="button _button" @click="report(appearNote)">
					<fa :icon="faExclamationCircle" fixed-width/>
				</button>
			</footer>
			<div class="deleted" v-if="appearNote.deletedAt != null">{{ $t('deleted') }}</div>
		</div>
	</article>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { faBolt, faTimes, faBullhorn, faSmile, faPlus, faMinus, faRetweet, faReply, faReplyAll, faEllipsisH, faHome, faUnlock, faEnvelope, faThumbtack, faBan, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { faTrashAlt, faEdit} from '@fortawesome/free-regular-svg-icons';
import { parse } from '../../mfm/parse';
import { sum, unique } from '../../prelude/array';
import XNoteHeader from './note-header.vue';
import XReactionsViewer from './reactions-viewer.vue';
import XMediaList from './media-list.vue';
import XCwButton from './cw-button.vue';
import MkUrlPreview from './url-preview.vue';
import MkReactionPicker from './reaction-picker.vue';
import pleaseLogin from '../scripts/please-login';
import { focusPrev, focusNext } from '../scripts/focus';
import { url } from '../config';
import copyToClipboard from '../scripts/copy-to-clipboard';

export default Vue.extend({
	
	components: {
		XNoteHeader,
		XReactionsViewer,
		XMediaList,
		XCwButton,
		MkUrlPreview,
	},

	props: {
		note: {
			type: Object,
			required: true
		},
		detail: {
			type: Boolean,
			required: false,
			default: false
		},
		pinned: {
			type: Boolean,
			required: false,
			default: false
		},
	},

	data() {
		return {
			connection: null,
			conversation: [],
			noteBody: null,
			replies: [],
			showContent: false,
			hideThisNote: false,
			faEdit, faBolt, faSmile, faTimes, faBullhorn, faPlus, faMinus, faRetweet, faReply, faReplyAll, faEllipsisH, faHome, faUnlock, faEnvelope, faThumbtack, faBan, faTrashAlt, faExclamationCircle
		};
	},

	computed: {
		keymap(): any {
			return {
				'delete|ctrl+d': this.del,
				'up|k|shift+tab': this.focusBefore,
				'down|j|tab': this.focusAfter,
				'esc': this.blur,
				'm|o': () => this.menu(true),
				's': this.toggleShowContent,
			};
		},

		isRenote(): boolean {
			return (this.note.renote &&
				this.note.text == null &&
				this.note.fileIds.length == 0 &&
				this.note.poll == null);
		},

		appearNote(): any {
			return this.isRenote ? this.note.renote : this.note;
		},

		isDeleted(): boolean {
			return this.appearNote.deletedAt != null || this.note.deletedAt != null;
		},

		isMyNote(): boolean {
			return this.$store.getters.isSignedIn && (this.$store.state.i.id === this.appearNote.userId);
		},

		isMyRenote(): boolean {
			return this.$store.getters.isSignedIn && (this.$store.state.i.id === this.note.userId);
		},

		canRenote(): boolean {
			return ['public', 'home'].includes(this.appearNote.visibility) || this.isMyNote;
		},

		reactionsCount(): number {
			return this.appearNote.reactions
				? sum(Object.values(this.appearNote.reactions))
				: 0;
		},

		urls(): string[] {
			if (this.appearNote.text) {
				const ast = parse(this.appearNote.text);
				// TODO: 再帰的にURL要素がないか調べる
				const urls = unique(ast
					.filter(t => ((t.node.type == 'url' || t.node.type == 'link') && t.node.props.url && !t.node.props.silent))
					.map(t => t.node.props.url));

				// unique without hash
				// [ http://a/#1, http://a/#2, http://b/#3 ] => [ http://a/#1, http://b/#3 ]
				const removeHash = x => x.replace(/#[^#]*$/, '');

				return urls.reduce((array, url) => {
					const removed = removeHash(url);
					if (!array.map(x => removeHash(x)).includes(removed)) array.push(url);
					return array;
				}, []);
			} else {
				return null;
			}
		}
	},

	created() {
		if (this.$store.getters.isSignedIn) {
			this.connection = this.$root.stream;
		}

		if (this.detail) {
			this.$root.api('notes/children', {
				noteId: this.appearNote.id,
				limit: 30
			}).then(replies => {
				this.replies = replies;
			});

			if (this.appearNote.replyId) {
				this.$root.api('notes/conversation', {
					noteId: this.appearNote.replyId
				}).then(conversation => {
					this.conversation = conversation.reverse();
				});
			}
		}
	},

	mounted() {
		this.capture(true);

		if (this.$store.getters.isSignedIn) {
			this.connection.on('_connected_', this.onStreamConnected);
		}

		this.noteBody = this.$refs.noteBody
	},

	beforeDestroy() {
		this.decapture(true);

		if (this.$store.getters.isSignedIn) {
			this.connection.off('_connected_', this.onStreamConnected);
		}
	},

	methods: {

		capture(withHandler = false) {
			if (this.$store.getters.isSignedIn) {
				this.connection.send(document.body.contains(this.$el) ? 'sn' : 's', { id: this.appearNote.id });
				if (withHandler) this.connection.on('noteUpdated', this.onStreamNoteUpdated);
			}
		},

		decapture(withHandler = false) {
			if (this.$store.getters.isSignedIn) {
				this.connection.send('un', {
					id: this.appearNote.id
				});
				if (withHandler) this.connection.off('noteUpdated', this.onStreamNoteUpdated);
			}
		},

		onStreamConnected() {
			this.capture();
		},

		onStreamNoteUpdated(data) {
			const { type, id, body } = data;

			if (id !== this.appearNote.id) return;

			switch (type) {
				case 'reacted': {
					const reaction = body.reaction;

					if (this.appearNote.reactions == null) {
						Vue.set(this.appearNote, 'reactions', {});
					}

					if (this.appearNote.reactions[reaction] == null) {
						Vue.set(this.appearNote.reactions, reaction, 0);
					}

					// Increment the count
					this.appearNote.reactions[reaction]++;

					if (body.userIdIsMine) {
						Vue.set(this.appearNote, 'myReaction', reaction);
					}
					break;
				}

				case 'unreacted': {
					const reaction = body.reaction;

					if (this.appearNote.reactions == null) {
						return;
					}

					if (this.appearNote.reactions[reaction] == null) {
						return;
					}

					// Decrement the count
					if (this.appearNote.reactions[reaction] > 0) this.appearNote.reactions[reaction]--;

					if (body.userIdIsMine) {
						Vue.set(this.appearNote, 'myReaction', null);
					}
					break;
				}

				case 'pollVoted': {
					const choice = body.choice;
					this.appearNote.poll.choices[choice].votes++;
					if (body.userId == this.$store.state.i.id) {
						Vue.set(this.appearNote.poll.choices[choice], 'isVoted', true);
					}
					break;
				}

				case 'deleted': {
					Vue.set(this.appearNote, 'deletedAt', body.deletedAt);
					Vue.set(this.appearNote, 'renote', null);
					this.appearNote.text = null;
					this.appearNote.fileIds = [];
					this.appearNote.poll = null;
					this.appearNote.cw = null;
					break;
				}
			}
		},

		react(viaKeyboard = false) {
			pleaseLogin(this.$root);
			this.blur();
			const picker = this.$root.new(MkReactionPicker, {
				source: this.$refs.reactButton,
				showFocus: viaKeyboard,
			});
			picker.$once('chosen', reaction => {
				this.$root.api('notes/reactions/create', {
					noteId: this.appearNote.id,
					reaction: reaction
				}).then(() => {
					picker.close();
				});
			});
			picker.$once('closed', this.focus);
		},

		reactDirectly(reaction) {
			this.$root.api('notes/reactions/create', {
				noteId: this.appearNote.id,
				reaction: reaction
			});
		},

		undoReact(note) {
			const oldReaction = note.myReaction;
			if (!oldReaction) return;
			this.$root.api('notes/reactions/delete', {
				noteId: note.id
			});
		},

		async report(note) {
			pleaseLogin(this.$root);
			const { canceled, result: comment } = await this.$root.dialog({
				title: this.$t('enterTheReasonToReportThisNote'),
				input: {
					placeholder: this.$t('reason'),
					allowEmpty: false
				}
			});

			if (canceled) return;

			if (!comment) {
				this.$root.dialog({
					type: 'error',
					iconOnly: true,
					autoClose: true
				});
				return;
			}

			try {
				await this.$root.api('notes/report', { noteId: note.id, comment });
				this.$root.dialog({
					type: 'success',
					iconOnly: true,
					autoClose: true
				});
			} catch (e) {
				this.$root.dialog({
					type: 'error',
					text: e.message,
				});
			}
		},

		favorite() {
			pleaseLogin(this.$root);
			this.$root.api('notes/favorites/create', {
				noteId: this.appearNote.id
			}).then(() => {
				this.$root.dialog({
					type: 'success',
					iconOnly: true, autoClose: true
				});
			});
		},

		del() {
			this.$root.dialog({
				type: 'warning',
				text: this.$t('noteDeleteConfirm'),
				showCancelButton: true
			}).then(({ canceled }) => {
				if (canceled) return;

				this.$root.api('notes/delete', {
					noteId: this.appearNote.id
				});
			});
		},

		delEdit() {
			this.$root.dialog({
				type: 'warning',
				text: this.$t('deleteAndEditConfirm'),
				showCancelButton: true
			}).then(({ canceled }) => {
				if (canceled) return;

				this.$root.api('notes/delete', {
					noteId: this.appearNote.id
				});

				this.$root.post({ initialNote: this.appearNote, renote: this.appearNote.renote, reply: this.appearNote.reply });
			});
		},

		toggleFavorite(favorite: boolean) {
			this.$root.api(favorite ? 'notes/favorites/create' : 'notes/favorites/delete', {
				noteId: this.appearNote.id
			}).then(() => {
				this.$root.dialog({
					type: 'success',
					iconOnly: true, autoClose: true
				});
			});
		},

		toggleWatch(watch: boolean) {
			this.$root.api(watch ? 'notes/watching/create' : 'notes/watching/delete', {
				noteId: this.appearNote.id
			}).then(() => {
				this.$root.dialog({
					type: 'success',
					iconOnly: true, autoClose: true
				});
			});
		},

		showRenoteMenu(viaKeyboard = false) {
			if (!this.isMyRenote) return;
			this.$root.menu({
				items: [{
					text: this.$t('unrenote'),
					icon: faTrashAlt,
					action: () => {
						this.$root.api('notes/delete', {
							noteId: this.note.id
						});
						Vue.set(this.note, 'deletedAt', new Date());
					}
				}],
				source: this.$refs.renoteTime,
				viaKeyboard: viaKeyboard
			});
		},

		toggleShowContent() {
			this.showContent = !this.showContent;
		},

		copyContent() {
			copyToClipboard(this.appearNote.text);
			this.$root.dialog({
				type: 'success',
				iconOnly: true, autoClose: true
			});
		},

		copyLink() {
			copyToClipboard(`${url}/notes/${this.appearNote.id}`);
			this.$root.dialog({
				type: 'success',
				iconOnly: true, autoClose: true
			});
		},

		togglePin(pin: boolean) {
			this.$root.api(pin ? 'i/pin' : 'i/unpin', {
				noteId: this.appearNote.id
			}).then(() => {
				this.$root.dialog({
					type: 'success',
					iconOnly: true, autoClose: true
				});
			}).catch(e => {
				if (e.id === '72dab508-c64d-498f-8740-a8eec1ba385a') {
					this.$root.dialog({
						type: 'error',
						text: this.$t('pinLimitExceeded')
					});
				}
			});
		},

		async promote() {
			const { canceled, result: days } = await this.$root.dialog({
				title: this.$t('numberOfDays'),
				input: { type: 'number' }
			});

			if (canceled) return;

			this.$root.api('admin/promo/create', {
				noteId: this.appearNote.id,
				expiresAt: Date.now() + (86400000 * days)
			}).then(() => {
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

		focus() {
			this.$el.focus();
		},

		blur() {
			this.$el.blur();
		},

		focusBefore() {
			focusPrev(this.$el);
		},

		focusAfter() {
			focusNext(this.$el);
		}
	}
});
</script>

<style lang="scss" scoped>
.note {
	position: relative;
	transition: box-shadow 0.1s ease;
	overflow: hidden;

	&.max-width_500px {
		font-size: 0.9em;
	}

	&.max-width_450px {
		> .renote {
			padding: 8px 16px 0 16px;
		}

		> .article {
			padding: 14px 16px 9px;

			> .avatar {
				margin: 0 10px 8px 0;
				width: 50px;
				height: 50px;
			}
		}
	}

	&.max-width_350px {
		> .article {
			> .main {
				> .footer {
					> .button {
						&:not(:last-child) {
							margin-right: 18px;
						}
					}
				}
			}
		}
	}

	&.max-width_300px {
		font-size: 0.825em;

		> .article {
			> .avatar {
				width: 44px;
				height: 44px;
			}

			> .main {
				> .footer {
					> .button {
						&:not(:last-child) {
							margin-right: 12px;
						}
					}
				}
			}
		}
	}

	&:focus {
		outline: none;
		box-shadow: 0 0 0 3px var(--focus);
	}

	&:hover > .article > .main > .footer > .button {
		opacity: 1;
	}

	> .info {
		display: flex;
		align-items: center;
		padding: 16px 32px 8px 32px;
		line-height: 24px;
		font-size: 90%;
		white-space: pre;
		color: #d28a3f;

		@media (max-width: 450px) {
			padding: 8px 16px 0 16px;
		}

		> [data-icon] {
			margin-right: 4px;
		}

		> .hide {
			margin-left: auto;
			color: inherit;
		}
	}

	> .info + .article {
		padding-top: 8px;
	}

	> .reply-to {
		opacity: 0.7;
		padding-bottom: 0;
	}

	> .reply-to-more {
		opacity: 0.7;
	}

	> .renote {
		display: flex;
		align-items: center;
		padding: 16px 32px 8px 32px;
		line-height: 28px;
		white-space: pre;
		color: var(--renote);

		> .avatar {
			flex-shrink: 0;
			display: inline-block;
			width: 28px;
			height: 28px;
			margin: 0 8px 0 0;
			border-radius: 6px;
		}

		> [data-icon] {
			margin-right: 4px;
		}

		> span {
			overflow: hidden;
			flex-shrink: 1;
			text-overflow: ellipsis;
			white-space: nowrap;

			> .name {
				font-weight: bold;
			}
		}

		> .info {
			margin-left: auto;
			font-size: 0.9em;

			> .time {
				flex-shrink: 0;
				color: inherit;

				> .dropdownIcon {
					margin-right: 4px;
				}
			}

			> .visibility {
				margin-left: 8px;
			}

			> .localOnly {
				margin-left: 8px;
			}
		}
	}

	> .renote + .article {
		padding-top: 8px;
	}

	> .article {
		display: flex;
		padding: 28px 32px 18px;

		> .avatar {
			flex-shrink: 0;
			display: block;
			//position: sticky;
			//top: 72px;
			margin: 0 14px 8px 0;
			width: 58px;
			height: 58px;
		}

		> .main {
			flex: 1;
			min-width: 0;

			> .body {
				margin-left: 0.5em;
				> .cw {
					cursor: default;
					display: block;
					margin: 0;
					padding: 0;
					overflow-wrap: break-word;

					> .text {
						margin-right: 8px;
					}
				}

				> .content {
					> .text {
						overflow-wrap: break-word;

						> .reply {
							color: var(--accent);
							margin-right: 0.5em;
						}

						> .rp {
							margin-left: 4px;
							font-style: oblique;
							color: var(--renote);
						}
					}

					> .url-preview {
						margin-top: 8px;
					}

					> .poll {
						font-size: 80%;
					}

					> .renote {
						padding: 8px 0;

						> * {
							padding: 16px;
							border: dashed 1px var(--renote);
							border-radius: 8px;
						}
					}
				}
			}

			> .footer {
				margin-top: 8px;
				> .button {
					margin: 0;
					padding: 8px;
					opacity: 0.7;

					&:not(:last-child) {
						margin-right: 28px;
					}

					&:hover {
						color: var(--fgHighlighted);
					}

					> .count {
						display: inline;
						margin: 0 0 0 8px;
						opacity: 0.7;
					}

					&.reacted {
						color: var(--accent);
					}
				}
			}

			> .deleted {
				opacity: 0.7;
			}
		}
	}

	> .reply {
		border-top: solid 1px var(--divider);
	}
}
</style>
