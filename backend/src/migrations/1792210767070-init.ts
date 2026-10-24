import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1792210767070 implements MigrationInterface {
  name = 'Init1792210767070';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "role" character varying NOT NULL DEFAULT 'Operator', "theme" character varying NOT NULL DEFAULT 'dark', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."todos_category_enum" AS ENUM('Work', 'Personal', 'Study', 'Health', 'Other')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."todos_priority_enum" AS ENUM('low', 'medium', 'high')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."todos_status_enum" AS ENUM('todo', 'in-progress', 'done')`,
    );
    await queryRunner.query(
      `CREATE TABLE "todos" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "category" "public"."todos_category_enum" NOT NULL DEFAULT 'Work', "priority" "public"."todos_priority_enum" NOT NULL DEFAULT 'medium', "status" "public"."todos_status_enum" NOT NULL DEFAULT 'todo', "dueDate" date, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_ca8cafd59ca6faaf67995344225" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "todos" ADD CONSTRAINT "FK_4583be7753873b4ead956f040e3" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "todos" DROP CONSTRAINT "FK_4583be7753873b4ead956f040e3"`,
    );
    await queryRunner.query(`DROP TABLE "todos"`);
    await queryRunner.query(`DROP TYPE "public"."todos_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."todos_priority_enum"`);
    await queryRunner.query(`DROP TYPE "public"."todos_category_enum"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
