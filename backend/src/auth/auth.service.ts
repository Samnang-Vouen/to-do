import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import type { ConfigType } from '@nestjs/config';
import * as argon2 from 'argon2';
import { Repository } from 'typeorm';
import authConfig from '../config/auth.config.js';
import { UsersService } from '../users/users.service.js';
import type {
  AccessTokenPayload,
  AuthTokens,
  RefreshTokenPayload,
} from './auth.types.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { RefreshToken } from './entities/refresh-token.entity.js';
import { User } from '../users/entities/user.entity.js';

@Injectable()
export class AuthService {
  // Checked when the email is unknown, so response time doesn't reveal which emails exist
  private readonly dummyHash = argon2.hash('dummy-password');

  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokens: Repository<RefreshToken>,
    @Inject(authConfig.KEY)
    private readonly config: ConfigType<typeof authConfig>,
  ) {}

  async register(dto: RegisterDto): Promise<AuthTokens> {
    const user = await this.users.create(dto);
    return this.issueTokens(user);
  }

  async login(dto: LoginDto): Promise<AuthTokens> {
    const user = await this.users.findByEmailWithPassword(dto.email);
    const hash = user?.password ?? (await this.dummyHash);
    // verify() throws on a malformed hash (e.g. an old plain-text password)
    const valid = await argon2.verify(hash, dto.password).catch(() => false);
    if (!user || !valid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.issueTokens(user);
  }

  async refresh(token: string | undefined): Promise<AuthTokens> {
    const payload = await this.verifyRefreshToken(token);
    const result = await this.refreshTokens.delete({
      id: payload.jti,
      userId: payload.sub,
    });
    if (!result.affected) {
      // Valid signature but already used or revoked: assume it was stolen, sign out everywhere
      await this.refreshTokens.delete({ userId: payload.sub });
      throw new UnauthorizedException();
    }
    const user = await this.users.findOne(payload.sub);
    return this.issueTokens(user);
  }

  async logout(token: string | undefined): Promise<void> {
    try {
      const payload = await this.verifyRefreshToken(token);
      await this.refreshTokens.delete({ id: payload.jti });
    } catch {
      // Missing or expired token: nothing to revoke
    }
  }

  private async verifyRefreshToken(token: string | undefined) {
    if (!token) throw new UnauthorizedException();
    try {
      return await this.jwt.verifyAsync<RefreshTokenPayload>(token, {
        secret: this.config.refreshSecret,
      });
    } catch {
      throw new UnauthorizedException();
    }
  }

  private async issueTokens(
    user: Pick<User, 'id' | 'email' | 'role'>
  ): Promise<AuthTokens> {
    const { id } = await this.refreshTokens.save(
      this.refreshTokens.create({
        userId: user.id,
        expiresAt: new Date(Date.now() + this.config.refreshTtl * 1000),
      }),
    );
    const accessPayload: AccessTokenPayload = { sub: user.id, email: user.email, role: user.role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(accessPayload, {
        secret: this.config.accessSecret,
        expiresIn: this.config.accessTtl,
      }),
      this.jwt.signAsync(
        { sub: user.id },
        {
          secret: this.config.refreshSecret,
          expiresIn: this.config.refreshTtl,
          jwtid: id,
        },
      ),
    ]);
    return { accessToken, refreshToken };
  }
}
