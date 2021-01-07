import { VNode, defineComponent, h } from 'vue';
import { MfmForest } from '@/../mfm/prelude';
import { parse, parsePlain } from '@/../mfm/parse';
import MkUrl from '@/components/global/url.vue';
import MkLink from '@/components/link.vue';
import MkMention from '@/components/mention.vue';
import MkEmoji from '@/components/global/emoji.vue';
import { concat } from '@/../prelude/array';
import MkFormula from '@/components/formula.vue';
import MkCode from '@/components/code.vue';
import MkGoogle from '@/components/google.vue';
import MkA from '@/components/global/a.vue';
import { host } from '@/config';
import { mfmFunctions, MfmFunctionStyleProp } from './mfm.functions';

export default defineComponent({
	props: {
		text: {
			type: String,
			required: true
		},
		plain: {
			type: Boolean,
			default: false
		},
		nowrap: {
			type: Boolean,
			default: false
		},
		author: {
			type: Object,
			default: null
		},
		i: {
			type: Object,
			default: null
		},
		customEmojis: {
			required: false,
		},
		isNote: {
			type: Boolean,
			default: true
		},
	},

	render() {
		if (this.text == null || this.text == '') return;

		const ast = (this.plain ? parsePlain : parse)(this.text);

		const validTime = (t: string | null | undefined) => {
			if (t == null) return null;
			return t.match(/^[0-9.]+s$/) ? t : null;
		};

		const genEl = (ast: MfmForest) => concat(ast.map((token): VNode[] => {
			switch (token.node.type) {
				case 'text': {
					const text = token.node.props.text.replace(/(\r\n|\n|\r)/g, '\n');

					if (!this.plain) {
						const x = text.split('\n')
							.map(t => t == '' ? [h('br')] : [h('span', t), h('br')]);
						x[x.length - 1].pop();
						return x;
					} else {
						return [h('span', text.replace(/\n/g, ' '))];
					}
				}

				case 'bold': {
					return [h('b', genEl(token.children))];
				}

				case 'strike': {
					return [h('del', genEl(token.children))];
				}

				case 'italic': {
					return [h('i', {
						style: 'font-style: oblique;'
					}, genEl(token.children))];
				}

				case 'fn': {
					const { name, args } = token.node.props as { name: string, args: MfmFunctionStyleProp };
					const fn = mfmFunctions[name];
					if (typeof fn === 'object' && fn.class) { 
						return [h('span', {
							class: fn.class,
						}, genEl(token.children))];
					}
					const noAnimatedMfm = !this.$store.state.animatedMfm;
					const noAnimatedStyle = !fn ? '' : typeof fn === 'string' ? '' : fn.noAnimatedMfmStyle ? (typeof fn.noAnimatedMfmStyle === 'boolean' ? fn.style(args) : fn.noAnimatedMfmStyle(args)) : '';
					const style = noAnimatedMfm ? noAnimatedStyle : !fn ? '' : typeof fn === 'string' ? fn : fn.style(args);

					return [h('span', { style: 'display: inline-block;' + style, }, genEl(token.children))];
				}

				case 'small': {
					return [h('small', {
						style: 'opacity: 0.7;'
					}, genEl(token.children))];
				}

				case 'center': {
					return [h('div', {
						style: 'text-align:center;'
					}, genEl(token.children))];
				}

				case 'right': {
					return [h('div', {
						style: 'text-align:right;'
					}, genEl(token.children))];
				}

				case 'sup': {
					return [h('sup', genEl(token.children))];
				}

				case 'sub': {
					return [h('sub', genEl(token.children))];
				}

				case 'marquee': {
					if (!this.$store.state.animatedMfm) {
						return genEl(token.children) as any;
					}

					return [h('marquee', { class: 'marquee' }, genEl(token.children) as any)];
				}

				case 'url': {
					return [h(MkUrl, {
						key: Math.random(),
						url: token.node.props.url,
						rel: 'nofollow noopener',
					})];
				}

				case 'link': {
					return [h(MkLink, {
						key: Math.random(),
						url: token.node.props.url,
						rel: 'nofollow noopener',
					}, genEl(token.children))];
				}

				case 'mention': {
					return [h(MkMention, {
						key: Math.random(),
						host: (token.node.props.host == null && this.author && this.author.host != null ? this.author.host : token.node.props.host) || host,
						username: token.node.props.username
					})];
				}

				case 'hashtag': {
					return [h(MkA, {
						key: Math.random(),
						to: `/search?q=%23${encodeURIComponent(token.node.props.hashtag)}&f=${this.isNote ? 'notes' : 'users'}`,
						style: 'color:var(--hashtag);'
					}, `#${token.node.props.hashtag}`)];
				}

				case 'blockCode': {
					return [h(MkCode, {
						key: Math.random(),
						code: token.node.props.code,
						lang: token.node.props.lang,
					})];
				}

				case 'inlineCode': {
					return [h(MkCode, {
						key: Math.random(),
						code: token.node.props.code,
						lang: token.node.props.lang,
						inline: true
					})];
				}

				case 'quote': {
					if (!this.nowrap) {
						return [h('div', {
							class: 'quote'
						}, genEl(token.children))];
					} else {
						return [h('span', {
							class: 'quote'
						}, genEl(token.children))];
					}
				}

				case 'emoji': {
					return [h(MkEmoji, {
						key: Math.random(),
						emoji: token.node.props.name ? `:${token.node.props.name}:` : token.node.props.emoji,
						customEmojis: this.customEmojis,
						normal: this.plain
					})];
				}

				case 'mathInline': {
					return [h(MkFormula, {
						key: Math.random(),
						formula: token.node.props.formula,
						block: false
					})];
				}

				case 'mathBlock': {
					return [h(MkFormula, {
						key: Math.random(),
						formula: token.node.props.formula,
						block: true
					})];
				}

				case 'search': {
					return [h(MkGoogle, {
						key: Math.random(),
						q: token.node.props.query
					})];
				}

				default: {
					console.error('unrecognized ast type:', token.node.type);

					return [];
				}
			}
		}));

		// Parse ast to DOM
		return h('span', genEl(ast));
	}
});
