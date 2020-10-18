import React, { useEffect, useState } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { faPencilAlt, faComments, faHome, faShareAlt, faGlobe, faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';

import Spinner from '../components/Spinner';
import { api } from '../utils/api';
import { t } from '../utils/i18n';
import { getStream } from '../utils/stream';
import FAB from '../components/FAB';
import { ShellFAB, ShellHeader } from '../teleporters';
import { PostFormDialog } from '../components/PostFormDialog';
import { Timeline } from '../components/Timeline';
import PostForm from '../components/PostForm';
import { useDeviceSetting } from '../settings/device';
import { PackedNote } from '../../models/repositories/note';
import { AvatarHeader } from '../components/AvatarHeader';
import { PackedUser } from '../../models/repositories/user';
import Note from '../components/Note';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Home() {
	const [note, setNote] = useState(null as PackedNote | null);
	const [prevNotes, setPrevNotes] = useState(null as PackedNote[] | null);
	const [nextNotes, setNextNotes] = useState(null as PackedNote[] | null);
	const [hasPrev, setHasPrev] = useState(false);
	const [hasNext, setHasNext] = useState(false);

	const m = useRouteMatch<{ noteId: string }>();


	useEffect(() => {
		api('notes/show', { noteId: m.params.noteId }).then((n) => { 
			setNote(n);

			Promise.all([
				api('users/notes', {
					userId: n.userId,
					untilId: n.id,
					limit: 1,
				}),
				api('users/notes', {
					userId: n.userId,
					sinceId: n.id,
					limit: 1,
				}),
			]).then(([prev, next]) => {
				setHasPrev(prev.length !== 0);
				setHasNext(next.length !== 0);
			});
		});
	}, []);

	const user = note?.user as PackedUser | null;

	const fetchNext = () => { 
		setHasNext(false);
		api('users/notes', {
			userId: note.userId,
			sinceId: note.id,
			limit: 15,
		}).then(setNextNotes);
	};

	const fetchPrev = () => {
		setHasPrev(false);
		api('users/notes', {
			userId: note.userId,
			untilId: note.id,
			limit: 15,
		}).then(setPrevNotes);
	};


	return (
		<div className="_vstack">
			<ShellHeader.Source>
				{user ? <AvatarHeader user={user} title={t('noteOf', { user: user.name || user.username })} /> : null}
			</ShellHeader.Source>

			{ nextNotes ? <div style={{ paddingBottom: 'var(--margin)' }}><Timeline notes={nextNotes} /></div> : null}

			{ hasNext ?
				<button className="_button" onClick={fetchNext}>
					<FontAwesomeIcon icon={faChevronUp} />
				</button>
				: null}
			
			{ note ? <div className="_box"><Note note={note} /></div> : <Spinner /> }

			{ hasPrev ?
				<button className="_button" onClick={fetchPrev}>
					<FontAwesomeIcon icon={faChevronDown} />
				</button>
			: null}

			{ prevNotes ? <div style={{ paddingTop: 'var(--margin)' }}><Timeline notes={prevNotes} /></div> : null}
		</div>
	);
}
