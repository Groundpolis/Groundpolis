import { nextTick, Ref, ref } from 'vue';
import * as getCaretCoordinates from 'textarea-caret';
import { toASCII } from 'punycode';
import { popup } from '@/os';
import findChildByTag from './find-child-by-tag';

export class Autocomplete {
	private suggestion: {
		x: Ref<number>;
		y: Ref<number>;
		q: Ref<string>;
		close: Function;
	};
	private textarea: any;
	private vm: any;
	private currentType: string;
	private opts: {
		model: string;
	};
	private opening: boolean;

	private get text(): string {
		let tmp = this.vm;
		for (const id of this.opts.model.split('.')) {
			tmp = tmp[id];
		}
		return tmp;
	}

	private set text(text: string) {
		let tmp = this.vm;
		const splitted = this.opts.model.split('.');
		// 代入するため、末尾だけ取り出す
		const popped = splitted.pop();
		for (const id of splitted) {
			tmp = tmp[id];
		}
		tmp[popped] = text;
	}

	/**
	 * 対象のテキストエリアを与えてインスタンスを初期化します。
	 */
	constructor(textarea, vm, opts) {
		//#region BIND
		this.onInput = this.onInput.bind(this);
		this.complete = this.complete.bind(this);
		this.close = this.close.bind(this);
		//#endregion

		this.suggestion = null;
		this.textarea = textarea;
		if (this.textarea.value instanceof HTMLElement) {
			this.textarea = this.textarea.value;
		}
		if (this.textarea instanceof HTMLElement && (!(this.textarea instanceof HTMLInputElement) || !(this.textarea instanceof HTMLTextAreaElement))) {
			const input = findChildByTag(this.textarea, 'input') as HTMLInputElement
			if (input != null) {
				this.textarea = input;
			} else {
				const ta = findChildByTag(this.textarea, 'textarea') as HTMLTextAreaElement
				if (ta != null) {
					this.textarea = ta;
				} else {
					console.warn('The element bound to the autocomplete directive is neither an input nor a textarea.');
				}
			}
		}
		this.vm = vm;
		this.opts = opts;
		this.opening = false;

		this.attach();
	}

	/**
	 * このインスタンスにあるテキストエリアの入力のキャプチャを開始します。
	 */
	public attach() {
		this.textarea.addEventListener('input', this.onInput);
	}

	/**
	 * このインスタンスにあるテキストエリアの入力のキャプチャを解除します。
	 */
	public detach() {
		this.textarea.removeEventListener('input', this.onInput);
		this.close();
	}

	/**
	 * テキスト入力時
	 */
	private onInput() {
		const caretPos = this.textarea.selectionStart;
		const text = this.text.substr(0, caretPos).split('\n').pop();

		if (!text) {
			this.close();
			return;
		}

		const mentionIndex = text.lastIndexOf('@');
		const hashtagIndex = text.lastIndexOf('#');
		const emojiIndex = text.lastIndexOf(':');
		const fnIndex = text.lastIndexOf('$');
		const templateIndex = text.lastIndexOf('.');

		const max = Math.max(
			mentionIndex,
			hashtagIndex,
			emojiIndex,
			fnIndex,
			templateIndex
		);

		if (max == -1) {
			this.close();
			return;
		}

		const isMention = mentionIndex != -1;
		const isHashtag = hashtagIndex != -1;
		const isEmoji = emojiIndex != -1;
		const isFn = fnIndex != -1;
		const isTemplate = templateIndex != -1;

		let opened = false;

		if (isMention) {
			const username = text.substr(mentionIndex + 1);
			if (username != '' && username.match(/^[a-zA-Z0-9_]+$/)) {
				this.open('user', username);
				opened = true;
			} else if (username === '') {
				this.open('user', null);
				opened = true;
			}
		}

		if (isHashtag && !opened) {
			const hashtag = text.substr(hashtagIndex + 1);
			if (!hashtag.includes(' ')) {
				this.open('hashtag', hashtag);
				opened = true;
			}
		}

		if (isEmoji && !opened) {
			const emoji = text.substr(emojiIndex + 1);
			if (!emoji.includes(' ')) {
				this.open('emoji', emoji);
				opened = true;
			}
		}

		if (isFn && !opened) {
			const fn = text.substr(fnIndex + 1);
			if (!fn.includes(' ')) {
				this.open('fn', fn.replace('[', ''));
				opened = true;
			}
		}

		if (isTemplate && !opened) {
			const template = text.substr(templateIndex + 1);
			if (!template.includes(' ')) {
				this.open('template', template);
				opened = true;
			}
		}

		if (!opened) {
			this.close();
		}
	}

	/**
	 * サジェストを提示します。
	 */
	private async open(type: string, q: string) {
		if (type != this.currentType) {
			this.close();
		}
		if (this.opening) return;
		this.opening = true;
		this.currentType = type;

		//#region サジェストを表示すべき位置を計算
		const caretPosition = getCaretCoordinates(this.textarea, this.textarea.selectionStart);

		const rect = this.textarea.getBoundingClientRect();

		const x = rect.left + caretPosition.left - this.textarea.scrollLeft;
		const y = rect.top + caretPosition.top - this.textarea.scrollTop;
		//#endregion

		if (this.suggestion) {
			this.suggestion.x.value = x;
			this.suggestion.y.value = y;
			this.suggestion.q.value = q;

			this.opening = false;
		} else {
			const _x = ref(x);
			const _y = ref(y);
			const _q = ref(q);

			const { dispose } = await popup(import('@/components/autocomplete.vue'), {
				textarea: this.textarea,
				close: this.close,
				type: type,
				q: _q,
				x: _x,
				y: _y,
			}, {
				done: (res) => {
					this.complete(res);
				}
			});

			this.suggestion = {
				q: _q,
				x: _x,
				y: _y,
				close: () => dispose(),
			};

			this.opening = false;
		}
	}

	/**
	 * サジェストを閉じます。
	 */
	private close() {
		if (this.suggestion == null) return;

		this.suggestion.close();
		this.suggestion = null;

		this.textarea.focus();
	}

	/**
	 * オートコンプリートする
	 */
	private complete({ type, value }) {
		this.close();

		const caret = this.textarea.selectionStart;

		if (type == 'user') {
			const source = this.text;

			const before = source.substr(0, caret);
			const trimmedBefore = before.substring(0, before.lastIndexOf('@'));
			const after = source.substr(caret);

			const acct = value.host === null ? value.username : `${value.username}@${toASCII(value.host)}`;

			// 挿入
			this.text = `${trimmedBefore}@${acct} ${after}`;

			// キャレットを戻す
			this.vm.$nextTick(() => {
				this.textarea.focus();
				const pos = trimmedBefore.length + (acct.length + 2);
				this.textarea.setSelectionRange(pos, pos);
			});
		} else if (type == 'hashtag') {
			const source = this.text;

			const before = source.substr(0, caret);
			const trimmedBefore = before.substring(0, before.lastIndexOf('#'));
			const after = source.substr(caret);

			// 挿入
			this.text = `${trimmedBefore}#${value} ${after}`;

			// キャレットを戻す
			this.vm.$nextTick(() => {
				this.textarea.focus();
				const pos = trimmedBefore.length + (value.length + 2);
				this.textarea.setSelectionRange(pos, pos);
			});
		} else if (type == 'emoji') {
			const source = this.text;

			const before = source.substr(0, caret);
			const trimmedBefore = before.substring(0, before.lastIndexOf(':'));
			const after = source.substr(caret);

			// 挿入
			this.text = trimmedBefore + value + after;

			// キャレットを戻す
			this.vm.$nextTick(() => {
				this.textarea.focus();
				const pos = trimmedBefore.length + value.length;
				this.textarea.setSelectionRange(pos, pos);
			});
		} else if (type == 'fn') {
			const source = this.text;

			const before = source.substr(0, caret);
			const trimmedBefore = before.substring(0, before.lastIndexOf('$'));
			const after = source.substr(caret);

			// 挿入
			this.text = `${trimmedBefore}$[${value} ]${after}`;

			// キャレットを戻す
			nextTick(() => {
				this.textarea.focus();
				const pos = trimmedBefore.length + (2 + value.length + 1);
				this.textarea.setSelectionRange(pos, pos);
			});
		} else if (type == 'template') {
			const source = this.text;

			const before = source.substr(0, caret);
			const trimmedBefore = before.substring(0, before.lastIndexOf('.'));
			const after = source.substr(caret);

			// 挿入
			this.text = trimmedBefore + value + after;

			// キャレットを戻す
			this.vm.$nextTick(() => {
				this.textarea.focus();
				const pos = trimmedBefore.length + value.length;
				this.textarea.setSelectionRange(pos, pos);
			});
		}
	}
}
