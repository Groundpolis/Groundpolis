import React from 'react';
import MDSpinner from 'react-md-spinner';

export default function Spinner(props: { relative?: boolean }) {
	return (
		<div className={!props.relative ? '_fixed-center' : ''}>
			<MDSpinner singleColor="var(--accent)" />
		</div>
	);
}
