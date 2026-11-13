import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, AssessmentType } from '@prisma/client';

interface CreateAssessmentTypeInput {
  name: string;
  weight: number;
  description?: string;
  color?: string;
  isDefault?: boolean;
}

interface CreateAssessmentInput {
  name: string;
  typeId: string;
  classSubjectId: string;
  date: Date;
  maxScore: number;
  weight?: number;
  description?: string;
  instructions?: string;
  attachmentUrl?: string;
  createdById: string;
}

interface RecordGradeInput {
  studentId: string;
  assessmentId: string;
  classSubjectId: string;
  score: number;
  gradedById?: string;
  feedback?: string;
  isPublished?: boolean;
}

interface BulkRecordGradesInput {
  assessmentId: string;
  classSubjectId: string;
  grades: Array<{
    studentId: string;
    score: number;
    gradedById?: string;
    feedback?: string;
    isPublished?: boolean;
  }>;
}

@Injectable()
export class GradesService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // ASSESSMENT TYPE OPERATIONS
  // ============================================

  async createAssessmentType(data: CreateAssessmentTypeInput) {
    // If setting as default, unset other defaults
    if (data.isDefault) {
      await this.prisma.assessmentType.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.assessmentType.create({ data });
  }

  async getAssessmentTypes(params: { skip?: number; take?: number } = {}) {
    const { skip, take } = params;

    const [data, total] = await Promise.all([
      this.prisma.assessmentType.findMany({
        skip,
        take,
        orderBy: { name: 'asc' },
        include: { _count: { select: { assessments: true } } },
      }),
      this.prisma.assessmentType.count(),
    ]);

    return { data, total };
  }

  async getAssessmentTypeById(id: string) {
    const type = await this.prisma.assessmentType.findUnique({
      where: { id },
      include: { assessments: { include: { classSubject: { include: { class: true, subject: true } } } } },
    });

    if (!type) {
      throw new NotFoundException('Assessment type not found');
    }
    return type;
  }

  async updateAssessmentType(id: string, data: Prisma.AssessmentTypeUpdateInput) {
    // If setting as default, unset other defaults
    if (data.isDefault === true) {
      await this.prisma.assessmentType.updateMany({
        where: { isDefault: true, NOT: { id } },
        data: { isDefault: false },
      });
    }

    return this.prisma.assessmentType.update({ where: { id }, data });
  }

  async deleteAssessmentType(id: string) {
    const type = await this.prisma.assessmentType.findUnique({ where: { id } });
    if (!type) {
      throw new NotFoundException('Assessment type not found');
    }

    // Check if type is used
    const count = await this.prisma.assessment.count({ where: { typeId: id } });
    if (count > 0) {
      throw new BadRequestException('Cannot delete assessment type that is in use');
    }

    return this.prisma.assessmentType.delete({ where: { id } });
  }

  // ============================================
  // ASSESSMENT OPERATIONS
  // ============================================

  async createAssessment(data: CreateAssessmentInput) {
    // Validate class subject exists
    const classSubject = await this.prisma.classSubject.findUnique({
      where: { id: data.classSubjectId },
      include: { class: true, subject: true },
    });
    if (!classSubject) {
      throw new NotFoundException('Class subject not found');
    }

    // Validate assessment type exists
    const type = await this.prisma.assessmentType.findUnique({ where: { id: data.typeId } });
    if (!type) {
      throw new NotFoundException('Assessment type not found');
    }

    // Validate createdBy user exists
    const createdBy = await this.prisma.user.findUnique({ where: { id: data.createdById } });
    if (!createdBy) {
      throw new NotFoundException('Created by user not found');
    }

    return this.prisma.assessment.create({
      data: {
        ...data,
        weight: data.weight ?? type.weight,
      },
      include: {
        type: true,
        classSubject: { include: { class: { include: { gradeLevel: true } }, subject: true } },
        createdBy: true,
      },
    });
  }

  async getAssessments(params: {
    skip?: number;
    take?: number;
    classSubjectId?: string;
    typeId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    isPublished?: boolean;
  } = {}) {
    const { skip, take, classSubjectId, typeId, dateFrom, dateTo, isPublished } = params;

    const where: Prisma.AssessmentWhereInput = {};
    if (classSubjectId) where.classSubjectId = classSubjectId;
    if (typeId) where.typeId = typeId;
    if (isPublished !== undefined) where.isPublished = isPublished;
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = dateFrom;
      if (dateTo) where.date.lte = dateTo;
    }

    const [data, total] = await Promise.all([
      this.prisma.assessment.findMany({
        skip,
        take,
        where,
        orderBy: { date: 'desc' },
        include: {
          type: true,
          classSubject: { include: { class: { include: { gradeLevel: true } }, subject: true } },
          createdBy: true,
          _count: { select: { grades: true } },
        },
      }),
      this.prisma.assessment.count({ where }),
    ]);

    return { data, total };
  }

  async getAssessmentById(id: string) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id },
      include: {
        type: true,
        classSubject: { include: { class: { include: { gradeLevel: true, academicYear: true } }, subject: true, teacher: { include: { user: true } } } },
        createdBy: true,
        grades: {
          include: { student: { include: { user: true } }, gradedBy: { include: { user: true } } },
          orderBy: { student: { user: { firstName: 'asc' } } },
        },
      },
    });

    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }
    return assessment;
  }

  async updateAssessment(id: string, data: Prisma.AssessmentUpdateInput) {
    return this.prisma.assessment.update({
      where: { id },
      data,
      include: { type: true, classSubject: { include: { class: true, subject: true } }, createdBy: true },
    });
  }

  async publishAssessment(id: string) {
    const assessment = await this.prisma.assessment.findUnique({ where: { id } });
    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }

    return this.prisma.assessment.update({
      where: { id },
      data: { isPublished: true, publishedAt: new Date() },
      include: { type: true, classSubject: { include: { class: true, subject: true } } },
    });
  }

  async unpublishAssessment(id: string) {
    return this.prisma.assessment.update({
      where: { id },
      data: { isPublished: false, publishedAt: null },
      include: { type: true, classSubject: { include: { class: true, subject: true } } },
    });
  }

  async deleteAssessment(id: string) {
    const assessment = await this.prisma.assessment.findUnique({ where: { id } });
    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }

    return this.prisma.assessment.delete({ where: { id } });
  }

  // ============================================
  // GRADE OPERATIONS
  // ============================================

  async recordGrade(data: RecordGradeInput) {
    // Validate student exists
    const student = await this.prisma.student.findUnique({ where: { id: data.studentId } });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Validate assessment exists
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: data.assessmentId },
      include: { classSubject: true },
    });
    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }

    // Validate student is in the class
    if (assessment.classSubject.classId !== student.classId) {
      throw new BadRequestException('Student is not enrolled in this class');
    }

    // Validate score is within range
    if (data.score < 0 || data.score > assessment.maxScore) {
      throw new BadRequestException(`Score must be between 0 and ${assessment.maxScore}`);
    }

    // Validate classSubject matches
    if (assessment.classSubjectId !== data.classSubjectId) {
      throw new BadRequestException('Class subject does not match assessment');
    }

    // Validate gradedBy if provided
    if (data.gradedById) {
      const gradedBy = await this.prisma.user.findUnique({ where: { id: data.gradedById } });
      if (!gradedBy) {
        throw new NotFoundException('Graded by user not found');
      }
    }

    // Check for existing grade
    const existing = await this.prisma.grade.findUnique({
      where: { studentId_assessmentId: { studentId: data.studentId, assessmentId: data.assessmentId } },
    });

    if (existing) {
      // Update existing grade
      return this.prisma.grade.update({
        where: { id: existing.id },
        data: {
          score: data.score,
          gradedById: data.gradedById,
          gradedAt: data.gradedById ? new Date() : null,
          feedback: data.feedback,
          isPublished: data.isPublished ?? false,
        },
        include: {
          student: { include: { user: true } },
          assessment: { include: { type: true } },
          classSubject: { include: { class: true, subject: true } },
          gradedBy: { include: { user: true } },
        },
      });
    }

    // Create new grade
    return this.prisma.grade.create({
      data: {
        ...data,
        gradedAt: data.gradedById ? new Date() : null,
      },
      include: {
        student: { include: { user: true } },
        assessment: { include: { type: true } },
        classSubject: { include: { class: true, subject: true } },
        gradedBy: { include: { user: true } },
      },
    });
  }

  async bulkRecordGrades(data: BulkRecordGradesInput) {
    const { assessmentId, classSubjectId, grades } = data;

    // Validate assessment
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { classSubject: { include: { class: { include: { students: true } } } } },
    });
    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }
    if (assessment.classSubjectId !== classSubjectId) {
      throw new BadRequestException('Class subject does not match assessment');
    }

    // Get all students in class for validation
    const studentIds = new Set(assessment.classSubject.class.students.map((s) => s.id));
    const results = [];
    const errors = [];

    for (const gradeData of grades) {
      if (!studentIds.has(gradeData.studentId)) {
        errors.push({ studentId: gradeData.studentId, error: 'Student not enrolled in this class' });
        continue;
      }

      if (gradeData.score < 0 || gradeData.score > assessment.maxScore) {
        errors.push({ studentId: gradeData.studentId, error: `Score must be between 0 and ${assessment.maxScore}` });
        continue;
      }

      try {
        const existing = await this.prisma.grade.findUnique({
          where: { studentId_assessmentId: { studentId: gradeData.studentId, assessmentId } },
        });

        if (existing) {
          const updated = await this.prisma.grade.update({
            where: { id: existing.id },
            data: {
              score: gradeData.score,
              gradedById: gradeData.gradedById,
              gradedAt: gradeData.gradedById ? new Date() : null,
              feedback: gradeData.feedback,
              isPublished: gradeData.isPublished ?? false,
            },
            include: {
              student: { include: { user: true } },
              assessment: { include: { type: true } },
              classSubject: { include: { class: true, subject: true } },
              gradedBy: { include: { user: true } },
            },
          });
          results.push(updated);
        } else {
          const created = await this.prisma.grade.create({
            data: {
              studentId: gradeData.studentId,
              assessmentId,
              classSubjectId,
              score: gradeData.score,
              gradedById: gradeData.gradedById,
              gradedAt: gradeData.gradedById ? new Date() : null,
              feedback: gradeData.feedback,
              isPublished: gradeData.isPublished ?? false,
            },
            include: {
              student: { include: { user: true } },
              assessment: { include: { type: true } },
              classSubject: { include: { class: true, subject: true } },
              gradedBy: { include: { user: true } },
            },
          });
          results.push(created);
        }
      } catch (error) {
        errors.push({ studentId: gradeData.studentId, error: error.message });
      }
    }

    return { recorded: results.length, errors, grades: results };
  }

  async getGrades(params: {
    skip?: number;
    take?: number;
    studentId?: string;
    assessmentId?: string;
    classSubjectId?: string;
    isPublished?: boolean;
  } = {}) {
    const { skip, take, studentId, assessmentId, classSubjectId, isPublished } = params;

    const where: Prisma.GradeWhereInput = {};
    if (studentId) where.studentId = studentId;
    if (assessmentId) where.assessmentId = assessmentId;
    if (classSubjectId) where.classSubjectId = classSubjectId;
    if (isPublished !== undefined) where.isPublished = isPublished;

    const [data, total] = await Promise.all([
      this.prisma.grade.findMany({
        skip,
        take,
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          student: { include: { user: true } },
          assessment: { include: { type: true, classSubject: { include: { class: true, subject: true } } } },
          classSubject: { include: { class: true, subject: true } },
          gradedBy: { include: { user: true } },
        },
      }),
      this.prisma.grade.count({ where }),
    ]);

    return { data, total };
  }

  async getGradeById(id: string) {
    const grade = await this.prisma.grade.findUnique({
      where: { id },
      include: {
        student: { include: { user: true } },
        assessment: { include: { type: true, classSubject: { include: { class: true, subject: true } } } },
        classSubject: { include: { class: true, subject: true } },
        gradedBy: { include: { user: true } },
      },
    });

    if (!grade) {
      throw new NotFoundException('Grade not found');
    }
    return grade;
  }

  async updateGrade(id: string, data: Prisma.GradeUpdateInput) {
    return this.prisma.grade.update({
      where: { id },
      data,
      include: {
        student: { include: { user: true } },
        assessment: { include: { type: true } },
        classSubject: { include: { class: true, subject: true } },
        gradedBy: { include: { user: true } },
      },
    });
  }

  async deleteGrade(id: string) {
    return this.prisma.grade.delete({ where: { id } });
  }

  async publishGrade(id: string) {
    return this.prisma.grade.update({
      where: { id },
      data: { isPublished: true },
      include: { student: { include: { user: true } }, assessment: true },
    });
  }

  async unpublishGrade(id: string) {
    return this.prisma.grade.update({
      where: { id },
      data: { isPublished: false },
      include: { student: { include: { user: true } }, assessment: true },
    });
  }

  // ============================================
  // GRADEBOOK VIEW (Grid/Spreadsheet)
  // ============================================

  async getGradebook(classSubjectId: string) {
    const classSubject = await this.prisma.classSubject.findUnique({
      where: { id: classSubjectId },
      include: {
        class: { include: { students: { include: { user: true }, orderBy: { user: { firstName: 'asc' } } } } },
        subject: true,
        assessments: {
          where: { isPublished: true },
          include: { type: true },
          orderBy: { date: 'asc' },
        },
      },
    });

    if (!classSubject) {
      throw new NotFoundException('Class subject not found');
    }

    // Get all grades for this class subject
    const grades = await this.prisma.grade.findMany({
      where: { classSubjectId },
      include: { assessment: { include: { type: true } }, student: { include: { user: true } } },
    });

    // Build gradebook grid
    const students = classSubject.class.students;
    const assessments = classSubject.assessments;

    const gradebook = students.map((student) => {
      const studentGrades = assessments.map((assessment) => {
        const grade = grades.find((g) => g.studentId === student.id && g.assessmentId === assessment.id);
        return {
          assessmentId: assessment.id,
          assessmentName: assessment.name,
          type: assessment.type.name,
          maxScore: assessment.maxScore,
          weight: assessment.weight,
          score: grade?.score ?? null,
          percentage: grade ? (grade.score / assessment.maxScore) * 100 : null,
          isPublished: grade?.isPublished ?? false,
          gradedAt: grade?.gradedAt ?? null,
          feedback: grade?.feedback ?? null,
        };
      });

      // Calculate weighted average
      let totalWeight = 0;
      let weightedSum = 0;
      for (const g of studentGrades) {
        if (g.score !== null && g.weight !== null) {
          weightedSum += (g.score / g.maxScore) * g.weight;
          totalWeight += g.weight;
        }
      }
      const average = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : null;

      return {
        student: { id: student.id, studentId: student.studentId, user: student.user },
        grades: studentGrades,
        average,
        totalWeight,
      };
    });

    return {
      classSubject: { id: classSubject.id, class: classSubject.class, subject: classSubject.subject },
      assessments,
      gradebook,
    };
  }

  // ============================================
  // REPORT CARD OPERATIONS
  // ============================================

  async generateReportCard(data: {
    studentId: string;
    academicYearId: string;
    term: string;
  }) {
    const student = await this.prisma.student.findUnique({
      where: { id: data.studentId },
      include: { user: true, class: { include: { gradeLevel: true, academicYear: true } } },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Get all class subjects for student's class in this academic year
    const classSubjects = await this.prisma.classSubject.findMany({
      where: { classId: student.classId! },
      include: { subject: true, teacher: { include: { user: true } } },
    });

    const subjectsData = [];

    for (const cs of classSubjects) {
      // Get published assessments for this class subject in the term
      const assessments = await this.prisma.assessment.findMany({
        where: {
          classSubjectId: cs.id,
          isPublished: true,
        },
        include: { type: true, grades: { where: { studentId: data.studentId, isPublished: true } } },
        orderBy: { date: 'asc' },
      });

      let totalWeight = 0;
      let weightedSum = 0;

      for (const assessment of assessments) {
        const grade = assessment.grades[0];
        if (grade && grade.isPublished && assessment.weight !== null) {
          weightedSum += (grade.score / assessment.maxScore) * assessment.weight;
          totalWeight += assessment.weight;
        }
      }

      const average = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : null;

      subjectsData.push({
        subject: { id: cs.subject.id, name: cs.subject.name, code: cs.subject.code },
        teacher: cs.teacher ? { id: cs.teacher.id, name: `${cs.teacher.user.firstName} ${cs.teacher.user.lastName}` } : null,
        assessments: assessments.map((a) => ({
          id: a.id,
          name: a.name,
          type: a.type.name,
          maxScore: a.maxScore,
          weight: a.weight,
          date: a.date,
          grade: a.grades[0]?.score ?? null,
          percentage: a.grades[0] ? (a.grades[0].score / a.maxScore) * 100 : null,
        })),
        average,
        letterGrade: this.calculateLetterGrade(average),
      });
    }

    // Calculate overall average
    const overallTotalWeight = subjectsData.reduce((sum, s) => sum + (s.average !== null ? 1 : 0), 0);
    const overallWeightedSum = subjectsData.reduce((sum, s) => sum + (s.average ?? 0), 0);
    const overallAverage = overallTotalWeight > 0 ? overallWeightedSum / overallTotalWeight : null;

    return {
      student: { id: student.id, studentId: student.studentId, user: student.user, class: student.class },
      academicYearId: data.academicYearId,
      term: data.term,
      subjects: subjectsData,
      overallAverage,
      overallLetterGrade: this.calculateLetterGrade(overallAverage),
      generatedAt: new Date(),
    };
  }

  async saveReportCard(data: {
    studentId: string;
    academicYearId: string;
    term: string;
    pdfUrl?: string;
  }) {
    return this.prisma.reportCard.upsert({
      where: { studentId_academicYearId_term: { studentId: data.studentId, academicYearId: data.academicYearId, term: data.term as any } },
      update: { pdfUrl: data.pdfUrl, status: 'PUBLISHED', publishedAt: new Date() },
      create: {
        studentId: data.studentId,
        academicYearId: data.academicYearId,
        term: data.term as any,
        pdfUrl: data.pdfUrl,
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });
  }

  async getReportCards(params: {
    skip?: number;
    take?: number;
    studentId?: string;
    academicYearId?: string;
    term?: string;
    status?: string;
  } = {}) {
    const { skip, take, studentId, academicYearId, term, status } = params;

    const where: Prisma.ReportCardWhereInput = {};
    if (studentId) where.studentId = studentId;
    if (academicYearId) where.academicYearId = academicYearId;
    if (term) where.term = term as any;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.reportCard.findMany({
        skip,
        take,
        where,
        orderBy: { generatedAt: 'desc' },
        include: { student: { include: { user: true, class: true } }, academicYear: true },
      }),
      this.prisma.reportCard.count({ where }),
    ]);

    return { data, total };
  }

  async getReportCardById(id: string) {
    const reportCard = await this.prisma.reportCard.findUnique({
      where: { id },
      include: { student: { include: { user: true, class: { include: { gradeLevel: true } } } }, academicYear: true },
    });

    if (!reportCard) {
      throw new NotFoundException('Report card not found');
    }
    return reportCard;
  }

  async publishReportCard(id: string) {
    return this.prisma.reportCard.update({
      where: { id },
      data: { status: 'PUBLISHED', publishedAt: new Date() },
    });
  }

  // ============================================
  // ANALYTICS
  // ============================================

  async getClassSubjectAnalytics(classSubjectId: string) {
    const classSubject = await this.prisma.classSubject.findUnique({
      where: { id: classSubjectId },
      include: { class: { include: { students: { include: { user: true } } } }, subject: true, assessments: { include: { type: true } } },
    });
    if (!classSubject) {
      throw new NotFoundException('Class subject not found');
    }

    const grades = await this.prisma.grade.findMany({
      where: { classSubjectId, isPublished: true },
      include: { assessment: { include: { type: true } }, student: { include: { user: true } } },
    });

    // Assessment-level stats
    const assessmentStats = classSubject.assessments.map((assessment) => {
      const assessmentGrades = grades.filter((g) => g.assessmentId === assessment.id);
      const scores = assessmentGrades.map((g) => g.score);
      const count = scores.length;
      const avg = count > 0 ? scores.reduce((a, b) => a + b, 0) / count : 0;
      const max = count > 0 ? Math.max(...scores) : 0;
      const min = count > 0 ? Math.min(...scores) : 0;
      const passRate = count > 0 ? (scores.filter((s) => (s / assessment.maxScore) * 100 >= 50).length / count) * 100 : 0;

      return {
        assessment: { id: assessment.id, name: assessment.name, type: assessment.type.name, maxScore: assessment.maxScore, weight: assessment.weight },
        stats: { count, avg, max, min, passRate, submissionRate: (count / classSubject.class.students.length) * 100 },
      };
    });

    // Student-level stats
    const studentStats = classSubject.class.students.map((student) => {
      const studentGrades = grades.filter((g) => g.studentId === student.id);
      const assessmentsWithGrades = studentGrades.length;
      const totalWeight = studentGrades.reduce((sum, g) => sum + (g.assessment.weight ?? 0), 0);
      const weightedSum = studentGrades.reduce((sum, g) => sum + (g.assessment.weight !== null ? (g.score / g.assessment.maxScore) * g.assessment.weight : 0), 0);
      const average = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 0;

      return {
        student: { id: student.id, studentId: student.studentId, user: student.user },
        assessmentsCompleted: assessmentsWithGrades,
        totalAssessments: classSubject.assessments.length,
        average,
        letterGrade: this.calculateLetterGrade(average),
      };
    });

    return {
      classSubject: { id: classSubject.id, class: classSubject.class, subject: classSubject.subject },
      assessmentStats,
      studentStats,
      classAverage: studentStats.length > 0 ? studentStats.reduce((sum, s) => sum + s.average, 0) / studentStats.length : 0,
    };
  }

  async getStudentAnalytics(studentId: string, params: { classSubjectId?: string } = {}) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true, class: { include: { gradeLevel: true } } },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const where: Prisma.GradeWhereInput = { studentId, isPublished: true };
    if (params.classSubjectId) where.classSubjectId = params.classSubjectId;

    const grades = await this.prisma.grade.findMany({
      where,
      include: { assessment: { include: { type: true, classSubject: { include: { subject: true, class: true } } } } },
      orderBy: { assessment: { date: 'desc' } },
    });

    // Group by subject
    const bySubject = grades.reduce((acc, g) => {
      const subjectName = g.assessment.classSubject.subject.name;
      if (!acc[subjectName]) {
        acc[subjectName] = { grades: [], totalWeight: 0, weightedSum: 0 };
      }
      acc[subjectName].grades.push(g);
      acc[subjectName].totalWeight += g.assessment.weight ?? 0;
      acc[subjectName].weightedSum += g.assessment.weight !== null ? (g.score / g.assessment.maxScore) * g.assessment.weight : 0;
      return acc;
    }, {} as Record<string, { grades: typeof grades; totalWeight: number; weightedSum: number }>);

    const subjectAnalytics = Object.entries(bySubject).map(([subjectName, data]) => {
      const avg = data.totalWeight > 0 ? (data.weightedSum / data.totalWeight) * 100 : 0;
      return {
        subject: subjectName,
        average: avg,
        letterGrade: this.calculateLetterGrade(avg),
        assessmentsCount: data.grades.length,
      };
    });

    // Overall stats
    const totalWeight = grades.reduce((sum, g) => sum + (g.assessment.weight ?? 0), 0);
    const weightedSum = grades.reduce((sum, g) => sum + (g.assessment.weight !== null ? (g.score / g.assessment.maxScore) * g.assessment.weight : 0), 0);
    const overallAverage = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 0;

    return {
      student: { id: student.id, studentId: student.studentId, user: student.user, class: student.class },
      overallAverage,
      overallLetterGrade: this.calculateLetterGrade(overallAverage),
      subjectAnalytics,
      recentGrades: grades.slice(0, 10),
    };
  }

  private calculateLetterGrade(average: number | null): string | null {
    if (average === null) return null;
    if (average >= 90) return 'A';
    if (average >= 80) return 'B';
    if (average >= 70) return 'C';
    if (average >= 60) return 'D';
    return 'F';
  }
}