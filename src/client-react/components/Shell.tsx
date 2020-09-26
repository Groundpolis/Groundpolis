import React, { useState } from 'react';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faPencilAlt } from '@fortawesome/free-solid-svg-icons';

import './Shell.scss';
import FAB from './FAB';
import { api } from '../scripts/api';

const DefaultHeader = (props: { title: string, icon?: IconProp }) => (
	<>
		{props.icon ? <FontAwesomeIcon icon={props.icon} /> : null}
		<span className='title'>{props.title}</span>
	</>
);

export default (props: { title?: string, icon?: IconProp, header?: React.ReactElement, children?: React.ReactElement }) => {
	return (
		<div className='_com shell'>
			<header className='header'>
				<div className='left'>
					<button className='_mobile-only _button command'>
						<FontAwesomeIcon icon={faBars} />
					</button>
				</div>
				<div className='center'>
					{props.header ?? <DefaultHeader title={props.title ?? ''} />}
				</div>
				<div className='right'>

				</div>
			</header>
			<div className='content _container'>
				{props.children}
			</div>
			<FAB icon={faPencilAlt} onClick={() => api('notes/create', { text: 'ﾍﾞﾍﾞﾖ' })} />
		</div>
	);
};
