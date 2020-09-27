import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import { faUser, faPencilAlt } from '@fortawesome/free-solid-svg-icons';

import Icon from '../components/Icon';
import Note from '../components/Note';
import { api } from '../scripts/api';
import { t } from '../scripts/i18n';
import Spinner from '../components/Spinner';

import '../styles/style.scss';
import './Welcome.scss';

function stopBeta() {
	Cookies.remove('fe');
	location.href = '/';
}

export default function Welcome() {
	const [meta, setMeta] = useState<Record<string, any> | null>(null);
	const [stats, setStats] = useState<Record<string, any> | null>(null);
	const [tl, setTl] = useState<any[] | null>(null);

	useEffect(() => {
		(async () => {
			setStats(await api('stats'));
			setMeta(await api('meta'));
			setTl(await api('notes/featured'));
		})();
	}, []);

	return meta === null || stats === null ? <Spinner relative /> : (
		<article className="_page welcome _container">
			<div className="_split-view">
				<article>
					<header className="_bulk title">
						<Icon className="icon" />
						<h1 className="name">{meta?.name || 'Groundpolis'}</h1>
					</header>
					<section className="_box _fill">
						{meta?.bannerUrl ? <figure className="banner" style={{ backgroundImage: `url("${meta.bannerUrl}")` }} /> : null}
						<aside className="_flat-box">
							<Fa icon={faUser} /> {stats.originalUsersCount}
							・
							<Fa icon={faPencilAlt} /> {stats.originalNotesCount}
						</aside>
						<aside className="_flat-box">
							<b>{t('administrator')}: </b>
							{meta.maintainerEmail
								? <a href={'mailto:' + meta.maintainerEmail}>{meta.maintainerName ?? 'null'}</a>
								: meta.maintainerName ?? 'null'
							}
						</aside>
						<article className="_flat-box">
							{meta?.description || t('introMisskey')}
						</article>
					</section>
					<nav className="_flat-box">
						<p>{t('getStarted')}</p>
						<div className="_hstack">
							<Link to="/signup" className="_button primary">{t('signup')}</Link>
							<Link to="/signin" className="_button">{t('login')}</Link>
						</div>
					</nav>
				</article>
				<article>
					<header className="_bulk"><h2>{t('welcomeFeatured')}</h2></header>
					<section className="_box">
						<div className="_vstack">
							{tl ? tl.map(note => <Note key={note.id} note={note} />) : <Spinner relative />}
						</div>
					</section>
				</article>
			</div>
			<footer className="_bulk _label _center">
				<a href="https://github.com/Groundpolis/Groundpolis">Powered by Groundpolis</a>・
				<a href="javascript:void(0)" onClick={() => stopBeta()}>βテストをやめる</a>
			</footer>
		</article>
	);
}
