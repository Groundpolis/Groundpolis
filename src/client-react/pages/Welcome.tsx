import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';

import Icon from '../components/solo/Icon';
import { api } from '../scripts/api';
import { t } from '../scripts/i18n';

import '../styles/style.scss';

function stopBeta() {
	Cookies.remove('fe');
	location.href = '/';
}


export const Welcome = () => {
	const [ meta, setMeta ] = useState<Record<string, any> | null>(null);
	const [ tl, setTl ] = useState<any[] | null>(null);

	useEffect(() => {
		(async () => {
			setMeta(await api('meta'));
		})();
		(async () => {
			setTl(await api('notes/featured'));
		})();
	}, []);

	return (
		<article className='welcome-shell'>
			<div className='_split-view'>
				<article>
					<header className='_bulk title'>
						<Icon className='icon' />
						<h1 className='name'>{ meta?.name || 'Groundpolis' }</h1>
					</header>
					<section className='_box _fill'>
						{ meta?.bannerUrl ? <figure className='banner' style={{backgroundImage: `url("${meta.bannerUrl}")`}}/> : null }
						<article className='_flat-box'>
							{ meta?.description || t('introMisskey')}
						</article>
					</section>
					<nav className='_flat-box'>
						<p>アカウントを作成して、今すぐはじめよう。</p>
						<div className="_hstack">
							<button className='_button primary'>{t('signup')}</button>
							<button className='_button'>{t('login')}</button>
						</div>
					</nav>
				</article>
				<article>
					<header className='_bulk'><h2>{t('welcomeFeatured')}</h2></header>
					<section className='_box'>
						<div className='_vstack'>
							{tl ? tl.map(note => <p>{note.user.name || note.user.username}: {note.text}</p>) : 'Loading...'}
						</div>
					</section>
				</article>
			</div>
			<footer className='_bulk _label _center'>
				<a href='https://github.com/Groundpolis/Groundpolis'>Powered by Groundpolis</a>・
				<a href='javascript:void(0)' onClick={() => stopBeta()}>βテストをやめる</a>
			</footer>
		</article>
	);
};
