import React from 'react';
import { Link } from 'react-router-dom';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

import Shell from '../components/Shell';
import { t } from '../utils/i18n';

export default function NotFound() {
	return (
		<Shell title={t('notFound')} icon={faExclamationTriangle}>
			<div className="_box _center _error-box">
				<img src="https://xn--931a.moe/assets/not-found.jpg" alt="error" />
				<p>{t('notFoundDescription')}</p>
				<Link to="/" className="primary">{t('returnHome')}</Link>
			</div>
		</Shell>
	);
}
