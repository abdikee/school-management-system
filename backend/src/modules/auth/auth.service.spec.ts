import { UnauthorizedException } from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    loginAttempt: { create: jest.fn() },
    refreshToken: {
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
    },
    auditLog: { create: jest.fn() },
    $transaction: jest.fn(),
  };
  const jwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };
  const configService = {
    get: jest.fn(),
  };
  const service = new AuthService(
    prisma as never,
    jwtService as never,
    configService as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    configService.get.mockImplementation((key: string) => {
      if (key === 'auth.maxFailedLoginAttempts') return 5;
      if (key === 'auth.lockoutMinutes') return 15;
      return undefined;
    });
  });

  it('validates an active user and records a successful login', async () => {
    const user = {
      id: 'user-1',
      email: 'teacher@example.test',
      passwordHash: 'hash',
      firstName: 'Test',
      lastName: 'Teacher',
      role: UserRole.TEACHER,
      status: UserStatus.ACTIVE,
      lockedUntil: null,
    };
    prisma.user.findUnique.mockResolvedValue(user);
    prisma.user.update.mockResolvedValue(user);
    prisma.loginAttempt.create.mockResolvedValue({});
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await service.validateUser('teacher@example.test', 'password');

    expect(result).toEqual(expect.objectContaining({ id: 'user-1' }));
    expect(result.passwordHash).toBeUndefined();
    expect(prisma.loginAttempt.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ successful: true, userId: 'user-1' }),
      }),
    );
  });

  it('rejects an invalid password and increments the failed-login count', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'teacher@example.test',
      passwordHash: 'hash',
      status: UserStatus.ACTIVE,
      lockedUntil: null,
    });
    prisma.user.update.mockResolvedValue({ failedLoginCount: 1 });
    prisma.loginAttempt.create.mockResolvedValue({});
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.validateUser('teacher@example.test', 'wrong-password'),
    ).resolves.toBeNull();

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { failedLoginCount: { increment: 1 } },
      }),
    );
    expect(prisma.loginAttempt.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ successful: false, failureReason: 'INVALID_PASSWORD' }),
      }),
    );
  });

  it('rejects inactive accounts before checking the password', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'pending@example.test',
      passwordHash: 'hash',
      status: UserStatus.PENDING,
      lockedUntil: null,
    });
    prisma.loginAttempt.create.mockResolvedValue({});

    await expect(
      service.validateUser('pending@example.test', 'password'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it('revokes sessions and records a password-reset audit event', async () => {
    jwtService.verify.mockReturnValue({ sub: 'user-1', type: 'password-reset' });
    (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');
    prisma.user.update.mockResolvedValue({});
    prisma.refreshToken.updateMany.mockResolvedValue({ count: 1 });
    prisma.auditLog.create.mockResolvedValue({});

    await service.resetPassword('reset-token', 'new-password');

    expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1', revokedAt: null } }),
    );
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        action: 'PASSWORD_RESET',
        entity: 'User',
        entityId: 'user-1',
        newData: { status: 'completed' },
      },
    });
  });

  it('rejects an invalid reset token', async () => {
    jwtService.verify.mockImplementation(() => {
      throw new Error('expired');
    });

    await expect(
      service.resetPassword('expired-token', 'new-password'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('rejects an expired refresh token', async () => {
    prisma.refreshToken.findUnique.mockResolvedValue({
      id: 'refresh-1',
      token: 'expired-token',
      revokedAt: null,
      expiresAt: new Date(Date.now() - 1_000),
      user: { id: 'user-1', status: UserStatus.ACTIVE },
    });

    await expect(service.refreshTokens('expired-token')).rejects.toThrow(
      'Refresh token has expired',
    );
    expect(prisma.refreshToken.update).not.toHaveBeenCalled();
  });

  it('rejects a revoked refresh token', async () => {
    prisma.refreshToken.findUnique.mockResolvedValue({
      id: 'refresh-1',
      token: 'revoked-token',
      revokedAt: new Date(),
      expiresAt: new Date(Date.now() + 60_000),
      user: { id: 'user-1', status: UserStatus.ACTIVE },
    });

    await expect(service.refreshTokens('revoked-token')).rejects.toThrow(
      'Refresh token has been revoked',
    );
    expect(prisma.refreshToken.update).not.toHaveBeenCalled();
  });

  it('rotates a valid refresh token and revokes the old token', async () => {
    prisma.refreshToken.findUnique.mockResolvedValue({
      id: 'refresh-1',
      token: 'valid-token',
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      user: {
        id: 'user-1',
        email: 'teacher@example.test',
        firstName: 'Test',
        lastName: 'Teacher',
        role: UserRole.TEACHER,
        status: UserStatus.ACTIVE,
      },
    });
    prisma.refreshToken.update.mockResolvedValue({});
    prisma.refreshToken.create.mockResolvedValue({});
    jwtService.sign
      .mockReturnValueOnce('new-access-token')
      .mockReturnValueOnce('new-refresh-token');
    configService.get.mockImplementation((key: string) => {
      if (key === 'jwt.refreshSecret') return 'refresh-secret';
      if (key === 'jwt.refreshExpiresIn') return '7d';
      return undefined;
    });

    await expect(service.refreshTokens('valid-token')).resolves.toEqual(
      expect.objectContaining({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        user: expect.objectContaining({ id: 'user-1', role: UserRole.TEACHER }),
      }),
    );
    expect(prisma.refreshToken.update).toHaveBeenCalledWith({
      where: { id: 'refresh-1' },
      data: { revokedAt: expect.any(Date) },
    });
    expect(prisma.refreshToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          token: 'new-refresh-token',
          userId: 'user-1',
          expiresAt: expect.any(Date),
        }),
      }),
    );
  });
});
