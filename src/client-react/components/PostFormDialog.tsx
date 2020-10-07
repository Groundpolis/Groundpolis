import React, { useEffect, useRef, useState } from 'react';
import rndstr from 'rndstr';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { api } from '../utils/api';
import { t } from '../utils/i18n';
import Modal from './Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useGlobal } from 'reactn';


export function PostFormDialog(props: { onClose?: () => void; }) {
	const [text, setText] = useState('');
	const [cw, setCw] = useState('');
	const [useCw, setUseCw] = useState(false);

	const [meta, _] = useGlobal('meta');

	const onClose = props.onClose ?? (() => { });

	const remaining = (meta && typeof meta.maxNoteTextLength === 'number' ? meta.maxNoteTextLength : 1000) - text.length;
	const canNote = remaining >= 0 && text.length > 0;

	const textarea = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		textarea.current.focus();
	}, []);

	const submitNote = async () => {
		try {
			await api('notes/create', { text, cw: useCw ? cw : undefined });
			setText('');
			setCw('');
			setUseCw(false);
		} catch (e) {
			alert(e);
		}
		onClose();
	};

	return (
		<Modal align="top" title="新規投稿" onClose={onClose}>
			<div className="_vstack">
				{useCw ? <input type="text"
					style={{ width: '100%', maxWidth: '100%', minWidth: '100%' }}
					placeholder={t('annotation')}
					value={cw}
					onChange={(e) => setCw(e.target.value)} /> : null}
				<textarea
					ref={textarea}
					style={{ width: '100%', maxWidth: '100%', minWidth: '100%', height: '128px' }}
					placeholder={t('_postForm._placeholders.' + rndstr({ length: 1, chars: 'a-f' }))}
					value={text}
					onChange={(e) => setText(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter' && (e.ctrlKey || e.metaKey))
							submitNote();
					}} />
				<div className="_hstack">
					<button className={'_button command' + (useCw ? ' primary' : '')} onClick={() => setUseCw(!useCw)}>
						<FontAwesomeIcon icon={faEyeSlash} />
					</button>
					<span style={{ marginLeft: 'auto' }}>{remaining}</span>
					<button className="_button primary" onClick={submitNote} disabled={!canNote}>{t('note')}</button>
				</div>
			</div>
		</Modal>
	);
}
