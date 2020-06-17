import { EntityRepository, Repository } from 'typeorm';
import { Users, Notes } from '..';
import { ensure } from '../../prelude/ensure';
import { awaitAll } from '../../prelude/await-all';
import { ReportedNote } from '../entities/reported-note';

@EntityRepository(ReportedNote)
export class ReportedNoteRepository extends Repository<ReportedNote> {
	public async pack(
		src: ReportedNote['id'] | ReportedNote,
	) {
		const report = typeof src === 'object' ? src : await this.findOne(src).then(ensure);

		return await awaitAll({
			id: report.id,
			createdAt: report.createdAt,
			comment: report.comment,
			reporterId: report.reporterId,
			noteId: report.noteId,
			reporter: Users.pack(report.reporter || report.reporterId, null, {
				detail: true
			}),
			note: report.note || report.noteId ? Notes.pack(report.note || report.noteId, null, {
				detail: true,
				showActualUser: true,
			}) : null,
			noteText: report.noteText,
			noteCw: report.noteCw,
			noteCreatedAt: report.noteCreatedAt,
			noteUserId: report.noteUserId,
		});
	}

	public packMany(
		reports: any[],
	) {
		return Promise.all(reports.map(x => this.pack(x)));
	}
}
