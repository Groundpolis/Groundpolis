import React, { useEffect, useState } from 'react';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faBell, faBroadcastTower, faChevronCircleDown, faChevronCircleUp, faCloud, faCog, faComments, faHome, faSearch, faSlidersH } from '@fortawesome/free-solid-svg-icons';

import './Shell.scss';
import FAB from './FAB';
import { api, isSignedIn } from '../scripts/api';
import { t } from '../scripts/i18n';
import { Link, NavLink } from 'react-router-dom';
import getAcct from '../../misc/acct/render';
import { PackedUser } from '../../models/repositories/user';
import Spinner from './Spinner';
import Icon from './Icon';

const DefaultHeader = (props: { title: string, icon?: IconProp }) => (
	<span className="title">
		{props.icon ? <FontAwesomeIcon icon={props.icon} /> : null}
		{props.title}
	</span >
);

function Item(props: { disabled?: boolean, exact?: boolean, to: string, icon?: IconProp, label: string }) { 
	return (
		<NavLink exact={props.exact} to={props.to} className={`item ${props.disabled ? ' disabled' : ''}`} activeClassName="active">
			{props.icon ? <FontAwesomeIcon icon={props.icon} fixedWidth /> : null}
			<span className="label">{props.label}</span>
		</NavLink>
	);
}

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

	const signedIn = isSignedIn();

	useEffect(() => {
		(async () => {
			setI(await api('i'));
		})();
	}, []);

	return (
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
					<button className="_button command primary">
						<FontAwesomeIcon icon={faSlidersH} />
					</button>
				</div>
			</header>
			<div className="sidebar">
				{signedIn ?
					<NavLink to={i ? '/@' + getAcct(i) : ''} className="item" activeClassName="active">
						<img src={i?.avatarUrl} className="avatar" />
						<span className="label">{i?.name || i?.username}</span>
					</NavLink>
					:
					<div className="item">
						<Icon style={{ fontSize: '32px', fill: 'var(--fg)', }}/> Groundpolis
					</div>
				}
				<div className="divider" />
				{toggle ? <>
					<button className="_button command item">
						<span className="label">{t('createAccount')}</span>
					</button>
					<button className="_button command item">
						<span className="label">{t('addAcount')}</span>
					</button>
				</> : <>
						<Item exact to="/" icon={faHome} label={t('home')} />
						{signedIn ? <Item disabled to="/my/notifications" icon={faBell} label={t('notifications')} /> : null}
						<Item disabled to="/explore" icon={faSearch} label={t('explore')} />
						{signedIn ? <Item disabled to="/my/messaging" icon={faComments} label={t('messaging')} /> : null}
						{signedIn ? <Item disabled to="/my/drive" icon={faCloud} label={t('drive')} /> : null}
						<div className="divider" />
						<Item disabled to="/announcements" icon={faBroadcastTower} label={t('announcements')} />
						<Item to="/my/settings" icon={faCog} label={t('settings')} />
					</>
				}
				{signedIn ? <button className="_button command toggler" onClick={() => setToggle(!toggle)}>
					<FontAwesomeIcon icon={toggle ? faChevronCircleUp : faChevronCircleDown} />
				</button> : null}
			</div>
			<div className="content _container">
				{props.children}
			</div>
			{props.fabIcon ? <FAB icon={props.fabIcon} onClick={props.onFabClicked ?? (() => { })} /> : null}
		</div>
	);
}
