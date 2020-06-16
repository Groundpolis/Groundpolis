import {MigrationInterface, QueryRunner} from "typeorm";

export class disableInvitation1592288966883 implements MigrationInterface {
    name = 'disableInvitation1592288966883'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "meta" ADD "disableInvitation" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "meta" ADD "disableInvitationReason" character varying(64) NOT NULL DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "disableInvitationReason"`);
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "disableInvitation"`);
    }

}
