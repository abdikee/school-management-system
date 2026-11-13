import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, UserRole, Term } from '@prisma/client';

@Injectable()
export class AcademicService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // SCHOOL OPERATIONS
  // ============================================

  async createSchool(data: {
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
    return this.prisma.school.create({ data });
  }

  async getSchools(params: {
    skip?: number;
    take?: number;
    search?: string;
  }) {
    const { skip, take, search } = params;

    const where: Prisma.SchoolWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.school.findMany({
        skip,
        take,
        where,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.school.count({ where }),
    ]);

    return { data, total };
  }

  async getSchoolById(id: string) {
    const school = await this.prisma.school.findUnique({
      where: { id },
      include: {
        academicYears: { orderBy: { startDate: 'desc' } },
        gradeLevels: { orderBy: { order: 'asc' } },
        _count: { select: { users: true, classes: true } },
      },
    });

    if (!school) {
      throw new NotFoundException('School not found');
    }
    return school;
  }

  async updateSchool(id: string, data: Prisma.SchoolUpdateInput) {
    return this.prisma.school.update({ where: { id }, data });
  }

  async deleteSchool(id: string) {
    return this.prisma.school.delete({ where: { id } });
  }

  // ============================================
  // ACADEMIC YEAR OPERATIONS
  // ============================================

  async createAcademicYear(data: {
    name: string;
    startDate: Date;
    endDate: Date;
    schoolId: string;
    isCurrent?: boolean;
  }) {
    // If setting as current, unset other current years for this school
    if (data.isCurrent) {
      await this.prisma.academicYear.updateMany({
        where: { schoolId: data.schoolId, isCurrent: true },
        data: { isCurrent: false },
      });
    }

    return this.prisma.academicYear.create({ data });
  }

  async getAcademicYears(schoolId: string, params: { skip?: number; take?: number } = {}) {
    const { skip, take } = params;
    const where: Prisma.AcademicYearWhereInput = { schoolId };

    const [data, total] = await Promise.all([
      this.prisma.academicYear.findMany({
        skip,
        take,
        where,
        orderBy: { startDate: 'desc' },
        include: {
          _count: { select: { classes: true, feeStructures: true, reportCards: true } },
        },
      }),
      this.prisma.academicYear.count({ where }),
    ]);

    return { data, total };
  }

  async getAcademicYearById(id: string) {
    const year = await this.prisma.academicYear.findUnique({
      where: { id },
      include: {
        school: true,
        classes: { include: { gradeLevel: true, homeroomTeacher: { include: { user: true } } } },
        feeStructures: true,
      },
    });

    if (!year) {
      throw new NotFoundException('Academic year not found');
    }
    return year;
  }

  async getCurrentAcademicYear(schoolId: string) {
    return this.prisma.academicYear.findFirst({
      where: { schoolId, isCurrent: true },
    });
  }

  async updateAcademicYear(id: string, data: Prisma.AcademicYearUpdateInput) {
    // If setting as current, unset others
    if (data.isCurrent === true) {
      const year = await this.prisma.academicYear.findUnique({ where: { id } });
      if (year) {
        await this.prisma.academicYear.updateMany({
          where: { schoolId: year.schoolId, isCurrent: true, NOT: { id } },
          data: { isCurrent: false },
        });
      }
    }
    return this.prisma.academicYear.update({ where: { id }, data });
  }

  async deleteAcademicYear(id: string) {
    return this.prisma.academicYear.delete({ where: { id } });
  }

  // ============================================
  // GRADE LEVEL OPERATIONS
  // ============================================

  async createGradeLevel(data: {
    name: string;
    order: number;
    schoolId: string;
  }) {
    // Check for duplicate name or order
    const existing = await this.prisma.gradeLevel.findFirst({
      where: {
        schoolId: data.schoolId,
        OR: [{ name: data.name }, { order: data.order }],
      },
    });
    if (existing) {
      throw new ConflictException('Grade level with this name or order already exists');
    }

    return this.prisma.gradeLevel.create({ data });
  }

  async getGradeLevels(schoolId: string, params: { skip?: number; take?: number } = {}) {
    const { skip, take } = params;
    const where: Prisma.GradeLevelWhereInput = { schoolId };

    const [data, total] = await Promise.all([
      this.prisma.gradeLevel.findMany({
        skip,
        take,
        where,
        orderBy: { order: 'asc' },
        include: {
          _count: { select: { classes: true, subjects: true, students: true, feeStructures: true } },
        },
      }),
      this.prisma.gradeLevel.count({ where }),
    ]);

    return { data, total };
  }

  async getGradeLevelById(id: string) {
    const gradeLevel = await this.prisma.gradeLevel.findUnique({
      where: { id },
      include: {
        school: true,
        classes: { include: { academicYear: true, homeroomTeacher: { include: { user: true } } } },
        subjects: true,
        feeStructures: { where: { isActive: true } },
      },
    });

    if (!gradeLevel) {
      throw new NotFoundException('Grade level not found');
    }
    return gradeLevel;
  }

  async updateGradeLevel(id: string, data: Prisma.GradeLevelUpdateInput) {
    return this.prisma.gradeLevel.update({ where: { id }, data });
  }

  async deleteGradeLevel(id: string) {
    return this.prisma.gradeLevel.delete({ where: { id } });
  }

  // ============================================
  // SUBJECT OPERATIONS
  // ============================================

  async createSubject(data: {
    name: string;
    code: string;
    description?: string;
    gradeLevelId: string;
    isCore?: boolean;
    color?: string;
  }) {
    // Check for duplicate code in grade level
    const existing = await this.prisma.subject.findFirst({
      where: { gradeLevelId: data.gradeLevelId, code: data.code },
    });
    if (existing) {
      throw new ConflictException('Subject with this code already exists in this grade level');
    }

    return this.prisma.subject.create({ data });
  }

  async getSubjects(gradeLevelId: string, params: { skip?: number; take?: number } = {}) {
    const { skip, take } = params;
    const where: Prisma.SubjectWhereInput = { gradeLevelId };

    const [data, total] = await Promise.all([
      this.prisma.subject.findMany({
        skip,
        take,
        where,
        orderBy: { name: 'asc' },
        include: {
          _count: { select: { classSubjects: true, assessments: true } },
        },
      }),
      this.prisma.subject.count({ where }),
    ]);

    return { data, total };
  }

  async getSubjectById(id: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      include: {
        gradeLevel: true,
        classSubjects: {
          include: { class: { include: { gradeLevel: true, academicYear: true } }, teacher: { include: { user: true } } },
        },
      },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }
    return subject;
  }

  async updateSubject(id: string, data: Prisma.SubjectUpdateInput) {
    return this.prisma.subject.update({ where: { id }, data });
  }

  async deleteSubject(id: string) {
    return this.prisma.subject.delete({ where: { id } });
  }

  // ============================================
  // CLASS OPERATIONS
  // ============================================

  async createClass(data: {
    name: string;
    gradeLevelId: string;
    academicYearId: string;
    homeroomTeacherId?: string;
    capacity?: number;
    room?: string;
  }) {
    // Check capacity
    if (data.capacity && data.capacity < 1) {
      throw new BadRequestException('Capacity must be at least 1');
    }

    // Check for duplicate class name in grade level + academic year
    const existing = await this.prisma.class.findFirst({
      where: {
        gradeLevelId: data.gradeLevelId,
        academicYearId: data.academicYearId,
        name: data.name,
      },
    });
    if (existing) {
      throw new ConflictException('Class with this name already exists in this grade level and academic year');
    }

    // If homeroom teacher specified, verify they're a teacher
    if (data.homeroomTeacherId) {
      const teacher = await this.prisma.teacher.findUnique({
        where: { id: data.homeroomTeacherId },
      });
      if (!teacher) {
        throw new NotFoundException('Homeroom teacher not found');
      }
    }

    return this.prisma.class.create({
      data,
      include: {
        gradeLevel: true,
        academicYear: true,
        homeroomTeacher: { include: { user: true } },
      },
    });
  }

  async getClasses(params: {
    skip?: number;
    take?: number;
    gradeLevelId?: string;
    academicYearId?: string;
    search?: string;
  }) {
    const { skip, take, gradeLevelId, academicYearId, search } = params;

    const where: Prisma.ClassWhereInput = {};
    if (gradeLevelId) where.gradeLevelId = gradeLevelId;
    if (academicYearId) where.academicYearId = academicYearId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { room: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.class.findMany({
        skip,
        take,
        where,
        orderBy: [{ gradeLevel: { order: 'asc' } }, { name: 'asc' }],
        include: {
          gradeLevel: true,
          academicYear: true,
          homeroomTeacher: { include: { user: true } },
          _count: { select: { students: true, classSubjects: true, timetableEntries: true } },
        },
      }),
      this.prisma.class.count({ where }),
    ]);

    return { data, total };
  }

  async getClassById(id: string) {
    const classData = await this.prisma.class.findUnique({
      where: { id },
      include: {
        gradeLevel: true,
        academicYear: true,
        homeroomTeacher: { include: { user: true } },
        students: { include: { user: true }, orderBy: { user: { firstName: 'asc' } } },
        classSubjects: {
          include: { subject: true, teacher: { include: { user: true } } },
        },
        timetableEntries: {
          include: { subject: true, teacher: { include: { user: true } } },
          orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        },
      },
    });

    if (!classData) {
      throw new NotFoundException('Class not found');
    }
    return classData;
  }

  async updateClass(id: string, data: Prisma.ClassUpdateInput) {
    return this.prisma.class.update({
      where: { id },
      data,
      include: {
        gradeLevel: true,
        academicYear: true,
        homeroomTeacher: { include: { user: true } },
      },
    });
  }

  async deleteClass(id: string) {
    return this.prisma.class.delete({ where: { id } });
  }

  // ============================================
  // CLASS-SUBJECT (Teacher Assignment) OPERATIONS
  // ============================================

  async assignSubjectToClass(data: {
    classId: string;
    subjectId: string;
    teacherId?: string;
  }) {
    // Check for existing assignment
    const existing = await this.prisma.classSubject.findUnique({
      where: { classId_subjectId: { classId: data.classId, subjectId: data.subjectId } },
    });
    if (existing) {
      throw new ConflictException('Subject already assigned to this class');
    }

    // If teacher specified, verify they're a teacher
    if (data.teacherId) {
      const teacher = await this.prisma.teacher.findUnique({
        where: { id: data.teacherId },
      });
      if (!teacher) {
        throw new NotFoundException('Teacher not found');
      }
    }

    return this.prisma.classSubject.create({
      data,
      include: {
        class: { include: { gradeLevel: true, academicYear: true } },
        subject: true,
        teacher: { include: { user: true } },
      },
    });
  }

  async getClassSubjects(classId: string) {
    return this.prisma.classSubject.findMany({
      where: { classId },
      include: {
        subject: true,
        teacher: { include: { user: true } },
      },
      orderBy: { subject: { name: 'asc' } },
    });
  }

  async updateClassSubject(id: string, data: Prisma.ClassSubjectUpdateInput) {
    return this.prisma.classSubject.update({
      where: { id },
      data,
      include: { subject: true, teacher: { include: { user: true } } },
    });
  }

  async removeSubjectFromClass(classId: string, subjectId: string) {
    return this.prisma.classSubject.delete({
      where: { classId_subjectId: { classId, subjectId } },
    });
  }

  // ============================================
  // TIMETABLE OPERATIONS
  // ============================================

  async createTimetableEntry(data: {
    classId: string;
    subjectId: string;
    teacherId?: string;
    dayOfWeek: number; // 0-6
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    room?: string;
  }) {
    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(data.startTime) || !timeRegex.test(data.endTime)) {
      throw new BadRequestException('Invalid time format. Use HH:mm');
    }

    // Check for conflicts
    const conflict = await this.prisma.timetableEntry.findFirst({
      where: {
        classId: data.classId,
        dayOfWeek: data.dayOfWeek,
        OR: [
          { startTime: { lte: data.startTime }, endTime: { gt: data.startTime } },
          { startTime: { lt: data.endTime }, endTime: { gte: data.endTime } },
          { startTime: { gte: data.startTime }, endTime: { lte: data.endTime } },
        ],
      },
    });
    if (conflict) {
      throw new ConflictException('Time slot conflicts with existing entry');
    }

    // If teacher specified, check teacher conflicts
    if (data.teacherId) {
      const teacherConflict = await this.prisma.timetableEntry.findFirst({
        where: {
          teacherId: data.teacherId,
          dayOfWeek: data.dayOfWeek,
          OR: [
            { startTime: { lte: data.startTime }, endTime: { gt: data.startTime } },
            { startTime: { lt: data.endTime }, endTime: { gte: data.endTime } },
            { startTime: { gte: data.startTime }, endTime: { lte: data.endTime } },
          ],
        },
      });
      if (teacherConflict) {
        throw new ConflictException('Teacher has a conflict at this time');
      }
    }

    // Verify class-subject exists
    const classSubject = await this.prisma.classSubject.findUnique({
      where: { classId_subjectId: { classId: data.classId, subjectId: data.subjectId } },
    });
    if (!classSubject) {
      throw new BadRequestException('Subject not assigned to this class');
    }

    return this.prisma.timetableEntry.create({
      data,
      include: {
        class: { include: { gradeLevel: true } },
        subject: true,
        teacher: { include: { user: true } },
      },
    });
  }

  async getTimetable(classId: string) {
    return this.prisma.timetableEntry.findMany({
      where: { classId, isActive: true },
      include: {
        subject: true,
        teacher: { include: { user: true } },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  async getTeacherTimetable(teacherId: string) {
    return this.prisma.timetableEntry.findMany({
      where: { teacherId, isActive: true },
      include: {
        class: { include: { gradeLevel: true } },
        subject: true,
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  async updateTimetableEntry(id: string, data: Prisma.TimetableEntryUpdateInput) {
    return this.prisma.timetableEntry.update({
      where: { id },
      data,
      include: { class: true, subject: true, teacher: { include: { user: true } } },
    });
  }

  async deleteTimetableEntry(id: string) {
    return this.prisma.timetableEntry.delete({ where: { id } });
  }

  // ============================================
  // BULK OPERATIONS
  // ============================================

  async bulkCreateClasses(classes: Array<{
    name: string;
    gradeLevelId: string;
    academicYearId: string;
    homeroomTeacherId?: string;
    capacity?: number;
    room?: string;
  }>) {
    const results = [];
    const errors = [];

    for (const classData of classes) {
      try {
        const result = await this.createClass(classData);
        results.push(result);
      } catch (error) {
        errors.push({ name: classData.name, error: error.message });
      }
    }

    return { created: results.length, errors };
  }

  async promoteStudents(currentAcademicYearId: string, nextAcademicYearId: string) {
    // Get all classes in current year
    const currentClasses = await this.prisma.class.findMany({
      where: { academicYearId: currentAcademicYearId },
      include: { gradeLevel: true, students: true },
    });

    // Get next year's grade levels
    const nextGradeLevels = await this.prisma.gradeLevel.findMany({
      where: { schoolId: currentClasses[0]?.gradeLevel?.schoolId },
    });

    const results = [];
    for (const currentClass of currentClasses) {
      const nextGradeLevel = nextGradeLevels.find(
        (gl) => gl.order === currentClass.gradeLevel.order + 1,
      );

      if (nextGradeLevel) {
        // Find or create next year's class
        let nextClass = await this.prisma.class.findFirst({
          where: {
            academicYearId: nextAcademicYearId,
            gradeLevelId: nextGradeLevel.id,
          },
        });

        if (!nextClass) {
          nextClass = await this.prisma.class.create({
            data: {
              name: currentClass.name,
              gradeLevelId: nextGradeLevel.id,
              academicYearId: nextAcademicYearId,
              capacity: currentClass.capacity,
              room: currentClass.room,
            },
          });
        }

        // Enroll students
        for (const student of currentClass.students) {
          await this.prisma.student.update({
            where: { id: student.id },
            data: { classId: nextClass.id, gradeLevelId: nextGradeLevel.id },
          });
          results.push({ studentId: student.id, fromClass: currentClass.name, toClass: nextClass.name });
        }
      }
    }

    return { promoted: results.length, details: results };
  }
}