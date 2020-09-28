import { faCog } from '@fortawesome/free-solid-svg-icons';
import React, { useState } from 'react';
import Cookies from 'js-cookie';

import Shell from '../components/Shell';
import { t } from '../scripts/i18n';
import { applyTheme, builtinThemes } from '../scripts/theme';
import { clientDb, set } from '../db';
import { langs } from '../config';

export default function Settings() {
	const [themeId, setThemeId] = useState(localStorage['themeId']);
	const themeChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setThemeId(e.target.value);
		localStorage['themeId'] = e.target.value; 
		const theme = builtinThemes.find(t => t.id === e.target.value);
		if (theme) { 
			applyTheme(theme);
		}
	};

	const [lang, setLang] = useState(localStorage['lang']);
	const langChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setLang(e.target.value);
		localStorage.setItem('lang', e.target.value);

		return set('_version_', `changeLang-${(new Date()).toJSON()}`, clientDb.i18n)
			.then(() => location.reload());
	};

	const darkThemes = builtinThemes.filter(t => t.base === 'dark');
	const lightThemes = builtinThemes.filter(t => t.base === 'light');

	return (
		<Shell title={t('settings')} icon={faCog}>
			<article className="_vstack">

				<article className="_box">
					<h1 className="_bulk">{t('uiLanguage')}</h1>
					<div className="_vstack">
						<select value={lang} onChange={langChanged}>
							{
								langs.map(lang => (
									<option key={lang[0]} value={lang[0]}>{lang[1]}</option>
								))
							}
						</select>
					</div>
				</article>

				<article className="_box">
					<h1 className="_bulk">{t('theme')}</h1>
					<div className="_vstack">
						<select value={themeId} onChange={themeChanged}>
							<optgroup label={t('lightThemes')}>
								{
									lightThemes.map(t => (
										<option key={t.id} value={t.id}>{t.name}</option>
									))
								}
							</optgroup>
							<optgroup label={t('darkThemes')}>
								{
									darkThemes.map(t => (
										<option key={t.id} value={t.id}>{t.name}</option>
									))
								}
							</optgroup>
						</select>
					</div>
				</article>

				<article className="_box _vstack">
					<button className="_button static" onClick={optoutBeta}>{t('optoutNewFE')}</button>
				</article>
			</article>
		</Shell>
	);
}

function optoutBeta() { 
	if (confirm('Are you sure to opt out the beta client?')) {
		Cookies.remove('fe');
		location.href = '/';
	}
}
