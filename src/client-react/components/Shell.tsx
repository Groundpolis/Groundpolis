import React, { useEffect, useState } from 'react';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faBell, faBroadcastTower, faChevronCircleDown, faChevronCircleUp, faCloud, faCog, faComments, faHome, faSearch } from '@fortawesome/free-solid-svg-icons';

import './Shell.scss';
import FAB from './FAB';
import { api } from '../scripts/api';
import { t } from '../scripts/i18n';
import { Link, NavLink } from 'react-router-dom';
import getAcct from '../../misc/acct/render';
import { PackedUser } from '../../models/repositories/user';
import Spinner from './Spinner';

const DefaultHeader = (props: { title: string, icon?: IconProp }) => (
	<span className="title">
		{props.icon ? <FontAwesomeIcon icon={props.icon} /> : null}
		{ props.title}
	</span >
);

export default function Shell(props: {
	title?: string,
	icon?: IconProp,
	header?: React.ReactElement,
	children?: React.ReactElement,
	fabIcon?: IconProp,
	onFabClicked?: () => void,
}) {
	const [i, setI] = useState(null as PackedUser | null);
	const [toggle, setToggle] = useState(false);

	useEffect(() => {
		(async () => {
			setI(await api('i'));
		})();
	}, []);

	return !i ? <Spinner /> : (
		<div className="_com shell">
			<header className="header">
				<div className="left">
					<button className="_mobile-only _button command">
						<FontAwesomeIcon icon={faBars} />
					</button>
				</div>
				<div className="center">
					{props.header ?? <DefaultHeader title={props.title ?? ''} icon={props.icon} />}
				</div>
				<div className="right">
					<div className="_class"></div>
				</div>
			</header>
			<div className="sidebar">
				<NavLink to={'/@' + getAcct(i)} className="item" activeClassName="active">
					<img src={i.avatarUrl} className="avatar" />
					<span className="label">{i.name || i.username}</span>
				</NavLink>
				<div className="divider" />
				{toggle ? <>
					<button className="_button command item">
						<span className="label">{t('createAccount')}</span>
					</button>
					<button className="_button command item">
						<span className="label">{t('addAcount')}</span>
					</button>
				</> : <>
						<NavLink exact to="/" className="item" activeClassName="active">
							<FontAwesomeIcon icon={faHome} />
							<span className="label">{t('home')}</span>
						</NavLink>
						<NavLink to="/my/notifications" className="item disabled" activeClassName="active">
							<FontAwesomeIcon icon={faBell} />
							<span className="label">{t('notifications')}</span>
						</NavLink>
						<NavLink to="/explore" className="item disabled" activeClassName="active">
							<FontAwesomeIcon icon={faSearch} />
							<span className="label">{t('explore')}</span>
						</NavLink>
						<NavLink to="/my/messaging" className="item disabled" activeClassName="active">
							<FontAwesomeIcon icon={faComments} />
							<span className="label">{t('messaging')}</span>
						</NavLink>
						<NavLink to="/my/drive" className="item disabled" activeClassName="active">
							<FontAwesomeIcon icon={faCloud} />
							<span className="label">{t('drive')}</span>
						</NavLink>
						<div className="divider" />
						<NavLink to="/announcements" className="item disabled" activeClassName="active">
							<FontAwesomeIcon icon={faBroadcastTower} />
							<span className="label">{t('announcements')}</span>
						</NavLink>
						<NavLink to="/my/settings" className="item" activeClassName="active">
							<FontAwesomeIcon icon={faCog} />
							<span className="label">{t('settings')}</span>
						</NavLink>
					</>
				}
				<button className="_button command toggler" onClick={() => setToggle(!toggle)}>
					<FontAwesomeIcon icon={toggle ? faChevronCircleUp : faChevronCircleDown} />
				</button>
			</div>
			<div className="content _container">
				{props.children}
			</div>
			{props.fabIcon ? <FAB icon={props.fabIcon} onClick={props.onFabClicked ?? (() => { })} /> : null}
		</div>
	);
}
