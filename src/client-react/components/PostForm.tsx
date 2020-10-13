import { faEyeSlash, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { HTMLProps, useEffect, useRef, useState } from 'react';
import { useGlobal } from 'reactn';
import rndstr from 'rndstr';
import { PackedNote } from '../../models/repositories/note';
import { api } from '../utils/api';
import { t } from '../utils/i18n';
import Spinner from './Spinner';

export type PostFormProps = {
	initialNote?: PackedNote,
	renote?: PackedNote,
	reply?: PackedNote,
	posting?: boolean,
	onSubmit?: () => void,
} & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

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
		if (!canNote) return;
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
		<div className="_vstack" {...props}>
			{useCw ? <input type="text"
				style={{ width: '100%', maxWidth: '100%', minWidth: '100%' }}
				placeholder={t('annotation')}
				disabled={props.posting}
				value={cw}
				onChange={(e) => setCw(e.target.value)} /> : null}
			<textarea
				ref={textarea}
				disabled={props.posting}
				style={{ width: '100%', maxWidth: '100%', minWidth: '100%', height: '128px' }}
				placeholder={t('_postForm._placeholders.' + rndstr({ length: 1, chars: 'a-f' }))}
				value={text}
				onChange={(e) => setText(e.target.value)}
				onKeyDown={(e) => {
					if (canNote && e.key === 'Enter' && (e.ctrlKey || e.metaKey))
						submitNote();
				}} />
			<div className="_hstack">
				<button className={'_button command' + (useCw ? ' active' : '')} onClick={() => setUseCw(!useCw)}>
					<FontAwesomeIcon icon={faEyeSlash} />
				</button>
				<span style={{ marginLeft: 'auto' }}>{remaining}</span>
				<button className="_button command primary" onClick={submitNote} disabled={!canNote || props.posting}>
					<FontAwesomeIcon icon={faPaperPlane} />
				</button>
			</div>
		</div>
	);
}
