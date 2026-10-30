import { UserRole } from "../users/entities/user.entity.js";

export interface AccessTokenPayload {
  sub: number;
  email: string;
  role: UserRole
}

export interface RefreshTokenPayload {
  sub: number;
  jti: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
