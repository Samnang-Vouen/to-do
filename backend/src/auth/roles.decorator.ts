import { Reflector } from '@nestjs/core';
import { UserRole } from '../users/entities/user.entity.js';

export const Roles = Reflector.createDecorator<UserRole[]>();