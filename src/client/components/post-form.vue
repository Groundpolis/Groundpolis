<template>
<div class="gafaadew"
	@dragover.stop="onDragover"
	@dragenter="onDragenter"
	@dragleave="onDragleave"
	@drop.stop="onDrop"
>
	<header>
		<button v-if="!fixed" class="cancel _button" @click="cancel"><fa :icon="faTimes"/></button>
		<div>
			<button class="_button" @click="insert('> ')" v-tooltip="$t('_mfmPad.quote')"><fa :icon="faQuoteRight"/></button>
			<button class="_button" @click="link" v-tooltip="$t('_mfmPad.link')"><fa :icon="faLink"/></button>
			<button class="_button" @click="insertMention" v-tooltip="$t('mention')"><fa :icon="faAt"/></button>
			<button class="_button" @click="insertEmoji" v-tooltip="$t('emoji')"><fa :icon="faLaughSquint"/></button>
			<!-- <button class="_button" @click="mfmPadMenu" v-tooltip="$t('_mfmPad.more')"><fa :icon="faEllipsisV"/></button> -->
			<div class="divider"></div>
			<button class="_button help" v-tooltip="$t('help')" @click="help">
				<fa :icon="faQuestionCircle" />
			</button>
			<button class="_button visibility" @click="setVisibility" ref="visibilityButton" v-tooltip="$t('visibility')" v-if="channel == null">
					<fa v-if="visibility === 'public'" :icon="faGlobe" />
					<fa v-if="visibility === 'home'" :icon="faHome" />
					<fa v-if="visibility === 'followers'" :icon="faUnlock" />
					<fa v-if="visibility === 'specified'" :icon="faEnvelope" />
					<fa v-if="visibility === 'users'" :icon="faUsers" />
					<fa class="localOnly" v-if="localOnly" :icon="faHeart" />
					<fa class="localOnly" v-if="remoteFollowersOnly" :icon="faHeartbeat" />
			</button>
			<!-- <div class="spacer"></div> -->
		</div>
	</header>
	<div class="form" :class="{ fixed }">
		<x-note-preview class="preview" v-if="reply" :note="reply"/>
		<x-note-preview class="preview" v-if="renote" :note="renote"/>
		<div class="with-quote" v-if="quoteId"><fa icon="quote-left"/> {{ $t('quoteAttached') }}<button @click="quoteId = null"><fa icon="times"/></button></div>
		<div v-if="visibility === 'specified'" class="to-specified">
			<span style="margin-right: 8px;">{{ $t('recipient') }}</span>
			<div class="visibleUsers">
				<span v-for="u in visibleUsers" :key="u.id">
					<mk-acct :user="u"/>
					<button class="_button" @click="removeVisibleUser(u)"><fa :icon="faTimes"/></button>
				</span>
				<button @click="addVisibleUser" class="_buttonPrimary"><fa :icon="faPlus" fixed-width/></button>
			</div>
		</div>
		<input v-show="useCw" ref="cw" class="cw" v-model="cw" :placeholder="$t('annotation')" v-autocomplete="{ model: 'cw' }" @keydown="onKeydown">
		<textarea v-model="text" class="text" :class="{ withCw: useCw }" ref="text" :disabled="posting" :placeholder="placeholder" v-autocomplete="{ model: 'text' }" @keydown="onKeydown" @paste="onPaste"></textarea>
		<input v-show="useBroadcast" ref="broadcastText" class="broadcastText" v-model="broadcastText" :placeholder="$t('broadcastTextDescription')" v-autocomplete="{ model: 'broadcastText' }" @keydown="onKeydown">
		<x-post-form-attaches class="attaches" :files="files"/>
		<x-poll-editor class="poll-editor" v-if="poll" ref="poll" @destroyed="poll = false" @updated="onPollUpdate()"/>
		<x-uploader ref="uploader" @uploaded="attachMedia" @change="onChangeUploadings"/>
		<footer>
			<button class="_button" @click="chooseFileFrom" v-tooltip="$t('attachFile')"><fa :icon="faPhotoVideo"/></button>
			<button class="_button" @click="poll = !poll" :class="{ active: poll }" v-tooltip="$t('poll')"><fa :icon="faPollH"/></button>
			<button class="_button" @click="useCw = !useCw" :class="{ active: useCw }" v-tooltip="$t('useCw')"><fa :icon="faEyeSlash"/></button>
			<button class="_button" @click="useBroadcast = !useBroadcast" :class="{ active: useBroadcast }" v-tooltip="$t('broadcastMode')"><fa :icon="faBullhorn"/></button>
			<button class="_button" @click="insertFace" v-tooltip="$t('gacha')"><fa :icon="faFish"/></button>
			<button class="_button" @click="showActions" v-tooltip="$t('plugin')" v-if="$store.state.postFormActions.length > 0"><fa :icon="faPlug"/></button>
			<span class="text-count" :class="{ over: trimmedLength(text) > max }">{{ max - trimmedLength(text) }}</span>
			<button class="submit _buttonPrimary" :disabled="!canPost" @click="post">
				<fa :icon="faPaperPlane" />
			</button>
		</footer>
		<input ref="file" class="file _button" type="file" multiple="multiple" @change="onChangeFile"/>
		<details v-if="text" class="preview" :open="isPreviewOpened" @toggle="isPreviewOpened = $event.target.open">
			<summary>{{ $t('preview') }}</summary>
			<x-note-preview :note="previewNote"/>
		</details>
	</div>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { faReply, faQuoteRight, faPaperPlane, faTimes, faUpload, faPollH, faGlobe, faHome, faUnlock, faEnvelope, faPlus, faPhotoVideo, faCloud, faLink, faAt, faHeart, faUsers, faFish, faHeartbeat, faQuestionCircle, faBullhorn, faPlug, faChevronDown, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { faEyeSlash, faLaughSquint } from '@fortawesome/free-regular-svg-icons';
import insertTextAtCursor from 'insert-text-at-cursor';
import { length } from 'stringz';
import { toASCII } from 'punycode';
import MkVisibilityChooser from './visibility-chooser.vue';
import MkUserSelect from './user-select.vue';
import XNotePreview from './note-preview.vue';
import { parse } from '../../mfm/parse';
import { host, url } from '../config';
import { erase, unique } from '../../prelude/array';
import extractMentions from '../../misc/extract-mentions';
import getAcct from '../../misc/acct/render';
import { formatTimeString } from '../../misc/format-time-string';
import { selectDriveFile } from '../scripts/select-drive-file';
import { noteVisibilities } from '../../types';
import { utils } from '@syuilo/aiscript';
import { FormItem } from '../scripts/form';

export default Vue.extend({
	components: {
		XNotePreview,
		XUploader: () => import('./uploader.vue').then(m => m.default),
		XPostFormAttaches: () => import('./post-form-attaches.vue').then(m => m.default),
		XPollEditor: () => import('./poll-editor.vue').then(m => m.default)
	},

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
		}
	},

	data() {
		return {
			posting: false,
			text: '',
			files: [],
			uploadings: [],
			poll: false,
			pollChoices: [],
			pollMultiple: false,
			pollExpiration: [],
			useCw: false,
			cw: null,
			localOnly: false,
			remoteFollowersOnly: false,
			useBroadcast: false,
			broadcastText: '',
			visibility: 'public',
			visibleUsers: [],
			autocomplete: null,
			draghover: false,
			quoteId: null,
			recentHashtags: JSON.parse(localStorage.getItem('hashtags') || '[]'),
			faReply, faQuoteRight, faPaperPlane, faTimes, faUpload, faPollH, faGlobe, faHome, faUnlock, faEnvelope, faEyeSlash, faLaughSquint, faPlus, faPhotoVideo, faCloud, faLink, faAt, faHeart, faUsers, faFish, faHeartbeat, faQuestionCircle, faBullhorn, faPlug, faChevronDown, faEllipsisV
		};
	},

	computed: {
		draftKey(): string {
			let key = this.channel ? `channel:${this.channel.id}` : '';

			if (this.renote) {
				key += `renote:${this.renote.id}`;
			} else if (this.reply) {
				key += `reply:${this.reply.id}`;
			} else {
				key += 'note';
			}

			return key;
		},

		placeholder(): string {
			if (this.renote) {
				return this.$t('_postForm.quotePlaceholder');
			} else if (this.reply) {
				return this.$t('_postForm.replyPlaceholder');
			} else if (this.channel) {
				return this.$t('_postForm.channelPlaceholder');
			} else {
				const xs = [
					this.$t('_postForm._placeholders.a'),
					this.$t('_postForm._placeholders.b'),
					this.$t('_postForm._placeholders.c'),
					this.$t('_postForm._placeholders.d'),
					this.$t('_postForm._placeholders.e'),
					this.$t('_postForm._placeholders.f')
				];
				return xs[Math.floor(Math.random() * xs.length)];
			}
		},

		submitText(): string {
			return this.renote
				? this.$t('quote')
				: this.reply
					? this.$t('reply')
					: this.$t('note');
		},

		canPost(): boolean {
			return !this.posting &&
				(1 <= this.text.length || 1 <= this.files.length || this.poll || this.renote) &&
				(length(this.text.trim()) <= this.max) &&
				(!this.poll || this.pollChoices.length >= 2);
		},

		max(): number {
			return this.$store.state.instance.meta ? this.$store.state.instance.meta.maxNoteTextLength : 1000;
		},

		previewNote() {
			return {
				id: '',
				createdAt: new Date(),
				text: this.text + (this.useBroadcast ? ' ' + this.broadcastText : ''),
				cw: this.useCw ? this.cw : undefined,
				visibility: this.visibility,
				user: this.$store.state.i,
				localOnly: this.localOnly,
				remoteFollowersOnly: this.remoteFollowersOnly,
				files: [],
			};
		},

		isPreviewOpened: {
			get() { return this.$store.state.device.showPostPreview },
			set(value) { this.$store.commit('device/set', { key: 'showPostPreview', value }); }
		}
	},

	watch: {
		localOnly() {
			this.$store.commit('deviceUser/setLocalOnly', this.localOnly);
		},
		remoteFollowersOnly() {
			this.$store.commit('deviceUser/setRemoteFollowersOnly', this.remoteFollowersOnly);
		}
	},

	mounted() {
		if (this.initialText) {
			this.text = this.initialText;
		}

		if (this.mention) {
			this.text = this.mention.host ? `@${this.mention.username}@${toASCII(this.mention.host)}` : `@${this.mention.username}`;
			this.text += ' ';
		}

		if (this.reply && this.reply.user.host != null) {
			this.text = `@${this.reply.user.username}@${toASCII(this.reply.user.host)} `;
		}

		if (this.reply && this.reply.text != null) {
			const ast = parse(this.reply.text);

			for (const x of extractMentions(ast)) {
				const mention = x.host ? `@${x.username}@${toASCII(x.host)}` : `@${x.username}`;

				// 自分は除外
				if (this.$store.state.i.username == x.username && x.host == null) continue;
				if (this.$store.state.i.username == x.username && x.host == host) continue;

				// 重複は除外
				if (this.text.indexOf(`${mention} `) != -1) continue;

				this.text += `${mention} `;
			}
		}

		// デフォルト公開範囲
		if (this.channel == null) {
			this.applyVisibility(this.$store.state.settings.rememberNoteVisibility ? this.$store.state.deviceUser.visibility : this.$store.state.settings.defaultNoteVisibility);
			this.localOnly = this.$store.state.settings.rememberNoteVisibility ? this.$store.state.deviceUser.localOnly : this.$store.state.settings.defaultNoteLocalOnly;
			this.remoteFollowersOnly = this.$store.state.settings.rememberNoteVisibility ? this.$store.state.deviceUser.remoteFollowersOnly : this.$store.state.settings.defaultNoteRemoteFollowersOnly;
		}

		// 公開以外へのリプライ時は元の公開範囲を引き継ぐ
		if (this.reply && ['home', 'followers', 'specified'].includes(this.reply.visibility)) {
			this.visibility = this.reply.visibility;
			if (this.reply.visibility === 'specified') {
				this.$root.api('users/show', {
					userIds: this.reply.visibleUserIds.filter(uid => uid !== this.$store.state.i.id && uid !== this.reply.userId)
				}).then(users => {
					this.visibleUsers.push(...users);
				});

				if (this.reply.userId !== this.$store.state.i.id) {
					this.$root.api('users/show', { userId: this.reply.userId }).then(user => {
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
		if (this.$store.state.settings.keepCw && this.reply && this.reply.cw) {
			this.useCw = true;
			this.cw = this.reply.cw;
		}

		this.focus();

		this.$nextTick(() => {
			this.focus();
		});

		this.$nextTick(() => {
			// 書きかけの投稿を復元
			if (!this.instant && !this.mention) {
				const draft = JSON.parse(localStorage.getItem('drafts') || '{}')[this.draftKey];
				if (draft) {
					this.text = draft.data.text;
					this.useCw = draft.data.useCw;
					this.cw = draft.data.cw;
					this.useBroadcast = draft.data.useBroadcast;
					this.broadcastText = draft.data.broadcastText;
					this.applyVisibility(draft.data.visibility);
					this.localOnly = draft.data.localOnly;
					this.remoteFollowersOnly = draft.data.remoteFollowersOnly;
					this.files = (draft.data.files || []).filter(e => e);
					if (draft.data.poll) {
						this.poll = true;
						this.$nextTick(() => {
							(this.$refs.poll as any).set(draft.data.poll);
						});
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
					this.poll = true;
					this.$nextTick(() => {
						(this.$refs.poll as any).set({
							choices: init.poll.choices.map(c => c.text),
							multiple: init.poll.multiple
						});
					});
				}
				this.visibility = init.visibility;
				this.localOnly = init.localOnly;
				this.remoteFollowersOnly = init.remoteFollowersOnly;
				this.quoteId = init.renote ? init.renote.id : null;
			}

			this.$nextTick(() => this.watch());
		});
	},

	methods: {
		watch() {
			this.$watch('text', () => this.saveDraft());
			this.$watch('useCw', () => this.saveDraft());
			this.$watch('cw', () => this.saveDraft());
			this.$watch('useBroadcast', () => this.saveDraft());
			this.$watch('broadcastText', () => this.saveDraft());
			this.$watch('poll', () => this.saveDraft());
			this.$watch('files', () => this.saveDraft());
			this.$watch('visibility', () => this.saveDraft());
			this.$watch('localOnly', () => this.saveDraft());
			this.$watch('remoteFollowersOnly', () => this.saveDraft());
		},

		trimmedLength(text: string) {
			return length(text.trim());
		},

		addTag(tag: string) {
			insertTextAtCursor(this.$refs.text, ` #${tag} `);
		},

		focus() {
			(this.$refs.text as any).focus();
		},

		chooseFileFrom(ev) {
			this.$root.menu({
				items: [{
					type: 'label',
					text: this.$t('attachFile'),
				}, {
					text: this.$t('upload'),
					icon: faUpload,
					action: () => { this.chooseFileFromPc() }
				}, {
					text: this.$t('fromDrive'),
					icon: faCloud,
					action: () => { this.chooseFileFromDrive() }
				}, {
					text: this.$t('fromUrl'),
					icon: faLink,
					action: () => { this.chooseFileFromUrl() }
				}],
				source: ev.currentTarget || ev.target
			});
		},

		chooseFileFromPc() {
			(this.$refs.file as any).click();
		},

		chooseFileFromDrive() {
			selectDriveFile(this.$root, true).then(files => {
				for (const file of files) {
					this.attachMedia(file);
				}
			});
		},

		attachMedia(driveFile) {
			this.files.push(driveFile);
		},

		detachMedia(id) {
			this.files = this.files.filter(x => x.id != id);
		},

		updateMedia(file) {
			Vue.set(this.files, this.files.findIndex(x => x.id === file.id), file);
		},

		onChangeFile() {
			for (const x of Array.from((this.$refs.file as any).files)) this.upload(x);
		},

		upload(file: File, name?: string) {
			(this.$refs.uploader as any).upload(file, this.$store.state.settings.uploadFolder, name);
		},

		onChangeUploadings(uploads) {
			this.$emit('change-uploadings', uploads);
		},

		onPollUpdate() {
			const got = this.$refs.poll.get();
			this.pollChoices = got.choices;
			this.pollMultiple = got.multiple;
			this.pollExpiration = [got.expiration, got.expiresAt || got.expiredAfter];
			this.saveDraft();
		},

		setVisibility() {
			if (this.channel) {
				// TODO: information dialog
				return;
			}
			const w = this.$root.new(MkVisibilityChooser, {
				source: this.$refs.visibilityButton,
				currentVisibility: this.visibility,
				currentLocalOnly: this.localOnly,
				currentRemoteFollowersOnly: this.remoteFollowersOnly,
			});
			w.$once('chosen', ({ visibility, localOnly, remoteFollowersOnly }) => {
				this.applyVisibility(visibility);
				this.localOnly = localOnly;
				this.remoteFollowersOnly = remoteFollowersOnly;
			});
		},

		applyVisibility(v: string) {
			this.visibility = (noteVisibilities as unknown as string[]).includes(v) ? v : 'public'; // v11互換性のため
		},

		addVisibleUser() {
			const vm = this.$root.new(MkUserSelect, {});
			vm.$once('selected', user => {
				this.visibleUsers.push(user);
			});
		},

		removeVisibleUser(user) {
			this.visibleUsers = erase(user, this.visibleUsers);
		},

		clear() {
			this.text = '';
			this.files = [];
			this.poll = false;
			this.quoteId = null;
		},

		help() {
			this.cancel();
			this.$router.push('/docs/post')
		},

		onKeydown(e) {
			if ((e.which == 10 || e.which == 13) && (e.ctrlKey || e.metaKey) && this.canPost) this.post();
		},

		async onPaste(e: ClipboardEvent) {
			for (const { item, i } of Array.from(e.clipboardData.items).map((item, i) => ({item, i}))) {
				if (item.kind == 'file') {
					const file = item.getAsFile();
					const lio = file.name.lastIndexOf('.');
					const ext = lio >= 0 ? file.name.slice(lio) : '';
					const formatted = `${formatTimeString(new Date(file.lastModified), this.$store.state.settings.pastedFileName).replace(/{{number}}/g, `${i + 1}`)}${ext}`;
					this.upload(file, formatted);
				}
			}

			const paste = e.clipboardData.getData('text');

			if (!this.renote && !this.quoteId && paste.startsWith(url + '/notes/')) {
				e.preventDefault();

				this.$root.dialog({
					type: 'info',
					text: this.$t('quoteQuestion'),
					showCancelButton: true
				}).then(({ canceled }) => {
					if (canceled) {
						insertTextAtCursor(this.$refs.text, paste);
						return;
					}

					this.quoteId = paste.substr(url.length).match(/^\/notes\/(.+?)\/?$/)[1];
				});
			}
		},

		onDragover(e) {
			if (!e.dataTransfer.items[0]) return;
			const isFile = e.dataTransfer.items[0].kind == 'file';
			const isDriveFile = e.dataTransfer.types[0] == 'mk_drive_file';
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
			this.draghover = false;

			// ファイルだったら
			if (e.dataTransfer.files.length > 0) {
				e.preventDefault();
				for (const x of Array.from(e.dataTransfer.files)) this.upload(x);
				return;
			}

			//#region ドライブのファイル
			const driveFile = e.dataTransfer.getData('mk_drive_file');
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
					files: this.files,
					poll: this.poll && this.$refs.poll ? (this.$refs.poll as any).get() : undefined
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
				await this.$root.dialog({
					type: 'error',
					text: this.$t('errorLocalOnlyToRemote'),
				});
				return;
			}
			const canceled = this.$store.state.device.showNoteConfirm && (await this.$root.dialog({
				type: 'question',
				text: this.$t('noteConfirm'),
				showCancelButton: true
			})).canceled;
			if (canceled) return;

			this.posting = true;
			let data = {
				text: this.text == '' ? undefined : this.text + (this.useBroadcast ? ' ' + this.broadcastText : ''),
				fileIds: this.files.length > 0 ? this.files.map(f => f.id) : undefined,
				replyId: this.reply ? this.reply.id : undefined,
				renoteId: this.renote ? this.renote.id : this.quoteId ? this.quoteId : undefined,
				channelId: this.channel ? this.channel.id : undefined,
				poll: this.poll ? (this.$refs.poll as any).get() : undefined,
				cw: this.useCw ? this.cw || '' : undefined,
				localOnly: this.localOnly,
				remoteFollowersOnly: this.remoteFollowersOnly,
				visibility: this.visibility,
				visibleUserIds: this.visibility == 'specified' ? this.visibleUsers.map(u => u.id) : undefined,
				viaMobile: this.$root.isMobile
			};

			// plugin
			if (this.$store.state.notePostInterruptors.length > 0) {
				for (const interruptor of this.$store.state.notePostInterruptors) {
					data = utils.valToJs(await interruptor.handler(JSON.parse(JSON.stringify(data))));
				}
			}

			this.posting = true;
			this.$root.api('notes/create', data).then(() => {
				this.clear();
				this.deleteDraft();
				this.$emit('posted');
			}).catch(err => {
			}).then(() => {
				this.posting = false;
			});

			if (this.text && this.text != '') {
				const hashtags = parse(this.text).filter(x => x.node.type === 'hashtag').map(x => x.node.props.hashtag);
				const history = JSON.parse(localStorage.getItem('hashtags') || '[]') as string[];
				localStorage.setItem('hashtags', JSON.stringify(unique(hashtags.concat(history))));
			}
		},

		cancel() {
			this.$emit('cancel');
		},

		insertFace() {
			insertTextAtCursor(this.$refs.text, this.$store.getters['settings/getRandomFace']());
		},

		insertMention() {
			const vm = this.$root.new(MkUserSelect, {});
			vm.$once('selected', user => {
				insertTextAtCursor(this.$refs.text, getAcct(user) + ' ');
			});
		},

		async insertEmoji(ev) {
			const vm = this.$root.new(await import('./emoji-picker.vue').then(m => m.default), {
				source: ev.currentTarget || ev.target
			}).$once('chosen', emoji => {
				insertTextAtCursor(this.$refs.text, emoji);
				vm.close();
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
					label: this.$t('description').toString(),
				},
			};
			const { canceled, result } = await this.$root.form('挿入するリンクの設定', form);
			if (canceled) return;
			this.insert(`[${result.desc}](${result.url})`);
		},

		async mfmPadMenu() {

		},

		showActions(ev) {
			this.$root.menu({
				items: this.$store.state.postFormActions.map(action => ({
					text: action.title,
					action: () => {
						action.handler({
							text: this.text
						}, (key, value) => {
							if (key === 'text') { this.text = value; }
						});
					}
				})),
				source: ev.currentTarget || ev.target,
			});
		}
	}
});
</script>

<style lang="scss" scoped>
.gafaadew {
	background: var(--panel);

	-webkit-backdrop-filter: blur(4px);
	backdrop-filter: blur(4px);

	> header {
		z-index: 1000;
		height: 66px;
		position: relative;

		@media (max-width: 500px) {
			height: 50px;
		}

		> .cancel {
			padding: 0;
			font-size: 20px;
			width: 64px;
			line-height: 66px;

			@media (max-width: 500px) {
				width: 50px;
				line-height: 50px;
			}
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
		max-width: 500px;
		margin: 0 auto;

		&.fixed {
			max-width: unset;
		}

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

			@media (max-width: 500px) {
				padding: 6px 16px;
			}

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

			@media (max-width: 500px) {
				padding: 0 16px;
			}

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

			@media (max-width: 500px) {
				min-height: 80px;
			}

			&.withCw {
				padding-top: 8px;
			}
		}

		> .mk-uploader {
			margin: 8px 0 0 0;
			padding: 8px;
		}

		> .file {
			display: none;
		}

		> footer {
			display: flex;
			padding: 0 16px;
			align-items: center;

			@media (max-width: 500px) {
				padding: 0 8px 8px 8px;
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
	}
}
</style>
