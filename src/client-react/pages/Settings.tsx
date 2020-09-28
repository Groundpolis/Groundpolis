import { faCog } from '@fortawesome/free-solid-svg-icons';
import React, { useState } from 'react';
import Cookies from 'js-cookie';

import Shell from '../components/Shell';
import { t } from '../scripts/i18n';
import { applyTheme, builtinThemes } from '../scripts/theme';

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

	const darkThemes = builtinThemes.filter(t => t.base === 'dark');
	const lightThemes = builtinThemes.filter(t => t.base === 'light');

	return (
		<Shell title={t('settings')} icon={faCog}>
			<div className="_vstack">

				<div className="_box">
					<h1 className="_bulk">{t('general')}</h1>
					<div className="_vstack">
						<button className="_button static" onClick={optoutBeta}>{t('optoutBeta')}</button>
						<button className="_button static danger" onClick={logout}>{t('logout')}</button>
					</div>
				</div>

				<div className="_box">
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
				</div>

			</div>
		</Shell>
	);
}

function optoutBeta() { 
	if (confirm('Are you sure to opt out the beta client?')) {
		Cookies.remove('fe');
		location.href = '/';
	}
}

function logout() {
	if (confirm('Are you sure to log out?')) {
		localStorage.removeItem('i');
		location.href = '/';
	}
}
