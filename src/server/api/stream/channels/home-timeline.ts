import autobind from 'autobind-decorator';
import Channel from '../channel';
import { PackedNote } from '../../../../models/repositories/note';
import { Notes } from '../../../../models';

export default class extends Channel {
	public readonly chName = 'homeTimeline';
	public static shouldShare = true;
	public static requireCredential = true;

	@autobind
	public async init(params: any) {
		// Subscribe events
		this.subscriber.on('notesStream', this.onNote);
	}

	@autobind
	private async onNote(note: PackedNote) {
		// 流れるノートは投稿主に向けてpackしたものなので、packし直す
		const repacked = await Notes.pack(note.id, this.user!);

		// 自分のノートでなければ弾く
		if (!repacked.isMyNote) return;
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
