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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { GradesService } from './grades.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { StudentAccessService } from '../../common/policies/student-access.service';
import { UserRole } from '@prisma/client';
import { Prisma } from '@prisma/client';

@ApiTags('grades')
@Controller('grades')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GradesController {
  constructor(
    private gradesService: GradesService,
    private studentAccess: StudentAccessService,
  ) {}

  // ============================================
  // ASSESSMENT TYPE OPERATIONS
  // ============================================

  @Post('assessment-types')
  @Roles(UserRole.ADMIN)
  @Permissions('marks.manage')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create assessment type' })
  async createAssessmentType(@Body() data: {
    name: string;
    weight: number;
    description?: string;
    color?: string;
    isDefault?: boolean;
  }) {
    return this.gradesService.createAssessmentType(data);
  }

  @Get('assessment-types')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get all assessment types' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  async getAssessmentTypes(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.gradesService.getAssessmentTypes({
      skip: skip ? Number(skip) : 0,
      take: take ? Number(take) : 10,
    });
  }

  @Get('assessment-types/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get assessment type by ID' })
  async getAssessmentTypeById(@Param('id') id: string) {
    return this.gradesService.getAssessmentTypeById(id);
  }

  @Put('assessment-types/:id')
  @Roles(UserRole.ADMIN)
  @Permissions('marks.manage')
  @ApiOperation({ summary: 'Update assessment type' })
  async updateAssessmentType(
    @Param('id') id: string,
    @Body() data: Prisma.AssessmentTypeUpdateInput,
  ) {
    return this.gradesService.updateAssessmentType(id, data);
  }

  @Delete('assessment-types/:id')
  @Roles(UserRole.ADMIN)
  @Permissions('marks.manage')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete assessment type' })
  async deleteAssessmentType(@Param('id') id: string) {
    return this.gradesService.deleteAssessmentType(id);
  }

  // ============================================
  // ASSESSMENT OPERATIONS
  // ============================================

  @Post('assessments')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Permissions('marks.manage')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create assessment' })
  async createAssessment(@Body() data: {
    name: string;
    typeId: string;
    classSubjectId: string;
    date: string;
    maxScore: number;
    weight?: number;
    description?: string;
    instructions?: string;
    attachmentUrl?: string;
    createdById: string;
  }) {
    return this.gradesService.createAssessment({
      ...data,
      date: new Date(data.date),
    });
  }

  @Get('assessments')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get assessments with filters' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'classSubjectId', required: false, type: String })
  @ApiQuery({ name: 'typeId', required: false, type: String })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiQuery({ name: 'isPublished', required: false, type: Boolean })
  async getAssessments(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('classSubjectId') classSubjectId?: string,
    @Query('typeId') typeId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('isPublished') isPublished?: boolean,
  ) {
    return this.gradesService.getAssessments({
      skip: skip ? Number(skip) : 0,
      take: take ? Number(take) : 10,
      classSubjectId,
      typeId,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      isPublished,
    });
  }

  @Get('assessments/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  @ApiOperation({ summary: 'Get assessment by ID with grades' })
  async getAssessmentById(@Param('id') id: string) {
    return this.gradesService.getAssessmentById(id);
  }

  @Put('assessments/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Permissions('marks.manage')
  @ApiOperation({ summary: 'Update assessment' })
  async updateAssessment(
    @Param('id') id: string,
    @Body() data: Prisma.AssessmentUpdateInput,
  ) {
    return this.gradesService.updateAssessment(id, data);
  }

  @Put('assessments/:id/publish')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Permissions('marks.manage')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish assessment' })
  async publishAssessment(@Param('id') id: string) {
    return this.gradesService.publishAssessment(id);
  }

  @Put('assessments/:id/unpublish')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Permissions('marks.manage')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unpublish assessment' })
  async unpublishAssessment(@Param('id') id: string) {
    return this.gradesService.unpublishAssessment(id);
  }

  @Delete('assessments/:id')
  @Roles(UserRole.ADMIN)
  @Permissions('marks.manage')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete assessment' })
  async deleteAssessment(@Param('id') id: string) {
    return this.gradesService.deleteAssessment(id);
  }

  // ============================================
  // GRADE OPERATIONS
  // ============================================

  @Post('grades')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Permissions('marks.manage')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record single grade' })
  async recordGrade(@Body() data: {
    studentId: string;
    assessmentId: string;
    classSubjectId: string;
    score: number;
    gradedById?: string;
    feedback?: string;
    isPublished?: boolean;
  }) {
    return this.gradesService.recordGrade(data);
  }

  @Post('grades/bulk')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Permissions('marks.manage')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Bulk record grades for an assessment' })
  async bulkRecordGrades(@Body() data: {
    assessmentId: string;
    classSubjectId: string;
    grades: Array<{
      studentId: string;
      score: number;
      gradedById?: string;
      feedback?: string;
      isPublished?: boolean;
    }>;
  }) {
    return this.gradesService.bulkRecordGrades(data);
  }

  @Get('grades')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get grades with filters' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'studentId', required: false, type: String })
  @ApiQuery({ name: 'assessmentId', required: false, type: String })
  @ApiQuery({ name: 'classSubjectId', required: false, type: String })
  @ApiQuery({ name: 'isPublished', required: false, type: Boolean })
  async getGrades(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('studentId') studentId?: string,
    @Query('assessmentId') assessmentId?: string,
    @Query('classSubjectId') classSubjectId?: string,
    @Query('isPublished') isPublished?: boolean,
  ) {
    return this.gradesService.getGrades({
      skip: skip ? Number(skip) : 0,
      take: take ? Number(take) : 10,
      studentId,
      assessmentId,
      classSubjectId,
      isPublished,
    });
  }

  @Get('grades/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  @ApiOperation({ summary: 'Get grade by ID' })
  async getGradeById(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    await this.studentAccess.assertCanAccessGrade(userId, role, id);
    return this.gradesService.getGradeById(id);
  }

  @Put('grades/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Permissions('marks.manage')
  @ApiOperation({ summary: 'Update grade' })
  async updateGrade(
    @Param('id') id: string,
    @Body() data: Prisma.GradeUpdateInput,
  ) {
    return this.gradesService.updateGrade(id, data);
  }

  @Put('grades/:id/publish')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Permissions('marks.manage')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish grade' })
  async publishGrade(@Param('id') id: string) {
    return this.gradesService.publishGrade(id);
  }

  @Put('grades/:id/unpublish')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Permissions('marks.manage')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unpublish grade' })
  async unpublishGrade(@Param('id') id: string) {
    return this.gradesService.unpublishGrade(id);
  }

  @Delete('grades/:id')
  @Roles(UserRole.ADMIN)
  @Permissions('marks.manage')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete grade' })
  async deleteGrade(@Param('id') id: string) {
    return this.gradesService.deleteGrade(id);
  }

  // ============================================
  // GRADEBOOK VIEW (Grid/Spreadsheet)
  // ============================================

  @Get('gradebook/:classSubjectId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  @ApiOperation({ summary: 'Get gradebook grid for a class subject' })
  async getGradebook(@Param('classSubjectId') classSubjectId: string) {
    return this.gradesService.getGradebook(classSubjectId);
  }

  @Get('students/:studentId/subjects')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  @ApiOperation({ summary: 'Get subjects assigned to a student class' })
  async getSubjectsForStudent(
    @Param('studentId') studentId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    await this.studentAccess.assertCanAccessStudent(userId, role, studentId);
    return this.gradesService.getSubjectsForStudent(studentId);
  }

  // ============================================
  // REPORT CARD OPERATIONS
  // ============================================

  @Post('report-cards/generate')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Permissions('marks.manage')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate report card for a student' })
  async generateReportCard(@Body() data: {
    studentId: string;
    academicYearId: string;
    term: string;
  }) {
    return this.gradesService.generateReportCard(data);
  }

  @Post('report-cards')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Permissions('marks.manage')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Save report card' })
  async saveReportCard(@Body() data: {
    studentId: string;
    academicYearId: string;
    term: string;
    pdfUrl?: string;
  }) {
    return this.gradesService.saveReportCard(data);
  }

  @Get('report-cards')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  @ApiOperation({ summary: 'Get report cards with filters' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'studentId', required: false, type: String })
  @ApiQuery({ name: 'academicYearId', required: false, type: String })
  @ApiQuery({ name: 'term', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  async getReportCards(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('studentId') studentId?: string,
    @Query('academicYearId') academicYearId?: string,
    @Query('term') term?: string,
    @Query('status') status?: string,
  ) {
    return this.gradesService.getReportCards({
      skip: skip ? Number(skip) : 0,
      take: take ? Number(take) : 10,
      studentId,
      academicYearId,
      term,
      status,
    });
  }

  @Get('report-cards/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  @ApiOperation({ summary: 'Get report card by ID' })
  async getReportCardById(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    await this.studentAccess.assertCanAccessReportCard(userId, role, id);
    return this.gradesService.getReportCardById(id);
  }

  @Put('report-cards/:id/publish')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Permissions('results.approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish report card' })
  async publishReportCard(@Param('id') id: string) {
    return this.gradesService.publishReportCard(id);
  }

  // ============================================
  // ANALYTICS
  // ============================================

  @Get('analytics/class-subject/:classSubjectId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get analytics for a class subject' })
  async getClassSubjectAnalytics(@Param('classSubjectId') classSubjectId: string) {
    return this.gradesService.getClassSubjectAnalytics(classSubjectId);
  }

  @Get('analytics/student/:studentId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  @ApiOperation({ summary: 'Get analytics for a student' })
  @ApiQuery({ name: 'classSubjectId', required: false, type: String })
  async getStudentAnalytics(
    @Param('studentId') studentId: string,
    @Query('classSubjectId') classSubjectId?: string,
  ) {
    return this.gradesService.getStudentAnalytics(studentId, { classSubjectId });
  }
}