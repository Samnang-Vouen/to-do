import { IsEmail, IsEnum, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { UserRole } from '../entities/user.entity.js';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;

    @IsEmail()
    email: string;

    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(18)
    password: string;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @IsOptional()
    @IsIn(['dark', 'light'])
    theme?: string;
}
