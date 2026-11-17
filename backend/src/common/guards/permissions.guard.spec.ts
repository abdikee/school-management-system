import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard';

describe('PermissionsGuard', () => {
  const prisma = {
    rolePermission: { findMany: jest.fn() },
  };
  const reflector = {
    getAllAndOverride: jest.fn(),
  } as unknown as Reflector;
  const guard = new PermissionsGuard(reflector, prisma as never);

  const context = (role: UserRole): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => ({ user: { role } }) }),
    }) as unknown as ExecutionContext;

  beforeEach(() => jest.clearAllMocks());

  it('allows a role with every required permission', async () => {
    reflector.getAllAndOverride = jest.fn().mockReturnValue(['user.manage']);
    prisma.rolePermission.findMany.mockResolvedValue([
      { permission: { key: 'user.manage' } },
    ]);

    await expect(guard.canActivate(context(UserRole.ADMIN))).resolves.toBe(true);
  });

  it('denies a role missing a required permission', async () => {
    reflector.getAllAndOverride = jest.fn().mockReturnValue(['audit.read']);
    prisma.rolePermission.findMany.mockResolvedValue([]);

    await expect(guard.canActivate(context(UserRole.STUDENT))).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
