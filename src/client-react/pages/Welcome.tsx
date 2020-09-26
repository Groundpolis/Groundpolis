import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'

import Icon from '../components/Icon';
import { Note } from '../components/Note';
import { api } from '../scripts/api';
import { t } from '../scripts/i18n';

import '../styles/style.scss';

import './Welcome.scss';

function stopBeta() {
	Cookies.remove('fe');
	location.href = '/';
}


export default () => {
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

	return meta === null ? <>Loading...</> : (
		<article className='_page welcome'>
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
							<Link to='/signup' className='_button primary'>{t('signup')}</Link>
							<Link to='/signin' className='_button'>{t('login')}</Link>
						</div>
					</nav>
				</article>
				<article>
					<header className='_bulk'><h2>{t('welcomeFeatured')}</h2></header>
					<section className='_box'>
						<div className='_vstack'>
							{tl ? tl.map(note => <Note note={note} />) : 'Loading...'}
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
