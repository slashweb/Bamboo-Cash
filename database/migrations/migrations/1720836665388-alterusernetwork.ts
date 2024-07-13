import { MigrationInterface, QueryRunner } from "typeorm";

export class Alterusernetwork1720836665388 implements MigrationInterface {
    name = 'Alterusernetwork1720836665388'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_networks" ALTER COLUMN "balance" SET DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_networks" ALTER COLUMN "balance" DROP DEFAULT`);
    }

}
