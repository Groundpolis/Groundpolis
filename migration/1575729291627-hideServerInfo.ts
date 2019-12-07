import {MigrationInterface, QueryRunner} from "typeorm";

export class hideServerInfo1575729291627 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "meta" ADD "hideServerInformation" boolean NOT NULL DEFAULT false`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "hideServerInformation"`, undefined);
    }

}
