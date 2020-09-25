import React from 'react';

import Icon from '../components/solo/Icon';

import '../styles/style.scss';

export const Welcome = () => (
	<article className='welcome-shell'>
		<div className='_split-view'>
			<article>
				<header className='_bulk title'>
					<Icon className='icon' />
					<h1 className='name'>Groundpolis</h1>
				</header>
				<section className='_box'>
					{'ようこそ！Groundpolisは、オープンソースの分散型マイクロブログサービスです。\n「ノート」を作成して、いま起こっていることを共有したり、あなたについて皆に発信しよう📡\n「リアクション」機能で、皆のノートに素早く反応を追加することもできます👍\n新しい世界を探検しよう🚀'}
				</section>
				<nav className='_flat-box _vstack'>
					<button className='_button primary'>新規登録</button>
					<button className='_button'>ログイン</button>
				</nav>
			</article>
			<article>
				<header className='_bulk'><h2>人気のノートを見てみよう</h2></header>
				<section className='_box'>
					<div className='_vstack'>
						<div>dummy</div>
						<div>dummy</div>
						<div>dummy</div>
						<div>dummy</div>
						<div>dummy</div>
						<div>dummy</div>
					</div>
				</section>
			</article>
		</div>
		<footer className='_bulk _label _center'>
			<a href='https://github.com/Groundpolis/Groundpolis'>Powered by Groundpolis</a>
		</footer>
	</article>
);
