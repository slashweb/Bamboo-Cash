import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialEntities1720822165853 implements MigrationInterface {
    name = 'InitialEntities1720822165853'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "bank_accounts" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "name" character varying NOT NULL, "clabe" character varying NOT NULL, CONSTRAINT "PK_c872de764f2038224a013ff25ed" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "networks" ("id" SERIAL NOT NULL, "chanId" character varying NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_61b1ee921bf79550d9d4742b9f7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_networks" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "networkId" integer NOT NULL, "balance" character varying NOT NULL, CONSTRAINT "PK_275dcf81bd134cf77ebf6290665" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "phone" character varying(15) NOT NULL, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "bank_accounts" ADD CONSTRAINT "FK_45ef3ca170943e2c70e8073a7c5" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_networks" ADD CONSTRAINT "FK_17fd1a865f78d0fe4c36e0644fe" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_networks" ADD CONSTRAINT "FK_ed29fb980b85ab5d1a055ef118d" FOREIGN KEY ("networkId") REFERENCES "networks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_networks" DROP CONSTRAINT "FK_ed29fb980b85ab5d1a055ef118d"`);
        await queryRunner.query(`ALTER TABLE "user_networks" DROP CONSTRAINT "FK_17fd1a865f78d0fe4c36e0644fe"`);
        await queryRunner.query(`ALTER TABLE "bank_accounts" DROP CONSTRAINT "FK_45ef3ca170943e2c70e8073a7c5"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "user_networks"`);
        await queryRunner.query(`DROP TABLE "networks"`);
        await queryRunner.query(`DROP TABLE "bank_accounts"`);
    }

}
