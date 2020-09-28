import { faCog } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import Cookies from 'js-cookie';

import Shell from '../components/Shell';
import { t } from '../scripts/i18n';

export default function Settings() {
	return (
		<Shell title={t('settings')} icon={faCog}>
			<div className="_vstack">
				<button className="_button" onClick={optoutBeta}>
					{t('optoutBeta')}
				</button>
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
