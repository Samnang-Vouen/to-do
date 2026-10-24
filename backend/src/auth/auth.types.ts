export interface AccessTokenPayload {
  sub: number;
  email: string;
}

export interface RefreshTokenPayload {
  sub: number;
  jti: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
