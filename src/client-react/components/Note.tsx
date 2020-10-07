import React, { useState, useRef } from 'react';
import { useIntersection } from 'use-intersection';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faReply,
	faRetweet,
	faPlus,
	faMinus,
	faEllipsisV,
	faReplyAll,
	faCertificate,
	faCheck,
	faBookmark,
	faCrown
} from '@fortawesome/free-solid-svg-icons';
import { length } from 'stringz';

import { PackedNote } from '../../models/repositories/note';
import getAcct from '../../misc/acct/render';
import { t } from '../utils/i18n';
import { PackedUser } from '../../models/repositories/user';
import { getNoteVisibilityIconOf } from '../utils/getNoteVisibilityIconOf';
import { useWatch } from '../utils/useWatch';
import Mfm from './Mfm';
import { concat } from '../../prelude/array';

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

function relativeTime(time: Date) { 
	const ago = (new Date().getTime() - time.getTime()) / 1000/*ms*/;
	return ago >= 31536000 ? t('_ago.yearsAgo', { n: ~~(ago / 31536000) }) :
		ago >= 2592000 ? t('_ago.monthsAgo', { n: ~~(ago / 2592000) }) :
		ago >= 604800 ? t('_ago.weeksAgo', { n: ~~(ago / 604800) }) :
		ago >= 86400 ? t('_ago.daysAgo', { n: ~~(ago / 86400) }) :
		ago >= 3600 ? t('_ago.hoursAgo', { n: ~~(ago / 3600) }) :
		ago >= 60 ? t('_ago.minutesAgo', { n: ~~(ago / 60) }) :
		ago >= 10 ? t('_ago.secondsAgo', { n: ~~(ago % 60) }) :
		ago >= -1 ? t('_ago.justNow') :
		ago < -1 ? t('_ago.future') :
		t('_ago.unknown');
}

export default function Note(props: { note: PackedNote, pinned?: boolean }) {
	const isPureRenote = props.note.renote && !props.note.text;
	const renoter = isPureRenote ? (props.note.user as PackedUser) : null;
	const note = isPureRenote ? props.note.renote as PackedNote : props.note;

	const user = note.user as PackedUser;
	const userPage = '/@' + getAcct(user);

	const isMine = (reaction: string) => note.myReaction === reaction;

	const [cwOpen, setCwOpen] = useState(false);

	const root = useRef(null);
	useWatch(1000);

	const cwLabel = concat([
		note.text ? [t('_cw.chars', { count: length(note.text) })] : [],
		note.files && note.files.length !== 0 ? [t('_cw.files', { count: note.files.length })] : [],
		note.poll != null ? [t('poll')] : []
	] as string[][]).join(' / ');

	return (
		<article className="_com note" ref={root}>
			{ isPureRenote ? <RenotedBy user={renoter} /> : null }
			<div className="body">
				<Link className="avatar" to={userPage}>
					<img src={user.avatarUrl} alt={getAcct(user)} />
				</Link>
				<section className="right">
					<header>
						<Link to={userPage} className="name">
							{user.name ?? user.username}
						</Link>
						<Link to={userPage} className="acct">
							@{getAcct(user)}
						</Link>
						{user.isAdmin ? <FontAwesomeIcon className="admin" icon={faBookmark} /> : null}
						{user.isVerified ? <div className="verified fa-layers">
							<FontAwesomeIcon icon={faCertificate} />
							<FontAwesomeIcon icon={faCheck} transform="shrink-6" size="xs" style={{ color: 'var(--bg)' }} />
						</div> : null}
						{user.isPremium ? <FontAwesomeIcon className="premium" icon={faCrown} /> : null}
						<Link to={'/notes/' + note.id} className="time">
							{relativeTime(new Date(note.createdAt))}
						</Link>
						{note.visibility !== 'public'
							? <FontAwesomeIcon className="visibility" icon={getNoteVisibilityIconOf(note.visibility)} />
							: null
						}
					</header>
					<div className="content">
						{note.cw ? (
							<>
								<Mfm text={note.cw}/>
								<button className="cw-button" onClick={() => setCwOpen(!cwOpen)}>
									{cwOpen ? t('_cw.hide') : t('_cw.show')}
									{!cwOpen ? <span>({cwLabel})</span> : null}
								</button>
							</>
						) : null}
						{!note.cw || cwOpen ? <Mfm text={note.text}/> : null}
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
							<FontAwesomeIcon icon={note.reply ? faReplyAll : faReply} />
							{note.repliesCount ? <span className="count">{note.repliesCount}</span> : null}
						</button>
						<button className="_button command">
							<FontAwesomeIcon icon={faRetweet} />
							{note.renoteCount ? <span className="count">{note.renoteCount}</span> : null}
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
