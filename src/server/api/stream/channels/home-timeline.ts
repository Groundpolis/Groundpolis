import autobind from 'autobind-decorator';
import Mute from '../../../../models/mute';
import { pack } from '../../../../models/note';
import shouldMuteThisNote from '../../../../misc/should-mute-this-note';
import Channel from '../channel';
import { concat } from '../../../../prelude/array';
import UserList from '../../../../models/user-list';

export default class extends Channel {
	public readonly chName = 'homeTimeline';
	public static shouldShare = true;
	public static requireCredential = true;

	private mutedUserIds: string[] = [];
	private hideFromUsers: string[] = [];

	@autobind
	public async init(params: any) {
		// Subscribe events
		this.subscriber.on(`homeTimeline:${this.user._id}`, this.onNote);

		const mute = await Mute.find({ muterId: this.user._id });
		this.mutedUserIds = mute.map(m => m.muteeId.toString());

		// Homeから隠すリストユーザー
		const lists = await UserList.find({
			userId: this.user._id,
			hideFromHome: true,
		});

		this.hideFromUsers = concat(lists.map(list => list.userIds)).map(x => x.toString());
	}

	@autobind
	private async onNote(note: any) {
		// リプライなら再pack
		if (note.replyId != null) {
			note.reply = await pack(note.replyId, this.user, {
				detail: true
			});
		}
		// Renoteなら再pack
		if (note.renoteId != null) {
			note.renote = await pack(note.renoteId, this.user, {
				detail: true
			});
		}

		// 流れてきたNoteがミュートしているユーザーが関わるものだったら無視する
		if (shouldMuteThisNote(note, this.mutedUserIds, this.hideFromUsers)) return;

		this.send('note', note);
	}

	@autobind
	public dispose() {
		// Unsubscribe events
		this.subscriber.off(`homeTimeline:${this.user._id}`, this.onNote);
	}
}
