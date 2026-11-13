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

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, UserStatus, Gender } from '@prisma/client';
import { Prisma } from '@prisma/client';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  // ============================================
  // GENERAL USER OPERATIONS (Admin only)
  // ============================================

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'role', required: false, enum: UserRole })
  @ApiQuery({ name: 'status', required: false, enum: UserStatus })
  async findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('role') role?: UserRole,
    @Query('status') status?: UserStatus,
  ) {
    const where: Prisma.UserWhereInput = {};
    if (role) where.role = role;
    if (status) where.status = status;

    return this.usersService.findAll({
      skip: skip ? Number(skip) : 0,
      take: take ? Number(take) : 10,
      where,
    });
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.findById(userId);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() data: Prisma.UserUpdateInput,
  ) {
    return this.usersService.update(userId, data);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user by ID' })
  async findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Put(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update user status' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: UserStatus,
  ) {
    return this.usersService.updateStatus(id, status);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete user' })
  async delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }

  // ============================================
  // STUDENT OPERATIONS
  // ============================================

  @Post('students')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new student' })
  async createStudent(@Body() data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    studentId: string;
    dateOfBirth: string;
    gender: Gender;
    address?: string;
    parentId?: string;
    classId?: string;
    gradeLevelId?: string;
    schoolId?: string;
  }) {
    return this.usersService.createStudent({
      ...data,
      dateOfBirth: new Date(data.dateOfBirth),
    });
  }

  @Get('students')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get all students with filters' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'classId', required: false, type: String })
  @ApiQuery({ name: 'gradeLevelId', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getStudents(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('classId') classId?: string,
    @Query('gradeLevelId') gradeLevelId?: string,
    @Query('search') search?: string,
  ) {
    return this.usersService.getStudents({
      skip: skip ? Number(skip) : 0,
      take: take ? Number(take) : 10,
      classId,
      gradeLevelId,
      search,
    });
  }

  @Get('students/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.PARENT)
  @ApiOperation({ summary: 'Get student by ID' })
  async getStudentById(@Param('id') id: string) {
    return this.usersService.getStudentById(id);
  }

  @Put('students/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update student' })
  async updateStudent(
    @Param('id') id: string,
    @Body() data: Prisma.StudentUpdateInput,
  ) {
    return this.usersService.updateStudent(id, data);
  }

  @Post('students/:id/enroll')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Enroll student in class' })
  async enrollStudent(
    @Param('id') studentId: string,
    @Body('classId') classId: string,
  ) {
    return this.usersService.enrollStudent(studentId, classId);
  }

  @Post('students/:id/transfer')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Transfer student to another class' })
  async transferStudent(
    @Param('id') studentId: string,
    @Body('classId') classId: string,
  ) {
    return this.usersService.transferStudent(studentId, classId);
  }

  // ============================================
  // TEACHER OPERATIONS
  // ============================================

  @Post('teachers')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new teacher' })
  async createTeacher(@Body() data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    employeeId: string;
    hireDate: string;
    qualification?: string;
    subjects?: string[];
    schoolId?: string;
  }) {
    return this.usersService.createTeacher({
      ...data,
      hireDate: new Date(data.hireDate),
    });
  }

  @Get('teachers')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all teachers' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getTeachers(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('search') search?: string,
  ) {
    return this.usersService.getTeachers({
      skip: skip ? Number(skip) : 0,
      take: take ? Number(take) : 10,
      search,
    });
  }

  @Get('teachers/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get teacher by ID' })
  async getTeacherById(@Param('id') id: string) {
    return this.usersService.getTeacherById(id);
  }

  @Put('teachers/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update teacher' })
  async updateTeacher(
    @Param('id') id: string,
    @Body() data: Prisma.TeacherUpdateInput,
  ) {
    return this.usersService.updateTeacher(id, data);
  }

  // ============================================
  // PARENT OPERATIONS
  // ============================================

  @Post('parents')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new parent' })
  async createParent(@Body() data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    occupation?: string;
    address?: string;
    schoolId?: string;
  }) {
    return this.usersService.createParent(data);
  }

  @Get('parents')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all parents' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getParents(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('search') search?: string,
  ) {
    return this.usersService.getParents({
      skip: skip ? Number(skip) : 0,
      take: take ? Number(take) : 10,
      search,
    });
  }

  @Get('parents/:id')
  @Roles(UserRole.ADMIN, UserRole.PARENT)
  @ApiOperation({ summary: 'Get parent by ID with children' })
  async getParentById(@Param('id') id: string) {
    return this.usersService.getParentById(id);
  }

  @Put('parents/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update parent' })
  async updateParent(
    @Param('id') id: string,
    @Body() data: Prisma.ParentUpdateInput,
  ) {
    return this.usersService.updateParent(id, data);
  }

  @Post('parents/:parentId/students')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Link parent to student' })
  async linkParentToStudent(
    @Param('parentId') parentId: string,
    @Body() data: { studentId: string; relationship: string; isPrimary?: boolean },
  ) {
    return this.usersService.linkParentToStudent(
      parentId,
      data.studentId,
      data.relationship,
      data.isPrimary,
    );
  }

  @Delete('parents/:parentId/students/:studentId')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unlink parent from student' })
  async unlinkParentFromStudent(
    @Param('parentId') parentId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.usersService.unlinkParentFromStudent(parentId, studentId);
  }

  // ============================================
  // BULK OPERATIONS
  // ============================================

  @Post('bulk')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Bulk create users' })
  async bulkCreateUsers(
    @Body() users: Array<{
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone?: string;
      role: UserRole;
      schoolId?: string;
    }>,
  ) {
    return this.usersService.bulkCreateUsers(users);
  }
}