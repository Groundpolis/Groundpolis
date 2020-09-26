import React from 'react';
import { t } from '../scripts/i18n';

import '../styles/style.scss';

export class ErrorBoundary extends React.Component<{}, {hasError: boolean}, any> {
	constructor(props: any) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(err: unknown) {
		return { hasError: true };
	}

	render() {
		if(this.state.hasError) {
			return (
				<div className='_box _center _error-box'>
					<img src='https://xn--931a.moe/assets/error.jpg' alt='error' />
					<p>{ t('error') }</p>
					<a className='primary' href='/'>{ t('backToTop') }</a>
				</div>
			);
		}

		return this.props.children;
	}
}
