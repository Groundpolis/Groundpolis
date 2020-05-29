import {MigrationInterface, QueryRunner} from "typeorm";

export class ctl1590746057549 implements MigrationInterface {
    name = 'ctl1590746057549'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "meta" ADD "disableCatTimeline" boolean NOT NULL DEFAULT false`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "disableCatTimeline"`, undefined);
    }

}
