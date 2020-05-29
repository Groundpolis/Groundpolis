import {MigrationInterface, QueryRunner} from "typeorm";

export class remoteFollowersOnly1590764983545 implements MigrationInterface {
    name = 'remoteFollowersOnly1590764983545'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "note" ADD "remoteFollowersOnly" boolean NOT NULL DEFAULT false`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "note" DROP COLUMN "remoteFollowersOnly"`, undefined);
    }

}
