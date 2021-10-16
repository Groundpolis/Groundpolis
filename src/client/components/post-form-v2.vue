<template>
<div
	class="gp-com-postformv2"
	:class="{modal}"
	@dragover.stop="onDragover"
	@dragenter="onDragenter"
	@dragleave="onDragleave"
	@drop.stop="onDrop"
>
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
		<button class="_btn flat icon" v-tooltip="$ts._postForm.poll" :class="{active: draft.poll}" @click="togglePoll">
			<BIconPieChart />
		</button>
		<button class="_btn flat icon" v-tooltip="$ts._postForm.broadcast" :class="{active: useBroadcast}" @click="useBroadcast = !useBroadcast">
			<BIconMegaphone />
		</button>
	</div>
	<div class="_cardx _mb-1 _pa-2" style="opacity: 0.5" v-if="reply">
		<XNotePreview v-if="reply" class="preview" :note="reply"/>
	</div>
	<div class="_cardx _mb-1 _pa-2" style="opacity: 0.5" v-if="quote">
		<XNotePreview v-if="quote" class="preview" :note="quote"/>
	</div>
	<div v-show="useCw" class="_cardx textarea-card _mb-1">
		<input :placeholder="$ts._postForm.cwPlaceholder" ref="cwRef" v-model="cw" />
	</div>
	<div class="_cardx textarea-card has-tab">
		<ul class="tab">
			<li :class="{active: mode === 'edit'}" @click="mode = 'edit'">
				<button>{{$ts.edit}}</button>
			</li>
			<li :class="{active: mode === 'preview'}" @click="mode = 'preview'">
				<button>{{$ts.preview}}</button>
			</li>
		</ul>
		<div class="textarea-wrapper">
			<textarea 
				v-show="mode === 'edit'" 
				:placeholder="placeholder"
				ref="textRef"
				v-model="draft.text"
				@keydown="onKeydown"
				@paste="onPaste"
				@compositionupdate="onCompositionUpdate"
				@compositionend="onCompositionEnd"
				/>
			<div class="count" v-if="mode === 'edit'" v-text="max - textLength" :class="{error: max < textLength}" />
		</div>
		<div v-show="mode === 'preview'" class="preview">
			<Mfm :text="draft.text" />
		</div>
		<XPostFormAttaches class="attaches" :files="draft.files" @updated="updateFiles" @detach="detachFile" @changeSensitive="updateFileSensitive" @changeName="updateFileName"/>
		<XPollEditor class="_mb-3" v-if="draft.poll" :poll="draft.poll" @destroyed="draft.poll = null" @updated="onPollUpdate"/>
		<MkSwitch v-if="requiredConfirmation" v-model:value="draft.confirmed" class="confirm-switch _ma-2">
			{{ $ts.confirmBeforePostLabel }}
		</MkSwitch>
	</div>
	<div class="gpfmpad _hstack dense" :class="{'_shadow-1-f': modal}">
		<button class="_btn flat icon" v-tooltip="$ts.insertQuote" style="font-size: 24px" @click="insert('> ')">
			<BIconBlockquoteLeft />
		</button>
		<button class="_btn flat icon" v-tooltip="$ts.insertLink" style="font-size: 24px" @click="link">
			<BIconLink45deg />
		</button>
		<button class="_btn flat icon" v-tooltip="$ts.insertFunction" style="font-weight: normal; font-size: 18px" @click="insertFunction">
			[ ]
		</button>
		<button class="_btn flat icon" v-tooltip="$ts.insertMention" style="font-size: 24px" @click="insertMention">
			<BIconAt />
		</button>
		<button class="_btn flat icon" v-tooltip="$ts.openEmojiPalette" @click="insertEmoji">
			<BIconEmojiSmile />
		</button>
		<button class="_btn flat icon" v-tooltip="$ts.openEmojiPalette" @click="insertFace">
			<Fa :icon="faFish" />
		</button>
	</div>
	<div v-show="useBroadcast" class="_cardx textarea-card _shadow-3 _mb-2">
		<input :placeholder="$ts._postForm.broadcastPlaceholder" ref="broadcastRef" v-model="broadcastText" />
	</div>
	<div class="footer _hstack dense">
		<a class="_btn active primary flat icon _ml-auto" style="height: 40px" v-tooltip="'Send Feedback'" href="https://forms.gle/uHZihgYbyH5tGfJV9" target="_blank" rel="noopener noreferrer">
			<BIconExclamationCircle />
		</a>
		<div class="_hgroup">
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
import { defineComponent, defineAsyncComponent, onMounted, reactive, ref, nextTick, computed, watch, Ref, toRef } from 'vue';

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
	BIconExclamationCircle,
} from 'bootstrap-icons-vue';

import {
	faFish,
} from '@fortawesome/free-solid-svg-icons';

import insertTextAtCursor from 'insert-text-at-cursor';
import XNotePreview from './note-preview.vue';
import { length } from 'stringz';
import { Autocomplete } from '@/scripts/autocomplete';
import objectAssignDeep from 'object-assign-deep';
import { selectFile } from '@/scripts/select-file';
import { i18n } from '@/i18n';
import { api, dialog, isMobile, popup, upload, form, selectUser, pickEmoji } from '@/os';
import { defaultStore, notePostInterruptors } from '@/store';
import { toASCII } from 'punycode';
import { markRawAll } from '@/scripts/mark-raw-all';

import VisibilityIcon from './visibility-icon.vue';
import getAcct from '../../misc/acct/render';
import MkSwitch from './ui/switch.vue';
import { instance } from '@/instance';
import extractMentions from '@/../misc/extract-mentions';
import { MfmNode, parse } from 'mfm-js';
import { $i } from '@/account';
import { unique } from '@/../prelude/array';
import { formatTimeString } from '@/../misc/format-time-string';
import { host, url } from '@/config';
import { FormItem } from '@/scripts/form';
import { MfmHashtag } from 'mfm-js';

markRawAll(
	faFish,
);

const noteTemplate = {
	text: '',
	files: [] as any[],
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
		BIconExclamationCircle,
		VisibilityIcon,
		XNotePreview,
		XPostFormAttaches: defineAsyncComponent(() => import('./post-form-attaches.vue')),
		XPollEditor: defineAsyncComponent(() => import('./poll-editor.vue'))
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
		const draft = reactive(objectAssignDeep({}, noteTemplate));
		const mode = ref<'edit' | 'preview'>('edit');
		const posting = ref(false);
		const quote: Ref<any> = ref(null as any);
		const imeText = ref('');
		const draghover = ref(false);

		const state = reactive({
			useCw: false,
			useBroadcast: false,
			cw: '',
			broadcastText: '',
			visibility: defaultStore.reactiveState.rememberNoteVisibility
				? defaultStore.state.visibility
				: defaultStore.state.defaultNoteVisibility,
			localOnly: defaultStore.reactiveState.rememberNoteVisibility
				? defaultStore.state.localOnly
				: defaultStore.state.defaultNoteLocalOnly ,
			remoteFollowersOnly: defaultStore.reactiveState.rememberNoteVisibility
				? defaultStore.state.remoteFollowersOnly
				: defaultStore.state.defaultNoteRemoteFollowersOnly,
		});

		const visibility = toRef(state, 'visibility');
		const visibleUsers = reactive<any[]>([]);
		const useCw = toRef(state, 'useCw');
		const useBroadcast = toRef(state, 'useBroadcast');
		const cw = toRef(state, 'cw');
		const broadcastText = toRef(state, 'broadcastText');
		const localOnly = toRef(state, 'localOnly');
		const remoteFollowersOnly = toRef(state, 'remoteFollowersOnly');

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

		const textLength = computed(() => length((draft.text + imeText.value).trim()));
		
		const max = computed(() => instance ? instance.maxNoteTextLength as number : 1000);

		const requiredConfirmation = computed(() => defaultStore.reactiveState.confirmBeforePost.value);

		// TODO
		const currentAccountIsMyself = computed(() => true);

		const canPost = computed(() => (
			!posting.value &&
			(!requiredConfirmation.value || draft.confirmed) &&
			(1 <= textLength.value || 1 <= draft.files.length || !!draft.poll || !!quote.value) &&
			(textLength.value <= max.value) &&
			(!draft.poll || draft.poll.choices.length >= 2)
		));

		const saveDraft = () => {
			if (props.instant) return;

			const data = JSON.parse(localStorage.getItem('drafts') || '{}');

			data[draftKey.value] = {
				updatedAt: new Date(),
				data: {
					text: draft.text,
					useCw: useCw.value,
					cw: cw.value,
					useBroadcast: useBroadcast.value,
					broadcastText: broadcastText.value,
					visibility: visibility.value,
					localOnly: localOnly.value,
					remoteFollowersOnly: remoteFollowersOnly.value,
					visibleUsers: [ ...visibleUsers ],
					files: draft.files,
					quote: quote.value,
					poll: draft.poll
				}
			};

			localStorage.setItem('drafts', JSON.stringify(data));
		};

		const deleteDraft = () => {
			const data = JSON.parse(localStorage.getItem('drafts') || '{}');

			delete data[draftKey.value];

			localStorage.setItem('drafts', JSON.stringify(data));
		};

		const watchData = () => {
			watch(() => draft, saveDraft, { deep: true });
			watch(visibility, saveDraft);
			watch(visibleUsers, saveDraft);
			watch(useCw, saveDraft);
			watch(useBroadcast, saveDraft);
			watch(cw, saveDraft);
			watch(broadcastText, saveDraft);
			watch(localOnly, saveDraft);
			watch(remoteFollowersOnly, saveDraft);
			watch(quote, saveDraft);
		};

		const fileUpload = (file: File, name?: string) => {
			upload(file, defaultStore.state.uploadFolder, name).then(res => {
				draft.files.push(res);
			});
		};

		const insert = (text: string) => {
			insertTextAtCursor(textRef.value, text);
		};

		const post = async () => {
			if (props.reply && props.reply.user.host !== null && localOnly.value) {
				await dialog({
					type: 'error',
					text: i18n.locale.errorLocalOnlyToRemote,
				});
				return;
			}

			let data = {
				text: draft.text == '' ? undefined : draft.text + (useBroadcast.value ? ' ' + broadcastText.value : ''),
				fileIds: draft.files.length > 0 ? draft.files.map(f => f.id) : undefined,
				replyId: props.reply ? props.reply.id : undefined,
				renoteId: quote.value ? quote.value.id : props.renote ? props.renote.id : undefined,
				channelId: props.channel ? props.channel.id : undefined,
				poll: draft.poll,
				cw: useCw.value ? cw.value || '' : undefined,
				localOnly: localOnly.value,
				remoteFollowersOnly: remoteFollowersOnly.value,
				visibility: visibility.value,
				// TODO
				// visibleUserIds: draft.visibility == 'specified' ? draft.visibleUsers.map(u => u.id) : undefined,
				viaMobile: isMobile
			};

			// plugin
			if (notePostInterruptors.length > 0) {
				for (const interruptor of notePostInterruptors as any[]) {
					data = await interruptor.handler(JSON.parse(JSON.stringify(data)));
				}
			}
			// get token

			// const token = currentAccountIsMyself ? undefined : currentAccount.token;

			posting.value = true;
			
			api('notes/create', data).then(() => {
				objectAssignDeep(draft, noteTemplate);
				nextTick(() => {
					deleteDraft();
					ctx.emit('posted');
					if (draft.text && draft.text != '') {
						const hashtags = parse(draft.text)!.filter(x => x.type === 'hashtag').map((x: MfmNode) => (x as MfmHashtag).props.hashtag);
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
		};

		// TODO: detach when unmount
		onMounted(() => {
			new Autocomplete(textRef, draft, { model: 'text' });
			new Autocomplete(cwRef, state, { model: 'cw' });
			new Autocomplete(broadcastRef, state, { model: 'broadcastText' });

			if (props.initialText) {
				draft.text = props.initialText;
			}

			if (props.mention) {
				draft.text = props.mention.host ? `@${props.mention.username}@${toASCII(props.mention.host)}` : `@${props.mention.username}`;
				draft.text += ' ';
			}

			if (props.renote) {
				quote.value = props.renote;
			}

			if (props.reply && props.reply.user.host != null) {
				draft.text = `@${props.reply.user.username}@${toASCII(props.reply.user.host)} `;
			}

			if (props.reply && props.reply.text != null) {
				const ast = parse(props.reply.text);

				for (const x of extractMentions(ast)) {
					const mention = x.host ? `@${x.username}@${toASCII(x.host)}` : `@${x.username}`;

					// 自分は除外
					if ($i!.username == x.username && x.host == null) continue;
					if ($i!.username == x.username && x.host == host) continue;

					// 重複は除外
					if (draft.text.indexOf(`${mention} `) != -1) continue;

					draft.text += `${mention} `;
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
						userIds: props.reply.visibleUserIds.filter(uid => uid !== $i!.id && uid !== props.reply!.userId)
					}).then(users => {
						visibleUsers.push(...users);
					});

					if (props.reply.userId !== $i.id) {
						api('users/show', { userId: props.reply.userId }).then(user => {
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
					const saveddraft = JSON.parse(localStorage.getItem('drafts') || '{}')[draftKey.value];
					if (saveddraft) {
						draft.text = saveddraft.data.text;
						useCw.value = saveddraft.data.useCw;
						cw.value = saveddraft.data.cw;
						useBroadcast.value = saveddraft.data.useBroadcast;
						broadcastText.value = saveddraft.data.broadcastText;
						visibility.value = saveddraft.data.visibility;
						localOnly.value = saveddraft.data.localOnly;
						remoteFollowersOnly.value = saveddraft.data.remoteFollowersOnly;
						quote.value = saveddraft.data.quote;
						visibleUsers.push(...(saveddraft.data.visibleUsers as []));
						draft.files = (saveddraft.data.files || []).filter(e => e);
						if (saveddraft.data.poll) {
							draft.poll = saveddraft.data.poll;
						}
					}
				}
		});

			// 削除して編集
			if (props.initialNote) {
				const init = props.initialNote;
				draft.text = init.text ? init.text : '';
				draft.files = init.files;
				cw.value = init.cw;
				useCw.value = init.cw != null;
				if (init.poll) {
					draft.poll = init.poll;
				}
				visibility.value = init.visibility;
				localOnly.value = init.localOnly;
				remoteFollowersOnly.value = init.remoteFollowersOnly;
				quote.value = init.renote;
				if (init.visibleUserIds && init.visibleUserIds.length > 0) {
					api('users/show', {
						userIds: init.visibleUserIds
					}).then((users) => {
						visibleUsers.push(...(users as any[]));
						saveDraft();
					});
				} else {
					saveDraft();
				}
			}

			nextTick(() => watchData());
		});

		return {
			draft,
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
				if (draft.poll) {
					draft.poll = null;
				} else {
					draft.poll = {
						choices: ['', ''],
						multiple: false,
						expiresAt: null,
						expiredAfter: null,
					};
				}
			},

			chooseFileFrom(ev) {
				selectFile(ev.currentTarget || ev.target, i18n.locale.attachFile, true).then(files => {
					for (const file of files as any[]) {
						draft.files.push(file);
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
				draft.files = files;
			},

			updateFileSensitive(file, sensitive) {
				draft.files[draft.files.findIndex(x => x.id === file.id)].isSensitive = sensitive;
			},

			detachFile(id) {
				draft.files = draft.files.filter(x => x.id != id);
			},

			updateFileName(file, name) {
				draft.files[draft.files.findIndex(x => x.id === file.id)].name = name;
			},

			onPollUpdate(poll) {
				draft.poll = poll;
				saveDraft();
			},

			onKeydown(e: KeyboardEvent) {
				if ((e.which === 10 || e.which === 13) && (e.ctrlKey || e.metaKey) && canPost.value) post();
				if (e.which === 27) ctx.emit('esc');
			},

			onCompositionUpdate(e: CompositionEvent) {
				imeText.value = e.data;
			},

			onCompositionEnd(e: CompositionEvent) {
				imeText.value = '';
			},

			async onPaste(e: ClipboardEvent) {
				if (!e.clipboardData) return;
				if (!currentAccountIsMyself.value) return;
				for (const { item, i } of Array.from(e.clipboardData.items).map((item, i) => ({item, i}))) {
					if (item.kind == 'file') {
						const file = item.getAsFile();
						if (file !== null) {
							const lio = file.name.lastIndexOf('.');
							const ext = lio >= 0 ? file.name.slice(lio) : '';
							const formatted = `${formatTimeString(new Date(file.lastModified), defaultStore.state.pastedFileName).replace(/{{number}}/g, `${i + 1}`)}${ext}`;
							fileUpload(file, formatted);
						}
					}
				}

				const paste = e.clipboardData.getData('text');

				if (!quote.value && paste.startsWith(url + '/notes/')) {
					e.preventDefault();

					dialog({
						type: 'info',
						text: i18n.locale.quoteQuestion,
						showCancelButton: true
					}).then(({ canceled }) => {
						if (canceled) {
							insert(paste);
							return;
						}

						const quoteId = paste.substr(url.length).match(/^\/notes\/(.+?)\/?$/)![1];
						api('notes/show', {
							noteId: quoteId,
						}).then(note => {
							quote.value = note;
						}).catch(e => {
							dialog({
								type: 'error',
								text: e.message,
							});
						});
					});
				}
			},

			onDragover(e) {
				if (!currentAccountIsMyself.value) {
					e.preventDefault();
					draghover.value = true;
					e.dataTransfer.dropEffect = 'none';
					return;
				};
				if (!e.dataTransfer.items[0]) return;
				const isFile = e.dataTransfer.items[0].kind == 'file';
				const isDriveFile = e.dataTransfer.types[0] == _DATA_TRANSFER_DRIVE_FILE_;
				if (isFile || isDriveFile) {
					e.preventDefault();
					draghover.value = true;
					e.dataTransfer.dropEffect = e.dataTransfer.effectAllowed == 'all' ? 'copy' : 'move';
				}
			},

			onDragenter(e) {
				draghover.value = true;
			},

			onDragleave(e) {
				draghover.value = false;
			},

			onDrop(e): void {
				if (!currentAccountIsMyself.value) return;
				draghover.value = false;

				// ファイルだったら
				if (e.dataTransfer.files.length > 0) {
					e.preventDefault();
					for (const x of Array.from(e.dataTransfer.files)) fileUpload(x);
					return;
				}

				//#region ドライブのファイル
				const driveFile = e.dataTransfer.getData(_DATA_TRANSFER_DRIVE_FILE_);
				if (driveFile != null && driveFile != '') {
					const file = JSON.parse(driveFile);
					draft.files.push(file);
					e.preventDefault();
				}
				//#endregion
			},

			insertFunction() {
				popup(import('./function-builder-window.vue'), {
				}, { done: insert }, 'closed');
			},

			async link() {
				const formItems: Record<string, FormItem> = {
					url: {
						type: 'string',
						default: 'https://',
						label: 'URL',
					},
					desc: {
						type: 'string',
						default: '',
						label: i18n.locale.description,
					},
					noUrlPreview: {
						type: 'boolean',
						default: false,
						label: i18n.locale._mfmpad.noUrlPreview,
						description: i18n.locale._mfmpad.noUrlPreviewDesc,
					},
				};
				const { canceled, result } = await form('挿入するリンクの設定', formItems);
				if (canceled) return;
				insert(`${result.noUrlPreview ? '?' : ''}[${result.desc}](${result.url})`);
			},

			insertFace() {
				const faces = defaultStore.reactiveState.faces.value;
				insert(faces.length > 0 ? faces[Math.floor(Math.random() * faces.length)] : '');
			},

			insertMention() {
				selectUser().then(user => {
					insert('@' + getAcct(user) + ' ');
				});
			},

			async insertEmoji(ev) {
				pickEmoji(ev.currentTarget || ev.target).then(emoji => {
					insert(emoji);
				});
			},

			post,
			insert,
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
