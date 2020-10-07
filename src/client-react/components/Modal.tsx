import React, { useLayoutEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { CSSTransition } from 'react-transition-group';

import './Modal.scss';
import Window, { WindowProps } from './Window';

type Alignment = 'top' | 'middle' | 'bottom';

export default function Modal(props: WindowProps & { align?: Alignment, onClose?: () => void, children: React.ReactElement }) { 
	const [opening, setOpening] = useState(false);
	useLayoutEffect(() => setOpening(true), []);

	return ReactDOM.createPortal(
		<div
			className="_com modal"
			style={{ alignItems: props.align === 'top' ? 'flex-start' : props.align === 'bottom' ? 'flex-end' : 'center' }}
		>
			<CSSTransition in={opening} timeout={200} classNames="backdrop">
				<div className="backdrop" onClick={() => setOpening(false)} />
			</CSSTransition>
				
			<CSSTransition in={opening} timeout={200} classNames="window" onExited={props.onClose}>
				<Window {...props} onClose={() => setOpening(false)}>
					{props.children}
				</Window>
			</CSSTransition>
		</div>
	, document.getElementById('app'));
}
