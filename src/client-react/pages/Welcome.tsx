import React, { useEffect, useState } from 'react';
import { useGlobal } from 'reactn';
import { FontAwesomeIcon as Fa, FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faPencilAlt, faComments, faFireAlt } from '@fortawesome/free-solid-svg-icons';

import Icon from '../components/Icon';
import Note from '../components/Note';
import { api } from '../utils/api';
import { t } from '../utils/i18n';
import Spinner from '../components/Spinner';

import '../styles/style.scss';
import './Welcome.scss';
import { Timeline } from '../components/Timeline';

function stopBeta() {
	localStorage.removeItem('fe');
	location.href = '/';
}

export default function Welcome() {
	const [meta, setMeta] = useGlobal('meta');
	const [stats, setStats] = useState<Record<string, any> | null>(null);
	const [tl, setTl] = useState<any[] | null>(null);

	useEffect(() => {
		if (meta === null) return;
		(async () => {
			setStats(await api('stats'));
			setTl(await api(meta.disableFeatured ? 'notes/local-timeline' : 'notes/featured'));
		})();
	}, [meta]);

	return meta === null || stats === null ? <Spinner /> : (
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
							<button className="_button primary" onClick={() => alert('coming soon')}>{t('signup')}</button>
							<button className="_button" onClick={() => alert('coming soon')}>{t('login')}</button>
						</div>
					</nav>
				</article>
				<article>
					<header className="_bulk"><h2>
						<FontAwesomeIcon icon={meta.disableFeatured ? faComments : faFireAlt} style={{ marginRight: '16px' }}/>
						{t(meta.disableFeatured ? 'welcomeTimeline' : 'welcomeFeatured')}
					</h2></header>
					<section className="timeline">
						{tl ? <Timeline notes={tl} /> : <Spinner relative />}
					</section>
				</article>
			</div>
			<footer className="_bulk _label _center">
				<a href="https://github.com/Groundpolis/Groundpolis">Powered by Groundpolis</a>・
				<a href="javascript:void(0)" onClick={() => stopBeta()}>{t('optoutNewFE')}</a>
			</footer>
		</article>
	);
}
