import { Entity, Column, Index, OneToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { DriveFile } from './drive-file';
import { id } from '../id';

@Entity()
@Index(['usernameLower', 'host'], { unique: true })
export class User {
	@PrimaryColumn(id())
	public id: string;

	@Index()
	@Column('timestamp with time zone', {
		comment: 'The created date of the User.'
	})
	public createdAt: Date;

	@Index()
	@Column('timestamp with time zone', {
		nullable: true,
		comment: 'The updated date of the User.'
	})
	public updatedAt: Date | null;

	@Column('timestamp with time zone', {
		nullable: true
	})
	public lastFetchedAt: Date | null;

	@Column('varchar', {
		length: 128,
		comment: 'The username of the User.'
	})
	public username: string;

	@Index()
	@Column('varchar', {
		length: 128, select: false,
		comment: 'The username (lowercased) of the User.'
	})
	public usernameLower: string;

	@Column('varchar', {
		length: 128, nullable: true,
		comment: 'The name of the User.'
	})
	public name: string | null;

	@Column('integer', {
		default: 0,
		comment: 'The count of followers.'
	})
	public followersCount: number;

	@Column('integer', {
		default: 0,
		comment: 'The count of following.'
	})
	public followingCount: number;

	@Column('integer', {
		default: 0,
		comment: 'The count of notes.'
	})
	public notesCount: number;

	@Column({
		...id(),
		nullable: true,
		comment: 'The ID of avatar DriveFile.'
	})
	public avatarId: DriveFile['id'] | null;

	@OneToOne(type => DriveFile, {
		onDelete: 'SET NULL'
	})
	@JoinColumn()
	public avatar: DriveFile | null;

	@Column({
		...id(),
		nullable: true,
		comment: 'The ID of banner DriveFile.'
	})
	public bannerId: DriveFile['id'] | null;

	@OneToOne(type => DriveFile, {
		onDelete: 'SET NULL'
	})
	@JoinColumn()
	public banner: DriveFile | null;

	@Index()
	@Column('varchar', {
		length: 128, array: true, default: '{}'
	})
	public tags: string[];

	@Column('varchar', {
		length: 512, nullable: true,
	})
	public avatarUrl: string | null;

	@Column('varchar', {
		length: 512, nullable: true,
	})
	public bannerUrl: string | null;

	@Column('varchar', {
		length: 128, nullable: true,
	})
	public avatarBlurhash: string | null;

	@Column('varchar', {
		length: 128, nullable: true,
	})
	public bannerBlurhash: string | null;

	@Column('boolean', {
		default: false,
		comment: 'Whether the User is suspended.'
	})
	public isSuspended: boolean;

	@Column('boolean', {
		default: false,
		comment: 'Whether the User is silenced.'
	})
	public isSilenced: boolean;

	@Column('boolean', {
		default: false,
		comment: 'Whether the User is locked.'
	})
	public isLocked: boolean;

	@Column('boolean', {
		default: false,
		comment: 'Whether the User hides following and followers.'
	})
	public hideFF: boolean;

	@Column('boolean', {
		default: false,
		comment: 'Whether the User is a bot.'
	})
	public isBot: boolean;

	@Column('boolean', {
		default: false,
		comment: 'Whether the User is a cat.'
	})
	public isCat: boolean;

	@Column('boolean', {
		default: false,
		comment: 'Whether the User is the admin.'
	})
	public isAdmin: boolean;

	@Column('boolean', {
		default: false,
		comment: 'Whether the User is a moderator.'
	})
	public isModerator: boolean;

	@Column('boolean', {
		default: false,
	})
	public isVerified: boolean;

	@Column('boolean', {
		default: false,
	})
	public isPremium: boolean;

	@Index()
	@Column('boolean', {
		default: true,
		comment: 'Whether the User is explorable.'
	})
	public isExplorable: boolean;

	@Column('varchar', {
		length: 128, array: true, default: '{}'
	})
	public emojis: string[];

	@Index()
	@Column('varchar', {
		length: 128, nullable: true,
		comment: 'The host of the User. It will be null if the origin of the user is local.'
	})
	public host: string | null;

	@Column('varchar', {
		length: 512, nullable: true,
		comment: 'The inbox URL of the User. It will be null if the origin of the user is local.'
	})
	public inbox: string | null;

	@Column('varchar', {
		length: 512, nullable: true,
		comment: 'The sharedInbox URL of the User. It will be null if the origin of the user is local.'
	})
	public sharedInbox: string | null;

	@Column('varchar', {
		length: 512, nullable: true,
		comment: 'The featured URL of the User. It will be null if the origin of the user is local.'
	})
	public featured: string | null;

	@Index()
	@Column('varchar', {
		length: 512, nullable: true,
		comment: 'The URI of the User. It will be null if the origin of the user is local.'
	})
	public uri: string | null;

	@Column('varchar', {
		length: 512, nullable: true,
		comment: 'The URI of the user Follower Collection. It will be null if the origin of the user is local.'
	})
	public followersUri: string | null;

	@Index({ unique: true })
	@Column('char', {
		length: 16, nullable: true, unique: true,
		comment: 'The native access token of the User. It will be null if the origin of the user is local.'
	})
	public token: string | null;

	@Column('enum', {
		enum: ['not-known', 'male', 'female', 'not-applicable'],
		default: 'not-known', nullable: false,
	})
	public sex: 'not-known' | 'male' | 'female' | 'not-applicable';

	constructor(data: Partial<User>) {
		if (data == null) return;

		for (const [k, v] of Object.entries(data)) {
			(this as any)[k] = v;
		}
	}
}

export interface ILocalUser extends User {
	host: null;
}

export interface IRemoteUser extends User {
	host: string;
}
