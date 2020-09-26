import React from 'react';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

import './Shell.scss';
import FAB from './FAB';
import { api } from '../scripts/api';
import { t } from '../scripts/i18n';

const DefaultHeader = (props: { title: string, icon?: IconProp }) => (
	<span className='title'>
		{props.icon ? <FontAwesomeIcon icon={props.icon} /> : null}
		{ props.title}
	</span >
);

export default (props: { title?: string, icon?: IconProp, header?: React.ReactElement, children?: React.ReactElement, fabIcon?: IconProp, onFabClicked: () => void, }) => {
	return (
		<div className='_com shell'>
			<header className='header'>
				<div className='left'>
					<button className='_mobile-only _button command'>
						<FontAwesomeIcon icon={faBars} />
					</button>
				</div>
				<div className='center'>
					{props.header ?? <DefaultHeader title={props.title ?? ''} icon={props.icon} />}
				</div>
				<div className='right'>

				</div>
			</header>
			<div className='content _container'>
				{props.children}
			</div>
			<FAB icon={props.fabIcon} onClick={props.onFabClicked} />
		</div>
	);
};
