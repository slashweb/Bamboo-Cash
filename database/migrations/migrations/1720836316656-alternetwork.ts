import { MigrationInterface, QueryRunner } from "typeorm";

export class Alternetwork1720836316656 implements MigrationInterface {
    name = 'Alternetwork1720836316656'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "networks" RENAME COLUMN "chanId" TO "chainId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "networks" RENAME COLUMN "chainId" TO "chanId"`);
    }

}
