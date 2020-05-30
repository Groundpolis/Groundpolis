import {MigrationInterface, QueryRunner} from "typeorm";

export class hideFF1590805350225 implements MigrationInterface {
    name = 'hideFF1590805350225'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "hideFF" boolean NOT NULL DEFAULT false`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "hideFF"`, undefined);
    }

}
