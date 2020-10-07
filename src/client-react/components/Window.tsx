import React, { useState, useEffect, useLayoutEffect } from 'react';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import './Window.scss';
import { CSSTransition } from 'react-transition-group';

export type WindowProps = {
	title?: string;
	icon?: IconProp;
	children?: React.ReactElement;
	backButton?: IconProp;
	headerVisible?: boolean;
	onClose?: () => void;
};

export default function Window(props: React.HTMLAttributes<HTMLDivElement> & WindowProps) { 
	const [opening, setOpening] = useState(false);
	useLayoutEffect(() => setOpening(true), []);
	const headerVisible = props.headerVisible ?? true;

	return (
		<CSSTransition in={opening} timeout={400} classNames="window" onExited={props.onClose}>
			<div className="_box _com window">
				{headerVisible ? <>
					<div className="_bulk title">
						<h1>
							{props.icon ? <FontAwesomeIcon icon={props.icon} /> : null}
							{props.title}
						</h1>
					</div>
					<button className="_button command back" onClick={() => setOpening(false)}>
						<FontAwesomeIcon icon={props.backButton || (faTimes as any)} />
					</button>
				</> : null}
				<div className="content">
					{props.children}
				</div>
			</div>
		</CSSTransition>
	);
}
