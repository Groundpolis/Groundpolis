import {MigrationInterface, QueryRunner} from "typeorm";

export class reportedNote21592386009696 implements MigrationInterface {
    name = 'reportedNote21592386009696'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reported_note" DROP CONSTRAINT "FK_5e0dac41465f05183d928c33263"`);
        await queryRunner.query(`ALTER TABLE "reported_note" DROP CONSTRAINT "REL_5e0dac41465f05183d928c3326"`);
        await queryRunner.query(`ALTER TABLE "reported_note" ADD CONSTRAINT "FK_5e0dac41465f05183d928c33263" FOREIGN KEY ("noteId") REFERENCES "note"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reported_note" DROP CONSTRAINT "FK_5e0dac41465f05183d928c33263"`);
        await queryRunner.query(`ALTER TABLE "reported_note" ADD CONSTRAINT "REL_5e0dac41465f05183d928c3326" UNIQUE ("noteId")`);
        await queryRunner.query(`ALTER TABLE "reported_note" ADD CONSTRAINT "FK_5e0dac41465f05183d928c33263" FOREIGN KEY ("noteId") REFERENCES "note"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
