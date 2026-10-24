import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUsers1792222199005 implements MigrationInterface {
  name = 'UpdateUsers1792222199005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "role" character varying NOT NULL DEFAULT 'Operator'`,
    );
  }
}
