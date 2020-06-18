import { EntityRepository, Repository, In } from 'typeorm';
import { Note } from '../entities/note';
import { User } from '../entities/user';
import { Emojis, DriveFiles, NoteReactions, Users } from '..';
import { ensure } from '../../prelude/ensure';
import { SchemaType } from '../../misc/schema';
import { awaitAll } from '../../prelude/await-all';
import { convertLegacyReaction, convertLegacyReactions } from '../../misc/reaction-lib';

export type PackedNote = SchemaType<typeof packedNoteSchema>;

@EntityRepository(Note)
export class NoteRepository extends Repository<Note> {
	public validateCw(x: string) {
		return x.trim().length <= 100;
	}

	private async hideNote(packedNote: PackedNote, meId: User['id'] | null) {
		let hide = false;

		if (hide) {
			packedNote.visibleUserIds = undefined;
			packedNote.fileIds = [];
			packedNote.files = [];
			packedNote.text = null;
			packedNote.cw = null;
			packedNote.isHidden = true;
		}
	}

	public async pack(
		src: Note['id'] | Note,
		me?: User['id'] | User | null | undefined,
		options?: {
			detail?: boolean;
			skipHide?: boolean;
			showActualUser?: boolean;
		}
	): Promise<PackedNote> {
		const opts = Object.assign({
			detail: true,
			skipHide: false,
			showActualUser: false,
		}, options);

		const meId = me ? typeof me === 'string' ? me : me.id : null;
		const note = typeof src === 'object' ? src : await this.findOne(src).then(ensure);
		const host = note.userHost;

		async function populateEmojis(emojiNames: string[], noteUserHost: string | null, reactionNames: string[]) {
			const where = [] as {}[];

			if (emojiNames?.length > 0) {
				where.push({
					name: In(emojiNames),
					host: noteUserHost
				});
			}

			reactionNames = reactionNames?.filter(x => x.match(/^:[^:]+:$/)).map(x => x.replace(/:/g, ''));

			if (reactionNames?.length > 0) {
				where.push({
					name: In(reactionNames),
					host: null
				});
			}

			if (where.length === 0) return [];

			return Emojis.find({
				where,
				select: ['name', 'host', 'url', 'aliases']
			});
		}

		async function populateMyReaction() {
			const reaction = await NoteReactions.findOne({
				userId: meId!,
				noteId: note.id,
			});

			if (reaction) {
				return convertLegacyReaction(reaction.reaction);
			}

			return undefined;
		}

		function populateVirtualUser() {
			return {
				id: 'VIRTUAL_ANONYMOUS_USER',
				name: null,
				username: 'anonymous',
				host: null,
				avatarUrl: null,
				avatarColor: null,
				isAdmin: false,
				isModerator: false,
				isBot: false,
				isCat: false,
				emojis: [],
				url: null,
				createdAt: '1970-01-01T00:00:00.000Z',
				updatedAt: '1970-01-01T00:00:00.000Z',
				bannerUrl: null,
				bannerColor: null,
				isLocked: false,
				isSilenced: false,
				isSuspended: false,
				description: null,
				location: null,
				birthday: null,
				fields: [],
				followersCount: 0,
				followingCount: 0,
				notesCount: 0,
				pinnedNoteIds: [],
				pinnedNotes: [],
				pinnedPageId: null,
				pinnedPage: null,
				twoFactorEnabled: false,
				usePasswordLessLogin: false,
				securityKeys: false,
				isFollowing: false,
				isFollowed: false,
				hasPendingFollowRequestFromYou: false,
				hasPendingFollowRequestToYou: false,
				isBlocking: false,
				isBlocked: false,
				isMuted: false
			};
		}

		let text = note.text;

		if (note.name && (note.url || note.uri)) {
			text = `【${note.name}】\n${(note.text || '').trim()}\n\n${note.url || note.uri}`;
		}

		const user = opts.showActualUser ? await Users.pack(note.user || note.userId, meId) : populateVirtualUser();

		const packed = await awaitAll({
			id: note.id,
			createdAt: note.createdAt.toISOString(),
			userId: user.id,
			user,
			text: text,
			cw: note.cw,
			visibility: note.visibility,
			viaMobile: note.viaMobile || undefined,
			repliesCount: note.repliesCount,
			reactions: convertLegacyReactions(note.reactions),
			tags: note.tags.length > 0 ? note.tags : undefined,
			emojis: populateEmojis(note.emojis, host, Object.keys(note.reactions)),
			fileIds: note.fileIds,
			files: DriveFiles.packMany(note.fileIds),
			uri: note.uri || undefined,
			isMyNote: meId === note.userId,
			isAnnouncement: note.isAnnouncement,

			...(opts.detail ? {
				...(meId ? {
					myReaction: populateMyReaction(),
				} : {})
			} : {})
		});

		if (!opts.skipHide) {
			await this.hideNote(packed, meId);
		}

		return packed;
	}

	public packMany(
		notes: (Note['id'] | Note)[],
		me?: User['id'] | User | null | undefined,
		options?: {
			detail?: boolean;
			skipHide?: boolean;
			showActualuser?: boolean;
		}
	) {
		return Promise.all(notes.map(n => this.pack(n, me, options)));
	}
}

export const packedNoteSchema = {
	type: 'object' as const,
	optional: false as const, nullable: false as const,
	properties: {
		id: {
			type: 'string' as const,
			optional: false as const, nullable: false as const,
			format: 'id',
			description: 'The unique identifier for this Note.',
			example: 'xxxxxxxxxx',
		},
		createdAt: {
			type: 'string' as const,
			optional: false as const, nullable: false as const,
			format: 'date-time',
			description: 'The date that the Note was created on Misskey.'
		},
		text: {
			type: 'string' as const,
			optional: false as const, nullable: true as const,
		},
		cw: {
			type: 'string' as const,
			optional: true as const, nullable: true as const,
		},
		userId: {
			type: 'string' as const,
			optional: false as const, nullable: false as const,
			format: 'id',
		},
		user: {
			type: 'object' as const,
			ref: 'User',
			optional: false as const, nullable: false as const,
		},
		viaMobile: {
			type: 'boolean' as const,
			optional: true as const, nullable: false as const,
		},
		isHidden: {
			type: 'boolean' as const,
			optional: true as const, nullable: false as const,
		},
		isMyNote: {
			type: 'boolean' as const,
			optional: false as const, nullable: false as const,
		},
		isAnnouncement: {
			type: 'boolean' as const,
			optional: false as const, nullable: false as const,
		},
		visibility: {
			type: 'string' as const,
			optional: false as const, nullable: false as const,
		},
		visibleUserIds: {
			type: 'array' as const,
			optional: true as const, nullable: false as const,
			items: {
				type: 'string' as const,
				optional: false as const, nullable: false as const,
				format: 'id'
			}
		},
		fileIds: {
			type: 'array' as const,
			optional: true as const, nullable: false as const,
			items: {
				type: 'string' as const,
				optional: false as const, nullable: false as const,
				format: 'id'
			}
		},
		files: {
			type: 'array' as const,
			optional: true as const, nullable: false as const,
			items: {
				type: 'object' as const,
				optional: false as const, nullable: false as const,
				ref: 'DriveFile'
			}
		},
		tags: {
			type: 'array' as const,
			optional: true as const, nullable: false as const,
			items: {
				type: 'string' as const,
				optional: false as const, nullable: false as const,
			}
		},

	},
};
