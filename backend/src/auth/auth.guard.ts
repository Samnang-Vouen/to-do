import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { ConfigType } from '@nestjs/config';
import type { Request } from 'express';
import authConfig from '../config/auth.config.js';
import { ACCESS_COOKIE } from './auth.constants.js';
import type { AccessTokenPayload } from './auth.types.js';
import { IS_PUBLIC_KEY } from './public.decorator.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly reflector: Reflector,
    @Inject(authConfig.KEY)
    private readonly config: ConfigType<typeof authConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AccessTokenPayload }>();
    const token: string | undefined = request.cookies?.[ACCESS_COOKIE];
    if (!token) throw new UnauthorizedException();

    try {
      request.user = await this.jwt.verifyAsync<AccessTokenPayload>(token, {
        secret: this.config.accessSecret,
      });
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }
}
