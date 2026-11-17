import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || 'api',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  throttleLimit: parseInt(process.env.THROTTLE_DEFAULT_LIMIT || '100', 10),
  throttleTtlMs: parseInt(process.env.THROTTLE_DEFAULT_TTL_MS || '60000', 10),
  upload: {
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '5242880', 10),
    dest: process.env.UPLOAD_DEST || './uploads',
  },
}));