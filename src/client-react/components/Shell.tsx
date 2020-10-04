import React, { useEffect, useState } from 'react';
import { useGlobal } from 'reactn';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faBell, faBroadcastTower, faChevronCircleDown, faChevronCircleUp, faCloud, faCog, faComments, faHome, faSearch, faSlidersH } from '@fortawesome/free-solid-svg-icons';

import './Shell.scss';
import { api, isSignedIn } from '../utils/api';
import { t } from '../utils/i18n';
import { NavLink, NavLinkProps } from 'react-router-dom';
import getAcct from '../../misc/acct/render';
import { PackedUser } from '../../models/repositories/user';
import Icon from './Icon';
import { ShellFAB, ShellHeader } from '../teleporters';

function Item(props: { disabled?: boolean, icon?: IconProp, label: string } & NavLinkProps) { 
	return (
		<NavLink {...props} className={`item ${props.disabled ? ' disabled' : ''}`} activeClassName="active">
			{props.icon ? <FontAwesomeIcon icon={props.icon} fixedWidth /> : null}
			<span className="label">{props.label}</span>
		</NavLink>
	);
}

export default function Shell(props: {
	zenMode?: boolean,
	children?: React.ReactElement,
}) {
	const [i, setI] = useGlobal('i');
	const [toggle, setToggle] = useState(false);
	const [isOpen, setIsOpen] = useState(false);

	const signedIn = isSignedIn();

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
					<NavLink to={i ? '/@' + getAcct(i) : ''} className="item" activeClassName="active" onClick={() => setIsOpen(false)}>
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
						<Item exact to="/" icon={faHome} label={t('home')} onClick={() => setIsOpen(false)} />
						{signedIn ? <Item disabled to="/my/notifications" icon={faBell} label={t('notifications')} onClick={() => setIsOpen(false)} /> : null}
						<Item disabled to="/explore" icon={faSearch} label={t('explore')} onClick={() => setIsOpen(false)} />
						{signedIn ? <Item disabled to="/my/messaging" icon={faComments} label={t('messaging')} onClick={() => setIsOpen(false)} /> : null}
						{signedIn ? <Item disabled to="/my/drive" icon={faCloud} label={t('drive')} onClick={() => setIsOpen(false)} /> : null}
						<div className="divider" />
						<Item disabled to="/announcements" icon={faBroadcastTower} label={t('announcements')} onClick={() => setIsOpen(false)} />
						<Item to="/my/settings" icon={faCog} label={t('settings')} onClick={() => setIsOpen(false)} />
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
