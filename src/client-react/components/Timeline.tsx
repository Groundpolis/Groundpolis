import React from 'react';
import { useBottomScrollListener } from 'react-bottom-scroll-listener';
import Note from './Note';

export function Timeline(props: { notes: any[]; onBottom?: () => void; }) {
	useBottomScrollListener(props.onBottom ?? (() => { }));

	return (
		<div className="_vstack">
			{props.notes.map(note => <div className="_box" key={note.id}><Note note={note} /></div>)}
		</div>
	);
}
