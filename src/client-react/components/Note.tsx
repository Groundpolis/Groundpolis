import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faReply,
	faRetweet,
	faPlus,
	faMinus,
	faEllipsisV,
} from '@fortawesome/free-solid-svg-icons';

import { PackedNote } from '../../models/repositories/note';
import getAcct from '../../misc/acct/render';
import { t } from '../scripts/i18n';
import { PackedUser } from '../../models/repositories/user';

import './Note.scss';

export default function Note(props: { note: PackedNote }) {
	const [ cwOpen, setCwOpen ] = useState(false);
	const user = props.note.user as PackedUser;
	return (
		<article className="_com note">
			<img src={user.avatarUrl} className="avatar" alt={getAcct(user)} />
			<section className="right">
				<header>
					<span className="name">
						{ user.name ?? user.username }
					</span>
					<span className="acct">
						@{ getAcct(user) }
					</span>
				</header>
				<div className="content">
					{ props.note.cw ? (
						<button className="cw-button" onClick={() => setCwOpen(!cwOpen)}>{ cwOpen ? t('_cw.hide') : t('_cw.show') }</button>
					) : null }
					{ !props.note.cw || cwOpen ? props.note.text : null }
				</div>
				<div className="reactions">
					{
						Object.entries(props.note.reactions as Record<string, number>)
							.map(([ reaction, count ]) => (
								<button key={reaction} className={ `_button reaction ${props.note.myReaction === reaction ? 'primary' : ''}`}>
									{reaction} {count}
								</button>
							))
					}
				</div>
				<div className="commands">
					<button className="_button command">
						<FontAwesomeIcon icon={faReply}/>
					</button>
					<button className="_button command">
						<FontAwesomeIcon icon={faRetweet}/>
					</button>
					<button className="_button command">
						<FontAwesomeIcon icon={faPlus}/>
					</button>
					<button className="_button command">
						<FontAwesomeIcon icon={faEllipsisV}/>
					</button>
				</div>
			</section>
		</article>
	);
}
