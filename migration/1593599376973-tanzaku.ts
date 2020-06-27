import {MigrationInterface, QueryRunner} from "typeorm";

export class tanzaku1593599376973 implements MigrationInterface {
    name = 'tanzaku1593599376973'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "note" ADD "tanabataYear" integer`);
        await queryRunner.query(`CREATE TYPE "note_tanzakucolor_enum" AS ENUM('purple', 'red', 'white', 'yellow', 'blue')`);
        await queryRunner.query(`ALTER TABLE "note" ADD "tanzakuColor" "note_tanzakucolor_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "note" DROP COLUMN "tanzakuColor"`);
        await queryRunner.query(`DROP TYPE "note_tanzakucolor_enum"`);
        await queryRunner.query(`ALTER TABLE "note" DROP COLUMN "tanabataYear"`);
    }

}
