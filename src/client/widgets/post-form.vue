<template>
	<div class="_panel form">
		<input v-show="useCw" class="cw" v-model="cw" :placeholder="$t('annotation')" v-autocomplete="{ model: 'cw' }" @keydown="onKeydown">
		<textarea v-model="text" class="text" :class="{ withCw: useCw }" ref="text" :disabled="posting" :placeholder="placeholder" v-autocomplete="{ model: 'text' }" @keydown="onKeydown" @paste="onPaste"></textarea>
		<x-post-form-attaches class="attaches" :files="files"/>
		<x-uploader ref="uploader" @uploaded="attachMedia" @change="onChangeUploadings"/>
		<footer>
			<button class="_button" @click="chooseFileFrom" v-tooltip="$t('attachFile')"><fa :icon="faPhotoVideo"/></button>
			<button class="_button" @click="useCw = !useCw" :class="{ active: useCw }" v-tooltip="$t('useCw')"><fa :icon="faEyeSlash"/></button>
			<button class="_button" @click="insertFace" v-tooltip="$t('gacha')"><fa :icon="faFish"/></button>
			<button class="_button" @click="insertMention" v-tooltip="$t('mention')"><fa :icon="faAt"/></button>
			<button class="_button" @click="insertEmoji" v-tooltip="$t('emoji')"><fa :icon="faLaughSquint"/></button>
			<button class="_button" @click="setVisibility" v-tooltip="$t('visibility')">
				<span v-if="visibility === 'public'"><fa :icon="faGlobe"/></span>
				<span v-if="visibility === 'home'"><fa :icon="faHome"/></span>
				<span v-if="visibility === 'followers'"><fa :icon="faUnlock"/></span>
				<span v-if="visibility === 'specified'"><fa :icon="faEnvelope"/></span>
				<span v-if="visibility === 'users'"><fa :icon="faUsers"/></span>
			</button>
			<span v-if="localOnly" @click="localOnly = false" v-tooltip="$t('_visibility.localOnly')"><fa :icon="faHeart" fixed-width/></span>
			<span v-if="remoteFollowersOnly" @click="remoteFollowersOnly = false" v-tooltip="$t('_visibility.remoteFollowersOnly')"><fa :icon="faHeartbeat" fixed-width/></span>
			<button class="_buttonPrimary" @click="post" :disabled="!canPost"><fa :icon="faPaperPlane"/></button>
		</footer>
		<input ref="file" class="file _button" type="file" multiple="multiple" @change="onChangeFile"/>
	</div>
</template>

<script lang="ts">
import { faPaperPlane, faPhotoVideo, faAt, faFish, faGlobe, faHome, faUnlock, faEnvelope, faUsers, faHeart, faHeartbeat, faUpload, faCloud, faLink } from '@fortawesome/free-solid-svg-icons';
import { faEyeSlash, faLaughSquint } from '@fortawesome/free-regular-svg-icons';
import insertTextAtCursor from 'insert-text-at-cursor';
import { length } from 'stringz';

import MkVisibilityChooser from '../components/visibility-chooser.vue';
import getAcct from '../../misc/acct/render';
import MkUserSelect from '../components/user-select.vue';
import MkContainer from '../components/ui/container.vue';
import define from './define';
import { formatTimeString } from '../../misc/format-time-string';
import { selectDriveFile } from '../scripts/select-drive-file';

export default define({
	name: 'post-form',
	props: () => ({
		visibility: {
			type: 'string',
			default: 'public',
		},
		localOnly: {
			type: 'boolean',
			default: false,
		},
		remoteFollowersOnly: {
			type: 'boolean',
			default: false,
		},
		draft: {
			type: 'string',
			default: '',
		},
		cw: {
			type: 'string',
			default: '',
		},
		useCw: {
			type: 'boolean',
			default: false,
		},
	})
}).extend({
	
	components: {
		MkContainer,
		XUploader: () => import('../components/uploader.vue').then(m => m.default),
		XPostFormAttaches: () => import('../components/post-form-attaches.vue').then(m => m.default),
	},

	data() {
		return {
			posting: false,
			files: [],
			faPaperPlane, faPhotoVideo, faAt, faEyeSlash, faLaughSquint, faFish, faGlobe, faHome, faUnlock, faEnvelope, faUsers, faHeart, faHeartbeat
		};
	},

	computed: {
		text: {
			get () { return this.props.draft; },
			set (value) { this.props.draft = value; this.save(); }
		},
		useCw: {
			get () { return this.props.useCw; },
			set (value) { this.props.useCw = value; this.save(); }
		},
		cw: {
			get () { return this.props.cw; },
			set (value) { this.props.cw = value; this.save(); }
		},
		localOnly: {
			get () { return this.props.localOnly; },
			set (value) { this.props.localOnly = value; this.save(); }
		},
		remoteFollowersOnly: {
			get () { return this.props.remoteFollowersOnly; },
			set (value) { this.props.remoteFollowersOnly = value; this.save(); }
		},
		visibility: {
			get () { return this.props.visibility; },
			set (value) { this.props.visibility = value; this.save(); }
		},
		canPost(): boolean {
			return !this.posting &&
				(1 <= this.text.length || 1 <= this.files.length) &&
				(length(this.text.trim()) <= this.max)
		},
		max(): number {
			return this.$store.state.instance.meta ? this.$store.state.instance.meta.maxNoteTextLength : 1000;
		},
		placeholder(): string {
			const xs = [
				this.$t('_postForm._placeholders.a'),
				this.$t('_postForm._placeholders.b'),
				this.$t('_postForm._placeholders.c'),
				this.$t('_postForm._placeholders.d'),
				this.$t('_postForm._placeholders.e'),
				this.$t('_postForm._placeholders.f')
			];
			return xs[Math.floor(Math.random() * xs.length)].toString();
		}
	},

	methods: {
		async onPaste(e: ClipboardEvent) {
			for (const { item, i } of Array.from(e.clipboardData.items).map((item: any, i) => ({item, i}))) {
				if (item.kind == 'file') {
					const file = item.getAsFile();
					const lio = file.name.lastIndexOf('.');
					const ext = lio >= 0 ? file.name.slice(lio) : '';
					const formatted = `${formatTimeString(new Date(file.lastModified), this.$store.state.settings.pastedFileName).replace(/{{number}}/g, `${i + 1}`)}${ext}`;
					this.upload(file, formatted);
				}
			}
		},

		onKeydown(e) {
			if ((e.which == 10 || e.which == 13) && (e.ctrlKey || e.metaKey) && this.canPost) this.post();
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
			const vm = this.$root.new(await import('../components/emoji-picker.vue').then(m => m.default), {
				source: ev.currentTarget || ev.target
			}).$once('chosen', emoji => {
				insertTextAtCursor(this.$refs.text, emoji);
				vm.close();
			});
		},

		setVisibility(ev) {
			const w = this.$root.new(MkVisibilityChooser, {
				source: ev.currentTarget || ev.target,
				currentVisibility: this.visibility,
				currentLocalOnly: this.localOnly,
				currentRemoteFollowersOnly: this.remoteFollowersOnly,
			});
			w.$once('chosen', ({ visibility, localOnly, remoteFollowersOnly }) => {
				this.visibility = visibility;
				this.localOnly = localOnly;
				this.remoteFollowersOnly = remoteFollowersOnly;
			});
		},

		async post() {
			const canceled = this.$store.state.device.showNoteConfirm && (await this.$root.dialog({
				type: 'question',
				text: this.$t('noteConfirm'),
				showCancelButton: true
			})).canceled;
			if (canceled) return;

			this.posting = true;
			this.$root.api('notes/create', {
				text: this.text == '' ? undefined : this.text,
				fileIds: this.files.length > 0 ? this.files.map(f => f.id) : undefined,
				cw: this.useCw ? this.cw || '' : undefined,
				localOnly: this.localOnly,
				remoteFollowersOnly: this.remoteFollowersOnly,
				visibility: this.visibility,
				viaMobile: this.$root.isMobile
			}).then(_ => {
				this.text = '';
				this.files = [];
			}).catch(() => {}).then(() => {
				this.posting = false;
			});
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
					// action: () => { this.chooseFileFromUrl() }
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
			this.save();
		},

		detachMedia(id) {
			this.files = this.files.filter(x => x.id != id);
		},

		updateMedia(file) {
			Vue.set(this.files, this.files.findIndex(x => x.id === file.id), file);
			this.save();
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
	}
});
</script>

<style lang="scss" scoped>
.form {
	padding: 8px;
	max-width: unset;
	margin: 0;
	box-sizing: border-box;
	font-size: 14px;

	> .cw,
	> .text {
		display: block;
		box-sizing: border-box;
		margin: 0;
		width: 100%;
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

		@media (max-width: 500px) {
			padding: 0 8px 8px 8px;
		}

		> button {
			display: inline-block;
			padding: 0;
			margin: 0;
			width: 32px;
			height: 32px;
			border-radius: 6px;

			&:hover {
				background: var(--geavgsxy);
			}

			&.active {
				color: var(--accent);
			}

			&:last-child {
				margin-left: auto;
			}
		}

		> span {
			display: flex;
			justify-content: center;
			align-items: center;
			color: var(--accent);
			cursor: pointer;
			width: 32px;
			height: 32px;
		}
	}
}
</style>
