import { PrimaryColumn, Entity, Index, JoinColumn, Column, OneToOne, ManyToOne } from 'typeorm';
import { Note } from './note';
import { User } from './user';
import { id } from '../id';

@Entity()
export class ReportedNote {
	@PrimaryColumn(id())
	public id: string;

	@Index()
	@Column('timestamp with time zone', {
		comment: 'The created date of the report.'
	})
	public createdAt: Date;

	@Column({
		...id(),
		nullable: true
	})
	public noteId: Note['id'];

	@ManyToOne(type => Note, {
		onDelete: 'SET NULL'
	})
	@JoinColumn()
	public note: Note | null;

	@Index()
	@Column({
		...id(),
		comment: 'Reported User Id.'
	})
	public reporterId: User['id'];

	@ManyToOne(type => User, {
		onDelete: 'CASCADE'
	})
	@JoinColumn()
	public reporter: User | null;

	@Column('varchar', {
		length: 512,
	})
	public comment: string;

	@Column('varchar', {
		nullable: true,
		comment: '[Denormalized]'
	})
	// 通報対象のノートを消されても
	// 中身をおおよそ残せるように証拠化
	public noteText: string;

	@Column('varchar', {
		nullable: true,
		comment: '[Denormalized]'
	})
	// 通報対象のノートを消されても
	// 中身をおおよそ残せるように証拠化
	public noteCw: string;

	@Column('timestamp with time zone', {
		comment: '[Denormalized]'
	})
	// 通報対象のノートを消されても
	// 中身をおおよそ残せるように証拠化
	public noteCreatedAt: Date;

	//#region Denormalized fields
	@Index()
	@Column({
		...id(),
		comment: '[Denormalized]'
	})
	public noteUserId: User['id'];
	//#endregion
}
