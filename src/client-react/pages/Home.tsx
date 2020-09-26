import React, { useEffect, useState } from 'react';

import { PackedNote } from '../../models/repositories/note';
import { Note } from '../components/Note';
import Shell from '../components/Shell';
import Spinner from '../components/Spinner';
import { api } from '../scripts/api';
import { t } from '../scripts/i18n';

export default () => {
	const [tl, setTl] = useState(null as any[] | null);

	useEffect(() => {
		(async () => {
			setTl(await api('notes/local-timeline'));
		})();
	}, []);

	return (
		<Shell title={t('timeline')}>
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
