import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { AccessTokenPayload } from './auth.types.js';
import { Roles } from './roles.decorator.js';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const roles = this.reflector.getAllAndOverride(Roles, [
        context.getHandler(),
        context.getClass(),
        ]);
        if (!roles) return true; // no @Roles(): any signed-in user

        const { user } = context
        .switchToHttp()
        .getRequest<Request & { user?: AccessTokenPayload }>();
        return !!user && roles.includes(user.role); // false → 403 Forbidden
    }
}
