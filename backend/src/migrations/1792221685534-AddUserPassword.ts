import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserPassword1792221685534 implements MigrationInterface {
    name = 'AddUserPassword1792221685534'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "password" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password"`);
    }

}
