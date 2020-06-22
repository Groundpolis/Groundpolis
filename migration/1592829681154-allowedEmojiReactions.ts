import {MigrationInterface, QueryRunner} from "typeorm";

export class allowedEmojiReactions1592829681154 implements MigrationInterface {
    name = 'allowedEmojiReactions1592829681154'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "meta" ADD "allowedEmojiReactions" character varying(128) array NOT NULL DEFAULT '{}'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "allowedEmojiReactions"`);
    }

}
