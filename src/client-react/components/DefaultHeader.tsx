import React from 'react';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import './Header.scss';

export function DefaultHeader(props: { title: string; icon?: IconProp; }) {
	return (
		<span className="_com header">
			{props.icon ? <FontAwesomeIcon icon={props.icon} /> : null}
			{props.title}
		</span>
	);
}
