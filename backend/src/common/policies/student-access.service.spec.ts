import { ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { StudentAccessService } from './student-access.service';

describe('StudentAccessService', () => {
  const prisma = {
    teacher: { findFirst: jest.fn() },
    student: { findFirst: jest.fn() },
    parent: { findFirst: jest.fn() },
    invoice: { findUnique: jest.fn() },
    payment: { findUnique: jest.fn() },
    grade: { findUnique: jest.fn() },
    reportCard: { findUnique: jest.fn() },
  };
  const service = new StudentAccessService(prisma as never);

  beforeEach(() => jest.clearAllMocks());

  it('allows a parent to access a linked child', async () => {
    prisma.parent.findFirst.mockResolvedValue({ id: 'parent-1' });

    await expect(
      service.assertCanAccessStudent('user-1', UserRole.PARENT, 'student-1'),
    ).resolves.toBeUndefined();
  });

  it('rejects a parent without a child link', async () => {
    prisma.parent.findFirst.mockResolvedValue(null);

    await expect(
      service.assertCanAccessStudent('user-1', UserRole.PARENT, 'student-2'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows a student to access only their own record', async () => {
    prisma.student.findFirst.mockResolvedValue({ id: 'student-1' });

    await expect(
      service.assertCanAccessStudent('user-1', UserRole.STUDENT, 'student-1'),
    ).resolves.toBeUndefined();
  });

  it('rejects a teacher outside assigned classes', async () => {
    prisma.teacher.findFirst.mockResolvedValue(null);

    await expect(
      service.assertCanAccessStudent('teacher-user', UserRole.TEACHER, 'student-1'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
