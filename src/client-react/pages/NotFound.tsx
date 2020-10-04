import React from 'react';
import { Link } from 'react-router-dom';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

import { t } from '../utils/i18n';
import { ShellHeader } from '../teleporters';
import { DefaultHeader } from '../components/DefaultHeader';

export default function NotFound() {
	return (
		<>
			<ShellHeader.Source>
				<DefaultHeader title={t('notFound')} icon={faExclamationTriangle} />
			</ShellHeader.Source>

			<div className="_box _center _error-box">
				<img src="https://xn--931a.moe/assets/not-found.jpg" alt="error" />
				<p>{t('notFoundDescription')}</p>
				<Link to="/" className="primary">{t('returnHome')}</Link>
			</div>
		</>
	);
}
