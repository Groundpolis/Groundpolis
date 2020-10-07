import React, { useCallback, useEffect, useState } from 'react';
import { faPencilAlt, faComments, faHome, faShareAlt, faGlobe } from '@fortawesome/free-solid-svg-icons';

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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export type TimelineSrc = 'home' | 'local' | 'hybrid' | 'global';
export default function Home() {
	const [tl, setTl] = useState(null as any[] | null);
	const [src, setSrc] = useState('home' as TimelineSrc);
	const [postFormVisible, setPostFormVisible] = useState(false);

	const prepend = useCallback((note: any) => {
		setTl(tl => tl === null ? [ note ] : [ note, ...tl ]);
	}, []);

	const endpoint =
		src === 'home' ? 'timeline' :
		src === 'local' ? 'local-timeline' :
				src === 'hybrid' ? 'hybrid-timeline' : 'global-timeline';

	const streamId =
		src === 'home' ? 'homeTimeline' :
			src === 'local' ? 'localTimeline' :
				src === 'hybrid' ? 'hybridTimeline' : 'globalTimeline';

	useEffect(() => {
		setTl(null);
		api('notes/' + endpoint).then(setTl);
		const stream = getStream();
		const conn = stream.useSharedConnection(streamId);
		conn.on('note', prepend);
		return () => {
			conn.off('note');
		};
	}, [src]);

	const [deviceSetting, _] = useDeviceSetting();

	const onBottom = async () => {
		const untilId = tl[tl.length - 1]?.id as string | undefined;
		if (!untilId) return;
		setTl([
			...tl,
			...(await api('notes/' + src.ep, {
				untilId, limit: 10,
			})),
		]);
	};

	return (
		<div className="_vstack">
			<ShellHeader.Source>
				{ /* <DefaultHeader title={t('timeline')} icon={faComments} /> */}
				<button className={ '_button static' +( src === 'home' ? ' primary' : '')} onClick={() => setSrc('home')}>
					<FontAwesomeIcon icon={faHome} />
					{src === 'home' ? t('_timelines.home') : undefined}
				</button>
				<button className={ '_button static' +( src === 'local' ? ' primary' : '')} onClick={() => setSrc('local')}>
					<FontAwesomeIcon icon={faComments} />
					{src === 'local' ? t('_timelines.local') : undefined}
				</button>
				<button className={ '_button static' +( src === 'hybrid' ? ' primary' : '')} onClick={() => setSrc('hybrid')}>
					<FontAwesomeIcon icon={faShareAlt} />
					{src === 'hybrid' ? t('_timelines.social') : undefined}
				</button>
				<button className={ '_button static' +( src === 'global' ? ' primary' : '')} onClick={() => setSrc('global')}>
					<FontAwesomeIcon icon={faGlobe} />
					{src === 'global' ? t('_timelines.global') : undefined}
				</button>
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
