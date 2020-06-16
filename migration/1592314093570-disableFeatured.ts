import {MigrationInterface, QueryRunner} from "typeorm";

export class disableFeatured1592314093570 implements MigrationInterface {
    name = 'disableFeatured1592314093570'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "meta" ADD "disableFeatured" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "disableFeatured"`);
    }

}
