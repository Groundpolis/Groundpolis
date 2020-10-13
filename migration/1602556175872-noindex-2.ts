import {MigrationInterface, QueryRunner} from 'typeorm';

export class noindex21602556175872 implements MigrationInterface {
	name = 'noindex21602556175872'

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query('ALTER TABLE "user_profile" DROP COLUMN "noindex"');
		await queryRunner.query('ALTER TABLE "user" ADD "noindex" boolean NOT NULL DEFAULT false');
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query('ALTER TABLE "user" DROP COLUMN "noindex"');
		await queryRunner.query('ALTER TABLE "user_profile" ADD "noindex" boolean NOT NULL DEFAULT false');
	}
}
