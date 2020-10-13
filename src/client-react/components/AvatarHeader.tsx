import React from 'react';

import { PackedUser } from '../../models/repositories/user';

import './Header.scss';

export function AvatarHeader(props: { title?: string; user: PackedUser; }) {
	return (
		<span className="_com header">
			<img src={props.user.avatarUrl} alt={props.user.id} className="avatar"/>
			{props.title ?? props.user.name ?? props.user.username}
		</span>
	);
}
