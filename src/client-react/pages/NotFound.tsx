import React from 'react';
import { Link } from 'react-router-dom';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

import Shell from '../components/Shell';
import { isSignedIn } from '../scripts/api';
import { t } from '../scripts/i18n';

function NotFoundContent() { 
	return (
		<div className="_box _center _error-box">
			<img src="https://xn--931a.moe/assets/not-found.jpg" alt="error" />
			<p>{t('notFoundDescription')}</p>
			<Link to="/" className="primary">{t('returnHome')}</Link>
		</div>
	);
}

export default function NotFound() {
	return isSignedIn ? (
		<Shell title={t('notFound')} icon={faExclamationTriangle}>
			<NotFoundContent />
		</Shell>
	) : <NotFoundContent />
}
