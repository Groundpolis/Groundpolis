import React from "react";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import './FAB.scss';

export default (props: { icon: IconProp } & React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>) => {
	return (
		<button className='_com fab' {...props}>
			<FontAwesomeIcon icon={props.icon} />
		</button>
	);
};
