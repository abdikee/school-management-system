import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, AttendanceStatus, AttendanceSessionStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';

@ApiTags('attendance')
@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  // ============================================
  // ATTENDANCE SESSION OPERATIONS
  // ============================================

  @Post('sessions')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create attendance session' })
  async createAttendanceSession(@Body() data: {
    classId: string;
    subjectId?: string;
    date: string;
    startTime: string;
    endTime: string;
    teacherId: string;
    notes?: string;
  }) {
    return this.attendanceService.createAttendanceSession({
      ...data,
      date: new Date(data.date),
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
    });
  }

  @Get('sessions')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get attendance sessions with filters' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'classId', required: false, type: String })
  @ApiQuery({ name: 'teacherId', required: false, type: String })
  @ApiQuery({ name: 'subjectId', required: false, type: String })
  @ApiQuery({ name: 'date', required: false, type: String })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: AttendanceSessionStatus })
  async getAttendanceSessions(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('classId') classId?: string,
    @Query('teacherId') teacherId?: string,
    @Query('subjectId') subjectId?: string,
    @Query('date') date?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('status') status?: AttendanceSessionStatus,
  ) {
    return this.attendanceService.getAttendanceSessions({
      skip: skip ? Number(skip) : 0,
      take: take ? Number(take) : 10,
      classId,
      teacherId,
      subjectId,
      date: date ? new Date(date) : undefined,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      status,
    });
  }

  @Get('sessions/my')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Get current teacher attendance sessions' })
  @ApiQuery({ name: 'date', required: false, type: String })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: AttendanceSessionStatus })
  async getMyAttendanceSessions(
    @CurrentUser('id') teacherUserId: string,
    @Query('date') date?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('status') status?: AttendanceSessionStatus,
  ) {
    // Get teacher ID from user ID
    const teacher = await this.attendanceService['prisma'].teacher.findUnique({
      where: { userId: teacherUserId },
    });
    if (!teacher) {
      throw new NotFoundException('Teacher profile not found');
    }

    return this.attendanceService.getMyAttendanceSessions(teacher.id, {
      date: date ? new Date(date) : undefined,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      status,
    });
  }

  @Get('sessions/today')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Get today attendance sessions for current teacher' })
  async getMyTodaysSessions(@CurrentUser('id') teacherUserId: string) {
    const teacher = await this.attendanceService['prisma'].teacher.findUnique({
      where: { userId: teacherUserId },
    });
    if (!teacher) {
      throw new NotFoundException('Teacher profile not found');
    }

    return this.attendanceService.getMyTodaysSessions(teacher.id);
  }

  @Get('sessions/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get attendance session by ID with records' })
  async getAttendanceSessionById(@Param('id') id: string) {
    return this.attendanceService.getAttendanceSessionById(id);
  }

  @Put('sessions/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Update attendance session' })
  async updateAttendanceSession(
    @Param('id') id: string,
    @Body() data: Prisma.AttendanceSessionUpdateInput,
  ) {
    return this.attendanceService.updateAttendanceSession(id, data);
  }

  @Put('sessions/:id/close')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Close attendance session' })
  async closeAttendanceSession(@Param('id') id: string) {
    return this.attendanceService.closeAttendanceSession(id);
  }

  @Put('sessions/:id/cancel')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel attendance session' })
  async cancelAttendanceSession(@Param('id') id: string) {
    return this.attendanceService.cancelAttendanceSession(id);
  }

  @Delete('sessions/:id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete attendance session' })
  async deleteAttendanceSession(@Param('id') id: string) {
    return this.attendanceService.deleteAttendanceSession(id);
  }

  // ============================================
  // ATTENDANCE RECORDING OPERATIONS
  // ============================================

  @Post('records')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record single attendance' })
  async recordAttendance(@Body() data: {
    studentId: string;
    classId: string;
    subjectId?: string;
    sessionId?: string;
    date: string;
    status: AttendanceStatus;
    checkInTime?: string;
    checkOutTime?: string;
    notes?: string;
    recordedById: string;
  }) {
    return this.attendanceService.recordAttendance({
      ...data,
      date: new Date(data.date),
      checkInTime: data.checkInTime ? new Date(data.checkInTime) : undefined,
      checkOutTime: data.checkOutTime ? new Date(data.checkOutTime) : undefined,
    });
  }

  @Post('records/bulk')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Bulk record attendance for a class' })
  async bulkRecordAttendance(@Body() data: {
    classId: string;
    subjectId?: string;
    sessionId?: string;
    date: string;
    records: Array<{
      studentId: string;
      status: AttendanceStatus;
      checkInTime?: string;
      checkOutTime?: string;
      notes?: string;
    }>;
    recordedById: string;
  }) {
    return this.attendanceService.bulkRecordAttendance({
      ...data,
      date: new Date(data.date),
      records: data.records.map((r) => ({
        ...r,
        checkInTime: r.checkInTime ? new Date(r.checkInTime) : undefined,
        checkOutTime: r.checkOutTime ? new Date(r.checkOutTime) : undefined,
      })),
    });
  }

  @Get('records')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get attendance records with filters' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'studentId', required: false, type: String })
  @ApiQuery({ name: 'classId', required: false, type: String })
  @ApiQuery({ name: 'subjectId', required: false, type: String })
  @ApiQuery({ name: 'sessionId', required: false, type: String })
  @ApiQuery({ name: 'date', required: false, type: String })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: AttendanceStatus })
  async getAttendances(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('studentId') studentId?: string,
    @Query('classId') classId?: string,
    @Query('subjectId') subjectId?: string,
    @Query('sessionId') sessionId?: string,
    @Query('date') date?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('status') status?: AttendanceStatus,
  ) {
    return this.attendanceService.getAttendances({
      skip: skip ? Number(skip) : 0,
      take: take ? Number(take) : 10,
      studentId,
      classId,
      subjectId,
      sessionId,
      date: date ? new Date(date) : undefined,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      status,
    });
  }

  @Get('records/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  @ApiOperation({ summary: 'Get attendance record by ID' })
  async getAttendanceById(@Param('id') id: string) {
    return this.attendanceService.getAttendanceById(id);
  }

  @Put('records/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Update attendance record' })
  async updateAttendance(
    @Param('id') id: string,
    @Body() data: Prisma.AttendanceUpdateInput,
  ) {
    return this.attendanceService.updateAttendance(id, data);
  }

  @Delete('records/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete attendance record' })
  async deleteAttendance(@Param('id') id: string) {
    return this.attendanceService.deleteAttendance(id);
  }

  // ============================================
  // CLASS TODAY'S ATTENDANCE (for teachers)
  // ============================================

  @Get('classes/:classId/today')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get today attendance for a class' })
  async getTodaysAttendance(
    @Param('classId') classId: string,
    @Query('subjectId') subjectId?: string,
  ) {
    return this.attendanceService.getTodaysAttendance(classId, subjectId);
  }

  // ============================================
  // REPORTS & ANALYTICS
  // ============================================

  @Get('reports/class/:classId')
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
    return this.attendanceService.getClassAttendanceReport(classId, {
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      subjectId,
    });
  }

  @Get('reports/student/:studentId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  @ApiOperation({ summary: 'Get student attendance report' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiQuery({ name: 'classId', required: false, type: String })
  @ApiQuery({ name: 'subjectId', required: false, type: String })
  async getStudentAttendanceReport(
    @Param('studentId') studentId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('classId') classId?: string,
    @Query('subjectId') subjectId?: string,
  ) {
    return this.attendanceService.getStudentAttendanceReport(studentId, {
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      classId,
      subjectId,
    });
  }

  @Get('reports/stats')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get attendance statistics' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiQuery({ name: 'classId', required: false, type: String })
  async getAttendanceStats(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('classId') classId?: string,
  ) {
    return this.attendanceService.getAttendanceStats(undefined, {
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      classId,
    });
  }

  @Get('reports/low-attendance')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get low attendance alerts' })
  @ApiQuery({ name: 'threshold', required: false, type: Number })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiQuery({ name: 'classId', required: false, type: String })
  async getLowAttendanceAlerts(
    @Query('threshold') threshold?: number,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('classId') classId?: string,
  ) {
    return this.attendanceService.getLowAttendanceAlerts({
      threshold,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      classId,
    });
  }
}