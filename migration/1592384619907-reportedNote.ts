import {MigrationInterface, QueryRunner} from "typeorm";

export class reportedNote1592384619907 implements MigrationInterface {
    name = 'reportedNote1592384619907'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "reported_note" ("id" character varying(32) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "noteId" character varying(32), "reporterId" character varying(32) NOT NULL, "comment" character varying(512) NOT NULL, "noteText" character varying, "noteCw" character varying, "noteCreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "noteUserId" character varying(32) NOT NULL, CONSTRAINT "REL_5e0dac41465f05183d928c3326" UNIQUE ("noteId"), CONSTRAINT "PK_78216d5f4a672905af4fa13e9fa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_fcf16a8fbf2617b0ba8e490061" ON "reported_note" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_a3b40da4a514115a3c9580e495" ON "reported_note" ("reporterId") `);
        await queryRunner.query(`CREATE INDEX "IDX_129089bf6b01c00018a20b0ed0" ON "reported_note" ("noteUserId") `);
        await queryRunner.query(`ALTER TABLE "reported_note" ADD CONSTRAINT "FK_5e0dac41465f05183d928c33263" FOREIGN KEY ("noteId") REFERENCES "note"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reported_note" ADD CONSTRAINT "FK_a3b40da4a514115a3c9580e4954" FOREIGN KEY ("reporterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reported_note" DROP CONSTRAINT "FK_a3b40da4a514115a3c9580e4954"`);
        await queryRunner.query(`ALTER TABLE "reported_note" DROP CONSTRAINT "FK_5e0dac41465f05183d928c33263"`);
        await queryRunner.query(`DROP TABLE "reported_note"`);
    }

}
