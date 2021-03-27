import {MigrationInterface, QueryRunner} from "typeorm";

export class suggestionLimitationSettings1616819210942 implements MigrationInterface {
    name = 'suggestionLimitationSettings1616819210942'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "meta" ADD "emojiSuggestionLimitation" integer NOT NULL DEFAULT '10'`);
        await queryRunner.query(`ALTER TABLE "meta" ADD "emojiSuggestionLimitationPremium" integer NOT NULL DEFAULT '-1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "emojiSuggestionLimitationPremium"`);
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "emojiSuggestionLimitation"`);
    }

}
