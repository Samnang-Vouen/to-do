import { PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from '../../users/dto/create-user.dto.js';

// No `role`: users can't register themselves as admin
export class RegisterDto extends PickType(CreateUserDto, [
  'name',
  'email',
  'password',
] as const) {}
