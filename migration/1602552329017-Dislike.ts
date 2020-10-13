import {MigrationInterface, QueryRunner} from 'typeorm';

export class Dislike1602552329017 implements MigrationInterface {
    name = 'Dislike1602552329017'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "note_reaction" ADD "dislike" boolean');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "note_reaction" DROP COLUMN "dislike"');
    }

}
