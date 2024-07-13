import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateContacts1720864996411 implements MigrationInterface {
    name = 'CreateContacts1720864996411'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "contacts" ("id" SERIAL NOT NULL, "ownerId" integer NOT NULL, "phone" character varying NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_b99cd40cfd66a99f1571f4f72e6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "contacts" ADD CONSTRAINT "FK_270a85b7f2d4b6821dc7642e6a8" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contacts" DROP CONSTRAINT "FK_270a85b7f2d4b6821dc7642e6a8"`);
        await queryRunner.query(`DROP TABLE "contacts"`);
    }

}
