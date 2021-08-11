<template>
<div class="gp-com-postformv2 _vstack" :class="{modal}">
	<div class="_hstack dense">
		<button v-if="!fixed" class="_btn flat" v-tooltip="$ts.close" style="font-size: 24px" @click="$emit('cancel')">
			<BIconX />
		</button>
		<button class="_btn flat" v-tooltip="$ts._postForm.attachMedia">
			<BIconPaperclip />
		</button>
		<button class="_btn flat" v-tooltip="$ts._postForm.cwOn" :class="{active: draftNote.useCw, '_shadow-1-f': modal}" @click="draftNote.useCw = !draftNote.useCw">
			<BIconEyeSlash v-if="!draftNote.useCw" />
			<BIconEye v-else />
		</button>
		<button class="_btn flat" v-tooltip="$ts._postForm.poll" :class="{ '_shadow-1-f': modal }">
			<BIconPieChart />
		</button>
		<button class="_btn flat" v-tooltip="$ts._postForm.broadcast" :class="{active: draftNote.useBroadcast, '_shadow-1-f': modal}" @click="draftNote.useBroadcast = !draftNote.useBroadcast">
			<BIconMegaphone />
		</button>
	</div>
	<div v-show="draftNote.useCw" class="_cardx textarea-card">
		<input :placeholder="$ts._postForm.cwPlaceholder" ref="cwRef" v-model="draftNote.cw" />
	</div>
	<div class="_cardx textarea-card has-tab" style="height: 10rem">
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
	</div>
	<div v-show="draftNote.useBroadcast" class="_cardx textarea-card _shadow-3">
		<input :placeholder="$ts._postForm.broadcastPlaceholder" ref="broadcastRef" v-model="draftNote.broadcastText" />
	</div>
</div>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from 'vue';

import {
	BIconX,
	BIconPaperclip,
	BIconEye,
	BIconEyeSlash,
	BIconPieChart,
	BIconMegaphone,
	BIconLink45deg,
	BIconAt,
	BIconEmojiSmile,
} from 'bootstrap-icons-vue';
import { NoteVisibility } from '@/../types';
import { Autocomplete } from '@/scripts/autocomplete';

const noteTemplate = {
	useCw: false,
	useBroadcast: false,

	visibility: 'public' as NoteVisibility,
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
		BIconLink45deg,
		BIconAt,
		BIconEmojiSmile,
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
		const draftNote = reactive(noteTemplate);
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
		font-size: 24px;
		padding: 0;
		width: 50px;
		height: 50px;
		&.active {
			color: var(--accent);
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
			> input,
			> textarea,
			> .preview {
				flex: 1;
			}
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
}
</style>
