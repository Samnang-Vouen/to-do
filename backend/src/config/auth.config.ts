import { registerAs } from '@nestjs/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
}

export default registerAs('auth', () => ({
  accessSecret: required('JWT_ACCESS_SECRET'),
  accessTtl: parseInt(process.env.JWT_ACCESS_TTL ?? '900', 10), // seconds
  refreshSecret: required('JWT_REFRESH_SECRET'),
  refreshTtl: parseInt(process.env.JWT_REFRESH_TTL ?? '604800', 10), // seconds
  secureCookies: process.env.NODE_ENV === 'production',
}));
