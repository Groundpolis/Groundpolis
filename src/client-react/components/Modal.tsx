import React from 'react';
import ReactDOM from 'react-dom';
import { CSSTransition } from 'react-transition-group';

import './Modal.scss';
import Window, { WindowProps } from './Window';

type Alignment = 'top' | 'middle' | 'bottom';

export default function Modal(props: WindowProps & { align?: Alignment, onClose?: () => void, children: React.ReactElement }) { 
	return ReactDOM.createPortal(
		<div
			className="_com modal"
			style={{ alignItems: props.align === 'top' ? 'flex-start' : props.align === 'bottom' ? 'flex-end' : 'center' }}
		>
			<Window {...props}>
				{props.children}
			</Window>
		</div>
	, document.getElementById('app'));
}
