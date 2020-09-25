import React from 'react';

import Icon from './components/solo/Icon';

import './styles/style.scss';

export const App = () => (
	<React.Fragment>
		<div className='welcome-header'>
			<Icon className='icon' />
			<h1 className='name'>Groundpolis</h1>
		</div>
		<div className='_box'>
			{'ようこそ！Groundpolisは、オープンソースの分散型マイクロブログサービスです。\n「ノート」を作成して、いま起こっていることを共有したり、あなたについて皆に発信しよう📡\n「リアクション」機能で、皆のノートに素早く反応を追加することもできます👍\n新しい世界を探検しよう🚀'}
		</div>
		<div className='_flat-box _hstack'>
			<button className='_button primary'>新規登録</button>
			<button className='_button'>ログイン</button>
		</div>
		<h2 className='_bulk'>タイムラインを見てみよう</h2>
		<div className='_box'>
			<div className='_vstack'>
				<div>dummy</div>
				<div>dummy</div>
				<div>dummy</div>
				<div>dummy</div>
				<div>dummy</div>
				<div>dummy</div>
			</div>
		</div>
		<footer className='_bulk _label _center'>
			<a href='https://github.com/Groundpolis/Groundpolis'>Powered by Groundpolis</a>
		</footer>
	</React.Fragment>
);
