import { faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useRef, useState } from 'react';
import { useGlobal } from 'reactn';
import rndstr from 'rndstr';
import { PackedNote } from '../../models/repositories/note';
import { api } from '../utils/api';
import { t } from '../utils/i18n';

export type PostFormProps = {
	initialNote?: PackedNote,
	renote?: PackedNote,
	reply?: PackedNote,
	onSubmit?: () => void,
};

export default function PostForm(props: PostFormProps) { 
	const [meta, _] = useGlobal('meta');
	const [text, setText] = useState('');
	const [cw, setCw] = useState('');
	const [useCw, setUseCw] = useState(false);

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
		(props.onSubmit ?? (() => { }))();
	};

	return (
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
	);
}
