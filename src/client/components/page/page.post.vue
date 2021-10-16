<template>
<div class="ngbfujlo">
	<h1>{{$ts.share}}</h1>
	<MkTextarea :value="text" readonly style="margin: 0;"></MkTextarea>
	<div class="_hstack dense commands">
		<button class="_button" @click="share" v-tooltip="$ts.share">
			<Fa :icon="faShareAlt" />
		</button>
		<button class="_button visibility" @click="chooseVisibility" v-tooltip="$ts.visibility">
			<VisibilityIcon
				:visibility="visibility"
				:localOnly="localOnly"
				:remoteFollowersOnly="remoteFollowersOnly"
				/>
		</button>
		<MkButton class="button _ml-2" primary @click="post()" :disabled="posting || posted"><Fa v-if="posted" :icon="faCheck"/>
			<Fa v-else :icon="faPaperPlane"/>
			{{$ts.post}}
		</MkButton>
	</div>
</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { faCheck, faPaperPlane, faShareAlt } from '@fortawesome/free-solid-svg-icons';
import VisibilityIcon from '../visibility-icon.vue';
import MkTextarea from '../ui/textarea.vue';
import MkButton from '../ui/button.vue';
import { apiUrl } from '@/config';
import * as os from '@/os';
import { PostBlock } from '@/scripts/hpml/block';
import { Hpml } from '@/scripts/hpml/evaluator';
import { i18n } from '@/i18n';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';

export default defineComponent({
	components: {
		MkTextarea,
		MkButton,
		VisibilityIcon,
	},
	props: {
		block: {
			type: Object as PropType<PostBlock>,
			required: true
		},
		hpml: {
			type: Object as PropType<Hpml>,
			required: true
		}
	},
	data() {
		return {
			text: this.hpml.interpolate(this.block.text),
			posted: false,
			posting: false,
			localOnly: this.$store.state.rememberNoteVisibility ? this.$store.state.localOnly : this.$store.state.defaultNoteLocalOnly,
			remoteFollowersOnly: this.$store.state.rememberNoteVisibility ? this.$store.state.remoteFollowersOnly : this.$store.state.defaultNoteRemoteFollowersOnly,
			visibility: this.$store.state.rememberNoteVisibility ? this.$store.state.visibility : this.$store.state.defaultNoteVisibility,
			faCheck, faPaperPlane, faShareAlt
		};
	},
	watch: {
		'hpml.vars': {
			handler() {
				this.text = this.hpml.interpolate(this.block.text);
			},
			deep: true
		}
	},
	methods: {
		upload() {
			const promise = new Promise((ok) => {
				const canvas = this.hpml.canvases[this.block.canvasId];
				canvas.toBlob(blob => {
					const data = new FormData();
					data.append('file', blob);
					data.append('i', this.$i.token);
					if (this.$store.state.uploadFolder) {
						data.append('folderId', this.$store.state.uploadFolder);
					}

					fetch(apiUrl + '/drive/files/create', {
						method: 'POST',
						body: data
					})
					.then(response => response.json())
					.then(f => {
						ok(f);
					})
				});
			});
			os.promiseDialog(promise);
			return promise;
		},
		async post() {
			this.posting = true;
			const file = this.block.attachCanvasImage ? await this.upload() : null;
			os.apiWithDialog('notes/create', {
				text: this.text === '' ? null : this.text,
				viaMobile: os.isMobile,
				fileIds: file ? [file.id] : undefined,
			}).then(() => {
				this.posted = true;
			});
		},
		chooseVisibility(ev) {
			os.popup(import('../visibility-picker.vue'), {
				currentVisibility: this.visibility,
				currentLocalOnly: this.localOnly,
				currentRemoteFollowersOnly: this.remoteFollowersOnly,
				src: ev.currentTarget || ev.target,
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
		share(ev) {
			os.modalMenu([{
				icon: faTwitter,
				type: 'a',
				href: `https://twitter.com/share?text=${encodeURIComponent(this.text)}`,
				target: '_blank',
				text: 'Twitter',
			}, {
				icon: faShareAlt,
				text: 'Fediverse',
				action: this.shareFediverse,
			},], ev.currentTarget || ev.target);
		},
		async shareFediverse() {
			const { canceled, result } = await os.dialog({
				title: i18n.locale.enterInstanceUrlToShare,
				input: true,
			});
			if (canceled) return;

			window.open(`https://${result}/share?text=${encodeURIComponent(this.text)}`);
		},
	}
});
</script>

<style lang="scss" scoped>
.ngbfujlo {
	position: relative;
	padding: 16px;
	border-radius: var(--margin);
	box-shadow: 0 2px 8px var(--shadow);
	background: var(--panel);
	z-index: 1;

	h1 {
		font-size: 1.5rem;
		margin: 0;
		margin-bottom: 1rem;
	}

	> .commands {
		justify-content: flex-end;
		margin-top: 32px;
		> ._button {
			width: 40px;
			height: 40px;
			border-radius: var(--radius);
		}
	}

	@media (max-width: 600px) {
		padding: 16px;

		> .commands {
			margin-top: 16px;
		}
	}
}
</style>
