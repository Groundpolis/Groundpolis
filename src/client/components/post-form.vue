<template>
<div class="gafaadew"
	@dragover.stop="onDragover"
	@dragenter="onDragenter"
	@dragleave="onDragleave"
	@drop.stop="onDrop"
>
	<div class="form" :class="{ fixed }">
		<input v-show="useCw" ref="cw" class="cw" v-model="cw" :placeholder="$t('annotation')" v-autocomplete="{ model: 'cw' }">
		<textarea v-model="text" class="text" :class="{ withCw: useCw }" ref="text" :disabled="posting" :placeholder="placeholder" v-autocomplete="{ model: 'text' }" @keydown="onKeydown" @paste="onPaste"></textarea>
		<x-post-form-attaches class="attaches" :files="files"/>
		<x-uploader ref="uploader" @uploaded="attachMedia" @change="onChangeUploadings"/>
		<footer>
			<button class="_button" v-tooltip="$t('attachFile')" @click="chooseFileFrom"><fa :icon="faPhotoVideo"/></button>
			<button class="_button" v-tooltip="$t('useCw')" @click="useCw = !useCw" :class="{ active: useCw }"><fa :icon="faEyeSlash"/></button>
			<button class="_button" v-tooltip="$t('insertEmoji')" @click="insertEmoji"><fa :icon="faLaughSquint"/></button>
			<button class="_button" v-tooltip="$t('officialNote')" v-if="$store.state.i.isAdmin || $store.state.i.isModerator" @click="announcement = !announcement" :class="{ active: announcement }"><fa :icon="faBullhorn"/></button>
			<div class="right">
				<span class="text-count" :class="{ over: trimmedLength(text) > max }">{{ max - trimmedLength(text) }}</span>
				<button class="submit _buttonPrimary" :disabled="!canPost" @click="post"><fa :icon="faPaperPlane"/></button>
			</div>
		</footer>
		<input ref="file" class="file _button" type="file" multiple="multiple" @change="onChangeFile"/>
	</div>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { faReply, faQuoteRight, faPaperPlane, faTimes, faUpload, faPollH, faGlobe, faHome, faUnlock, faEnvelope, faPlus, faPhotoVideo, faCloud, faLink, faAt, faBiohazard, faBullhorn } from '@fortawesome/free-solid-svg-icons';
import { faEyeSlash, faLaughSquint } from '@fortawesome/free-regular-svg-icons';
import insertTextAtCursor from 'insert-text-at-cursor';
import { length } from 'stringz';
import { parse } from '../../mfm/parse';
import { unique } from '../../prelude/array';
import { formatTimeString } from '../../misc/format-time-string';
import { selectDriveFile } from '../scripts/select-drive-file';

export default Vue.extend({
	components: {
		XUploader: () => import('./uploader.vue').then(m => m.default),
		XPostFormAttaches: () => import('./post-form-attaches.vue').then(m => m.default),
	},

	props: {
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
			useCw: false,
			cw: null,
			announcement: false,
			autocomplete: null,
			draghover: false,
			recentHashtags: JSON.parse(localStorage.getItem('hashtags') || '[]'),
			faReply, faQuoteRight, faPaperPlane, faTimes, faUpload, faPollH, faGlobe, faHome, faUnlock, faEnvelope, faEyeSlash, faLaughSquint, faPlus, faPhotoVideo, faCloud, faLink, faAt, faBiohazard, faBullhorn
		};
	},

	computed: {
		draftId(): string {
			return 'note';
		},

		placeholder() {
			const xs = [
				this.$t('_postForm._placeholders.a'),
				this.$t('_postForm._placeholders.b'),
				this.$t('_postForm._placeholders.c'),
				this.$t('_postForm._placeholders.d'),
				this.$t('_postForm._placeholders.e'),
				this.$t('_postForm._placeholders.f')
			];
			const x = xs[Math.floor(Math.random() * xs.length)];

			return x;
		},

		submitText() {
			return this.$t('note');
		},

		canPost(): boolean {
			return !this.posting &&
				(1 <= this.text.length || 1 <= this.files.length) &&
				(length(this.text.trim()) <= this.max);
		},

		max(): number {
			return this.$store.state.instance.meta ? this.$store.state.instance.meta.maxNoteTextLength : 1000;
		}
	},

	mounted() {
		if (this.initialText) {
			this.text = this.initialText;
		}

		this.focus();

		this.$nextTick(() => {
			this.focus();
		});

		this.$nextTick(() => {
			// 書きかけの投稿を復元
			if (!this.instant) {
				const draft = JSON.parse(localStorage.getItem('drafts') || '{}')[this.draftId];
				if (draft) {
					this.text = draft.data.text;
					this.useCw = draft.data.useCw;
					this.cw = draft.data.cw;
					this.files = (draft.data.files || []).filter(e => e);
				}
			}

			// 削除して編集
			if (this.initialNote) {
				const init = this.initialNote;
				this.text = init.text ? init.text : '';
				this.files = init.files;
				this.cw = init.cw;
				this.announcement = init.announcement;
				this.useCw = init.cw != null;
			}

			this.$nextTick(() => this.watch());
		});
	},

	methods: {
		watch() {
			this.$watch('text', () => this.saveDraft());
			this.$watch('useCw', () => this.saveDraft());
			this.$watch('cw', () => this.saveDraft());
			this.$watch('files', () => this.saveDraft());
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

		clear() {
			this.text = '';
			this.files = [];
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

			data[this.draftId] = {
				updatedAt: new Date(),
				data: {
					text: this.text,
					useCw: this.useCw,
					cw: this.cw,
					files: this.files,
				}
			};

			localStorage.setItem('drafts', JSON.stringify(data));
		},

		deleteDraft() {
			const data = JSON.parse(localStorage.getItem('drafts') || '{}');

			delete data[this.draftId];

			localStorage.setItem('drafts', JSON.stringify(data));
		},

		post() {
			this.posting = true;
			this.$root.api('notes/create', {
				text: this.text == '' ? undefined : this.text,
				fileIds: this.files.length > 0 ? this.files.map(f => f.id) : undefined,
				announcement: this.announcement,
				cw: this.useCw ? this.cw || '' : undefined,
			}).then(data => {
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

		async insertEmoji(ev) {
			const vm = this.$root.new(await import('./emoji-picker.vue').then(m => m.default), {
				source: ev.currentTarget || ev.target
			}).$once('chosen', emoji => {
				insertTextAtCursor(this.$refs.text, emoji);
				vm.close();
			});
		},
	}
});
</script>

<style lang="scss" scoped>
.gafaadew {
	background: var(--panel);

	> .form {
		max-width: 500px;
		margin: 0 auto;
		padding-top: 16px;

		&.fixed {
			max-width: unset;
		}

		> .preview {
			padding: 16px;
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
					border-radius: 8px;
				}

				> span {
					margin-right: 14px;
					padding: 8px 0 8px 8px;
					border-radius: 8px;
					background: var(--nwjktjjq);

					> button {
						padding: 4px 8px;
					}
				}
			}
		}

		> .cw,
		> .text {
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
			padding: 0 16px 16px 16px;

			@media (max-width: 500px) {
				padding: 0 8px 8px 8px;
			}

			> button {
				display: inline-block;
				padding: 0;
				margin: 0;
				font-size: 16px;
				width: 48px;
				height: 48px;
				border-radius: 6px;

				&:hover {
					background: var(--geavgsxy);
				}

				&.active {
					color: var(--accent);
				}
			}

		> .right {
			position: absolute;
			bottom: 0;
			right: 0;

			> .text-count {
				opacity: 0.7;
				line-height: 66px;

				@media (max-width: 500px) {
					line-height: 50px;
				}
			}

			> .submit {
				margin: 16px;
				padding: 0 12px;
				line-height: 34px;
				font-weight: bold;
				vertical-align: bottom;
				border-radius: 4px;

				@media (max-width: 500px) {
					margin: 8px;
				}

				&:disabled {
					opacity: 0.7;
				}
			}
		}
		}
	}
}
</style>
