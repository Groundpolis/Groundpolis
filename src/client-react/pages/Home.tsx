import React, { useEffect, useState } from 'react';
import rndstr from 'rndstr';
import { faPencilAlt, faComments } from '@fortawesome/free-solid-svg-icons';
import { useBottomScrollListener } from 'react-bottom-scroll-listener';

import Note from '../components/Note';
import Shell from '../components/Shell';
import Spinner from '../components/Spinner';
import { api } from '../scripts/api';
import { t } from '../scripts/i18n';
import { PackedNote } from '../../models/repositories/note';

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

	useEffect(() => {
		(async () => {
			setTl(await api('notes/local-timeline'));
		})();
	}, []);

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
		<Shell title={t('timeline')} icon={faComments} fabIcon={faPencilAlt} onFabClicked={fabClicked}>
			{ tl ? <Timeline notes={tl} onBottom={onBottom} /> : <Spinner relative /> }
		</Shell>
	);
}
