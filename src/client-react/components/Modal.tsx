import React from 'react';
import ReactDOM from 'react-dom';

import './Modal.scss';

export default function Modal(props: { children: React.ReactElement }) { 
	return ReactDOM.createPortal(
		<div className="_com modal">
			{props.children}
		</div>
	, document.getElementById('app'));
}
