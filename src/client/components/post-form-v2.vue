<template>
<div class="gp-com-postformv2" :class="{modal}">
	<div class="_hstack dense _mb-1" :class="{'_shadow-1-f': modal}">
		<button v-if="!fixed" class="_btn flat icon" v-tooltip="$ts.close" @click="$emit('cancel')" style="font-size: 24px">
			<BIconX />
		</button>
		<button class="_btn flat icon" v-tooltip="$ts._postForm.attachMedia" @click="chooseFileFrom">
			<BIconPaperclip />
		</button>
		<button class="_btn flat icon" v-tooltip="$ts._postForm.cwOn" :class="{active: useCw}" @click="useCw = !useCw">
			<BIconEyeSlash v-if="!useCw" />
			<BIconEye v-else />
		</button>
		<button class="_btn flat icon" v-tooltip="$ts._postForm.poll" :class="{active: draftNote.poll}" @click="togglePoll">
			<BIconPieChart />
		</button>
		<button class="_btn flat icon" v-tooltip="$ts._postForm.broadcast" :class="{active: useBroadcast}" @click="useBroadcast = !useBroadcast">
			<BIconMegaphone />
		</button>
	</div>
	<div class="_cardx _mb-1 _pa-2" style="opacity: 0.5" v-if="reply">
		<XNotePreview class="preview" :note="reply"/>
	</div>
	<div class="_cardx _mb-1 _pa-2" style="opacity: 0.5" v-if="quote">
		<XNotePreview class="preview" :note="quote"/>
	</div>
	<div v-show="useCw" class="_cardx textarea-card _mb-1">
		<input :placeholder="$ts._postForm.cwPlaceholder" ref="cwRef" v-model="cw" />
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
		<div class="textarea-wrapper">
			<textarea v-show="mode === 'edit'" :placeholder="placeholder" ref="textRef" v-model="draftNote.text" />
			<div class="count" v-text="max - textLength" :class="{error: max < textLength}" />
		</div>
		<div v-show="mode === 'preview'" class="preview">
			<Mfm :text="draftNote.text" />
		</div>
		<XPostFormAttaches class="attaches" :files="draftNote.files" @updated="updateFiles" @detach="detachFile" @changeSensitive="updateFileSensitive" @changeName="updateFileName"/>
		<MkSwitch v-if="requiredConfirmation" v-model:value="draftNote.confirmed" class="confirm-switch">
			{{ $ts.confirmBeforePostLabel }}
		</MkSwitch>
	</div>
	<div class="gpfmpad _hstack dense" :class="{'_shadow-1-f': modal}">
		<button class="_btn flat icon" v-tooltip="$ts.insertQuote" style="font-size: 24px">
			<BIconBlockquoteLeft />
		</button>
		<button class="_btn flat icon" v-tooltip="$ts.insertLink" style="font-size: 24px">
			<BIconLink45deg />
		</button>
		<button class="_btn flat icon" v-tooltip="$ts.insertFunction" style="font-weight: normal; font-size: 18px">
			[ ]
		</button>
		<button class="_btn flat icon" v-tooltip="$ts.insertMention" style="font-size: 24px">
			<BIconAt />
		</button>
		<button class="_btn flat icon" v-tooltip="$ts.openEmojiPalette">
			<BIconEmojiSmile />
		</button>
		<button class="_btn flat icon" v-tooltip="$ts.openEmojiPalette">
			<Fa :icon="faFish" />
		</button>
	</div>
	<div v-show="useBroadcast" class="_cardx textarea-card _shadow-3 _mb-2">
		<input :placeholder="$ts._postForm.broadcastPlaceholder" ref="broadcastRef" v-model="broadcastText" />
	</div>
	<div class="footer _hstack">
		<div class="_hgroup _ml-auto">
			<button class="_btn primary" @click="post" :disabled="!canPost">
				<VisibilityIcon
					:visibility="visibility"
					:localOnly="localOnly"
					:remoteFollowersOnly="remoteFollowersOnly"
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
import { defineComponent, defineAsyncComponent, onMounted, reactive, ref, nextTick, computed, watch, Ref } from 'vue';

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
import insertTextAtCursor from 'insert-text-at-cursor';
import XNotePreview from './note-preview.vue';
import { length } from 'stringz';
import { Autocomplete } from '@/scripts/autocomplete';
import objectAssignDeep from 'object-assign-deep';
import { selectFile } from '@/scripts/select-file';
import { i18n } from '@/i18n';
import { api, dialog, isMobile, popup, upload } from '@/os';
import { defaultStore, notePostInterruptors } from '@/store';
import { toASCII } from 'punycode';
import { markRawAll } from '@/scripts/mark-raw-all';

import VisibilityIcon from './visibility-icon.vue';
import MkSwitch from './ui/switch.vue';
import { instance } from '@/instance';
import extractMentions from '@/../misc/extract-mentions';
import { parse } from '@/../mfm/parse';
import { $i } from '@/account';
import { unique } from '@/../prelude/array';

markRawAll(
	faFish,
);

const noteTemplate = {
	text: '',
	files: [],
	poll: null as unknown | null,
	confirmed: false,
};

export default defineComponent({
	components: {
		MkSwitch,
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
		XNotePreview,
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
		const posting = ref(false);
		const quote: Ref<any> = ref(null as any);
		const imeText = ref('');

		const visibility = ref<NoteVisibility>(
			defaultStore.reactiveState.rememberNoteVisibility
				? defaultStore.state.visibility
				: defaultStore.state.defaultNoteVisibility 
		);
		const visibleUsers = reactive([]);
		const useCw = ref(false);
		const useBroadcast = ref(false);
		const cw = ref('');
		const broadcastText = ref('');
		const localOnly = ref(
			defaultStore.reactiveState.rememberNoteVisibility
				? defaultStore.state.localOnly
				: defaultStore.state.defaultNoteLocalOnly 
		);
		const remoteFollowersOnly = ref(
			defaultStore.reactiveState.rememberNoteVisibility
				? defaultStore.state.remoteFollowersOnly
				: defaultStore.state.defaultNoteRemoteFollowersOnly 
		);

		const textRef = ref();
		const cwRef = ref();
		const broadcastRef = ref();

		const draftKey = computed(() => {
			let key = props.channel ? `channel:${props.channel.id}` : '';

			if (quote.value && props.renote) {
				key += `renote:${quote.value.id}`;
			} else if (props.reply) {
				key += `reply:${props.reply.id}`;
			} else {
				key += 'note';
			}

			return key;
		});

		const placeholder = computed(() => {
			if (quote.value) {
				return i18n.locale._postForm.quotePlaceholder;
			} else if (props.reply) {
				return i18n.locale._postForm.replyPlaceholder;
			} else if (props.channel) {
				return i18n.locale._postForm.channelPlaceholder;
			} else {
				const xs = [
					i18n.locale._postForm._placeholders.a,
					i18n.locale._postForm._placeholders.b,
					i18n.locale._postForm._placeholders.c,
					i18n.locale._postForm._placeholders.d,
					i18n.locale._postForm._placeholders.e,
					i18n.locale._postForm._placeholders.f
				];
				return xs[Math.floor(Math.random() * xs.length)];
			}
		});

		const textLength = computed(() => length((draftNote.text + imeText.value).trim()));
		
		const max = computed(() => instance ? instance.maxNoteTextLength as number : 1000);

		const requiredConfirmation = computed(() => defaultStore.reactiveState.confirmBeforePost);

		const canPost = computed(() => (
			!posting.value &&
			(!requiredConfirmation.value || draftNote.confirmed) &&
			(1 <= textLength.value || 1 <= draftNote.files.length || !!draftNote.poll || !!quote) &&
			(textLength.value <= max.value) &&
			(!draftNote.poll || draftNote.poll.choices.length >= 2)
		));

		const saveDraft = () => {
			if (props.instant) return;

			const data = JSON.parse(localStorage.getItem('drafts') || '{}');

			data[draftKey.value] = {
				updatedAt: new Date(),
				data: {
					text: draftNote.text,
					useCw: useCw.value,
					cw: cw.value,
					useBroadcast: useBroadcast.value,
					broadcastText: broadcastText.value,
					visibility: visibility.value,
					localOnly: localOnly.value,
					remoteFollowersOnly: remoteFollowersOnly.value,
					visibleUsers: [ ...visibleUsers ],
					files: draftNote.files,
					quote,
					poll: draftNote.poll
				}
			};

			localStorage.setItem('drafts', JSON.stringify(data));
		},

		const deleteDraft = () => {
			const data = JSON.parse(localStorage.getItem('drafts') || '{}');

			delete data[draftKey.value];

			localStorage.setItem('drafts', JSON.stringify(data));
		}

		const watchData = () => {
			watch(draftNote, saveDraft);
			watch(quote, saveDraft);
		}

		// TODO: detach when unmount
		onMounted(() => {
			new Autocomplete(textRef, { draftNote }, { model: 'draftNote.text' });
			new Autocomplete(cwRef, { draftNote }, { model: 'draftNote.cw' });
			new Autocomplete(broadcastRef, { draftNote }, { model: 'draftNote.broadcastText' });

			if (props.initialText) {
				draftNote.text = props.initialText;
			}

			if (props.mention) {
				draftNote.text = props.mention.host ? `@${props.mention.username}@${toASCII(props.mention.host)}` : `@${props.mention.username}`;
				draftNote.text += ' ';
			}

			if (props.renote) {
				quote.value = props.renote;
			}

			if (props.reply && props.reply.user.host != null) {
				draftNote.text = `@${props.reply.user.username}@${toASCII(props.reply.user.host)} `;
			}

			if (props.reply && props.reply.text != null) {
				const ast = parse(props.reply.text);

				for (const x of extractMentions(ast)) {
					const mention = x.host ? `@${x.username}@${toASCII(x.host)}` : `@${x.username}`;

					// 自分は除外
					if ($i.username == x.username && x.host == null) continue;
					if ($i.username == x.username && x.host == host) continue;

					// 重複は除外
					if (draftNote.text.indexOf(`${mention} `) != -1) continue;

					draftNote.text += `${mention} `;
				}
			}

			// デフォルト公開範囲
			if (props.channel) {
				visibility.value = 'public';
				localOnly.value = true; // TODO: チャンネルが連合するようになった折には消す
				remoteFollowersOnly.value = false;
			}

			// public以外へのリプライ時は元の公開範囲を引き継ぐ
			if (props.reply && ['home', 'followers', 'specified'].includes(props.reply.visibility)) {
				visibility.value = props.reply.visibility;
				if (props.reply.visibility === 'specified') {
					api('users/show', {
						userIds: props.reply.visibleUserIds.filter(uid => uid !== $i.id && uid !== props.reply.userId)
					}).then(users => {
						visibleUsers.push(...users);
					});

					if (props.reply.userId !== this.$i.id) {
						api('users/show', { userId: this.reply.userId }).then(user => {
							visibleUsers.push(user);
						});
					}
				}
			}

			if (props.specified) {
				visibility.value = 'specified';
				visibleUsers.push(props.specified);
			}

			// keep cw when reply
			if (defaultStore.state.keepCw && props.reply && props.reply.cw) {
				useCw.value = true;
				cw.value = props.reply.cw;
			}

			if (props.autofocus) {
				focus();

				nextTick(() => {
					focus();
				});
			}

			nextTick(() => {
				// 書きかけの投稿を復元
				if (!props.instant && !props.mention && !props.specified) {
					const savedDraftNote = JSON.parse(localStorage.getItem('drafts') || '{}')[props.draftKey];
					if (savedDraftNote) {
						draftNote.text = savedDraftNote.data.text;
						useCw.value = savedDraftNote.data.useCw;
						cw.value = savedDraftNote.data.cw;
						useBroadcast.value = savedDraftNote.data.useBroadcast;
						broadcastText.value = savedDraftNote.data.broadcastText;
						visibility.value = savedDraftNote.data.visibility;
						localOnly.value = savedDraftNote.data.localOnly;
						remoteFollowersOnly.value = savedDraftNote.data.remoteFollowersOnly;
						quote.value = savedDraftNote.data.quote;
						visibleUsers.push(...(savedDraftNote.data.visibleUsers as []));
						draftNote.files = (savedDraftNote.data.files || []).filter(e => e);
						if (savedDraftNote.data.poll) {
							draftNote.poll = savedDraftNote.data.poll;
						}
					}
				}
		});

			// 削除して編集
			if (props.initialNote) {
				const init = props.initialNote;
				draftNote.text = init.text ? init.text : '';
				draftNote.files = init.files;
				cw.value = init.cw;
				useCw.value = init.cw != null;
				if (init.poll) {
					draftNote.poll = init.poll;
				}
				visibility.value = init.visibility;
				localOnly.value = init.localOnly;
				remoteFollowersOnly.value = init.remoteFollowersOnly;
				quote.value = init.renote;
				if (init.visibleUserIds && init.visibleUserIds.length > 0) {
					api('users/show', {
						userIds: init.visibleUserIds
					}).then((users: []) => {
						visibleUsers.push(...users);
						saveDraft();
					});
				} else {
					saveDraft();
				}

				nextTick(() => watchData());
			}
		});

		return {
			draftNote,
			mode,
			posting,
			quote,

			textRef,
			cwRef,
			broadcastRef,

			faFish,

			placeholder,
			textLength,
			max,
			canPost,
			requiredConfirmation,

			visibility,
			visibleUsers,
			useCw,
			useBroadcast,
			cw,
			broadcastText,
			localOnly,
			remoteFollowersOnly,

			togglePoll() {
				if (draftNote.poll) {
					draftNote.poll = null;
				} else {
					draftNote.poll = {
						choices: ['', ''],
						multiple: false,
						expiresAt: null,
						expiredAfter: null,
					};
				}
			},

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
					currentVisibility: visibility.value,
					currentLocalOnly: localOnly.value,
					currentRemoteFollowersOnly: remoteFollowersOnly.value,
					src: ev.currentTarget || ev.target,
				}, {
					changeVisibility: v => {
						visibility.value = v;
						if (defaultStore.state.rememberNoteVisibility) {
							defaultStore.set('visibility', v);
						}
					},
					changeLocalOnly: lo => {
						localOnly.value = lo;
						if (defaultStore.state.rememberNoteVisibility) {
							defaultStore.set('localOnly', lo);
						}
					},
					changeRemoteFollowersOnly: re => {
						remoteFollowersOnly.value = re;
						if (defaultStore.state.rememberNoteVisibility) {
							defaultStore.set('remoteFollowersOnly', re);
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
				draftNote.files[draftNote.files.findIndex(x => x.id === file.id)].name = name;
			},

			upload(file: File, name?: string) {
				upload(file, defaultStore.state.uploadFolder, name).then(res => {
					draftNote.files.push(res);
				});
			},

			async post() {
				if (props.reply && props.reply.user.host !== null && localOnly.value) {
					await dialog({
						type: 'error',
						text: i18n.locale.errorLocalOnlyToRemote,
					});
					return;
				}

				let data = {
					text: draftNote.text == '' ? undefined : draftNote.text + (useBroadcast.value ? ' ' + broadcastText.value : ''),
					fileIds: draftNote.files.length > 0 ? draftNote.files.map(f => f.id) : undefined,
					replyId: props.reply ? props.reply.id : undefined,
					renoteId: quote.value ? quote.value.id : props.renote ? props.renote.id : undefined,
					channelId: props.channel ? props.channel.id : undefined,
					poll: draftNote.poll,
					cw: useCw.value ? cw.value || '' : undefined,
					localOnly: localOnly.value,
					remoteFollowersOnly: remoteFollowersOnly.value,
					visibility: visibility.value,
					// TODO
					// visibleUserIds: draftNote.visibility == 'specified' ? draftNote.visibleUsers.map(u => u.id) : undefined,
					viaMobile: isMobile
				};

				// plugin
				if (notePostInterruptors.length > 0) {
					for (const interruptor of notePostInterruptors) {
						data = await interruptor.handler(JSON.parse(JSON.stringify(data)));
					}
				}
				// get token

				// TODO
				// const token = currentAccountIsMyself ? undefined : currentAccount.token;

				posting.value = true;
				
				api('notes/create', data).then(() => {
					objectAssignDeep(draftNote, noteTemplate);
					nextTick(() => {
						deleteDraft();
						ctx.emit('posted');
						if (draftNote.text && draftNote.text != '') {
							const hashtags = parse(draftNote.text)!.filter(x => x.node.type === 'hashtag').map(x => x.node.props.hashtag);
							const history = JSON.parse(localStorage.getItem('hashtags') || '[]') as string[];
							localStorage.setItem('hashtags', JSON.stringify(unique(hashtags.concat(history))));
						}
						posting.value = false;
					});
				}).catch(err => {
					posting.value = false;
					dialog({
						type: 'error',
						text: err.message + '\n' + (err as any).id,
					});
				});
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
			font-size: 20px;
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
		input,
		textarea {
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
				padding: 8px 16px;
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
	.textarea-wrapper {
		position: relative;
		> .count {
			position: absolute;
			right: 10px;
			bottom: 16px;
			opacity: 0.5;
			&.error {
				color: var(--error);
			}
		}
	}
	.confirm-switch {
		margin: 0.5rem;
	}
}
</style>
