import React, { useCallback, useEffect, useState } from 'react';
import rndstr from 'rndstr';
import { faPencilAlt, faComments, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useBottomScrollListener } from 'react-bottom-scroll-listener';

import Note from '../components/Note';
import Spinner from '../components/Spinner';
import { api } from '../utils/api';
import { t } from '../utils/i18n';
import { getStream } from '../utils/stream';
import FAB from '../components/FAB';
import { ShellFAB, ShellHeader } from '../teleporters';
import { DefaultHeader } from '../components/DefaultHeader';
import Modal from '../components/Modal';
import Window from '../components/Window';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useGlobal } from 'reactn';

const fabClicked = () => {
	const placeholder = t('_postForm._placeholders.' + rndstr({ length: 1, chars: 'a-f' }));
	const text = window.prompt(placeholder);
	if (!text) return;

	api('notes/create', { text });
};

function Timeline(props: { notes: any[], onBottom?: () => void }) { 
	useBottomScrollListener(props.onBottom ?? (() => { }));

	return (
		<div className="_vstack">
			{props.notes.map(note => <div className="_box" key={note.id}><Note note={note} /></div>)}
		</div>
	);
}

export default function Home() {
	const [tl, setTl] = useState(null as any[] | null);
	const [meta, _] = useGlobal('meta');
	const [postFormVisible, setPostFormVisible] = useState(false);

	const [text, setText] = useState('');
	const [cw, setCw] = useState('');
	const [useCw, setUseCw] = useState(false);

	const prepend = useCallback((note: any) => {
		setTl(tl => tl === null ? [ note ] : [ note, ...tl ]);
	}, []);

	const remaining = (meta && typeof meta.maxNoteTextLength === 'number' ? meta.maxNoteTextLength : 1000) - text.length;

	const canNote = remaining >= 0 && text.length > 0;

	useEffect(() => {
		api('notes/timeline').then(setTl);
		const stream = getStream();
		const conn = stream.useSharedConnection('homeTimeline');
		conn.on('note', prepend);
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
		setPostFormVisible(false);
	};

	const onBottom = async () => {
		const untilId = tl[tl.length - 1]?.id as string | undefined;
		if (!untilId) return;
		setTl([
			...tl,
			...(await api('notes/local-timeline', {
				untilId, limit: 10,
			})),
		]);
	};

	return (
		<>
			<ShellHeader.Source>
				<DefaultHeader title={t('timeline')} icon={faComments} />
			</ShellHeader.Source>

			{ tl ? <Timeline notes={tl} onBottom={onBottom} /> : <Spinner relative />}

			{ postFormVisible ?
				<Modal>
					<Window title="新規投稿" onClose={() => setPostFormVisible(!postFormVisible)}>
						<div className="_vstack">
							{useCw ? <input type="text"
								style={{ width: '100%', maxWidth: '100%', minWidth: '100%'}}
								placeholder={t('annotation')}
								value={cw}
								onChange={(e) => setCw(e.target.value)} /> : null}
							<textarea
								style={{ width: '100%', maxWidth: '100%', minWidth: '100%', height: '128px' }}
								placeholder={t('_postForm._placeholders.' + rndstr({ length: 1, chars: 'a-f' }))}
								value={text}
								onChange={(e) => setText(e.target.value)}
								onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submitNote() }}
							/>
							<div className="_hstack">
								<button className={'_button command' + (useCw ? ' primary' : '')} onClick={() => setUseCw(!useCw)}>
									<FontAwesomeIcon icon={faEyeSlash}/>
								</button>
								<span style={{ marginLeft: 'auto' }}>{ remaining }</span>
								<button className="_button primary" onClick={submitNote} disabled={!canNote}>{t('note')}</button>
							</div>
						</div>
					</Window>
				</Modal>
			: null }

			<ShellFAB.Source>
				<FAB icon={faPencilAlt} onClick={() => setPostFormVisible(true)} />
			</ShellFAB.Source>
		</>
	);
}
