import React from "react";
import MDSpinner from "react-md-spinner";

export default (props: { relative?: boolean }) => (
	<div className={ props.relative ? '_fixed-center' : '' }>
		<MDSpinner singleColor='var(--accent)' />
	</div>
);
