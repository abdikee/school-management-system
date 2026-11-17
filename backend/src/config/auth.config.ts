import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  maxFailedLoginAttempts: parseInt(process.env.AUTH_MAX_FAILED_LOGIN_ATTEMPTS || '5', 10),
  lockoutMinutes: parseInt(process.env.AUTH_LOCKOUT_MINUTES || '15', 10),
  inactivityMinutes: parseInt(process.env.AUTH_INACTIVITY_MINUTES || '30', 10),
}));
