import {MigrationInterface, QueryRunner} from "typeorm";

export class isAnnouncement1592462546648 implements MigrationInterface {
    name = 'isAnnouncement1592462546648'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "note" ADD "isAnnouncement" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "note" DROP COLUMN "isAnnouncement"`);
    }

}
