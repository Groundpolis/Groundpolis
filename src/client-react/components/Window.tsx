import React from 'react';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import './Window.scss';

export type WindowProps = {
	title?: string;
	icon?: IconProp;
	children?: React.ReactElement;
	backButton?: IconProp;
	headerVisible?: boolean;
	onClose?: () => void;
};

export default function Window(props: React.HTMLAttributes<HTMLDivElement> & WindowProps) { 
	const headerVisible = props.headerVisible ?? true;

	return (
			<div className="_box _com window">
				{headerVisible ? <>
					<div className="_bulk title">
						<h1>
							{props.icon ? <FontAwesomeIcon icon={props.icon} /> : null}
							{props.title}
						</h1>
					</div>
					<button className="_button command back" onClick={props.onClose}>
						<FontAwesomeIcon icon={props.backButton || (faTimes as any)} />
					</button>
				</> : null}
				<div className="content">
					{props.children}
				</div>
			</div>
	);
}
