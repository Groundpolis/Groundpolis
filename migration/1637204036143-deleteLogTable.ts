import {MigrationInterface, QueryRunner} from "typeorm";

export class deleteLogTable1637204036143 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
			await queryRunner.query(`DROP TABLE log`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
