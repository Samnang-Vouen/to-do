import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { AuthGuard } from './auth.guard.js';
import { AuthService } from './auth.service.js';
import { RefreshToken } from './entities/refresh-token.entity.js';
import { RolesGuard } from './roles.guard.js';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([RefreshToken]),
    // Secrets are passed per call: access and refresh tokens use different ones
    JwtModule.register({}),
    // 5 attempts per minute per IP, applied where ThrottlerGuard is used
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 5 }]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    { provide: APP_GUARD, useClass: AuthGuard },
    {provide: APP_GUARD, useClass: RolesGuard}
  ],
})
export class AuthModule {}
