import {MigrationInterface, QueryRunner} from "typeorm";

export class renoteMute1606083866431 implements MigrationInterface {
    name = 'renoteMute1606083866431'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "muting" ADD "isRenoteOnly" boolean NOT NULL DEFAULT FALSE`);
        await queryRunner.query(`COMMENT ON COLUMN "muting"."isRenoteOnly" IS 'Mute only reposts'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "muting"."isRenoteOnly" IS 'Mute only reposts'`);
        await queryRunner.query(`ALTER TABLE "muting" DROP COLUMN "isRenoteOnly"`);
    }

}
