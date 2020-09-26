import React, { useEffect, useState } from 'react';
import rndstr from 'rndstr';
import { faPencilAlt, faComments } from '@fortawesome/free-solid-svg-icons';

import { PackedNote } from '../../models/repositories/note';
import { Note } from '../components/Note';
import Shell from '../components/Shell';
import Spinner from '../components/Spinner';
import { api } from '../scripts/api';
import { t } from '../scripts/i18n';

const fabClicked = () => {
	const placeholder = t('_postForm._placeholders.' + rndstr({ length: 1, chars: 'a-f' }));
	const text = window.prompt(placeholder);
	if (!text) return;

	api('notes/create', { text });
};

export default () => {
	const [tl, setTl] = useState(null as any[] | null);

	useEffect(() => {
		(async () => {
			setTl(await api('notes/local-timeline'));
		})();
	}, []);

	return (
		<Shell title={t('timeline')} icon={faComments} fabIcon={faPencilAlt} onFabClicked={fabClicked}>
			<div className="_vstack">
				{
					tl
						? tl.map(note => <div className="_box" key={note.id}><Note key={note.id} note={note} /></div>)
						: <Spinner relative />
				}
			</div>

		</Shell>
	);
};
