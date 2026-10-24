import {
    Body,
    Controller,
    Get,
    HttpCode,
    Inject,
    Post,
    Req,
    Res,
    UseGuards,
    } from '@nestjs/common';
    import type { ConfigType } from '@nestjs/config';
    import { ThrottlerGuard } from '@nestjs/throttler';
    import type { CookieOptions, Request, Response } from 'express';
    import authConfig from '../config/auth.config.js';
    import { UsersService } from '../users/users.service.js';
    import { ACCESS_COOKIE, REFRESH_COOKIE } from './auth.constants.js';
    import { AuthService } from './auth.service.js';
    import type { AccessTokenPayload, AuthTokens } from './auth.types.js';
    import { CurrentUser } from './current-user.decorator.js';
    import { LoginDto } from './dto/login.dto.js';
    import { RegisterDto } from './dto/register.dto.js';
    import { Public } from './public.decorator.js';

    @Controller('auth')
    export class AuthController {
    constructor(
        private readonly auth: AuthService,
        private readonly users: UsersService,
        @Inject(authConfig.KEY)
        private readonly config: ConfigType<typeof authConfig>,
    ) {}

    @Public()
    @UseGuards(ThrottlerGuard)
    @HttpCode(204)
    @Post('register')
    async register(
        @Body() dto: RegisterDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        this.setCookies(res, await this.auth.register(dto));
    }

    @Public()
    @UseGuards(ThrottlerGuard)
    @HttpCode(204)
    @Post('login')
    async login(
        @Body() dto: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        this.setCookies(res, await this.auth.login(dto));
    }

    @Public()
    @HttpCode(204)
    @Post('refresh')
    async refresh(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        this.setCookies(res, await this.auth.refresh(req.cookies[REFRESH_COOKIE]));
    }

    @Public()
    @HttpCode(204)
    @Post('logout')
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        await this.auth.logout(req.cookies[REFRESH_COOKIE]);
        res.clearCookie(ACCESS_COOKIE, this.cookieOptions('/'));
        res.clearCookie(REFRESH_COOKIE, this.cookieOptions('/auth'));
    }

    @Get('me')
    me(@CurrentUser() user: AccessTokenPayload) {
        return this.users.findOne(user.sub);
    }

    private setCookies(res: Response, tokens: AuthTokens) {
        res.cookie(ACCESS_COOKIE, tokens.accessToken, {
        ...this.cookieOptions('/'),
        maxAge: this.config.accessTtl * 1000,
        });
        res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
        ...this.cookieOptions('/auth'), // only sent to /auth/refresh and /auth/logout
        maxAge: this.config.refreshTtl * 1000,
        });
    }

    private cookieOptions(path: string): CookieOptions {
        return {
        httpOnly: true,
        secure: this.config.secureCookies,
        sameSite: 'lax',
        path,
        };
    }
}
