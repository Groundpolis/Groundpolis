import {MigrationInterface, QueryRunner} from 'typeorm';

export class noindex1602555335140 implements MigrationInterface {
	name = 'noindex1602555335140'

	public async up(queryRunner: QueryRunner): Promise<void> {
			await queryRunner.query('ALTER TABLE "user_profile" ADD "noindex" boolean NOT NULL DEFAULT false');
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
			await queryRunner.query('ALTER TABLE "user_profile" DROP COLUMN "noindex"');
	}
}
