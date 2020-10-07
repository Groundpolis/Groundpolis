import React, { useEffect, useRef, useState } from 'react';
import rndstr from 'rndstr';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { api } from '../utils/api';
import { t } from '../utils/i18n';
import Modal from './Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useGlobal } from 'reactn';
import PostForm from './PostForm';


export function PostFormDialog(props: { onClose?: () => void; }) {
	const onClose = props.onClose ?? (() => { });

	return (
		<Modal align="top" title="新規投稿" onClose={onClose}>
			<PostForm onSubmit={onClose} />
		</Modal>
	);
}
