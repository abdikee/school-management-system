import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

export type PermissionKey =
  | 'audit.read'
  | 'user.manage'
  | 'finance.manage'
  | 'finance.payment.record'
  | 'academic.manage'
  | 'attendance.manage'
  | 'marks.manage'
  | 'results.approve';

export const Permissions = (...permissions: PermissionKey[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
