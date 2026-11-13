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

import { AcademicService } from './academic.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, Term } from '@prisma/client';
import { Prisma } from '@prisma/client';

@ApiTags('academic')
@Controller('academic')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AcademicController {
  constructor(private academicService: AcademicService) {}

  // ============================================
  // SCHOOL OPERATIONS
  // ============================================

  @Post('schools')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new school' })
  async createSchool(@Body() data: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    academicYearStart: number;
    academicYearEnd: number;
    timezone?: string;
    currency?: string;
  }) {
    return this.academicService.createSchool(data);
  }

  @Get('schools')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all schools' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getSchools(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('search') search?: string,
  ) {
    return this.academicService.getSchools({
      skip: skip ? Number(skip) : 0,
      take: take ? Number(take) : 10,
      search,
    });
  }

  @Get('schools/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get school by ID' })
  async getSchoolById(@Param('id') id: string) {
    return this.academicService.getSchoolById(id);
  }

  @Put('schools/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update school' })
  async updateSchool(@Param('id') id: string, @Body() data: Prisma.SchoolUpdateInput) {
    return this.academicService.updateSchool(id, data);
  }

  @Delete('schools/:id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete school' })
  async deleteSchool(@Param('id') id: string) {
    return this.academicService.deleteSchool(id);
  }

  // ============================================
  // ACADEMIC YEAR OPERATIONS
  // ============================================

  @Post('schools/:schoolId/academic-years')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create academic year' })
  async createAcademicYear(
    @Param('schoolId') schoolId: string,
    @Body() data: { name: string; startDate: string; endDate: string; isCurrent?: boolean },
  ) {
    return this.academicService.createAcademicYear({
      ...data,
      schoolId,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    });
  }

  @Get('schools/:schoolId/academic-years')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get academic years for a school' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  async getAcademicYears(
    @Param('schoolId') schoolId: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.academicService.getAcademicYears(schoolId, {
      skip: skip ? Number(skip) : 0,
      take: take ? Number(take) : 10,
    });
  }

  @Get('schools/:schoolId/academic-years/current')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  @ApiOperation({ summary: 'Get current academic year for a school' })
  async getCurrentAcademicYear(@Param('schoolId') schoolId: string) {
    return this.academicService.getCurrentAcademicYear(schoolId);
  }

  @Get('academic-years/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get academic year by ID' })
  async getAcademicYearById(@Param('id') id: string) {
    return this.academicService.getAcademicYearById(id);
  }

  @Put('academic-years/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update academic year' })
  async updateAcademicYear(@Param('id') id: string, @Body() data: Prisma.AcademicYearUpdateInput) {
    return this.academicService.updateAcademicYear(id, data);
  }

  @Delete('academic-years/:id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete academic year' })
  async deleteAcademicYear(@Param('id') id: string) {
    return this.academicService.deleteAcademicYear(id);
  }

  // ============================================
  // GRADE LEVEL OPERATIONS
  // ============================================

  @Post('schools/:schoolId/grade-levels')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create grade level' })
  async createGradeLevel(
    @Param('schoolId') schoolId: string,
    @Body() data: { name: string; order: number },
  ) {
    return this.academicService.createGradeLevel({ ...data, schoolId });
  }

  @Get('schools/:schoolId/grade-levels')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get grade levels for a school' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  async getGradeLevels(
    @Param('schoolId') schoolId: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.academicService.getGradeLevels(schoolId, {
      skip: skip ? Number(skip) : 0,
      take: take ? Number(take) : 10,
    });
  }

  @Get('grade-levels/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get grade level by ID' })
  async getGradeLevelById(@Param('id') id: string) {
    return this.academicService.getGradeLevelById(id);
  }

  @Put('grade-levels/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update grade level' })
  async updateGradeLevel(@Param('id') id: string, @Body() data: Prisma.GradeLevelUpdateInput) {
    return this.academicService.updateGradeLevel(id, data);
  }

  @Delete('grade-levels/:id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete grade level' })
  async deleteGradeLevel(@Param('id') id: string) {
    return this.academicService.deleteGradeLevel(id);
  }

  // ============================================
  // SUBJECT OPERATIONS
  // ============================================

  @Post('grade-levels/:gradeLevelId/subjects')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create subject' })
  async createSubject(
    @Param('gradeLevelId') gradeLevelId: string,
    @Body() data: { name: string; code: string; description?: string; isCore?: boolean; color?: string },
  ) {
    return this.academicService.createSubject({ ...data, gradeLevelId });
  }

  @Get('grade-levels/:gradeLevelId/subjects')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get subjects for a grade level' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  async getSubjects(
    @Param('gradeLevelId') gradeLevelId: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.academicService.getSubjects(gradeLevelId, {
      skip: skip ? Number(skip) : 0,
      take: take ? Number(take) : 10,
    });
  }

  @Get('subjects/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get subject by ID' })
  async getSubjectById(@Param('id') id: string) {
    return this.academicService.getSubjectById(id);
  }

  @Put('subjects/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update subject' })
  async updateSubject(@Param('id') id: string, @Body() data: Prisma.SubjectUpdateInput) {
    return this.academicService.updateSubject(id, data);
  }

  @Delete('subjects/:id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete subject' })
  async deleteSubject(@Param('id') id: string) {
    return this.academicService.deleteSubject(id);
  }

  // ============================================
  // CLASS OPERATIONS
  // ============================================

  @Post('classes')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create class' })
  async createClass(@Body() data: {
    name: string;
    gradeLevelId: string;
    academicYearId: string;
    homeroomTeacherId?: string;
    capacity?: number;
    room?: string;
  }) {
    return this.academicService.createClass(data);
  }

  @Get('classes')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get classes with filters' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'gradeLevelId', required: false, type: String })
  @ApiQuery({ name: 'academicYearId', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getClasses(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('gradeLevelId') gradeLevelId?: string,
    @Query('academicYearId') academicYearId?: string,
    @Query('search') search?: string,
  ) {
    return this.academicService.getClasses({
      skip: skip ? Number(skip) : 0,
      take: take ? Number(take) : 10,
      gradeLevelId,
      academicYearId,
      search,
    });
  }

  @Get('classes/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  @ApiOperation({ summary: 'Get class by ID with details' })
  async getClassById(@Param('id') id: string) {
    return this.academicService.getClassById(id);
  }

  @Put('classes/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update class' })
  async updateClass(@Param('id') id: string, @Body() data: Prisma.ClassUpdateInput) {
    return this.academicService.updateClass(id, data);
  }

  @Delete('classes/:id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete class' })
  async deleteClass(@Param('id') id: string) {
    return this.academicService.deleteClass(id);
  }

  // ============================================
  // CLASS-SUBJECT OPERATIONS
  // ============================================

  @Post('classes/:classId/subjects')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Assign subject to class with optional teacher' })
  async assignSubjectToClass(
    @Param('classId') classId: string,
    @Body() data: { subjectId: string; teacherId?: string },
  ) {
    return this.academicService.assignSubjectToClass({ classId, ...data });
  }

  @Get('classes/:classId/subjects')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get subjects assigned to a class' })
  async getClassSubjects(@Param('classId') classId: string) {
    return this.academicService.getClassSubjects(classId);
  }

  @Put('class-subjects/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update class-subject assignment' })
  async updateClassSubject(@Param('id') id: string, @Body() data: Prisma.ClassSubjectUpdateInput) {
    return this.academicService.updateClassSubject(id, data);
  }

  @Delete('classes/:classId/subjects/:subjectId')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove subject from class' })
  async removeSubjectFromClass(
    @Param('classId') classId: string,
    @Param('subjectId') subjectId: string,
  ) {
    return this.academicService.removeSubjectFromClass(classId, subjectId);
  }

  // ============================================
  // TIMETABLE OPERATIONS
  // ============================================

  @Post('classes/:classId/timetable')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create timetable entry' })
  async createTimetableEntry(
    @Param('classId') classId: string,
    @Body() data: {
      subjectId: string;
      teacherId?: string;
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      room?: string;
    },
  ) {
    return this.academicService.createTimetableEntry({ classId, ...data });
  }

  @Get('classes/:classId/timetable')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  @ApiOperation({ summary: 'Get class timetable' })
  async getTimetable(@Param('classId') classId: string) {
    return this.academicService.getTimetable(classId);
  }

  @Get('teachers/:teacherId/timetable')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get teacher timetable' })
  async getTeacherTimetable(@Param('teacherId') teacherId: string) {
    return this.academicService.getTeacherTimetable(teacherId);
  }

  @Put('timetable/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update timetable entry' })
  async updateTimetableEntry(
    @Param('id') id: string,
    @Body() data: Prisma.TimetableEntryUpdateInput,
  ) {
    return this.academicService.updateTimetableEntry(id, data);
  }

  @Delete('timetable/:id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete timetable entry' })
  async deleteTimetableEntry(@Param('id') id: string) {
    return this.academicService.deleteTimetableEntry(id);
  }

  // ============================================
  // BULK OPERATIONS
  // ============================================

  @Post('classes/bulk')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Bulk create classes' })
  async bulkCreateClasses(
    @Body() classes: Array<{
      name: string;
      gradeLevelId: string;
      academicYearId: string;
      homeroomTeacherId?: string;
      capacity?: number;
      room?: string;
    }>,
  ) {
    return this.academicService.bulkCreateClasses(classes);
  }

  @Post('promote-students')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Promote students to next academic year' })
  async promoteStudents(
    @Body() data: { currentAcademicYearId: string; nextAcademicYearId: string },
  ) {
    return this.academicService.promoteStudents(data.currentAcademicYearId, data.nextAcademicYearId);
  }
}