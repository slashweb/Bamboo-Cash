import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateWalletSet1720831305942 implements MigrationInterface {
    name = 'CreateWalletSet1720831305942'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "wallet_sets" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "walletSetId" character varying NOT NULL, CONSTRAINT "PK_aa26c383388f183068050ffb1ac" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "wallet_sets" ADD CONSTRAINT "FK_78c48e77d9e404b55cb259b072b" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallet_sets" DROP CONSTRAINT "FK_78c48e77d9e404b55cb259b072b"`);
        await queryRunner.query(`DROP TABLE "wallet_sets"`);
    }

}
