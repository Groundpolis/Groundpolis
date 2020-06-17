import $ from 'cafy';
import * as ms from 'ms';
import { length } from 'stringz';
import create from '../../../../services/note/create';
import define from '../../define';
import { fetchMeta } from '../../../../misc/fetch-meta';
import { ApiError } from '../../error';
import { ID } from '../../../../misc/cafy-id';
import { User } from '../../../../models/entities/user';
import { Users, DriveFiles, Notes, ReportedNotes } from '../../../../models';
import { DriveFile } from '../../../../models/entities/drive-file';
import { Note } from '../../../../models/entities/note';
import { DB_MAX_NOTE_TEXT_LENGTH } from '../../../../misc/hard-limits';
import { noteVisibilities } from '../../../../types';
import { genId } from '../../../../misc/gen-id';

export const meta = {
	desc: {
		'ja-JP': 'ノートを通報します。'
	},

	tags: ['notes'],

	requireCredential: true as const,

	kind: 'write:notes',

	params: {
		noteId: {
			validator: $.type(ID),
			desc: {
				'ja-JP': '対象の投稿のID',
				'en-US': 'Target note ID.'
			}
		},
		comment: {
			validator: $.str,
			desc: {
				'ja-JP': 'コメント'
			}
		},
	},

	errors: {
		noSuchNote: {
			message: 'No such note.',
			code: 'NO_SUCH_NOTE',
			id: 'b5c90186-4ab0-49c8-9bba-a1f76c282ba4'
		},
	}
};

export default define(meta, async (ps, user) => {
	const note = await Notes.findOne(ps.noteId);
	if (!note) throw new ApiError(meta.errors.noSuchNote);

	ReportedNotes.save({
		id: genId(),
		createdAt: new Date(),
		noteId: note.id,
		reporterId: user.id,
		comment: ps.comment,
		noteText: note.text,
		noteCw: note.cw,
		noteCreatedAt: note.createdAt,
		noteUserId: note.userId,
	});
});
