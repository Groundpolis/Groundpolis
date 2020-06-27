import autobind from 'autobind-decorator';
import Channel from '../channel';
import { PackedNote } from '../../../../models/repositories/note';
import { Notes } from '../../../../models';

export default class extends Channel {
	public readonly chName = 'localTimeline';
	public static shouldShare = true;
	public static requireCredential = false;

	@autobind
	public async init(params: any) {
		// Subscribe events
		this.subscriber.on('notesStream', this.onNote);
	}

	@autobind
	private async onNote(note: PackedNote) {
		// 流れるノートは投稿主に向けてpackしたものなので、packし直す
		const repacked = await Notes.pack(note.id, this.user!);

		// パブリックでなければ送らない
		if (repacked.visibility !== 'public') return;
		// 短冊は送らない
		if (repacked.isTanzaku) return;

		this.send('note', repacked);
	}

	@autobind
	public dispose() {
		// Unsubscribe events
		this.subscriber.off('notesStream', this.onNote);
	}
}
