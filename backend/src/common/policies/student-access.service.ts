import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StudentAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async assertCanAccessStudent(
    userId: string,
    role: UserRole,
    studentId: string,
  ): Promise<void> {
    if (role === UserRole.ADMIN || role === UserRole.CASHIER) {
      return;
    }

    if (role === UserRole.TEACHER) {
      const teacher = await this.prisma.teacher.findFirst({
        where: {
          userId,
          OR: [
            { homeroomClasses: { some: { students: { some: { id: studentId } } } } },
            { classSubjects: { some: { class: { students: { some: { id: studentId } } } } } },
          ],
        },
        select: { id: true },
      });
      if (teacher) return;
    }

    if (role === UserRole.STUDENT) {
      const student = await this.prisma.student.findFirst({
        where: { id: studentId, userId },
        select: { id: true },
      });
      if (student) return;
    }

    if (role === UserRole.PARENT) {
      const parent = await this.prisma.parent.findFirst({
        where: {
          userId,
          OR: [
            { students: { some: { id: studentId } } },
            { parentRelations: { some: { studentId } } },
          ],
        },
        select: { id: true },
      });
      if (parent) return;
    }

    throw new ForbiddenException('You do not have access to this student record');
  }

  async assertCanAccessInvoice(userId: string, role: UserRole, invoiceId: string): Promise<void> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: { studentId: true },
    });
    if (!invoice) {
      throw new ForbiddenException('You do not have access to this invoice');
    }
    await this.assertCanAccessStudent(userId, role, invoice.studentId);
  }

  async assertCanAccessPayment(userId: string, role: UserRole, paymentId: string): Promise<void> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      select: { invoice: { select: { studentId: true } } },
    });
    if (!payment) {
      throw new ForbiddenException('You do not have access to this payment');
    }
    await this.assertCanAccessStudent(userId, role, payment.invoice.studentId);
  }

  async assertCanAccessGrade(userId: string, role: UserRole, gradeId: string): Promise<void> {
    const grade = await this.prisma.grade.findUnique({
      where: { id: gradeId },
      select: { studentId: true },
    });
    if (!grade) {
      throw new ForbiddenException('You do not have access to this grade');
    }
    await this.assertCanAccessStudent(userId, role, grade.studentId);
  }

  async assertCanAccessReportCard(
    userId: string,
    role: UserRole,
    reportCardId: string,
  ): Promise<void> {
    const reportCard = await this.prisma.reportCard.findUnique({
      where: { id: reportCardId },
      select: { studentId: true },
    });
    if (!reportCard) {
      throw new ForbiddenException('You do not have access to this report card');
    }
    await this.assertCanAccessStudent(userId, role, reportCard.studentId);
  }
}
