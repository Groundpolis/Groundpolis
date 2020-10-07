import React, { useCallback, useEffect, useState } from 'react';
import { faPencilAlt, faComments } from '@fortawesome/free-solid-svg-icons';

import Spinner from '../components/Spinner';
import { api } from '../utils/api';
import { t } from '../utils/i18n';
import { getStream } from '../utils/stream';
import FAB from '../components/FAB';
import { ShellFAB, ShellHeader } from '../teleporters';
import { DefaultHeader } from '../components/DefaultHeader';
import { PostFormDialog } from '../components/PostFormDialog';
import { Timeline } from '../components/Timeline';
import PostForm from '../components/PostForm';
import { useDeviceSetting } from '../settings/device';

export default function Home() {
	const [tl, setTl] = useState(null as any[] | null);
	const [postFormVisible, setPostFormVisible] = useState(false);

	const prepend = useCallback((note: any) => {
		setTl(tl => tl === null ? [ note ] : [ note, ...tl ]);
	}, []);

	useEffect(() => {
		api('notes/timeline').then(setTl);
		const stream = getStream();
		const conn = stream.useSharedConnection('homeTimeline');
		conn.on('note', prepend);
	}, []);

	const [deviceSetting, _] = useDeviceSetting();

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
		<div className="_vstack">
			<ShellHeader.Source>
				<DefaultHeader title={t('timeline')} icon={faComments} />
			</ShellHeader.Source>

			{
				deviceSetting.showFixedPostForm ?
					<div className="_box">
						<PostForm />
					</div>
				: null
			}

			{ tl ? <Timeline notes={tl} onBottom={onBottom} /> : <Spinner relative />}

			{ postFormVisible ?
				<PostFormDialog onClose={() => setPostFormVisible(!postFormVisible)}/>
			: null }

			<ShellFAB.Source>
				<FAB icon={faPencilAlt} onClick={() => setPostFormVisible(true)} />
			</ShellFAB.Source>
		</div>
	);
}
