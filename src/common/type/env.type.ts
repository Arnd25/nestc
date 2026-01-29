export interface IEnvConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  BASE_URL: string;

  DATABASE_URL: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_EXPRES_IN: string;
  JWT_REFRESH_EXPRES_IN: string;
  COOKIE_DOMAIN: string;
  COOKIE_SECURE: string;
  COOKIE_SAMESITE: 'strict' | 'lax' | 'none';
  UPLOAD_DIR: string;
  UPLOAD_MAX_SIZE: number;
  UPLOAD_ALLOWED_MIME_TYPES: string;
}
