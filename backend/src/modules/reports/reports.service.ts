import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, UserRole, InvoiceStatus, PaymentMethod, Term, AttendanceStatus, UserStatus, FeeFrequency } from '@prisma/client';

interface DateRangeParams {
  dateFrom?: Date;
  dateTo?: Date;
}

interface SchoolFilterParams {
  schoolId?: string;
}

interface AcademicYearFilterParams {
  academicYearId?: string;
}

interface ClassFilterParams {
  classId?: string;
}

interface StudentFilterParams {
  studentId?: string;
}

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // ATTENDANCE REPORTS
  // ============================================

  async getAttendanceSummary(params: {
    schoolId?: string;
    academicYearId?: string;
    classId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  } = {}) {
    const { schoolId, academicYearId, classId, dateFrom, dateTo } = params;

    const where: Prisma.AttendanceWhereInput = {};
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = dateFrom;
      if (dateTo) where.date.lte = dateTo;
    }
    if (classId) where.classId = classId;
    if (schoolId) {
      where.class = { gradeLevel: { schoolId } };
    }
    if (academicYearId) {
      where.class = { ...where.class, academicYearId } as Prisma.ClassWhereInput;
    }

    const [
      totalRecords,
      presentCount,
      absentCount,
      lateCount,
      excusedCount,
      studentCount,
      classCount,
    ] = await Promise.all([
      this.prisma.attendance.count({ where }),
      this.prisma.attendance.count({ where: { ...where, status: AttendanceStatus.PRESENT } }),
      this.prisma.attendance.count({ where: { ...where, status: AttendanceStatus.ABSENT } }),
      this.prisma.attendance.count({ where: { ...where, status: AttendanceStatus.LATE } }),
      this.prisma.attendance.count({ where: { ...where, status: AttendanceStatus.EXCUSED } }),
      this.prisma.student.count({
        where: {
          class: classId ? { id: classId } : schoolId ? { gradeLevel: { schoolId } } : undefined,
        },
      }),
      this.prisma.class.count({
        where: {
          id: classId,
          gradeLevel: schoolId ? { schoolId } : undefined,
          academicYearId: academicYearId || undefined,
        },
      }),
    ]);

    const attendanceRate = totalRecords > 0
      ? ((presentCount + lateCount + excusedCount) / totalRecords) * 100
      : 0;

    return {
      totalRecords,
      presentCount,
      absentCount,
      lateCount,
      excusedCount,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      studentCount,
      classCount,
    };
  }

  async getStudentAttendanceReport(params: {
    studentId: string;
    academicYearId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    const { studentId, academicYearId, dateFrom, dateTo } = params;

    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true, class: { include: { gradeLevel: true } } },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const where: Prisma.AttendanceWhereInput = { studentId };
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = dateFrom;
      if (dateTo) where.date.lte = dateTo;
    }
    if (academicYearId) {
      where.class = { academicYearId };
    }

    const records = await this.prisma.attendance.findMany({
      where,
      include: {
        class: { include: { gradeLevel: true } },
        subject: true,
        session: true,
        recordedBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { date: 'desc' },
    });

    const summary = records.reduce(
      (acc, record) => {
        acc[record.status]++;
        return acc;
      },
      { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0 },
    );

    const total = records.length;
    const present = summary.PRESENT + summary.LATE + summary.EXCUSED;
    const rate = total > 0 ? (present / total) * 100 : 0;

    return {
      student: { id: student.id, studentId: student.studentId, user: student.user, class: student.class },
      records,
      summary: {
        total,
        ...summary,
        attendanceRate: Math.round(rate * 100) / 100,
      },
    };
  }

  async getClassAttendanceReport(params: {
    classId: string;
    dateFrom?: Date;
    dateTo?: Date;
    subjectId?: string;
  }) {
    const { classId, dateFrom, dateTo, subjectId } = params;

    const where: Prisma.AttendanceWhereInput = { classId };
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = dateFrom;
      if (dateTo) where.date.lte = dateTo;
    }
    if (subjectId) where.subjectId = subjectId;

    const records = await this.prisma.attendance.findMany({
      where,
      include: {
        student: { include: { user: true } },
        subject: true,
        recordedBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: [{ date: 'desc' }, { student: { user: { firstName: 'asc' } } }],
    });

    const studentSummaries = new Map<
      string,
      { student: any; present: number; absent: number; late: number; excused: number; total: number }
    >();

    for (const record of records) {
      const key = record.studentId;
      if (!studentSummaries.has(key)) {
        studentSummaries.set(key, {
          student: record.student,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          total: 0,
        });
      }
      const summary = studentSummaries.get(key)!;
      summary.total++;
      summary[record.status.toLowerCase() as keyof typeof summary]++;
    }

    const summaries = Array.from(studentSummaries.values()).map((s) => ({
      ...s,
      attendanceRate:
        s.total > 0 ? Math.round(((s.present + s.late + s.excused) / s.total) * 10000) / 100 : 0,
    }));

    return {
      class: await this.prisma.class.findUnique({
        where: { id: classId },
        include: { gradeLevel: true, academicYear: true },
      }),
      records,
      studentSummaries: summaries,
    };
  }

  async getAttendanceTrends(params: {
    schoolId?: string;
    academicYearId?: string;
    classId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    groupBy: 'day' | 'week' | 'month';
  }) {
    const { schoolId, academicYearId, classId, dateFrom, dateTo, groupBy } = params;

    const where: Prisma.AttendanceWhereInput = {};
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = dateFrom;
      if (dateTo) where.date.lte = dateTo;
    }
    if (classId) where.classId = classId;
    if (schoolId) {
      where.class = { gradeLevel: { schoolId } };
    }
    if (academicYearId) {
      where.class = { ...where.class, academicYearId } as Prisma.ClassWhereInput;
    }

    const records = await this.prisma.attendance.findMany({
      where,
      select: { date: true, status: true },
    });

    const grouped = new Map<string, { present: number; absent: number; late: number; excused: number; total: number }>();

    for (const record of records) {
      let key: string;
      const date = new Date(record.date);
      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (groupBy === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!grouped.has(key)) {
        grouped.set(key, { present: 0, absent: 0, late: 0, excused: 0, total: 0 });
      }
      const g = grouped.get(key)!;
      g.total++;
      g[record.status.toLowerCase() as keyof typeof g]++;
    }

    const trends = Array.from(grouped.entries())
      .map(([date, data]) => ({
        date,
        ...data,
        attendanceRate:
          data.total > 0
            ? Math.round(((data.present + data.late + data.excused) / data.total) * 10000) / 100
            : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return { trends, groupBy };
  }

  // ============================================
  // GRADES & ACADEMIC REPORTS
  // ============================================

  async getGradeSummary(params: {
    schoolId?: string;
    academicYearId?: string;
    classId?: string;
    subjectId?: string;
    term?: Term;
  } = {}) {
    const { schoolId, academicYearId, classId, subjectId, term } = params;

    const where: Prisma.GradeWhereInput = {};
    if (classId) where.classSubjectId = classId;
    if (subjectId) where.assessment = { classSubject: { subjectId } };
    if (schoolId) {
      where.classSubject = { class: { gradeLevel: { schoolId } } };
    }
    if (academicYearId) {
      where.classSubject = { ...where.classSubject, class: { academicYearId } } as Prisma.ClassSubjectWhereInput;
    }
    if (term) {
      where.assessment = { ...where.assessment, classSubject: { class: { academicYear: { /* filter by term? */ } } } } as any;
    }

    const grades = await this.prisma.grade.findMany({
      where,
      include: {
        student: { include: { user: true, class: { include: { gradeLevel: true } } } },
        assessment: { include: { type: true, classSubject: { include: { subject: true } } } },
      },
    });

    if (grades.length === 0) {
      return { average: 0, count: 0, distribution: {}, bySubject: {}, byAssessmentType: {} };
    }

    const scores = grades.map((g) => g.score);
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;

    // Distribution by grade ranges
    const ranges = { '90-100': 0, '80-89': 0, '70-79': 0, '60-69': 0, 'Below 60': 0 };
    for (const score of scores) {
      if (score >= 90) ranges['90-100']++;
      else if (score >= 80) ranges['80-89']++;
      else if (score >= 70) ranges['70-79']++;
      else if (score >= 60) ranges['60-69']++;
      else ranges['Below 60']++;
    }

    // By subject
    const bySubject: Record<string, { count: number; sum: number }> = {};
    for (const grade of grades) {
      const subjectName = grade.assessment.classSubject.subject.name;
      if (!bySubject[subjectName]) bySubject[subjectName] = { count: 0, sum: 0 };
      bySubject[subjectName].count++;
      bySubject[subjectName].sum += grade.score;
    }
    const bySubjectAvg: Record<string, { count: number; average: number }> = {};
    for (const [name, data] of Object.entries(bySubject) as [string, { count: number; sum: number }][]) {
      bySubjectAvg[name] = { count: data.count, average: Math.round((data.sum / data.count) * 100) / 100 };
    }

    // By assessment type
    const byType: Record<string, { count: number; sum: number }> = {};
    for (const grade of grades) {
      const typeName = grade.assessment.type.name;
      if (!byType[typeName]) byType[typeName] = { count: 0, sum: 0 };
      byType[typeName].count++;
      byType[typeName].sum += grade.score;
    }
    const byTypeAvg: Record<string, { count: number; average: number }> = {};
    for (const [name, data] of Object.entries(byType) as [string, { count: number; sum: number }][]) {
      byTypeAvg[name] = { count: data.count, average: Math.round((data.sum / data.count) * 100) / 100 };
    }

    return {
      count: grades.length,
      average: Math.round(average * 100) / 100,
      distribution: ranges,
      bySubject: bySubjectAvg,
      byAssessmentType: byTypeAvg,
    };
  }

  async getStudentGradeReport(params: {
    studentId: string;
    academicYearId?: string;
    classSubjectId?: string;
    term?: Term;
  }) {
    const { studentId, academicYearId, classSubjectId, term } = params;

    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true, class: { include: { gradeLevel: true, academicYear: true } } },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const where: Prisma.GradeWhereInput = { studentId };
    if (classSubjectId) where.classSubjectId = classSubjectId;
    if (academicYearId) {
      where.classSubject = { class: { academicYearId } };
    }

    const grades = await this.prisma.grade.findMany({
      where,
      include: {
        assessment: {
          include: {
            type: true,
            classSubject: { include: { subject: true, teacher: { include: { user: true } } } },
          },
        },
      },
      orderBy: { gradedAt: 'desc' },
    });

    // Group by subject
    const bySubject = new Map<string, typeof grades>();
    for (const grade of grades) {
      const subjectName = grade.assessment.classSubject.subject.name;
      if (!bySubject.has(subjectName)) bySubject.set(subjectName, []);
      bySubject.get(subjectName)!.push(grade);
    }

    const subjectReports = Array.from(bySubject.entries()).map(([subjectName, subjectGrades]) => {
      const scores = subjectGrades.map((g) => g.score);
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      return {
        subject: subjectName,
        grades: subjectGrades.map((g) => ({
          assessment: g.assessment.name,
          type: g.assessment.type.name,
          score: g.score,
          maxScore: g.assessment.maxScore,
          percentage: Math.round((g.score / g.assessment.maxScore) * 10000) / 100,
          gradedAt: g.gradedAt,
          feedback: g.feedback,
        })),
        average: Math.round(avg * 100) / 100,
        count: subjectGrades.length,
      };
    });

    const allScores = grades.map((g) => g.score);
    const overallAvg = allScores.length > 0 ? allScores.reduce((a, b) => a + b, 0) / allScores.length : 0;

    return {
      student: { id: student.id, studentId: student.studentId, user: student.user, class: student.class },
      subjectReports,
      overall: {
        average: Math.round(overallAvg * 100) / 100,
        totalAssessments: grades.length,
      },
    };
  }

  async getClassGradeReport(params: {
    classId: string;
    subjectId?: string;
    academicYearId?: string;
    term?: Term;
  }) {
    const { classId, subjectId, academicYearId, term } = params;

    const classData = await this.prisma.class.findUnique({
      where: { id: classId },
      include: { gradeLevel: true, academicYear: true, students: { include: { user: true } } },
    });
    if (!classData) {
      throw new NotFoundException('Class not found');
    }

    const where: Prisma.GradeWhereInput = {
      classSubject: { classId },
    };
    if (subjectId) where.classSubject = { ...where.classSubject, subjectId } as Prisma.ClassSubjectWhereInput;
    if (academicYearId) where.classSubject = { ...where.classSubject, class: { academicYearId } } as Prisma.ClassSubjectWhereInput;

    const grades = await this.prisma.grade.findMany({
      where,
      include: {
        student: { include: { user: true } },
        assessment: { include: { type: true, classSubject: { include: { subject: true } } } },
      },
    });

    // Group by student
    const byStudent = new Map<string, typeof grades>();
    for (const grade of grades) {
      if (!byStudent.has(grade.studentId)) byStudent.set(grade.studentId, []);
      byStudent.get(grade.studentId)!.push(grade);
    }

    const studentReports = classData.students.map((student) => {
      const studentGrades = byStudent.get(student.id) || [];
      const scores = studentGrades.map((g) => g.score);
      const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      return {
        student: { id: student.id, studentId: student.studentId, user: student.user },
        gradeCount: studentGrades.length,
        average: Math.round(avg * 100) / 100,
      };
    });

    // Group by assessment
    const byAssessment = new Map<string, typeof grades>();
    for (const grade of grades) {
      const key = grade.assessmentId;
      if (!byAssessment.has(key)) byAssessment.set(key, []);
      byAssessment.get(key)!.push(grade);
    }

    const assessmentReports = Array.from(byAssessment.entries()).map(([assessmentId, assessmentGrades]) => {
      const assessment = assessmentGrades[0].assessment;
      const scores = assessmentGrades.map((g) => g.score);
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      return {
        assessment: { id: assessment.id, name: assessment.name, type: assessment.type.name, maxScore: assessment.maxScore },
        classAverage: Math.round(avg * 100) / 100,
        studentCount: assessmentGrades.length,
        distribution: {
          '90-100': scores.filter((s) => s >= 90).length,
          '80-89': scores.filter((s) => s >= 80 && s < 90).length,
          '70-79': scores.filter((s) => s >= 70 && s < 80).length,
          '60-69': scores.filter((s) => s >= 60 && s < 70).length,
          'Below 60': scores.filter((s) => s < 60).length,
        },
      };
    });

    return {
      class: { id: classData.id, name: classData.name, gradeLevel: classData.gradeLevel, academicYear: classData.academicYear },
      studentReports,
      assessmentReports,
    };
  }

  // ============================================
  // FINANCE REPORTS
  // ============================================

  async getFinanceDashboard(params: {
    schoolId?: string;
    academicYearId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  } = {}) {
    const { schoolId, academicYearId, dateFrom, dateTo } = params;

    const where: Prisma.InvoiceWhereInput = {};
    if (academicYearId) where.academicYearId = academicYearId;
    if (schoolId) {
      where.student = { class: { gradeLevel: { schoolId } } };
    }
    if (dateFrom || dateTo) {
      where.dueDate = {};
      if (dateFrom) where.dueDate.gte = dateFrom;
      if (dateTo) where.dueDate.lte = dateTo;
    }

    const [
      totalInvoices,
      pendingInvoices,
      overdueInvoices,
      paidInvoices,
      partialInvoices,
      totalRevenue,
      pendingRevenue,
      overdueRevenue,
      byStatus,
      byFeeStructure,
      monthlyRevenue,
      recentPayments,
    ] = await Promise.all([
      this.prisma.invoice.count({ where }),
      this.prisma.invoice.count({ where: { ...where, status: InvoiceStatus.PENDING } }),
      this.prisma.invoice.count({
        where: { ...where, status: { in: [InvoiceStatus.PENDING, InvoiceStatus.PARTIAL] }, dueDate: { lt: new Date() } },
      }),
      this.prisma.invoice.count({ where: { ...where, status: InvoiceStatus.PAID } }),
      this.prisma.invoice.count({ where: { ...where, status: InvoiceStatus.PARTIAL } }),
      this.prisma.invoice.aggregate({
        where: { ...where, status: InvoiceStatus.PAID },
        _sum: { totalAmount: true },
      }),
      this.prisma.invoice.aggregate({
        where: { ...where, status: { in: [InvoiceStatus.PENDING, InvoiceStatus.PARTIAL] } },
        _sum: { totalAmount: true },
      }),
      this.prisma.invoice.aggregate({
        where: { ...where, status: { in: [InvoiceStatus.PENDING, InvoiceStatus.PARTIAL] }, dueDate: { lt: new Date() } },
        _sum: { totalAmount: true },
      }),
      this.prisma.invoice.groupBy({
        by: ['status'],
        where,
        _count: { id: true },
        _sum: { totalAmount: true },
      }),
      this.prisma.invoice.groupBy({
        by: ['feeStructureId'],
        where,
        _count: { id: true },
        _sum: { totalAmount: true },
      }),
      this.prisma.payment.groupBy({
        by: ['paidAt'],
        where: {
          paidAt: dateFrom || dateTo ? { gte: dateFrom, lte: dateTo } : undefined,
          invoice: where,
        },
        _sum: { amount: true },
      }),
      this.prisma.payment.findMany({
        where: { invoice: where },
        orderBy: { paidAt: 'desc' },
        take: 10,
        include: {
          invoice: {
            include: {
              student: { include: { user: true } },
              feeStructure: true,
            },
          },
          recordedBy: true,
        },
      }),
    ]);

    const feeStructureDetails = await this.prisma.feeStructure.findMany({
      where: { id: { in: byFeeStructure.map((fs) => fs.feeStructureId) } },
      select: { id: true, name: true, amount: true, frequency: true },
    });

    const byFeeStructureDetailed = await Promise.all(byFeeStructure.map(async (fs) => {
      const detail = feeStructureDetails.find((f) => f.id === fs.feeStructureId);
      const invoices = await this.prisma.invoice.findMany({
        where: { ...where, feeStructureId: fs.feeStructureId },
        select: {
          totalAmount: true,
          status: true,
          dueDate: true,
          payments: { select: { amount: true } },
        },
      });
      const total = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
      const collected = invoices.reduce(
        (sum, invoice) => sum + invoice.payments.reduce((paymentSum, payment) => paymentSum + payment.amount, 0),
        0,
      );
      const overdue = invoices
        .filter(
          (invoice) =>
            (invoice.status === InvoiceStatus.PENDING || invoice.status === InvoiceStatus.PARTIAL) &&
            invoice.dueDate < new Date(),
        )
        .reduce((sum, invoice) => sum + invoice.totalAmount, 0);
      return {
        feeStructure: detail,
        count: fs._count.id,
        totalAmount: fs._sum.totalAmount ?? 0,
        total,
        collected,
        pending: Math.max(total - collected, 0),
        overdue,
      };
    }));

    // Monthly revenue aggregation
    const monthlyMap = new Map<string, number>();
    for (const payment of monthlyRevenue) {
      if (!payment.paidAt) continue;
      const month = payment.paidAt.toISOString().slice(0, 7);
      monthlyMap.set(month, (monthlyMap.get(month) || 0) + (payment._sum.amount ?? 0));
    }
    const monthlyRevenueArray = Array.from(monthlyMap.entries())
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      totalRevenue: totalRevenue._sum.totalAmount ?? 0,
      pendingAmount: pendingRevenue._sum.totalAmount ?? 0,
      overdueAmount: overdueRevenue._sum.totalAmount ?? 0,
      collectedAmount: totalRevenue._sum.totalAmount ?? 0,
      recentPayments,
      invoices: {
        total: totalInvoices,
        pending: pendingInvoices,
        overdue: overdueInvoices,
        paid: paidInvoices,
        partial: partialInvoices,
      },
      revenue: {
        collected: totalRevenue._sum.totalAmount ?? 0,
        pending: pendingRevenue._sum.totalAmount ?? 0,
        overdue: overdueRevenue._sum.totalAmount ?? 0,
      },
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count.id, totalAmount: s._sum.totalAmount ?? 0 })),
      byFeeStructure: byFeeStructureDetailed,
      monthlyRevenue: monthlyRevenueArray,
    };
  }

  async getFeeCollectionReport(params: {
    schoolId?: string;
    academicYearId?: string;
    feeStructureId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  } = {}) {
    const { schoolId, academicYearId, feeStructureId, dateFrom, dateTo } = params;

    const where: Prisma.InvoiceWhereInput = {};
    if (academicYearId) where.academicYearId = academicYearId;
    if (feeStructureId) where.feeStructureId = feeStructureId;
    if (schoolId) {
      where.student = { class: { gradeLevel: { schoolId } } };
    }
    if (dateFrom || dateTo) {
      where.dueDate = {};
      if (dateFrom) where.dueDate.gte = dateFrom;
      if (dateTo) where.dueDate.lte = dateTo;
    }

    const invoices = await this.prisma.invoice.findMany({
      where,
      include: {
        student: { include: { user: true, class: { include: { gradeLevel: true } } } },
        parent: { include: { user: true } },
        feeStructure: true,
        payments: { orderBy: { paidAt: 'desc' } },
      },
      orderBy: { dueDate: 'asc' },
    });

    const report = invoices.map((invoice) => {
      const paidAmount = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
      const outstanding = invoice.totalAmount - paidAmount;
      return {
        invoice: {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          dueDate: invoice.dueDate,
          status: invoice.status,
        },
        student: {
          id: invoice.student.id,
          studentId: invoice.student.studentId,
          name: `${invoice.student.user.firstName} ${invoice.student.user.lastName}`,
          class: invoice.student.class?.name,
        },
        parent: invoice.parent
          ? {
              id: invoice.parent.id,
              name: `${invoice.parent.user.firstName} ${invoice.parent.user.lastName}`,
            }
          : null,
        feeStructure: { name: invoice.feeStructure.name, frequency: invoice.feeStructure.frequency },
        amount: invoice.totalAmount,
        paidAmount,
        outstanding,
        paymentCount: invoice.payments.length,
        lastPaymentDate: invoice.payments[0]?.paidAt || null,
      };
    });

    const totalInvoiced = report.reduce((sum, r) => sum + r.amount, 0);
    const totalCollected = report.reduce((sum, r) => sum + r.paidAmount, 0);
    const totalOutstanding = report.reduce((sum, r) => sum + r.outstanding, 0);

    return {
      summary: { totalInvoiced, totalCollected, totalOutstanding, collectionRate: totalInvoiced > 0 ? (totalCollected / totalInvoiced) * 100 : 0 },
      invoices: report,
    };
  }

  // ============================================
  // ENROLLMENT & DEMOGRAPHIC REPORTS
  // ============================================

  async getEnrollmentReport(params: {
    schoolId?: string;
    academicYearId?: string;
    gradeLevelId?: string;
  } = {}) {
    const { schoolId, academicYearId, gradeLevelId } = params;

    const where: Prisma.StudentWhereInput = { status: UserStatus.ACTIVE };
    if (schoolId) where.class = { gradeLevel: { schoolId } };
    if (academicYearId) where.class = { ...where.class, academicYearId } as Prisma.ClassWhereInput;
    if (gradeLevelId) where.gradeLevelId = gradeLevelId;

    const [
      totalStudents,
      byGradeLevel,
      byGender,
      byClass,
      newEnrollments,
      withdrawn,
    ] = await Promise.all([
      this.prisma.student.count({ where }),
      this.prisma.student.groupBy({
        by: ['gradeLevelId'],
        where,
        _count: { id: true },
      }),
      this.prisma.student.groupBy({
        by: ['gender'],
        where,
        _count: { id: true },
      }),
      this.prisma.student.groupBy({
        by: ['classId'],
        where: { ...where, classId: { not: null } },
        _count: { id: true },
      }),
      this.prisma.student.count({
        where: { ...where, enrollmentDate: { gte: new Date(new Date().getFullYear(), 0, 1) } },
      }),
      this.prisma.student.count({ where: { ...where, status: UserStatus.INACTIVE } }),
    ]);

    const gradeLevelDetails = await this.prisma.gradeLevel.findMany({
      where: { id: { in: byGradeLevel.map((g) => g.gradeLevelId).filter((id): id is string => id !== null) } },
      select: { id: true, name: true, order: true },
    });

    const classDetails = await this.prisma.class.findMany({
      where: { id: { in: byClass.map((c) => c.classId!).filter(Boolean) } },
      select: { id: true, name: true, gradeLevel: { select: { name: true } }, capacity: true },
    });

    return {
      totalStudents,
      newEnrollmentsThisYear: newEnrollments,
      withdrawnStudents: withdrawn,
      byGradeLevel: byGradeLevel.map((g) => ({
        gradeLevel: gradeLevelDetails.find((gl) => gl.id === g.gradeLevelId),
        count: g._count.id,
      })),
      byGender: byGender.map((g) => ({ gender: g.gender, count: g._count.id })),
      byClass: byClass.map((c) => {
        const detail = classDetails.find((cl) => cl.id === c.classId);
        return {
          class: detail,
          count: c._count.id,
          capacity: detail?.capacity || 0,
          utilization: detail?.capacity ? (c._count.id / detail.capacity) * 100 : 0,
        };
      }),
    };
  }

  async getTeacherWorkloadReport(params: {
    schoolId?: string;
    academicYearId?: string;
  } = {}) {
    const { schoolId, academicYearId } = params;

    const where: Prisma.TimetableEntryWhereInput = {};
    if (schoolId) where.class = { gradeLevel: { schoolId } };
    if (academicYearId) where.class = { ...where.class, academicYearId } as Prisma.ClassWhereInput;

    const entries = await this.prisma.timetableEntry.findMany({
      where,
      include: {
        teacher: { include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } } },
        subject: { select: { id: true, name: true, code: true } },
        class: { select: { id: true, name: true, gradeLevel: { select: { name: true } } } },
      },
    });

    const teacherMap = new Map<
      string,
      { teacher: any; hours: number; subjects: Set<string>; classes: Set<string>; entries: any[] }
    >();

    for (const entry of entries) {
      if (!entry.teacher) continue;
      const key = entry.teacher.id;
      if (!teacherMap.has(key)) {
        teacherMap.set(key, {
          teacher: entry.teacher,
          hours: 0,
          subjects: new Set(),
          classes: new Set(),
          entries: [],
        });
      }
      const t = teacherMap.get(key)!;
      const start = entry.startTime.split(':').map(Number);
      const end = entry.endTime.split(':').map(Number);
      const duration = (end[0] * 60 + end[1] - (start[0] * 60 + start[1])) / 60;
      t.hours += duration;
      t.subjects.add(entry.subject.name);
      t.classes.add(entry.class.name);
      t.entries.push(entry);
    }

    const report = Array.from(teacherMap.values()).map((t) => ({
      teacher: { id: t.teacher.id, user: t.teacher.user },
      weeklyHours: Math.round(t.hours * 100) / 100,
      subjectCount: t.subjects.size,
      classCount: t.classes.size,
      subjects: Array.from(t.subjects),
      classes: Array.from(t.classes),
    }));

    return { teachers: report, totalTeachers: report.length };
  }

  // ============================================
  // EXPORT FUNCTIONALITY
  // ============================================

  async exportReportToCSV(data: any[], headers: string[]): Promise<string> {
    if (data.length === 0) return headers.join(',') + '\n';

    const rows = data.map((item) =>
      headers.map((header) => {
        const value = header.split('.').reduce((obj, key) => obj?.[key], item);
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }),
    );

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  async getDashboardOverview(params: { schoolId?: string; academicYearId?: string } = {}) {
    const { schoolId, academicYearId } = params;

    const [
      studentCount,
      teacherCount,
      classCount,
      subjectCount,
      attendanceSummary,
      financeSummary,
      recentEnrollments,
      pendingInvoices,
      unreadNotifications,
    ] = await Promise.all([
      this.prisma.student.count({
        where: { status: UserStatus.ACTIVE, class: schoolId ? { gradeLevel: { schoolId } } : undefined },
      }),
      this.prisma.teacher.count({
        where: { user: { schoolId } },
      }),
      this.prisma.class.count({
        where: { gradeLevel: schoolId ? { schoolId } : undefined, academicYearId: academicYearId || undefined },
      }),
      this.prisma.subject.count({
        where: { gradeLevel: schoolId ? { schoolId } : undefined },
      }),
      this.getAttendanceSummary({ schoolId, academicYearId, dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }),
      this.getFinanceDashboard({ schoolId, academicYearId }),
      this.prisma.student.findMany({
        where: { enrollmentDate: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, status: UserStatus.ACTIVE },
        include: { user: { select: { firstName: true, lastName: true } }, class: { select: { name: true } } },
        orderBy: { enrollmentDate: 'desc' },
        take: 10,
      }),
      this.prisma.invoice.count({
        where: {
          status: { in: [InvoiceStatus.PENDING, InvoiceStatus.OVERDUE] },
          student: schoolId ? { class: { gradeLevel: { schoolId } } } : undefined,
        },
      }),
      this.prisma.notification.count({ where: { isRead: false, user: { schoolId } } }),
    ]);

    return {
      counts: { students: studentCount, teachers: teacherCount, classes: classCount, subjects: subjectCount },
      attendance: { rate: attendanceSummary.attendanceRate, records: attendanceSummary.totalRecords },
      finance: {
        revenue: financeSummary.revenue.collected,
        pending: financeSummary.revenue.pending,
        overdue: financeSummary.revenue.overdue,
        pendingInvoices,
      },
      recentEnrollments,
      unreadNotifications,
    };
  }
}