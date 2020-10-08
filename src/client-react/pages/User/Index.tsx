import React, { useEffect, useState } from 'react';
import { useRouteMatch } from 'react-router';

import { PackedUser } from '../../../models/repositories/user';
import { AvatarHeader } from '../../components/AvatarHeader';
import { DefaultHeader } from '../../components/DefaultHeader';
import Mfm from '../../components/Mfm';
import Spinner from '../../components/Spinner';
import { ShellHeader } from '../../teleporters';
import { api } from '../../utils/api';
import { t } from '../../utils/i18n';
import parseAcct from '../../../misc/acct/parse';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

export default function User() { 
	const [user, setUser] = useState(null as PackedUser | null);
	const [retry, setRetry] = useState(0);
	const [error, setError] = useState(null as string | null);
	const m = useRouteMatch<{acct: string}>();

	const acct = parseAcct(m.params.acct);

	useEffect(() => { 
		api('users/show', acct)
			.then(user => setUser(user as PackedUser))
			.catch(e => setError(e.message || e.code));
	}, [retry]);

	return user ? (
		<div className="_container">
			<ShellHeader.Source>
				<AvatarHeader user={user} />
			</ShellHeader.Source>
			<div className="_vstack">
				<h1><Mfm plain text={user.name || user.username}/></h1>
				<div className="_box">
					<Mfm text={user.description}/>
				</div>
			</div>
		</div>
	) : error ? (
			<div className="_container">
				<ShellHeader.Source>
					<DefaultHeader icon={faExclamationTriangle} title={t('error')} />
				</ShellHeader.Source>
				<div className="_box _center _error-box">
					<p>{error}</p>
					<button className="_button primary" onClick={() => setRetry(retry + 1)}>{t('retry')}</button>
				</div>
			</div>
	) : <Spinner/>;
}
