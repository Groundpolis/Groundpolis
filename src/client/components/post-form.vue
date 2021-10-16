<template>
<div class="gafaadew" :class="{ modal, _popup: modal }"
	v-size="{ max: [500] }"
	@dragover.stop="onDragover"
	@dragenter="onDragenter"
	@dragleave="onDragleave"
	@drop.stop="onDrop"
>
	<header>
		<button v-if="!fixed" class="cancel _button" @click="cancel"><Fa :icon="faTimes"/></button>
		<div>
			<button class="_button" @click="insert('> ')" v-tooltip="$ts._mfmpad.quote"><Fa :icon="faQuoteRight"/></button>
			<button class="_button" @click="link" v-tooltip="$ts._mfmpad.link"><Fa :icon="faLink"/></button>
			<button class="_button function" @click="insertFunction" v-tooltip="$ts._mfmpad.functions"><code style="font-weight: bold">[]</code></button>
			<button class="_button" @click="insertMention" v-tooltip="$ts.mention"><Fa :icon="faAt"/></button>
			<button class="_button" @click="insertEmoji" v-tooltip="$ts.emoji"><Fa :icon="faLaughSquint"/></button>
			<div class="divider"></div>
			<button class="_button help" v-tooltip="$ts.help" @click="help">
				<Fa :icon="faQuestionCircle" />
			</button>
			<button class="_button visibility" @click="setVisibility" ref="visibilityButton" v-tooltip="$ts.visibility" v-if="channel == null">
				<VisibilityIcon
					:visibility="visibility"
					:localOnly="localOnly"
					:remoteFollowersOnly="remoteFollowersOnly"
					/>
			</button>
			<!-- <div class="spacer"></div> -->
		</div>
	</header>
	<div class="form" :class="{ fixed }">
		<button v-if="quote && !renote" class="_textButton" style="padding-left: 8px" @click="quote = null">{{ $ts.unrenote }}</button>
		<XNotePreview class="preview" v-if="reply" :note="reply"/>
		<XNotePreview class="preview" v-if="quote" :note="quote"/>
		<div v-if="visibility === 'specified'" class="to-specified">
			<span style="margin-right: 8px;">{{ $ts.recipient }}</span>
			<div class="visibleUsers">
				<span v-for="u in visibleUsers" :key="u.id">
					<MkAcct :user="u"/>
					<button class="_button" @click="removeVisibleUser(u)"><Fa :icon="faTimes"/></button>
				</span>
				<button @click="addVisibleUser" class="_buttonPrimary"><Fa :icon="faPlus" fixed-width/></button>
			</div>
		</div>
		<input v-show="useCw" ref="cw" class="cw" v-model="cw" :placeholder="$ts.annotation" @keydown="onKeydown">
		<textarea v-model="text" class="text" :class="{ withCw: useCw }" ref="text" :disabled="posting" :placeholder="placeholder" @keydown="onKeydown" @paste="onPaste" @compositionupdate="onCompositionUpdate" @compositionend="onCompositionEnd" />
		<input v-show="useBroadcast" ref="broadcastText" class="broadcastText" v-model="broadcastText" :placeholder="$ts.broadcastTextDescription" @keydown="onKeydown">
		<XPostFormAttaches class="attaches" :files="files" @updated="updateFiles" @detach="detachFile" @changeSensitive="updateFileSensitive" @changeName="updateFileName"/>
		<XPollEditor v-if="poll" :poll="poll" @destroyed="poll = null" @updated="onPollUpdate"/>
		<footer>
			<button :disabled="!currentAccountIsMyself" class="_button" @click="chooseFileFrom" v-tooltip="$ts.attachFile"><Fa :icon="faPhotoVideo"/></button>
			<button class="_button" @click="togglePoll" :class="{ active: poll }" v-tooltip="$ts.poll"><Fa :icon="faPollH"/></button>
			<button class="_button" @click="useCw = !useCw" :class="{ active: useCw }" v-tooltip="$ts.useCw"><Fa :icon="faEyeSlash"/></button>
			<button class="_button" @click="useBroadcast = !useBroadcast" :class="{ active: useBroadcast }" v-tooltip="$ts.broadcastMode"><Fa :icon="faBullhorn"/></button>
			<button class="_button" @click="insertFace" v-tooltip="$ts.gacha"><Fa :icon="faFish"/></button>
			<button v-if="currentAccount && accounts.length > 1" class="_button switch-user" @click="switchUser" v-tooltip="$ts.switchUser">
				<MkAvatar class="avatar" :user="currentAccount" disable-link disable-preview />
			</button>
			<button class="_button" @click="showActions" v-tooltip="$ts.plugin" v-if="postFormActions.length > 0"><Fa :icon="faPlug"/></button>
			<span class="text-count" :class="{ over: textLength > max }">{{ max - textLength }}</span>
			<button class="submit _buttonPrimary" :disabled="!canPost" @click="post">
				<Fa :icon="faPaperPlane" />
			</button>
		</footer>
		<MkSwitch v-if="requiredConfirmation" v-model:value="confirmed" class="confirm-switch">
			{{ $ts.confirmBeforePostLabel }}
		</MkSwitch>
		<details v-if="text" class="preview" :open="isPreviewOpened" @toggle="isPreviewOpened = $event.target.open">
			<summary>{{ $ts.preview }}</summary>
			<XNotePreview :note="previewNote"/>
		</details>
	</div>
</div>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent } from 'vue';
import { faReply, faQuoteRight, faPaperPlane, faTimes, faUpload, faPollH, faGlobe, faHome, faUnlock, faEnvelope, faPlus, faPhotoVideo, faCloud, faLink, faAt, faHeart, faUsers, faFish, faHeartbeat, faQuestionCircle, faBullhorn, faPlug, faChevronDown, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { faEyeSlash, faLaughSquint } from '@fortawesome/free-regular-svg-icons';
import insertTextAtCursor from 'insert-text-at-cursor';
import { length } from 'stringz';
import { toASCII } from 'punycode';
import XNotePreview from './note-preview.vue';
import * as mfm from 'mfm-js';
import { host, url } from '@/config';
import { erase, unique } from '../../prelude/array';
import extractMentions from '../../misc/extract-mentions';
import getAcct from '../../misc/acct/render';
import { formatTimeString } from '../../misc/format-time-string';
import { Autocomplete } from '@/scripts/autocomplete';
import * as os from '@/os';
import { selectFile } from '@/scripts/select-file';
import { FormItem } from '../scripts/form';
import { defaultStore, notePostInterruptors, postFormActions } from '@/store';
import VisibilityIcon from './visibility-icon.vue';
import MkSwitch from './ui/switch.vue';

export default defineComponent({
	components: {
		XNotePreview,
		MkSwitch,
		XPostFormAttaches: defineAsyncComponent(() => import('./post-form-attaches.vue')),
		XPollEditor: defineAsyncComponent(() => import('./poll-editor.vue')),
		VisibilityIcon,
	},

	inject: ['modal'],

	props: {
		reply: {
			type: Object,
			required: false
		},
		renote: {
			type: Object,
			required: false
		},
		channel: {
			type: Object,
			required: false
		},
		mention: {
			type: Object,
			required: false
		},
		specified: {
			type: Object,
			required: false
		},
		initialText: {
			type: String,
			required: false
		},
		initialNote: {
			type: Object,
			required: false
		},
		instant: {
			type: Boolean,
			required: false,
			default: false
		},
		fixed: {
			type: Boolean,
			required: false,
			default: false
		},
		autofocus: {
			type: Boolean,
			required: false,
			default: true
		},
	},

	emits: ['posted', 'cancel', 'esc'],

	data() {
		return {
			posting: false,
			text: '',
			files: [],
			poll: null,
			useCw: false,
			cw: null,
			localOnly: this.$store.state.rememberNoteVisibility ? this.$store.state.localOnly : this.$store.state.defaultNoteLocalOnly,
			remoteFollowersOnly: this.$store.state.rememberNoteVisibility ? this.$store.state.remoteFollowersOnly : this.$store.state.defaultNoteRemoteFollowersOnly,
			visibility: this.$store.state.rememberNoteVisibility ? this.$store.state.visibility : this.$store.state.defaultNoteVisibility,
			currentAccount: {} as Record<string, unknown>,
			currentAccountRegistry: {} as Record<string, unknown>,
			accounts: [] as Record<string, unknown>[],
			accountRegistries: [] as Record<string, unknown>[],
			useBroadcast: false,
			broadcastText: '',
			visibleUsers: [],
			autocomplete: null,
			draghover: false,
			quote: null as Record<string, unknown> | null,
			recentHashtags: JSON.parse(localStorage.getItem('hashtags') || '[]'),
			imeText: '',
			postFormActions,
			confirmed: false,
			requiredConfirmation: this.$store.state.confirmBeforePost,
			faReply, faQuoteRight, faPaperPlane, faTimes, faUpload, faPollH, faGlobe, faHome, faUnlock, faEnvelope, faEyeSlash, faLaughSquint, faPlus, faPhotoVideo, faCloud, faLink, faAt, faHeart, faUsers, faFish, faHeartbeat, faQuestionCircle, faBullhorn, faPlug, faChevronDown, faEllipsisV
		};
	},

	computed: {
		draftKey(): string {
			let key = this.channel ? `channel:${this.channel.id}` : '';

			if (this.quote && this.renote) {
				key += `renote:${this.quote.id}`;
			} else if (this.reply) {
				key += `reply:${this.reply.id}`;
			} else {
				key += 'note';
			}

			return key;
		},

		placeholder(): string {
			if (this.quote) {
				return this.$ts._postForm.quotePlaceholder;
			} else if (this.reply) {
				return this.$ts._postForm.replyPlaceholder;
			} else if (this.channel) {
				return this.$ts._postForm.channelPlaceholder;
			} else {
				const xs = [
					this.$ts._postForm._placeholders.a,
					this.$ts._postForm._placeholders.b,
					this.$ts._postForm._placeholders.c,
					this.$ts._postForm._placeholders.d,
					this.$ts._postForm._placeholders.e,
					this.$ts._postForm._placeholders.f
				];
				return xs[Math.floor(Math.random() * xs.length)];
			}
		},

		submitText(): string {
			return this.quote
				? this.$ts.quote
				: this.reply
					? this.$ts.reply
					: this.$ts.note;
		},

		textLength(): number {
			return length((this.text + this.imeText).trim());
		},

		canPost(): boolean {
			return !this.posting &&
				(!this.requiredConfirmation || this.confirmed) &&
				(1 <= this.textLength || 1 <= this.files.length || !!this.poll || !!this.quote) &&
				(this.textLength <= this.max) &&
				(!this.poll || this.poll.choices.length >= 2);
		},

		max(): number {
			return this.$instance ? this.$instance.maxNoteTextLength : 1000;
		},

		previewNote() {
			return {
				id: '',
				createdAt: new Date(),
				text: this.text + (this.useBroadcast ? ' ' + this.broadcastText : ''),
				cw: this.useCw ? this.cw : undefined,
				visibility: this.visibility,
				user: this.currentAccount,
				localOnly: this.localOnly,
				remoteFollowersOnly: this.remoteFollowersOnly,
				files: [],
			};
		},

		isPreviewOpened: defaultStore.makeGetterSetter('showPostPreview'),

		currentAccountIsMyself(): boolean {
			return this.$i.id === this.currentAccount.id;
		},
	},

	mounted() {
		this.currentAccount = this.$i;
		os.getAccounts().then(accts => {
			this.accounts = [
				this.currentAccount,
				...accts
			];
		});

		if (this.initialText) {
			this.text = this.initialText;
		}

		if (this.mention) {
			this.text = this.mention.host ? `@${this.mention.username}@${toASCII(this.mention.host)}` : `@${this.mention.username}`;
			this.text += ' ';
		}

		if (this.renote) {
			this.quote = this.renote;
		}

		if (this.reply && this.reply.user.host != null) {
			this.text = `@${this.reply.user.username}@${toASCII(this.reply.user.host)} `;
		}

		if (this.reply && this.reply.text != null) {
			const ast = mfm.parse(this.reply.text);

			for (const x of extractMentions(ast)) {
				const mention = x.host ? `@${x.username}@${toASCII(x.host)}` : `@${x.username}`;

				// 自分は除外
				if (this.$i.username == x.username && x.host == null) continue;
				if (this.$i.username == x.username && x.host == host) continue;

				// 重複は除外
				if (this.text.indexOf(`${mention} `) != -1) continue;

				this.text += `${mention} `;
			}
		}

		// デフォルト公開範囲
		if (this.channel) {
			this.visibility = 'public';
			this.localOnly = true; // TODO: チャンネルが連合するようになった折には消す
			this.remoteFollowersOnly = false;
		}

		// 公開以外へのリプライ時は元の公開範囲を引き継ぐ
		if (this.reply && ['home', 'followers', 'specified'].includes(this.reply.visibility)) {
			this.visibility = this.reply.visibility;
			if (this.reply.visibility === 'specified') {
				os.api('users/show', {
					userIds: this.reply.visibleUserIds.filter(uid => uid !== this.$i.id && uid !== this.reply.userId)
				}).then(users => {
					this.visibleUsers.push(...users);
				});

				if (this.reply.userId !== this.$i.id) {
					os.api('users/show', { userId: this.reply.userId }).then(user => {
						this.visibleUsers.push(user);
					});
				}
			}
		}

		if (this.specified) {
			this.visibility = 'specified';
			this.visibleUsers.push(this.specified);
		}

		// keep cw when reply
		if (this.$store.state.keepCw && this.reply && this.reply.cw) {
			this.useCw = true;
			this.cw = this.reply.cw;
		}

		if (this.autofocus) {
			this.focus();

			this.$nextTick(() => {
				this.focus();
			});
		}

		// TODO: detach when unmount
		new Autocomplete(this.$refs.text, this, { model: 'text' });
		new Autocomplete(this.$refs.cw, this, { model: 'cw' });

		this.$nextTick(() => {
			// 書きかけの投稿を復元
			if (!this.instant && !this.mention && !this.specified) {
				const draft = JSON.parse(localStorage.getItem('drafts') || '{}')[this.draftKey];
				if (draft) {
					this.text = draft.data.text;
					this.useCw = draft.data.useCw;
					this.cw = draft.data.cw;
					this.useBroadcast = draft.data.useBroadcast;
					this.broadcastText = draft.data.broadcastText;
					this.visibility = draft.data.visibility;
					this.localOnly = draft.data.localOnly;
					this.remoteFollowersOnly = draft.data.remoteFollowersOnly;
					this.quote = draft.data.quote;
					this.visibleUsers.push(...(draft.data.visibleUsers as []));
					this.files = (draft.data.files || []).filter(e => e);
					if (draft.data.poll) {
						this.poll = draft.data.poll;
					}
				}
			}

			// 削除して編集
			if (this.initialNote) {
				const init = this.initialNote;
				this.text = init.text ? init.text : '';
				this.files = init.files;
				this.cw = init.cw;
				this.useCw = init.cw != null;
				if (init.poll) {
					this.poll = init.poll;
				}
				this.visibility = init.visibility;
				this.localOnly = init.localOnly;
				this.remoteFollowersOnly = init.remoteFollowersOnly;
				this.quote = init.renote;
				if (init.visibleUserIds && init.visibleUserIds.length > 0) {
					os.api('users/show', {
						userIds: init.visibleUserIds
					}).then((users: []) => {
						this.visibleUsers.push(...users);
						this.saveDraft();
					});
				} else {
					this.saveDraft();
				}
			}

			this.$nextTick(() => this.watch());
		});
	},

	methods: {
		watch() {
			this.$watch('text', this.saveDraft);
			this.$watch('quote', this.saveDraft);
			this.$watch('useCw', this.saveDraft);
			this.$watch('cw', this.saveDraft);
			this.$watch('useBroadcast', this.saveDraft);
			this.$watch('broadcastText', this.saveDraft);
			this.$watch('poll', this.saveDraft);
			this.$watch('files', this.saveDraft);
			this.$watch('visibility', this.saveDraft);
			this.$watch('visibleUsers', this.saveDraft);
			this.$watch('localOnly', this.saveDraft);
			this.$watch('remoteFollowersOnly', this.saveDraft);
		},

		togglePoll() {
			if (this.poll) {
				this.poll = null;
			} else {
				this.poll = {
					choices: ['', ''],
					multiple: false,
					expiresAt: null,
					expiredAfter: null,
				};
			}
		},

		addTag(tag: string) {
			this.insert(` #${tag} `);
		},

		focus() {
			(this.$refs.text as any).focus();
		},

		chooseFileFrom(ev) {
			selectFile(ev.currentTarget || ev.target, this.$ts.attachFile, true).then(files => {
				for (const file of files) {
					this.files.push(file);
				}
			});
		},

		detachFile(id) {
			this.files = this.files.filter(x => x.id != id);
		},

		updateFiles(files) {
			this.files = files;
		},

		updateFileSensitive(file, sensitive) {
			this.files[this.files.findIndex(x => x.id === file.id)].isSensitive = sensitive;
		},

		updateFileName(file, name) {
			this.files[this.files.findIndex(x => x.id === file.id)].name = name;
		},

		upload(file: File, name?: string) {
			os.upload(file, this.$store.state.uploadFolder, name).then(res => {
				this.files.push(res);
			});
		},

		onPollUpdate(poll) {
			this.poll = poll;
			this.saveDraft();
		},

		setVisibility() {
			if (this.channel) {
				// TODO: information dialog
				return;
			}

			os.popup(import('./visibility-picker.vue'), {
				currentVisibility: this.visibility,
				currentLocalOnly: this.localOnly,
				currentRemoteFollowersOnly: this.remoteFollowersOnly,
				src: this.$refs.visibilityButton
			}, {
				changeVisibility: visibility => {
					this.visibility = visibility;
					if (this.$store.state.rememberNoteVisibility) {
						this.$store.set('visibility', visibility);
					}
				},
				changeLocalOnly: localOnly => {
					this.localOnly = localOnly;
					if (this.$store.state.rememberNoteVisibility) {
						this.$store.set('localOnly', localOnly);
					}
				},
				changeRemoteFollowersOnly: remoteFollowersOnly => {
					this.remoteFollowersOnly = remoteFollowersOnly;
					if (this.$store.state.rememberNoteVisibility) {
						this.$store.set('remoteFollowersOnly', remoteFollowersOnly);
					}
				}
			}, 'closed');
		},

		addVisibleUser() {
			os.selectUser().then(user => {
				this.visibleUsers.push(user);
				this.saveDraft();
			});
		},

		removeVisibleUser(user) {
			this.visibleUsers = erase(user, this.visibleUsers);
			this.saveDraft();
		},

		clear() {
			this.text = '';
			this.files = [];
			this.poll = null;
			this.quote = null;
			this.confirmed = false;
		},

		help() {
			this.cancel();
			this.$router.push('/docs/post')
		},

		onKeydown(e: KeyboardEvent) {
			if ((e.which === 10 || e.which === 13) && (e.ctrlKey || e.metaKey) && this.canPost) this.post();
			if (e.which === 27) this.$emit('esc');
		},

		onCompositionUpdate(e: CompositionEvent) {
			this.imeText = e.data;
		},

		onCompositionEnd(e: CompositionEvent) {
			this.imeText = '';
		},

		async onPaste(e: ClipboardEvent) {
			if (!this.currentAccountIsMyself) return;
			for (const { item, i } of Array.from(e.clipboardData.items).map((item, i) => ({item, i}))) {
				if (item.kind == 'file') {
					const file = item.getAsFile();
					const lio = file.name.lastIndexOf('.');
					const ext = lio >= 0 ? file.name.slice(lio) : '';
					const formatted = `${formatTimeString(new Date(file.lastModified), this.$store.state.pastedFileName).replace(/{{number}}/g, `${i + 1}`)}${ext}`;
					this.upload(file, formatted);
				}
			}

			const paste = e.clipboardData.getData('text');

			if (!this.quote && paste.startsWith(url + '/notes/')) {
				e.preventDefault();

				os.dialog({
					type: 'info',
					text: this.$ts.quoteQuestion,
					showCancelButton: true
				}).then(({ canceled }) => {
					if (canceled) {
						this.insert(paste);
						return;
					}

					const quoteId = paste.substr(url.length).match(/^\/notes\/(.+?)\/?$/)![1];
					os.api('notes/show', {
						noteId: quoteId,
					}).then(note => {
						this.quote = note;
					}).catch(e => {
						os.dialog({
							type: 'error',
							text: e.message,
						});
					});
				});
			}
		},

		onDragover(e) {
			if (!this.currentAccountIsMyself) {
				e.preventDefault();
				this.draghover = true;
				e.dataTransfer.dropEffect = 'none';
				return;
			};
			if (!e.dataTransfer.items[0]) return;
			const isFile = e.dataTransfer.items[0].kind == 'file';
			const isDriveFile = e.dataTransfer.types[0] == _DATA_TRANSFER_DRIVE_FILE_;
			if (isFile || isDriveFile) {
				e.preventDefault();
				this.draghover = true;
				e.dataTransfer.dropEffect = e.dataTransfer.effectAllowed == 'all' ? 'copy' : 'move';
			}
		},

		onDragenter(e) {
			this.draghover = true;
		},

		onDragleave(e) {
			this.draghover = false;
		},

		onDrop(e): void {
			if (!this.currentAccountIsMyself) return;
			this.draghover = false;

			// ファイルだったら
			if (e.dataTransfer.files.length > 0) {
				e.preventDefault();
				for (const x of Array.from(e.dataTransfer.files)) this.upload(x);
				return;
			}

			//#region ドライブのファイル
			const driveFile = e.dataTransfer.getData(_DATA_TRANSFER_DRIVE_FILE_);
			if (driveFile != null && driveFile != '') {
				const file = JSON.parse(driveFile);
				this.files.push(file);
				e.preventDefault();
			}
			//#endregion
		},

		saveDraft() {
			if (this.instant) return;

			const data = JSON.parse(localStorage.getItem('drafts') || '{}');

			data[this.draftKey] = {
				updatedAt: new Date(),
				data: {
					text: this.text,
					useCw: this.useCw,
					cw: this.cw,
					useBroadcast: this.useBroadcast,
					broadcastText: this.broadcastText,
					visibility: this.visibility,
					localOnly: this.localOnly,
					remoteFollowersOnly: this.remoteFollowersOnly,
					visibleUsers: [ ...this.visibleUsers ],
					files: this.files,
					quote: this.quote,
					poll: this.poll
				}
			};

			localStorage.setItem('drafts', JSON.stringify(data));
		},

		deleteDraft() {
			const data = JSON.parse(localStorage.getItem('drafts') || '{}');

			delete data[this.draftKey];

			localStorage.setItem('drafts', JSON.stringify(data));
		},

		async post() {
			if (this.reply && this.reply.user.host !== null && this.localOnly) {
				await os.dialog({
					type: 'error',
					text: this.$ts.errorLocalOnlyToRemote,
				});
				return;
			}
			const canceled = this.$store.state.showNoteConfirm && (await os.dialog({
				type: 'question',
				text: this.$ts.noteConfirm,
				showCancelButton: true
			})).canceled;
			if (canceled) return;

			this.posting = true;
			let data = {
				text: this.text == '' ? undefined : this.text + (this.useBroadcast ? ' ' + this.broadcastText : ''),
				fileIds: this.files.length > 0 ? this.files.map(f => f.id) : undefined,
				replyId: this.reply ? this.reply.id : undefined,
				renoteId: this.quote ? this.quote.id : this.renote ? this.renote.id : undefined,
				channelId: this.channel ? this.channel.id : undefined,
				poll: this.poll,
				cw: this.useCw ? this.cw || '' : undefined,
				localOnly: this.localOnly,
				remoteFollowersOnly: this.remoteFollowersOnly,
				visibility: this.visibility,
				visibleUserIds: this.visibility == 'specified' ? this.visibleUsers.map(u => u.id) : undefined,
				viaMobile: os.isMobile
			};

			// plugin
			if (notePostInterruptors.length > 0) {
				for (const interruptor of notePostInterruptors) {
					data = await interruptor.handler(JSON.parse(JSON.stringify(data)));
				}
			}
			// get token

			const token = this.currentAccountIsMyself ? undefined : this.currentAccount.token;

			this.posting = true;
			
			os.api('notes/create', data, token).then(() => {
				this.clear();
				this.$nextTick(() => {
					this.deleteDraft();
					this.$emit('posted');
					if (this.text && this.text != '') {
						const hashtags = mfm.parse(this.text)!.filter(x => x.node.type === 'hashtag').map(x => x.node.props.hashtag);
						const history = JSON.parse(localStorage.getItem('hashtags') || '[]') as string[];
						localStorage.setItem('hashtags', JSON.stringify(unique(hashtags.concat(history))));
					}
					this.posting = false;
				});
			}).catch(err => {
				this.posting = false;
				os.dialog({
					type: 'error',
					text: err.message + '\n' + (err as any).id,
				});
			});
		},

		cancel() {
			this.$emit('cancel');
		},

		insertFace() {
			const faces = this.$store.state.faces;
			this.insert(faces.length > 0 ? faces[Math.floor(Math.random() * faces.length)] : '');
		},

		insertMention() {
			os.selectUser().then(user => {
				this.insert('@' + getAcct(user) + ' ');
			});
		},

		async insertEmoji(ev) {
			os.pickEmoji(ev.currentTarget || ev.target).then(emoji => {
				this.insert(emoji);
			});
		},

		insert(text: string) {
			insertTextAtCursor(this.$refs.text, text);
		},

		async link() {
			const form: Record<string, FormItem> = {
				url: {
					type: 'string',
					default: 'https://',
					label: 'URL',
				},
				desc: {
					type: 'string',
					default: '',
					label: this.$ts.description.toString(),
				},
				noUrlPreview: {
					type: 'boolean',
					default: false,
					label: this.$ts._mfmpad.noUrlPreview.toString(),
					description: this.$ts._mfmpad.noUrlPreviewDesc.toString(),
				},
			};
			const { canceled, result } = await os.form('挿入するリンクの設定', form);
			if (canceled) return;
			this.insert(`${result.noUrlPreview ? '?' : ''}[${result.desc}](${result.url})`);
		},

		async switchUser(ev) {
			const accountItems = this.accounts.map(account => ({
				type: 'user',
				user: account,
				action: () => {
					this.currentAccount = account;
					if (this.currentAccountIsMyself) {
						this.requiredConfirmation = this.$store.state.confirmBeforePost;
					} else {
						os.api('i/registry/get-all', {
							scope: ['client', 'base'],
						}, this.currentAccount.token)
							.then((dat) => this.requiredConfirmation = dat.confirmBeforePost);
					}

				},
			}));

			os.modalMenu(accountItems, ev.currentTarget || ev.target, { align: 'left' });
		},

		showActions(ev) {
			os.modalMenu(postFormActions.map(action => ({
				text: action.title,
				action: () => {
					action.handler({
						text: this.text
					}, (key, value) => {
						if (key === 'text') { this.text = value; }
					});
				}
			})), ev.currentTarget || ev.target);
		},

		insertFunction() {
			os.popup(import('./function-builder-window.vue'), {
			}, { done: this.insert }, 'closed');
		},
	}
});
</script>

<style lang="scss" scoped>
.gafaadew {
	position: relative;

	&.modal {
		width: 100%;
		max-width: 520px;
	}

	-webkit-backdrop-filter: blur(4px);
	backdrop-filter: blur(4px);

	> header {
		z-index: 1000;
		height: 66px;
		position: relative;

		> .cancel {
			padding: 0;
			font-size: 20px;
			width: 64px;
			line-height: 66px;
		}

		> div {
			display: flex;
			position: absolute;
			top: 0;
			right: 0;
			padding-right: 8px;
			height: 100%;

			> button {
				font-size: 16px;
				display: flex;
				justify-content: center;
				align-items: center;
				padding: 8px;
				margin: auto 0;
				width: 32px;
				height: 32px;
				border-radius: 4px;

				&:hover {
					background: var(--X5);
				}

				&.active {
					color: var(--accent);
				}

				&:not(:last-child) {
					margin-right: 4px;
				}
			}

			> .spacer {
				width: 8px;
			}

			> .divider {
				height: 32px;
				width: 1px;
				margin: auto 8px;
				background: var(--divider);
			}

			> .visibility {
				min-width: 32px;
				width: auto;

				> .localOnly {
					margin-left: 8px;
				}
			}
		}
	}

	> .form {
		> .preview {
			padding: 0 8px 8px 8px;

			> summary {
				margin-bottom: 8px;
			}
		}

		> .with-quote {
			margin: 0 0 8px 0;
			color: var(--accent);

			> button {
				padding: 4px 8px;
				color: var(--accentAlpha04);

				&:hover {
					color: var(--accentAlpha06);
				}

				&:active {
					color: var(--accentDarken30);
				}
			}
		}

		> .to-specified {
			padding: 6px 24px;
			margin-bottom: 8px;
			overflow: auto;
			white-space: nowrap;

			> .visibleUsers {
				display: inline;
				top: -1px;
				font-size: 14px;

				> button {
					padding: 4px;
					border-radius: 4px;
				}

				> span {
					margin-right: 14px;
					padding: 8px 0 8px 8px;
					border-radius: 4px;
					background: var(--X4);

					> button {
						padding: 4px 8px;
					}
				}
			}
		}

		> .cw,
		> .text,
		> .broadcastText {
			display: block;
			box-sizing: border-box;
			padding: 0 24px;
			margin: 0;
			width: 100%;
			font-size: 16px;
			border: none;
			border-radius: 0;
			background: transparent;
			color: var(--fg);
			font-family: inherit;

			&:focus {
				outline: none;
			}

			&:disabled {
				opacity: 0.5;
			}
		}

		> .cw {
			z-index: 1;
			padding-bottom: 8px;
			border-bottom: solid 1px var(--divider);
		}

		> .broadcastText {
			z-index: 1;
			padding-top: 8px;
			padding-bottom: 8px;
			border-bottom: solid 1px var(--divider);
		}

		> .poll-editor {
			border-top: 1px solid var(--divider);
		}

		> .text {
			max-width: 100%;
			min-width: 100%;
			min-height: 90px;

			&.withCw {
				padding-top: 8px;
			}
		}

		> footer {
			display: flex;
			padding: 0 16px;
			align-items: center;

			> .switch-user {
				> .avatar {
					width: 24px;
					height: 24px;
				}
			}

			> button {
				display: block;
				padding: 0;
				margin: 0;
				font-size: 16px;
				width: 32px;
				height: 32px;
				border-radius: 4px;

				&:not(:first-child) {
					margin-left: 8px;
				}

				&:hover {
					background: var(--X5);
				}

				&.active {
					color: var(--accent);
				}
			}

			> .text-count {
				margin-left: auto;
				opacity: 0.7;
				line-height: 66px;

				@media (max-width: 500px) {
					line-height: 50px;
				}
			}

			> .submit {
				padding: 0 8px;
				font-weight: bold;
				border-radius: 4px;
				margin: auto 0 auto 8px;
				width: 48px;
				padding: auto;

				&:disabled {
					opacity: 0.7;
				}

				&:hover {
					background: var(--accentLighten);
				}
			}
		}
		> .confirm-switch {
			margin: 0 1rem;
			margin-bottom: 1rem;
		}
	}

	&.max-width_500px {
		> header {
			height: 50px;

			> .cancel {
				width: 50px;
				line-height: 50px;
			}

			> div {
				> .text-count {
					line-height: 50px;
				}

				> .submit {
					margin: 8px;
				}
			}
		}

		> .form {
			> .to-specified {
				padding: 6px 16px;
			}

			> .cw,
			> .text {
				padding: 0 16px;
			}

			> .text {
				min-height: 80px;
			}

			> footer {
				padding: 0 8px 8px 8px;
			}
		}
	}
}
</style>
