import getNoteSummary from '../../misc/get-note-summary';
import getUserName from '../../misc/get-user-name';
import getReactionEmoji from '../../misc/get-reaction-emoji';
import { url } from '../config';

type Notification = {
	title: string;
	body: string;
	icon: string;
	url?: string;
};

// TODO: i18n

export default function(type, data): Notification {
	switch (type) {
		case 'driveFileCreated':
			return {
				title: 'File uploaded',
				body: data.name,
				icon: data.url
			};

		case 'notification':
			switch (data.type) {
				case 'mention':
					return {
						title: `${getUserName(data.user)} mentioned you:`,
						body: getNoteSummary(data.note),
						icon: data.user.avatarUrl,
						url: url + '/notes/' + data.note.id,
					};

				case 'reply':
					return {
						title: `You got reply from ${getUserName(data.user)}:`,
						body: getNoteSummary(data.note),
						icon: data.user.avatarUrl,
						url: url + '/notes/' + data.note.id,
					};

				case 'renote':
					return {
						title: `${getUserName(data.user)} renoted:`,
						body: getNoteSummary(data.note.renote),
						icon: data.user.avatarUrl,
						url: url + '/notes/' + data.note.renote.id,
					};

				case 'quote':
					return {
						title: `${getUserName(data.user)} quoted:`,
						body: getNoteSummary(data.note),
						icon: data.user.avatarUrl,
						url: url + '/notes/' + data.note.id,
					};

				case 'reaction':
					return {
						title: `${getUserName(data.user)} feels ${getReactionEmoji(data.reaction)}:`,
						body: getNoteSummary(data.note),
						icon: data.user.avatarUrl,
						url: url + '/notes/' + data.note.id,
					};

				default:
					return null;
			}

		default:
			return null;
	}
}
