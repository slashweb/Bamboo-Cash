import { MigrationInterface, QueryRunner } from "typeorm";

export class Alterusernetwork1720859531607 implements MigrationInterface {
    name = 'Alterusernetwork1720859531607'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_networks" ADD "originalId" character varying(1024) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_networks" DROP COLUMN "originalId"`);
    }

}
