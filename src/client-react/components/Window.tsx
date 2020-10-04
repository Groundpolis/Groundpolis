import React from 'react';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import './Window.scss';

export default function Window(props: { title: string, icon?: IconProp, children?: React.ReactElement, backButton?: IconProp, onClose?: () => void }) { 
	return (
		<div className="_box _com window">
			<div className="_bulk title">
				<h1>
					<FontAwesomeIcon icon={props.icon} />
					{props.title}
				</h1>
			</div>
			<button className="_button command back" onClick={props.onClose}>
				<FontAwesomeIcon icon={props.backButton || (faTimes as any)}/>
			</button>
			<div className="content">
				{props.children}
			</div>
		</div>
	);
}
