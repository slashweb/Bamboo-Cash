import { MigrationInterface, QueryRunner } from "typeorm";

export class AltarTransaction1720893131435 implements MigrationInterface {
    name = 'AltarTransaction1720893131435'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "transactions" ("id" SERIAL NOT NULL, "threadId" character varying NOT NULL, "fromId" integer NOT NULL, "toId" integer, "userNetworkId" integer, "amount" integer, "status" character varying NOT NULL DEFAULT 'created', CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_0697b5941a6016ab531b156049e" FOREIGN KEY ("fromId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_8f7e03be67a425cce6663b36255" FOREIGN KEY ("toId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_c755c26f924880583946795d91a" FOREIGN KEY ("userNetworkId") REFERENCES "user_networks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_c755c26f924880583946795d91a"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_8f7e03be67a425cce6663b36255"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_0697b5941a6016ab531b156049e"`);
        await queryRunner.query(`DROP TABLE "transactions"`);
    }

}
