import * as Bull from 'bull';
import { queueLogger } from '../../logger';
import { DriveFiles, Notes, Users } from '../../../models/index';
import { DbUserJobData } from '../../../queue/types';
import { Note } from '../../../models/entities/note';
import { DriveFile } from '../../../models/entities/drive-file';
import { MoreThan } from 'typeorm';
import { deleteFileSync } from '../../../services/drive/delete-file';

const logger = queueLogger.createSubLogger('delete-account');

export async function deleteAccount(job: Bull.Job<DbUserJobData>): Promise<string | void> {
	logger.info(`Deleting account of ${job.data.user.id} ...`);

	const user = await Users.findOne(job.data.user.id);
	if (user == null) {
		return;
	}

	{ // Delete notes
		let cursor: Note['id'] | null = null;

		while (true) {
			const notes = await Notes.find({
				where: {
					userId: user.id,
					...(cursor ? { id: MoreThan(cursor) } : {})
				},
				take: 100,
				order: {
					id: 1
				}
			});

			if (notes.length === 0) {
				break;
			}

			cursor = notes[notes.length - 1].id;

			await Notes.delete(notes.map(note => note.id));
		}

		logger.succ(`All of notes deleted`);
	}

	{ // Delete files
		let cursor: DriveFile['id'] | null = null;

		while (true) {
			const files = await DriveFiles.find({
				where: {
					userId: user.id,
					...(cursor ? { id: MoreThan(cursor) } : {})
				},
				take: 10,
				order: {
					id: 1
				}
			});

			if (files.length === 0) {
				break;
			}

			cursor = files[files.length - 1].id;

			for (const file of files) {
				await deleteFileSync(file);
			}
		}

		logger.succ(`All of files deleted`);
	}

	await Users.delete(job.data.user.id);

	return 'Account deleted';
}
