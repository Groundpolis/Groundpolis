import React, { useEffect, useState } from 'react';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faBell, faBroadcastTower, faChevronCircleDown, faChevronCircleUp, faCloud, faCog, faComments, faHome, faSearch, faSlidersH } from '@fortawesome/free-solid-svg-icons';

import './Shell.scss';
import FAB from './FAB';
import { api, isSignedIn } from '../utils/api';
import { t } from '../utils/i18n';
import { NavLink } from 'react-router-dom';
import getAcct from '../../misc/acct/render';
import { PackedUser } from '../../models/repositories/user';
import Icon from './Icon';
import { ShellFAB, ShellHeader } from '../teleporters';

function Item(props: { disabled?: boolean, exact?: boolean, to: string, icon?: IconProp, label: string }) { 
	return (
		<NavLink exact={props.exact} to={props.to} className={`item ${props.disabled ? ' disabled' : ''}`} activeClassName="active">
			{props.icon ? <FontAwesomeIcon icon={props.icon} fixedWidth /> : null}
			<span className="label">{props.label}</span>
		</NavLink>
	);
}

export default function Shell(props: {
	zenMode?: boolean,
	children?: React.ReactElement,
}) {
	const [i, setI] = useState(null as PackedUser | null);
	const [toggle, setToggle] = useState(false);
	const [isOpen, setIsOpen] = useState(false);

	const signedIn = isSignedIn();

	useEffect(() => {
		(async () => {
			setI(await api('i'));
		})();
	}, []);

	return props.zenMode ? props.children : (
		<div className="_com shell">
			<header className="header">
				<div className="left">
					<button className="_mobile-only _button command" onClick={() => setIsOpen(true)}>
						<FontAwesomeIcon icon={faBars} />
					</button>
				</div>
				<div className="center">
					<ShellHeader.Target />
				</div>
				<div className="right">
					<button disabled className="_button command primary">
						<FontAwesomeIcon icon={faSlidersH} />
					</button>
				</div>
			</header>
			<div className={'backdrop' + (isOpen ? ' open' : '')} onClick={() => setIsOpen(false)}/>
			<div className={'sidebar' + (isOpen ? ' open' : '')}>
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
					<button disabled className="_button command item">
						<span className="label">{t('createAccount')}</span>
					</button>
					<button disabled className="_button command item">
						<span className="label">{t('addAcount')}</span>
					</button>
					<button className="_button command item danger" onClick={logout}>{t('logout')}</button>
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
			<ShellFAB.Target/>
		</div>
	);
}

function logout() {
	if (confirm('Are you sure to log out?')) {
		localStorage.removeItem('i');
		location.href = '/';
	}
}
