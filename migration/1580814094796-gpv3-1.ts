import {MigrationInterface, QueryRunner} from "typeorm";

export class gpv311580814094796 implements MigrationInterface {
    name = 'gpv311580814094796'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "user" ADD "isVerified" boolean NOT NULL DEFAULT false`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isVerified"`, undefined);
    }

}
