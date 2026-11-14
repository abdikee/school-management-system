import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, UserRole, UserStatus, Gender } from '@prisma/client';
import * as bcrypt from 'bcrypt';

interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  schoolId?: string;
}

interface CreateStudentInput extends CreateUserInput {
  studentId: string;
  dateOfBirth: Date;
  gender: Gender;
  address?: string;
  parentId?: string;
  classId?: string;
  gradeLevelId?: string;
}

interface CreateTeacherInput extends CreateUserInput {
  employeeId: string;
  hireDate: Date;
  qualification?: string;
  subjects?: string[];
}

interface CreateParentInput extends CreateUserInput {
  occupation?: string;
  phone?: string;
  address?: string;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // GENERAL USER OPERATIONS
  // ============================================

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
    includeRefreshTokens?: boolean;
  }) {
    const { skip, take, where, orderBy, includeRefreshTokens } = params;
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        where,
        orderBy: orderBy || { createdAt: 'desc' },
        include: {
          student: true,
          teacher: true,
          parent: true,
          refreshTokens: includeRefreshTokens,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: data.map((user) => {
        const { passwordHash, refreshTokens, ...rest } = user;
        return rest;
      }),
      total,
      page: Math.floor((skip || 0) / (take || 10)) + 1,
      pageSize: take || 10,
    };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        student: true,
        teacher: true,
        parent: true,
        refreshTokens: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { passwordHash, refreshTokens, ...result } = user;
    return result;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    const user = await this.prisma.user.update({
      where: { id },
      data,
      include: {
        student: true,
        teacher: true,
        parent: true,
        refreshTokens: true,
      },
    });

    const { passwordHash, refreshTokens, ...result } = user;
    return result;
  }

  async delete(id: string) {
    await this.prisma.user.delete({ where: { id } });
    return { message: 'User deleted successfully' };
  }

  async updateStatus(id: string, status: UserStatus) {
    return this.update(id, { status });
  }

  // ============================================
  // STUDENT OPERATIONS
  // ============================================

  async createStudent(data: CreateStudentInput) {
    // Check if student ID already exists
    const existingStudent = await this.prisma.student.findUnique({
      where: { studentId: data.studentId },
    });
    if (existingStudent) {
      throw new ConflictException('Student ID already exists');
    }

    // Check if email exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: UserRole.STUDENT,
        schoolId: data.schoolId,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        student: {
          create: {
            studentId: data.studentId,
            dateOfBirth: data.dateOfBirth,
            gender: data.gender,
            address: data.address,
            parentId: data.parentId,
            classId: data.classId,
            gradeLevelId: data.gradeLevelId,
            enrollmentDate: new Date(),
          },
        },
      },
      include: { student: true, refreshTokens: true },
    });

    const { passwordHash: _, refreshTokens, ...result } = user;
    return result;
  }

  async getStudents(params: {
    skip?: number;
    take?: number;
    classId?: string;
    gradeLevelId?: string;
    search?: string;
  }) {
    const { skip, take, classId, gradeLevelId, search } = params;

    const where: Prisma.StudentWhereInput = {};
    if (classId) where.classId = classId;
    if (gradeLevelId) where.gradeLevelId = gradeLevelId;
    if (search) {
      where.OR = [
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { studentId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.student.findMany({
        skip,
        take,
        where,
        include: {
          user: { include: { refreshTokens: true } },
          class: { include: { gradeLevel: true } },
          gradeLevel: true,
          parent: { include: { user: true } },
        },
        orderBy: { user: { firstName: 'asc' } },
      }),
      this.prisma.student.count({ where }),
    ]);

    return {
      data: data.map((student) => {
        const { user, ...rest } = student;
        const { passwordHash, refreshTokens, ...userData } = user;
        return { ...rest, user: userData };
      }),
      total,
    };
  }

  async getStudentById(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        user: { include: { refreshTokens: true } },
        class: { include: { gradeLevel: true, academicYear: true } },
        gradeLevel: true,
        parent: { include: { user: true } },
        attendances: { take: 10, orderBy: { date: 'desc' } },
        grades: { take: 10, orderBy: { createdAt: 'desc' }, include: { assessment: true } },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const { user, ...rest } = student;
    const { passwordHash, refreshTokens, ...userData } = user;
    return { ...rest, user: userData };
  }

  async updateStudent(id: string, data: Prisma.StudentUpdateInput) {
    return this.prisma.student.update({
      where: { id },
      data,
      include: { user: true, class: true, gradeLevel: true },
    });
  }

  async enrollStudent(studentId: string, classId: string) {
    return this.prisma.student.update({
      where: { id: studentId },
      data: { classId },
      include: { class: true, user: true },
    });
  }

  async transferStudent(studentId: string, newClassId: string) {
    return this.enrollStudent(studentId, newClassId);
  }

  // ============================================
  // TEACHER OPERATIONS
  // ============================================

  async createTeacher(data: CreateTeacherInput) {
    const existingTeacher = await this.prisma.teacher.findUnique({
      where: { employeeId: data.employeeId },
    });
    if (existingTeacher) {
      throw new ConflictException('Employee ID already exists');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: UserRole.TEACHER,
        schoolId: data.schoolId,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        teacher: {
          create: {
            employeeId: data.employeeId,
            hireDate: data.hireDate,
            qualification: data.qualification,
            taughtSubjects: data.subjects || [],
          },
        },
      },
      include: { teacher: true, refreshTokens: true },
    });

    const { passwordHash: _, refreshTokens, ...result } = user;
    return result;
  }

  async getTeachers(params: {
    skip?: number;
    take?: number;
    search?: string;
  }) {
    const { skip, take, search } = params;

    const where: Prisma.TeacherWhereInput = {};
    if (search) {
      where.OR = [
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { employeeId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.teacher.findMany({
        skip,
        take,
        where,
        include: {
          user: { include: { refreshTokens: true } },
          homeroomClasses: { include: { gradeLevel: true } },
          classSubjects: { include: { subject: true, class: true } },
        },
        orderBy: { user: { firstName: 'asc' } },
      }),
      this.prisma.teacher.count({ where }),
    ]);

    return {
      data: data.map((teacher) => {
        const { user, ...rest } = teacher;
        const { passwordHash, refreshTokens, ...userData } = user;
        return { ...rest, user: userData };
      }),
      total,
    };
  }

  async getTeacherById(id: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: {
        user: { include: { refreshTokens: true } },
        homeroomClasses: { include: { gradeLevel: true, academicYear: true } },
        classSubjects: { include: { subject: true, class: { include: { gradeLevel: true } } } },
      },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    const { user, ...rest } = teacher;
    const { passwordHash, refreshTokens, ...userData } = user;
    return { ...rest, user: userData };
  }

  async updateTeacher(id: string, data: Prisma.TeacherUpdateInput) {
    return this.prisma.teacher.update({
      where: { id },
      data,
      include: { user: true },
    });
  }

  // ============================================
  // PARENT OPERATIONS
  // ============================================

  async createParent(data: CreateParentInput) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: UserRole.PARENT,
        schoolId: data.schoolId,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        parent: {
          create: {
            occupation: data.occupation,
            phone: data.phone,
            address: data.address,
          },
        },
      },
      include: { parent: true, refreshTokens: true },
    });

    const { passwordHash: _, refreshTokens, ...result } = user;
    return result;
  }

  async getParents(params: {
    skip?: number;
    take?: number;
    search?: string;
  }) {
    const { skip, take, search } = params;

    const where: Prisma.ParentWhereInput = {};
    if (search) {
      where.OR = [
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.parent.findMany({
        skip,
        take,
        where,
        include: {
          user: { include: { refreshTokens: true } },
          parentRelations: { include: { student: { include: { user: true, class: true } } } },
        },
        orderBy: { user: { firstName: 'asc' } },
      }),
      this.prisma.parent.count({ where }),
    ]);

    return {
      data: data.map((parent) => {
        const { user, ...rest } = parent;
        const { passwordHash, refreshTokens, ...userData } = user;
        return { ...rest, user: userData, students: rest.parentRelations };
      }),
      total,
    };
  }

  async getParentById(id: string) {
    const parent = await this.prisma.parent.findUnique({
      where: { id },
      include: {
        user: { include: { refreshTokens: true } },
        parentRelations: {
          include: {
            student: {
              include: {
                user: true,
                class: { include: { gradeLevel: true } },
                attendances: { take: 5, orderBy: { date: 'desc' } },
                grades: { take: 5, orderBy: { createdAt: 'desc' }, include: { assessment: true } },
              },
            },
          },
        },
      },
    });

    if (!parent) {
      throw new NotFoundException('Parent not found');
    }

    const { user, ...rest } = parent;
    const { passwordHash, refreshTokens, ...userData } = user;
    return { ...rest, user: userData, students: rest.parentRelations };
  }

  async updateParent(id: string, data: Prisma.ParentUpdateInput) {
    return this.prisma.parent.update({
      where: { id },
      data,
      include: { user: true },
    });
  }

  async linkParentToStudent(parentId: string, studentId: string, relationship: string, isPrimary = false) {
    // If setting as primary, unset other primary relationships
    if (isPrimary) {
      await this.prisma.parentStudent.updateMany({
        where: { studentId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    return this.prisma.parentStudent.create({
      data: {
        parentId,
        studentId,
        relationship,
        isPrimary,
      },
      include: { parent: true, student: { include: { user: true } } },
    });
  }

  async unlinkParentFromStudent(parentId: string, studentId: string) {
    return this.prisma.parentStudent.delete({
      where: { parentId_studentId: { parentId, studentId } },
    });
  }

  // ============================================
  // BULK OPERATIONS
  // ============================================

  async bulkCreateUsers(users: CreateUserInput[]) {
    const results = [];
    const errors = [];

    for (const userData of users) {
      try {
        const passwordHash = await bcrypt.hash(userData.password, 12);
        const user = await this.prisma.user.create({
          data: {
            ...userData,
            passwordHash,
            status: UserStatus.ACTIVE,
            emailVerified: true,
          },
        });
        const { passwordHash: _, ...result } = user;
        results.push(result);
      } catch (error) {
        errors.push({ email: userData.email, error: error.message });
      }
    }

    return { created: results.length, errors };
  }
}