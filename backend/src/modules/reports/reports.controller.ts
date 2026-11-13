import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';

import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, Term } from '@prisma/client';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  // ============================================
  // DASHBOARD OVERVIEW
  // ============================================

  @Get('dashboard')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get admin dashboard overview' })
  @ApiQuery({ name: 'schoolId', required: false, type: String })
  @ApiQuery({ name: 'academicYearId', required: false, type: String })
  async getDashboardOverview(
    @Query('schoolId') schoolId?: string,
    @Query('academicYearId') academicYearId?: string,
  ) {
    return this.reportsService.getDashboardOverview({ schoolId, academicYearId });
  }

  @Get('dashboard/teacher')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Get teacher dashboard overview' })
  async getTeacherDashboard(
    @CurrentUser('id') userId: string,
    @Query('schoolId') schoolId?: string,
    @Query('academicYearId') academicYearId?: string,
  ) {
    // Get teacher's classes
    const teacher = await this.reportsService['prisma'].teacher.findUnique({
      where: { userId },
      include: { classSubjects: { include: { class: { include: { gradeLevel: true } } } } },
    });

    if (!teacher) {
      return { counts: {}, attendance: {}, finance: {}, recentEnrollments: [], unreadNotifications: 0 };
    }

    const classIds = teacher.classSubjects.map((cs) => cs.classId);

    const [
      studentCount,
      attendanceSummary,
      recentEnrollments,
      unreadNotifications,
    ] = await Promise.all([
      this.reportsService['prisma'].student.count({
        where: { classId: { in: classIds }, status: 'ACTIVE' },
      }),
      this.reportsService.getAttendanceSummary({
        classId: classIds[0], // First class for summary
        dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      }),
      this.reportsService['prisma'].student.findMany({
        where: { classId: { in: classIds }, enrollmentDate: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, status: 'ACTIVE' },
        include: { user: { select: { firstName: true, lastName: true } }, class: { select: { name: true } } },
        orderBy: { enrollmentDate: 'desc' },
        take: 10,
      }),
      this.reportsService['prisma'].notification.count({ where: { isRead: false, userId } }),
    ]);

    return {
      counts: { students: studentCount, classes: classIds.length },
      attendance: { rate: attendanceSummary.attendanceRate, records: attendanceSummary.totalRecords },
      recentEnrollments,
      unreadNotifications,
    };
  }

  @Get('dashboard/student')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Get student dashboard overview' })
  async getStudentDashboard(
    @CurrentUser('id') userId: string,
  ) {
    const student = await this.reportsService['prisma'].student.findUnique({
      where: { userId },
      include: { class: { include: { gradeLevel: true, academicYear: true } }, user: true },
    });

    if (!student) {
      return { attendance: {}, grades: {}, fees: {}, notifications: 0 };
    }

    const [
      attendanceSummary,
      gradeReport,
      pendingInvoices,
      unreadNotifications,
    ] = await Promise.all([
      this.reportsService.getStudentAttendanceReport({ studentId: student.id, dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }),
      this.reportsService.getStudentGradeReport({ studentId: student.id }),
      this.reportsService['prisma'].invoice.count({
        where: { studentId: student.id, status: { in: ['PENDING', 'OVERDUE'] } },
      }),
      this.reportsService['prisma'].notification.count({ where: { isRead: false, userId } }),
    ]);

    return {
      attendance: { rate: attendanceSummary.summary.attendanceRate, records: attendanceSummary.summary.total },
      grades: { overall: gradeReport.overall.average, subjects: gradeReport.subjectReports.length },
      fees: { pendingInvoices },
      notifications: unreadNotifications,
    };
  }

  @Get('dashboard/parent')
  @Roles(UserRole.PARENT)
  @ApiOperation({ summary: 'Get parent dashboard overview' })
  async getParentDashboard(
    @CurrentUser('id') userId: string,
  ) {
    const parent = await this.reportsService['prisma'].parent.findUnique({
      where: { userId },
      include: { students: { include: { user: true, class: { include: { gradeLevel: true } } } } },
    });

    if (!parent) {
      return { children: [], notifications: 0 };
    }

    const childrenReports = await Promise.all(
      parent.students.map(async (student) => {
        const [attendanceSummary, gradeReport, pendingInvoices] = await Promise.all([
          this.reportsService.getStudentAttendanceReport({ studentId: student.id, dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }),
          this.reportsService.getStudentGradeReport({ studentId: student.id }),
          this.reportsService['prisma'].invoice.count({ where: { studentId: student.id, status: { in: ['PENDING', 'OVERDUE'] } } }),
        ]);
        return {
          student: { id: student.id, studentId: student.studentId, user: student.user, class: student.class },
          attendance: { rate: attendanceSummary.summary.attendanceRate, records: attendanceSummary.summary.total },
          grades: { overall: gradeReport.overall.average, subjects: gradeReport.subjectReports.length },
          fees: { pendingInvoices },
        };
      }),
    );

    const unreadNotifications = await this.reportsService['prisma'].notification.count({ where: { isRead: false, userId } });

    return { children: childrenReports, notifications: unreadNotifications };
  }

  // ============================================
  // ATTENDANCE REPORTS
  // ============================================

  @Get('attendance/summary')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get attendance summary' })
  @ApiQuery({ name: 'schoolId', required: false, type: String })
  @ApiQuery({ name: 'academicYearId', required: false, type: String })
  @ApiQuery({ name: 'classId', required: false, type: String })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  async getAttendanceSummary(
    @Query('schoolId') schoolId?: string,
    @Query('academicYearId') academicYearId?: string,
    @Query('classId') classId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.reportsService.getAttendanceSummary({
      schoolId,
      academicYearId,
      classId,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
    });
  }

  @Get('attendance/student/:studentId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  @ApiOperation({ summary: 'Get student attendance report' })
  @ApiQuery({ name: 'academicYearId', required: false, type: String })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  async getStudentAttendanceReport(
    @Param('studentId') studentId: string,
    @Query('academicYearId') academicYearId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.reportsService.getStudentAttendanceReport({
      studentId,
      academicYearId,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
    });
  }

  @Get('attendance/class/:classId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get class attendance report' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiQuery({ name: 'subjectId', required: false, type: String })
  async getClassAttendanceReport(
    @Param('classId') classId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('subjectId') subjectId?: string,
  ) {
    return this.reportsService.getClassAttendanceReport({
      classId,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      subjectId,
    });
  }

  @Get('attendance/trends')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get attendance trends over time' })
  @ApiQuery({ name: 'schoolId', required: false, type: String })
  @ApiQuery({ name: 'academicYearId', required: false, type: String })
  @ApiQuery({ name: 'classId', required: false, type: String })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiQuery({ name: 'groupBy', required: false, enum: ['day', 'week', 'month'] })
  async getAttendanceTrends(
    @Query('schoolId') schoolId?: string,
    @Query('academicYearId') academicYearId?: string,
    @Query('classId') classId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('groupBy') groupBy: 'day' | 'week' | 'month' = 'month',
  ) {
    return this.reportsService.getAttendanceTrends({
      schoolId,
      academicYearId,
      classId,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      groupBy,
    });
  }

  // ============================================
  // GRADES & ACADEMIC REPORTS
  // ============================================

  @Get('grades/summary')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get grade summary statistics' })
  @ApiQuery({ name: 'schoolId', required: false, type: String })
  @ApiQuery({ name: 'academicYearId', required: false, type: String })
  @ApiQuery({ name: 'classId', required: false, type: String })
  @ApiQuery({ name: 'subjectId', required: false, type: String })
  @ApiQuery({ name: 'term', required: false, enum: Term })
  async getGradeSummary(
    @Query('schoolId') schoolId?: string,
    @Query('academicYearId') academicYearId?: string,
    @Query('classId') classId?: string,
    @Query('subjectId') subjectId?: string,
    @Query('term') term?: Term,
  ) {
    return this.reportsService.getGradeSummary({
      schoolId,
      academicYearId,
      classId,
      subjectId,
      term,
    });
  }

  @Get('grades/student/:studentId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  @ApiOperation({ summary: 'Get student grade report' })
  @ApiQuery({ name: 'academicYearId', required: false, type: String })
  @ApiQuery({ name: 'classSubjectId', required: false, type: String })
  @ApiQuery({ name: 'term', required: false, enum: Term })
  async getStudentGradeReport(
    @Param('studentId') studentId: string,
    @Query('academicYearId') academicYearId?: string,
    @Query('classSubjectId') classSubjectId?: string,
    @Query('term') term?: Term,
  ) {
    return this.reportsService.getStudentGradeReport({
      studentId,
      academicYearId,
      classSubjectId,
      term,
    });
  }

  @Get('grades/class/:classId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get class grade report' })
  @ApiQuery({ name: 'subjectId', required: false, type: String })
  @ApiQuery({ name: 'academicYearId', required: false, type: String })
  @ApiQuery({ name: 'term', required: false, enum: Term })
  async getClassGradeReport(
    @Param('classId') classId: string,
    @Query('subjectId') subjectId?: string,
    @Query('academicYearId') academicYearId?: string,
    @Query('term') term?: Term,
  ) {
    return this.reportsService.getClassGradeReport({
      classId,
      subjectId,
      academicYearId,
      term,
    });
  }

  // ============================================
  // FINANCE REPORTS
  // ============================================

  @Get('finance/dashboard')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get finance dashboard' })
  @ApiQuery({ name: 'schoolId', required: false, type: String })
  @ApiQuery({ name: 'academicYearId', required: false, type: String })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  async getFinanceDashboard(
    @Query('schoolId') schoolId?: string,
    @Query('academicYearId') academicYearId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.reportsService.getFinanceDashboard({
      schoolId,
      academicYearId,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
    });
  }

  @Get('finance/fee-collection')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get fee collection report' })
  @ApiQuery({ name: 'schoolId', required: false, type: String })
  @ApiQuery({ name: 'academicYearId', required: false, type: String })
  @ApiQuery({ name: 'feeStructureId', required: false, type: String })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  async getFeeCollectionReport(
    @Query('schoolId') schoolId?: string,
    @Query('academicYearId') academicYearId?: string,
    @Query('feeStructureId') feeStructureId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.reportsService.getFeeCollectionReport({
      schoolId,
      academicYearId,
      feeStructureId,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
    });
  }

  // ============================================
  // ENROLLMENT & DEMOGRAPHIC REPORTS
  // ============================================

  @Get('enrollment')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get enrollment report' })
  @ApiQuery({ name: 'schoolId', required: false, type: String })
  @ApiQuery({ name: 'academicYearId', required: false, type: String })
  @ApiQuery({ name: 'gradeLevelId', required: false, type: String })
  async getEnrollmentReport(
    @Query('schoolId') schoolId?: string,
    @Query('academicYearId') academicYearId?: string,
    @Query('gradeLevelId') gradeLevelId?: string,
  ) {
    return this.reportsService.getEnrollmentReport({
      schoolId,
      academicYearId,
      gradeLevelId,
    });
  }

  @Get('teachers/workload')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get teacher workload report' })
  @ApiQuery({ name: 'schoolId', required: false, type: String })
  @ApiQuery({ name: 'academicYearId', required: false, type: String })
  async getTeacherWorkloadReport(
    @Query('schoolId') schoolId?: string,
    @Query('academicYearId') academicYearId?: string,
  ) {
    return this.reportsService.getTeacherWorkloadReport({
      schoolId,
      academicYearId,
    });
  }

  // ============================================
  // EXPORT FUNCTIONALITY
  // ============================================

  @Get('export/attendance')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Export attendance report as CSV' })
  @ApiQuery({ name: 'classId', required: true, type: String })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiQuery({ name: 'subjectId', required: false, type: String })
  async exportAttendance(
    @Res() res: Response,
    @Query('classId') classId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('subjectId') subjectId?: string,
  ) {
    if (!classId) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'classId is required' });
    }

    const report = await this.reportsService.getClassAttendanceReport({
      classId,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      subjectId,
    });

    const csvData = report.studentSummaries.map((s) => ({
      'Student ID': s.student?.studentId,
      'Student Name': `${s.student?.user?.firstName} ${s.student?.user?.lastName}`,
      'Present': s.present,
      'Absent': s.absent,
      'Late': s.late,
      'Excused': s.excused,
      'Total': s.total,
      'Attendance Rate': `${s.attendanceRate}%`,
    }));

    const csv = await this.reportsService.exportReportToCSV(csvData, [
      'Student ID',
      'Student Name',
      'Present',
      'Absent',
      'Late',
      'Excused',
      'Total',
      'Attendance Rate',
    ]);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="attendance-report-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  }

  @Get('export/grades')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Export grades report as CSV' })
  @ApiQuery({ name: 'classId', required: false, type: String })
  @ApiQuery({ name: 'subjectId', required: false, type: String })
  @ApiQuery({ name: 'academicYearId', required: false, type: String })
  @ApiQuery({ name: 'term', required: false, enum: Term })
  async exportGrades(
    @Res() res: Response,
    @Query('classId') classId?: string,
    @Query('subjectId') subjectId?: string,
    @Query('academicYearId') academicYearId?: string,
    @Query('term') term?: Term,
  ) {
    if (!classId) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'classId is required' });
    }

    const report = await this.reportsService.getClassGradeReport({
      classId,
      subjectId,
      academicYearId,
      term,
    });

    const csvData = report.studentReports.map((s) => ({
      'Student ID': s.student?.studentId,
      'Student Name': `${s.student?.user?.firstName} ${s.student?.user?.lastName}`,
      'Grade Count': s.gradeCount,
      'Average': s.average,
    }));

    const csv = await this.reportsService.exportReportToCSV(csvData, [
      'Student ID',
      'Student Name',
      'Grade Count',
      'Average',
    ]);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="grades-report-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  }

  @Get('export/finance')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Export finance report as CSV' })
  @ApiQuery({ name: 'schoolId', required: false, type: String })
  @ApiQuery({ name: 'academicYearId', required: false, type: String })
  @ApiQuery({ name: 'feeStructureId', required: false, type: String })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  async exportFinance(
    @Res() res: Response,
    @Query('schoolId') schoolId?: string,
    @Query('academicYearId') academicYearId?: string,
    @Query('feeStructureId') feeStructureId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const report = await this.reportsService.getFeeCollectionReport({
      schoolId,
      academicYearId,
      feeStructureId,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
    });

    const csvData = report.invoices.map((inv) => ({
      'Invoice Number': inv.invoice.invoiceNumber,
      'Student ID': inv.student.studentId,
      'Student Name': inv.student.name,
      'Class': inv.student.class,
      'Parent': inv.parent?.name,
      'Fee Structure': inv.feeStructure.name,
      'Frequency': inv.feeStructure.frequency,
      'Amount': inv.amount,
      'Paid': inv.paidAmount,
      'Outstanding': inv.outstanding,
      'Status': inv.invoice.status,
      'Due Date': inv.invoice.dueDate.toISOString().split('T')[0],
      'Last Payment': inv.lastPaymentDate?.toISOString().split('T')[0] || '',
    }));

    const csv = await this.reportsService.exportReportToCSV(csvData, [
      'Invoice Number',
      'Student ID',
      'Student Name',
      'Class',
      'Parent',
      'Fee Structure',
      'Frequency',
      'Amount',
      'Paid',
      'Outstanding',
      'Status',
      'Due Date',
      'Last Payment',
    ]);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="finance-report-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  }

  @Get('export/enrollment')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Export enrollment report as CSV' })
  @ApiQuery({ name: 'schoolId', required: false, type: String })
  @ApiQuery({ name: 'academicYearId', required: false, type: String })
  @ApiQuery({ name: 'gradeLevelId', required: false, type: String })
  async exportEnrollment(
    @Res() res: Response,
    @Query('schoolId') schoolId?: string,
    @Query('academicYearId') academicYearId?: string,
    @Query('gradeLevelId') gradeLevelId?: string,
  ) {
    const report = await this.reportsService.getEnrollmentReport({
      schoolId,
      academicYearId,
      gradeLevelId,
    });

    const csvData = report.byClass.map((c) => ({
      'Class': c.class?.name,
      'Grade Level': c.class?.gradeLevel?.name,
      'Student Count': c.count,
      'Capacity': c.capacity,
      'Utilization': `${c.utilization.toFixed(1)}%`,
    }));

    const csv = await this.reportsService.exportReportToCSV(csvData, [
      'Class',
      'Grade Level',
      'Student Count',
      'Capacity',
      'Utilization',
    ]);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="enrollment-report-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  }
}