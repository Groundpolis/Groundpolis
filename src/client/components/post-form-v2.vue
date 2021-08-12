<template>
<div class="gp-com-postformv2" :class="{modal}">
	<div class="_hstack dense _mb-1" :class="{'_shadow-1-f': modal}">
		<button v-if="!fixed" class="_btn flat icon" v-tooltip="$ts.close" @click="$emit('cancel')">
			<BIconX />
		</button>
		<button class="_btn flat icon" v-tooltip="$ts._postForm.attachMedia" @click="chooseFileFrom">
			<BIconPaperclip />
		</button>
		<button class="_btn flat icon" v-tooltip="$ts._postForm.cwOn" :class="{active: draftNote.useCw}" @click="draftNote.useCw = !draftNote.useCw">
			<BIconEyeSlash v-if="!draftNote.useCw" />
			<BIconEye v-else />
		</button>
		<button class="_btn flat icon" v-tooltip="$ts._postForm.poll">
			<BIconPieChart />
		</button>
		<button class="_btn flat icon" v-tooltip="$ts._postForm.broadcast" :class="{active: draftNote.useBroadcast}" @click="draftNote.useBroadcast = !draftNote.useBroadcast">
			<BIconMegaphone />
		</button>
	</div>
	<div v-show="draftNote.useCw" class="_cardx textarea-card _mb-1">
		<input :placeholder="$ts._postForm.cwPlaceholder" ref="cwRef" v-model="draftNote.cw" />
	</div>
	<div class="_cardx textarea-card has-tab">
		<ul class="tab">
			<li :class="{active: mode === 'edit'}" @click="mode = 'edit'">
				<button>編集</button>
			</li>
			<li :class="{active: mode === 'preview'}" @click="mode = 'preview'">
				<button>プレビュー</button>
			</li>
		</ul>
		<textarea v-show="mode === 'edit'" :placeholder="$ts._postForm._placeholders.a" ref="textRef" v-model="draftNote.text" />
		<div v-show="mode === 'preview'" class="preview">
			<Mfm :text="draftNote.text" />
		</div>
		<XPostFormAttaches class="attaches" :files="draftNote.files" @updated="updateFiles" @detach="detachFile" @changeSensitive="updateFileSensitive" @changeName="updateFileName"/>
	</div>
	<div v-show="draftNote.useBroadcast" class="_cardx textarea-card _shadow-3 _mb-1">
		<input :placeholder="$ts._postForm.broadcastPlaceholder" ref="broadcastRef" v-model="draftNote.broadcastText" />
	</div>
	<div class="gpfmpad _mb-1 _hstack dense" :class="{'_shadow-1-f': modal}">
		<button class="_btn flat icon" v-tooltip="$ts.insertQuote">
			<BIconBlockquoteLeft />
		</button>
		<button class="_btn flat icon" v-tooltip="$ts.insertLink">
			<BIconLink45deg />
		</button>
		<button class="_btn flat icon" v-tooltip="$ts.insertFunction" style="font-weight: normal; font-size: 18px">
			[ ]
		</button>
		<button class="_btn flat icon" v-tooltip="$ts.insertMention">
			<BIconAt />
		</button>
		<button class="_btn flat icon" v-tooltip="$ts.openEmojiPalette" style="font-size: 20px">
			<BIconEmojiSmile />
		</button>
		<button class="_btn flat icon" v-tooltip="$ts.openEmojiPalette" style="font-size: 20px">
			<Fa :icon="faFish" />
		</button>
	</div>
	<div class="footer _hstack">
		<div class="_hgroup _ml-auto">
			<button class="_btn primary">
				<VisibilityIcon
					:visibility="draftNote.visibility"
					:localOnly="draftNote.localOnly"
					:remoteFollowersOnly="draftNote.remoteFollowersOnly"
					/>
				<span class="_ml-1" v-text="$ts._postForm.createNote" />
			</button>
			<button class="_btn primary" style="padding: .5rem; margin-left: 1px" @click="setVisibility">
				<BIconChevronDown />
			</button>
		</div>
	</div>
</div>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent, onMounted, reactive, ref } from 'vue';

import {
	BIconX,
	BIconPaperclip,
	BIconEye,
	BIconEyeSlash,
	BIconPieChart,
	BIconMegaphone,
  BIconBlockquoteLeft,
	BIconLink45deg,
	BIconAt,
	BIconEmojiSmile,
	BIconChevronDown,
} from 'bootstrap-icons-vue';

import {
	faFish,
} from '@fortawesome/free-solid-svg-icons';

import { NoteVisibility } from '@/../types';
import { Autocomplete } from '@/scripts/autocomplete';
import objectAssignDeep from 'object-assign-deep';
import { selectFile } from '@/scripts/select-file';
import { i18n } from '@/i18n';
import { popup } from '@/os';
import { defaultStore } from '@/store';
import { markRawAll } from '@/scripts/mark-raw-all';

import VisibilityIcon from './visibility-icon.vue';

markRawAll(
	faFish,
);

const noteTemplate = {
	useCw: false,
	useBroadcast: false,

	visibility: 'public' as NoteVisibility,
	localOnly: false,
	remoteFollowersOnly: false,
	text: '',
	cw: '',
	broadcastText: '',
	files: [],
};

export default defineComponent({
	components: {
		BIconX,
		BIconPaperclip,
		BIconEye,
		BIconEyeSlash,
		BIconMegaphone,
		BIconPieChart,
		BIconBlockquoteLeft,
		BIconLink45deg,
		BIconAt,
		BIconEmojiSmile,
		BIconChevronDown,
		VisibilityIcon,
		XPostFormAttaches: defineAsyncComponent(() => import('./post-form-attaches.vue')),
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
	
	setup(props, ctx) {
		const draftNote = reactive(objectAssignDeep({}, noteTemplate));
		const mode = ref<'edit' | 'preview'>('edit');

		const textRef = ref();
		const cwRef = ref();
		const broadcastRef = ref();

		// TODO: detach when unmount
		onMounted(() => {
			new Autocomplete(textRef, { draftNote }, { model: 'draftNote.text' });
			new Autocomplete(cwRef, { draftNote }, { model: 'draftNote.cw' });
			new Autocomplete(broadcastRef, { draftNote }, { model: 'draftNote.broadcastText' });
		});

		return {
			draftNote,
			mode,

			textRef,
			cwRef,
			broadcastRef,

			faFish,

			chooseFileFrom(ev) {
				selectFile(ev.currentTarget || ev.target, i18n.locale.attachFile, true).then(files => {
					for (const file of files) {
						draftNote.files.push(file);
					}
				});
			},

			setVisibility(ev) {
				if (props.channel) {
					// TODO: information dialog
					return;
				}

				popup(import('./visibility-picker.vue'), {
					currentVisibility: draftNote.visibility,
					currentLocalOnly: draftNote.localOnly,
					currentRemoteFollowersOnly: draftNote.remoteFollowersOnly,
					src: ev.currentTarget || ev.target,
				}, {
					changeVisibility: visibility => {
						draftNote.visibility = visibility;
						if (defaultStore.state.rememberNoteVisibility) {
							defaultStore.set('visibility', visibility);
						}
					},
					changeLocalOnly: localOnly => {
						draftNote.localOnly = localOnly;
						if (defaultStore.state.rememberNoteVisibility) {
							defaultStore.set('localOnly', localOnly);
						}
					},
					changeRemoteFollowersOnly: remoteFollowersOnly => {
						draftNote.remoteFollowersOnly = remoteFollowersOnly;
						if (defaultStore.state.rememberNoteVisibility) {
							defaultStore.set('remoteFollowersOnly', remoteFollowersOnly);
						}
					}
				}, 'closed');
			},

			updateFiles(files) {
				draftNote.files = files;
			},

			updateFileSensitive(file, sensitive) {
				draftNote.files[draftNote.files.findIndex(x => x.id === file.id)].isSensitive = sensitive;
			},

			detachFile(id) {
				draftNote.files = draftNote.files.filter(x => x.id != id);
			},

			updateFileName(file, name) {
				this.files[this.files.findIndex(x => x.id === file.id)].name = name;
			},
		};
	}
});
</script>

<style lang="scss" scoped>
.gp-com-postformv2 {
	width: 100%;
	&.modal {
		max-width: 500px;
		._btn {
			color: white;
		}
	}
	._btn {
		display: flex;
		justify-content: center;
		align-items: center;
		&.icon {
			font-size: 24px;
			padding: 0;
			width: 50px;
			height: 50px;
			&.active {
				color: var(--accent);
			}
		}
	}
	.textarea-card {
		position: relative;
		overflow: hidden;
		box-sizing: border-box;
		border: 1px solid transparent;
		&:focus-within {
			border-color: var(--accent);
		}
		&.has-tab {
			display: flex;
			flex-direction: column;
			height: 100%;
		}
		textarea {
			height: 10rem;
		}
		> input,
		> textarea {
			font-family: unset;
			appearance: none;
			-webkit-appearance: none;
			outline: none;
			border: none;
			background: none;
			font-size: 1rem;
			color: inherit;
			overflow: auto;
			padding: var(--margin);
			box-sizing: border-box;
			width: 100%;
			max-width: 100%;
			min-width: 100%;
		}
		> .preview {
			padding: var(--margin);
			overflow: auto;
		}
		> ul.tab {
			width: 100%;
			display: flex;
			margin: 0;
			padding: 0;
			border-bottom: 1px solid var(--divider);
			> li {
				padding: 4px 16px;
				font-size: 0.8rem;
				list-style: none;
				margin: 0;
				&.active {
					color: var(--accent);
					border-bottom: 1px solid var(--accent);
				}
				> button {
					appearance: none;
					-webkit-appearance: none;
					border: none;
					margin: 0;
					padding: 0;
					background: none;
					color: inherit;
					width: 100%;
					height: 100%;
				}
			}
		}
	}
	.gpfmpad {
		width: 100%;
		justify-content: flex-end;
	}
}
</style>
