import { MigrationInterface, QueryRunner } from "typeorm";

export class Alterusernetwork1720834674007 implements MigrationInterface {
    name = 'Alterusernetwork1720834674007'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_networks" ADD "address" character varying(1024) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_networks" DROP COLUMN "address"`);
    }

}
