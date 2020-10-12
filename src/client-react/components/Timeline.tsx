import React, { useRef, useLayoutEffect } from 'react';
import { useBottomScrollListener } from 'react-bottom-scroll-listener';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { PackedNote } from '../../models/repositories/note';
import Note from './Note';

function NoteWrapper({ note }: { note: PackedNote }) { 
	const ref = useRef<HTMLDivElement>(null);
	useLayoutEffect(() => {
		const height = ref.current.getBoundingClientRect().height;
		ref.current.style.setProperty('--xCurrentNoteHeight', `${height}px`);
		console.log(height);
	}, []);
	return (
		<div ref={ref} className="_box note" key={note.id}>
			<Note note={note} />
		</div>
	);
}

export function Timeline(props: { notes: any[]; onBottom?: () => void; }) {
	useBottomScrollListener(props.onBottom ?? (() => { }));

	return (
		<TransitionGroup component="div" className="_vstack">
			{props.notes.map(note => (
				<CSSTransition key={note.id} timeout={200} classNames="note">
					<NoteWrapper note={note}/>
				</CSSTransition>
			))}
		</TransitionGroup>
	);
}
