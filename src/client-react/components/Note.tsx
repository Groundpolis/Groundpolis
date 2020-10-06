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
import { t } from '../utils/i18n';
import { PackedUser } from '../../models/repositories/user';

import './Note.scss';

function RenotedBy({ user }: { user: PackedUser }) { 
	return (
		<div className="renoted-by">
			<img className="avatar" src={user.avatarUrl} alt={getAcct(user)} />
			<FontAwesomeIcon icon={faRetweet} />
			{ t('renotedBy', { user: user.name || user.username }) }
		</div>
	);
}

export default function Note(props: { note: PackedNote, pinned: boolean }) {
	const isPureRenote = props.note.renote && !props.note.text;

	const note = isPureRenote ? props.note.renote as PackedNote : props.note;
	const renoter = isPureRenote ? (props.note.user as PackedUser) : null;
	const [cwOpen, setCwOpen] = useState(false);
	const user = note.user as PackedUser;
	const isMine = (reaction: string) => note.myReaction === reaction;
	return (
		<article className="_com note">
			{ isPureRenote ? <RenotedBy user={renoter} /> : null }
			<div className="body">
				<img src={user.avatarUrl} className="avatar" alt={getAcct(user)} />
				<section className="right">
					<header>
						<span className="name">
							{user.name ?? user.username}
						</span>
						<span className="acct">
							@{getAcct(user)}
						</span>
					</header>
					<div className="content">
						{note.cw ? (
							<>
								{note.cw}
								<button className="cw-button" onClick={() => setCwOpen(!cwOpen)}>{cwOpen ? t('_cw.hide') : t('_cw.show')}</button>
							</>
						) : null}
						{!note.cw || cwOpen ? note.text : null}
					</div>
					<div className="reactions">
						{
							Object.entries(note.reactions as Record<string, number>)
								.map(([reaction, count]) => (
									<button key={reaction} className={`_button reaction ${isMine(reaction) ? 'primary' : ''}`}>
										{reaction} {count}
									</button>
								))
						}
					</div>
					<div className="commands">
						<button className="_button command">
							<FontAwesomeIcon icon={faReply} />
						</button>
						<button className="_button command">
							<FontAwesomeIcon icon={faRetweet} />
						</button>
						<button className="_button command" style={{ color: note.myReaction ? 'var(--accent' : undefined }}>
							<FontAwesomeIcon icon={note.myReaction ? faMinus : faPlus} />
						</button>
						<button className="_button command">
							<FontAwesomeIcon icon={faEllipsisV} />
						</button>
					</div>
				</section>
			</div>
		</article>
	);
}
