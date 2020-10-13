import React, { useLayoutEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { CSSTransition } from 'react-transition-group';
import { useDeviceSetting } from '../settings/device';

import './Modal.scss';
import Window, { WindowProps } from './Window';

type Alignment = 'top' | 'middle' | 'bottom';

export default function Modal(props: WindowProps & { align?: Alignment, onClose?: () => void, children: React.ReactElement }) { 
	const [opening, setOpening] = useState(false);
	useLayoutEffect(() => setOpening(true), []);
	const [deviceSetting, _] = useDeviceSetting();

	console.log(deviceSetting.animation);

	return ReactDOM.createPortal(
		<div
			className="_com modal"
			style={{ alignItems: props.align === 'top' ? 'flex-start' : props.align === 'bottom' ? 'flex-end' : 'center' }}
		>
			<CSSTransition in={opening} timeout={deviceSetting.animation ? 200 : 0} classNames={deviceSetting.animation ? 'backdrop' : undefined}>
				<div className="backdrop" onClick={() => setOpening(false)} />
			</CSSTransition>
				
			<CSSTransition in={opening} timeout={deviceSetting.animation ? 200 : 0} classNames={deviceSetting.animation ? 'window' : undefined} onExited={props.onClose}>
				<Window {...props} onClose={() => setOpening(false)}>
					{props.children}
				</Window>
			</CSSTransition>
		</div>
	, document.getElementById('app'));
}
