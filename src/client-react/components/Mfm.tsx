import React, { CSSProperties, ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { parse, parsePlain } from '../../mfm/parse';
import { MfmForest, MfmTree } from '../../mfm/prelude';
import DeviceSettingManager from '../settings/device';
import { t } from '../utils/i18n';



export default function Mfm(props: { text: string, plain?: boolean, isNote?: boolean }) {
	const isNote = props.isNote ?? true;
	const useAnimation = DeviceSettingManager.get('animatedMfm');

	const generate = (ast: MfmForest): ReactElement[] => ast.map((token) => {
		switch (token.node.type) {
			case 'text': {
				const text = (token.node.props.text as string).replace(/(\r\n|\n|\r)/g, '\n');

				if (!props.plain) {
					const x = text.split('\n')
						// eslint-disable-next-line react/jsx-key
						.map(t => t == '' ? [<br />] : [<span>{t}</span>, <br/>]);
					x[x.length - 1].pop();
					return <span>{x}</span>;
				} else {
					return <span>{text.replace(/\n/g, ' ')}</span>
				}
			}

			case 'bold': {
				return <b>{generate(token.children)}</b>;
			}

			case 'strike': {
				return <del>{generate(token.children)}</del>;
			}

			case 'italic': {
				return <i style={{ fontStyle: 'oblique' }}>{generate(token.children)}</i>;
			}

			case 'big': {
				// TODO: animate css を組み入れる
				// directives: [this.$store.state.device.animatedMfm ? {
				// 	name: 'animate-css',
				// 	value: { classes: 'tada', iteration: 'infinite' }
				// } : {}]
				const style = {
					display: 'inline-block',
					fontSize: '150%',
				};
				return <strong style={style}>{generate(token.children)}</strong>;
			}

			case 'bigger': {
				// TODO: animate css を組み入れる
				// directives: [this.$store.state.settings.disableAnimatedMfm ? {} : {
				// 	name: 'animate-css',
				// 	value: { classes: 'wobble', iteration: 'infinite' }
				// }]
				const style = {
					display: 'inline-block',
					fontSize: '200%',
				};
				return <strong style={style}>{generate(token.children)}</strong>;
			}

			case 'small': {
				return <small style={{ opacity: '0.7' }}>{generate(token.children)}</small>;
			}

			case 'center': {
				return <div style={{ textAlign: 'center' }}>{generate(token.children)}</div>;
			}

			case 'right': {
				return <div style={{ textAlign: 'right' }}>{generate(token.children)}</div>;
			}

			case 'motion': {

				// TODO: animate css を組み入れる
				// directives: [this.$store.state.device.animatedMfm ? {
				// 	name: 'animate-css',
				// 	value: { classes: 'rubberBand', iteration: 'infinite' }
				// } : {}]

				return <span style={{display: 'inline-block'}}>{generate(token.children)}</span>;
			}

			case 'spin':
			case 'xspin':
			case 'yspin': {
				const direction =
					token.node.props.attr == 'left' ? 'reverse' :
						token.node.props.attr == 'alternate' ? 'alternate' :
							'normal';
				const style: CSSProperties = { display: 'inline-block' };
				if (useAnimation) { 
					style.animation = token.node.type + ' 1.5s linear infinite';
					style.animationDirection = direction;
				}
				return <span style={style}>{generate(token.children)}</span>;
			}

			case 'jump': {
				const style: CSSProperties = { display: 'inline-block', };
				if (useAnimation) { 
					style.animation = 'jump 0.75s linear infinite';
				}

				return <span style={style}>{generate(token.children)}</span>;
			}

			case 'flip': {
				const style: CSSProperties = {
					display: 'inline-block',
					transform: 'scaleX(-1)',
				};
				return <span style={style}>{generate(token.children)}</span>;
			}

			case 'vflip': {
				const style: CSSProperties = {
					display: 'inline-block',
					transform: 'scaleY(-1)',
				};
				return <span style={style}>{generate(token.children)}</span>;
			}

			case 'sup': {
				return <sup>{generate(token.children)}</sup>
			}

			case 'sub': {
				return <sub>{generate(token.children)}</sub>

			}

			case 'marquee': {
				// TODO: 再実装する
				return <>{generate(token.children)}</>;
			}

			case 'blink': {
				const style: CSSProperties = { display: 'inline-block', };
				if (useAnimation) {
					style.animation = 'blink 0.75s linear infinite';
				}
				return <span style={style}>{generate(token.children)}</span>
			}

			case 'url': {
				// TODO: リッチ表示するコンポーネントを作る
				// return [createElement(MkUrl, {
				// 	key: Math.random(),
				// 	props: {
				// 		url: token.node.props.url,
				// 		rel: 'nofollow noopener',
				// 	},
				// })];

				return <a
					href={token.node.props.url as string}
					target="_blank"
					rel="nofollow noopener noreferrer"
				>{token.node.props.url}</a>
			}

			case 'link': {
				// TODO: リッチ表示するコンポーネントを作る
				// return [createElement(MkLink, {
				// 	key: Math.random(),
				// 	props: {
				// 		url: token.node.props.url,
				// 		rel: 'nofollow noopener',
				// 	},
				// }, generate(token.children))];
				return <a
					href={token.node.props.url as string}
					target="_blank"
					rel="nofollow noopener noreferrer"
				>{generate(token.children)}</a>
			}

			case 'mention': {
				// TODO: リッチ表示するコンポーネントを作る
				// return [createElement(MkMention, {
				// 	key: Math.random(),
				// 	props: {
				// 		host: (token.node.props.host == null && this.author && this.author.host != null ? this.author.host : token.node.props.host) || host,
				// 		username: token.node.props.username
				// 	}
				// })];
				const username = token.node.props.username as string;
				const host = token.node.props.host as string | null;
				const acct = host ? `@${username}@${encodeURIComponent(host)}` : '@' + username;
				return <Link to={'/' + acct}>{acct}</Link>
			}

			case 'hashtag': {
				return <Link
					to={`/search?q=%23${encodeURIComponent(token.node.props.hashtag)}&f=${isNote ? 'notes' : 'users'}`}
					style={{ color: 'var(--hashtag)' }}
				>#{token.node.props.hashtag}</Link>
			}

			case 'blockCode': {
				// TODO
				// return [createElement(MkCode, {
				// 	key: Math.random(),
				// 	props: {
				// 		code: token.node.props.code,
				// 		lang: token.node.props.lang,
				// 	}
				// })];
				return <pre><code>{token.node.props.code}</code></pre>
			}

			case 'inlineCode': {
				// return [createElement(MkCode, {
				// 	key: Math.random(),
				// 	props: {
				// 		code: token.node.props.code,
				// 		lang: token.node.props.lang,
				// 		inline: true
				// 	}
				// })];
				return <code>{token.node.props.code}</code>
			}

			case 'quote': {
				// if (this.shouldBreak) {
				// 	return [createElement('div', {
				// 		attrs: {
				// 			class: 'quote'
				// 		}
				// 	}, generate(token.children))];
				// } else {
				// 	return [createElement('span', {
				// 		attrs: {
				// 			class: 'quote'
				// 		}
				// 	}, generate(token.children))];
				// }
				return <blockquote className="quote">{generate(token.children)}</blockquote>
			}

			case 'title': {
				return <div className="title">{generate(token.children)}</div>
			}

			case 'emoji': {
				// return [createElement('mk-emoji', {
				// 	key: Math.random(),
				// 	attrs: {
				// 		emoji: token.node.props.emoji,
				// 		name: token.node.props.name
				// 	},
				// 	props: {
				// 		customEmojis: this.customEmojis,
				// 		normal: this.plain
				// 	}
				// })];
				return <span>{token.node.props.emoji || token.node.props.name}</span>
			}

			case 'mathInline': {
				// return [createElement(MkFormula, {
				// 	key: Math.random(),
				// 	props: {
				// 		formula: token.node.props.formula,
				// 		block: false
				// 	}
				// })];
				return <span>{token.node.props.formula}</span>
			}

			case 'mathBlock': {
				// return [createElement(MkFormula, {
				// 	key: Math.random(),
				// 	props: {
				// 		formula: token.node.props.formula,
				// 		block: true
				// 	}
				// })];
				return <div>{token.node.props.formula}</div>
			}

			case 'search': {
				// return [createElement(MkGoogle, {
				// 	key: Math.random(),
				// 	props: {
				// 		q: token.node.props.query
				// 	}
				// })];
				return (
					<div>
						<span>{token.node.props.query}</span>
						<a style={{ marginLeft: '8px', color: 'var(--accent)' }} target="_blank" rel="nofollow noreferrer noopener" href={'https://google.com/search?q=' + encodeURIComponent(token.node.props.query)}>{t('search')}</a>
					</div>
				);
			}

			default: {
				console.log('unknown ast type:', token.node.type);

				return <></>;
			}
		}
	});

	if (props.text === null) return null;

	const forest = props.plain ? parsePlain(props.text) : parse(props.text);

	return (
		<div className="_com mfm">
			{ generate(forest) }
		</div>
	);
	
}
