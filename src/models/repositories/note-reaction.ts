import { EntityRepository, Repository } from 'typeorm';
import { NoteReaction } from '../entities/note-reaction';
import { ensure } from '../../prelude/ensure';
import { SchemaType } from '../../misc/schema';
import { convertLegacyReaction } from '../../misc/reaction-lib';

export type PackedNoteReaction = SchemaType<typeof packedNoteReactionSchema>;

@EntityRepository(NoteReaction)
export class NoteReactionRepository extends Repository<NoteReaction> {
	public async pack(
		src: NoteReaction['id'] | NoteReaction,
		me?: any
	): Promise<PackedNoteReaction> {
		const reaction = typeof src === 'object' ? src : await this.findOne(src).then(ensure);

		return {
			id: reaction.id,
			createdAt: reaction.createdAt.toISOString(),
			type: convertLegacyReaction(reaction.reaction),
		};
	}
}

export const packedNoteReactionSchema = {
	type: 'object' as const,
	optional: false as const, nullable: false as const,
	properties: {
		id: {
			type: 'string' as const,
			optional: false as const, nullable: false as const,
			format: 'id',
			description: 'The unique identifier for this reaction.',
			example: 'xxxxxxxxxx',
		},
		createdAt: {
			type: 'string' as const,
			optional: false as const, nullable: false as const,
			format: 'date-time',
			description: 'The date that the reaction was created.'
		},
		type: {
			type: 'string' as const,
			optional: false as const, nullable: false as const,
			description: 'The reaction type.'
		},
	},
};
