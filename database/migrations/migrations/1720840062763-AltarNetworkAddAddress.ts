import { MigrationInterface, QueryRunner } from "typeorm";

export class AltarNetworkAddAddress1720840062763 implements MigrationInterface {
    name = 'AltarNetworkAddAddress1720840062763'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "networks" ADD "address" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "networks" DROP COLUMN "address"`);
    }

}
