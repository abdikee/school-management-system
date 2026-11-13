import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, AttendanceStatus, AttendanceSessionStatus, UserRole } from '@prisma/client';

interface CreateAttendanceSessionInput {
  classId: string;
  subjectId?: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  teacherId: string;
  notes?: string;
}

interface RecordAttendanceInput {
  studentId: string;
  classId: string;
  subjectId?: string;
  sessionId?: string;
  date: Date;
  status: AttendanceStatus;
  checkInTime?: Date;
  checkOutTime?: Date;
  notes?: string;
  recordedById: string;
}

interface BulkRecordAttendanceInput {
  classId: string;
  subjectId?: string;
  sessionId?: string;
  date: Date;
  records: Array<{
    studentId: string;
    status: AttendanceStatus;
    checkInTime?: Date;
    checkOutTime?: Date;
    notes?: string;
  }>;
  recordedById: string;
}

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // ATTENDANCE SESSION OPERATIONS
  // ============================================

  async createAttendanceSession(data: CreateAttendanceSessionInput) {
    // Validate class exists
    const classData = await this.prisma.class.findUnique({
      where: { id: data.classId },
      include: { gradeLevel: true, academicYear: true },
    });
    if (!classData) {
      throw new NotFoundException('Class not found');
    }

    // Validate subject if provided
    if (data.subjectId) {
      const subject = await this.prisma.subject.findUnique({
        where: { id: data.subjectId },
      });
      if (!subject) {
        throw new NotFoundException('Subject not found');
      }

      // Verify subject is assigned to this class
      const classSubject = await this.prisma.classSubject.findUnique({
        where: { classId_subjectId: { classId: data.classId, subjectId: data.subjectId } },
      });
      if (!classSubject) {
        throw new BadRequestException('Subject not assigned to this class');
      }
    }

    // Validate teacher exists
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: data.teacherId },
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Check for duplicate session (same class, subject, date, startTime)
    const existing = await this.prisma.attendanceSession.findUnique({
      where: {
        classId_subjectId_date_startTime: {
          classId: data.classId,
          subjectId: data.subjectId || '',
          date: data.date,
          startTime: data.startTime,
        },
      },
    });
    if (existing) {
      throw new ConflictException('Attendance session already exists for this class, subject, date, and time');
    }

    return this.prisma.attendanceSession.create({
      data: {
        ...data,
        subjectId: data.subjectId || null,
      },
      include: {
        class: { include: { gradeLevel: true, academicYear: true } },
        subject: true,
        teacher: { include: { user: true } },
      },
    });
  }

  async getAttendanceSessions(params: {
    skip?: number;
    take?: number;
    classId?: string;
    teacherId?: string;
    subjectId?: string;
    date?: Date;
    dateFrom?: Date;
    dateTo?: Date;
    status?: AttendanceSessionStatus;
  }) {
    const { skip, take, classId, teacherId, subjectId, date, dateFrom, dateTo, status } = params;

    const where: Prisma.AttendanceSessionWhereInput = {};
    if (classId) where.classId = classId;
    if (teacherId) where.teacherId = teacherId;
    if (subjectId) where.subjectId = subjectId;
    if (status) where.status = status;
    if (date) {
      where.date = date;
    } else if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = dateFrom;
      if (dateTo) where.date.lte = dateTo;
    }

    const [data, total] = await Promise.all([
      this.prisma.attendanceSession.findMany({
        skip,
        take,
        where,
        orderBy: { date: 'desc' },
        include: {
          class: { include: { gradeLevel: true } },
          subject: true,
          teacher: { include: { user: true } },
          _count: { select: { attendances: true } },
        },
      }),
      this.prisma.attendanceSession.count({ where }),
    ]);

    return { data, total };
  }

  async getAttendanceSessionById(id: string) {
    const session = await this.prisma.attendanceSession.findUnique({
      where: { id },
      include: {
        class: { include: { gradeLevel: true, academicYear: true } },
        subject: true,
        teacher: { include: { user: true } },
        attendances: {
          include: {
            student: { include: { user: true } },
            recordedBy: true,
          },
          orderBy: { student: { user: { firstName: 'asc' } } },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Attendance session not found');
    }
    return session;
  }

  async updateAttendanceSession(id: string, data: Prisma.AttendanceSessionUpdateInput) {
    return this.prisma.attendanceSession.update({
      where: { id },
      data,
      include: {
        class: { include: { gradeLevel: true } },
        subject: true,
        teacher: { include: { user: true } },
      },
    });
  }

  async closeAttendanceSession(id: string) {
    const session = await this.prisma.attendanceSession.findUnique({ where: { id } });
    if (!session) {
      throw new NotFoundException('Attendance session not found');
    }
    if (session.status === AttendanceSessionStatus.CLOSED) {
      throw new BadRequestException('Session is already closed');
    }
    if (session.status === AttendanceSessionStatus.CANCELLED) {
      throw new BadRequestException('Cannot close a cancelled session');
    }

    return this.prisma.attendanceSession.update({
      where: { id },
      data: { status: AttendanceSessionStatus.CLOSED },
      include: {
        class: true,
        subject: true,
        teacher: { include: { user: true } },
      },
    });
  }

  async cancelAttendanceSession(id: string) {
    const session = await this.prisma.attendanceSession.findUnique({ where: { id } });
    if (!session) {
      throw new NotFoundException('Attendance session not found');
    }
    if (session.status === AttendanceSessionStatus.CLOSED) {
      throw new BadRequestException('Cannot cancel a closed session');
    }

    return this.prisma.attendanceSession.update({
      where: { id },
      data: { status: AttendanceSessionStatus.CANCELLED },
      include: {
        class: true,
        subject: true,
        teacher: { include: { user: true } },
      },
    });
  }

  async deleteAttendanceSession(id: string) {
    const session = await this.prisma.attendanceSession.findUnique({ where: { id } });
    if (!session) {
      throw new NotFoundException('Attendance session not found');
    }
    if (session.status === AttendanceSessionStatus.CLOSED) {
      throw new BadRequestException('Cannot delete a closed session. Cancel it first.');
    }

    return this.prisma.attendanceSession.delete({ where: { id } });
  }

  // ============================================
  // ATTENDANCE RECORDING OPERATIONS
  // ============================================

  async recordAttendance(data: RecordAttendanceInput) {
    // Validate student exists and is in the class
    const student = await this.prisma.student.findUnique({
      where: { id: data.studentId },
      include: { class: true },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    if (student.classId !== data.classId) {
      throw new BadRequestException('Student is not enrolled in this class');
    }

    // Validate class exists
    const classData = await this.prisma.class.findUnique({ where: { id: data.classId } });
    if (!classData) {
      throw new NotFoundException('Class not found');
    }

    // Validate subject if provided
    if (data.subjectId) {
      const subject = await this.prisma.subject.findUnique({ where: { id: data.subjectId } });
      if (!subject) {
        throw new NotFoundException('Subject not found');
      }
      const classSubject = await this.prisma.classSubject.findUnique({
        where: { classId_subjectId: { classId: data.classId, subjectId: data.subjectId } },
      });
      if (!classSubject) {
        throw new BadRequestException('Subject not assigned to this class');
      }
    }

    // Validate session if provided
    if (data.sessionId) {
      const session = await this.prisma.attendanceSession.findUnique({ where: { id: data.sessionId } });
      if (!session) {
        throw new NotFoundException('Attendance session not found');
      }
      if (session.classId !== data.classId) {
        throw new BadRequestException('Session does not belong to this class');
      }
      if (session.subjectId !== data.subjectId) {
        throw new BadRequestException('Session subject does not match');
      }
      if (session.status === AttendanceSessionStatus.CLOSED) {
        throw new BadRequestException('Cannot record attendance for a closed session');
      }
      if (session.status === AttendanceSessionStatus.CANCELLED) {
        throw new BadRequestException('Cannot record attendance for a cancelled session');
      }
    }

    // Check for existing attendance record (unique constraint)
    const existing = await this.prisma.attendance.findFirst({
      where: {
        studentId: data.studentId,
        classId: data.classId,
        date: data.date,
        subjectId: data.subjectId ?? null,
      },
    });
    if (existing) {
      throw new ConflictException('Attendance record already exists for this student, class, date, and subject');
    }

    // Validate recordedBy user exists
    const recordedBy = await this.prisma.user.findUnique({ where: { id: data.recordedById } });
    if (!recordedBy) {
      throw new NotFoundException('Recorded by user not found');
    }

    return this.prisma.attendance.create({
      data: {
        ...data,
        subjectId: data.subjectId ?? null,
        sessionId: data.sessionId ?? null,
      },
      include: {
        student: { include: { user: true } },
        class: { include: { gradeLevel: true } },
        subject: true,
        session: true,
        recordedBy: true,
      },
    });
  }

  async bulkRecordAttendance(data: BulkRecordAttendanceInput) {
    const { classId, subjectId, sessionId, date, records, recordedById } = data;

    // Validate class
    const classData = await this.prisma.class.findUnique({
      where: { id: classId },
      include: { students: true },
    });
    if (!classData) {
      throw new NotFoundException('Class not found');
    }

    // Validate subject if provided
    if (subjectId) {
      const classSubject = await this.prisma.classSubject.findUnique({
        where: { classId_subjectId: { classId, subjectId } },
      });
      if (!classSubject) {
        throw new BadRequestException('Subject not assigned to this class');
      }
    }

    // Validate session if provided
    if (sessionId) {
      const session = await this.prisma.attendanceSession.findUnique({ where: { id: sessionId } });
      if (!session) {
        throw new NotFoundException('Attendance session not found');
      }
      if (session.classId !== classId || session.subjectId !== subjectId) {
        throw new BadRequestException('Session does not match class/subject');
      }
      if (session.status === AttendanceSessionStatus.CLOSED) {
        throw new BadRequestException('Cannot record attendance for a closed session');
      }
      if (session.status === AttendanceSessionStatus.CANCELLED) {
        throw new BadRequestException('Cannot record attendance for a cancelled session');
      }
    }

    // Validate recordedBy
    const recordedBy = await this.prisma.user.findUnique({ where: { id: recordedById } });
    if (!recordedBy) {
      throw new NotFoundException('Recorded by user not found');
    }

    // Get all students in class for validation
    const studentIds = new Set(classData.students.map((s) => s.id));
    const results = [];
    const errors = [];

    // Process each record in a transaction
    for (const record of records) {
      if (!studentIds.has(record.studentId)) {
        errors.push({ studentId: record.studentId, error: 'Student not enrolled in this class' });
        continue;
      }

      try {
        // Check for existing record
        const existing = await this.prisma.attendance.findFirst({
          where: {
            studentId: record.studentId,
            classId,
            date,
            subjectId: subjectId ?? null,
          },
        });

        if (existing) {
          // Update existing record
          const updated = await this.prisma.attendance.update({
            where: { id: existing.id },
            data: {
              status: record.status,
              checkInTime: record.checkInTime,
              checkOutTime: record.checkOutTime,
              notes: record.notes,
              recordedById,
            },
            include: {
              student: { include: { user: true } },
              class: { include: { gradeLevel: true } },
              subject: true,
              recordedBy: true,
            },
          });
          results.push(updated);
        } else {
          // Create new record
          const created = await this.prisma.attendance.create({
            data: {
              studentId: record.studentId,
              classId,
              subjectId: subjectId || null,
              sessionId: sessionId || null,
              date,
              status: record.status,
              checkInTime: record.checkInTime,
              checkOutTime: record.checkOutTime,
              notes: record.notes,
              recordedById,
            },
            include: {
              student: { include: { user: true } },
              class: { include: { gradeLevel: true } },
              subject: true,
              recordedBy: true,
            },
          });
          results.push(created);
        }
      } catch (error) {
        errors.push({ studentId: record.studentId, error: error.message });
      }
    }

    return { recorded: results.length, errors, records: results };
  }

  async getAttendances(params: {
    skip?: number;
    take?: number;
    studentId?: string;
    classId?: string;
    subjectId?: string;
    sessionId?: string;
    date?: Date;
    dateFrom?: Date;
    dateTo?: Date;
    status?: AttendanceStatus;
  }) {
    const { skip, take, studentId, classId, subjectId, sessionId, date, dateFrom, dateTo, status } = params;

    const where: Prisma.AttendanceWhereInput = {};
    if (studentId) where.studentId = studentId;
    if (classId) where.classId = classId;
    if (subjectId) where.subjectId = subjectId;
    if (sessionId) where.sessionId = sessionId;
    if (status) where.status = status;
    if (date) {
      where.date = date;
    } else if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = dateFrom;
      if (dateTo) where.date.lte = dateTo;
    }

    const [data, total] = await Promise.all([
      this.prisma.attendance.findMany({
        skip,
        take,
        where,
        orderBy: { date: 'desc' },
        include: {
          student: { include: { user: true } },
          class: { include: { gradeLevel: true } },
          subject: true,
          session: true,
          recordedBy: true,
        },
      }),
      this.prisma.attendance.count({ where }),
    ]);

    return { data, total };
  }

  async getAttendanceById(id: string) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
      include: {
        student: { include: { user: true } },
        class: { include: { gradeLevel: true, academicYear: true } },
        subject: true,
        session: true,
        recordedBy: true,
      },
    });

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }
    return attendance;
  }

  async updateAttendance(id: string, data: Prisma.AttendanceUpdateInput) {
    // Check if record exists
    const existing = await this.prisma.attendance.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Attendance record not found');
    }

    // If session is closed, don't allow updates
    if (existing.sessionId) {
      const session = await this.prisma.attendanceSession.findUnique({ where: { id: existing.sessionId } });
      if (session?.status === AttendanceSessionStatus.CLOSED) {
        throw new BadRequestException('Cannot update attendance for a closed session');
      }
    }

    return this.prisma.attendance.update({
      where: { id },
      data,
      include: {
        student: { include: { user: true } },
        class: { include: { gradeLevel: true } },
        subject: true,
        recordedBy: true,
      },
    });
  }

  async deleteAttendance(id: string) {
    const existing = await this.prisma.attendance.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Attendance record not found');
    }

    // If session is closed, don't allow deletion
    if (existing.sessionId) {
      const session = await this.prisma.attendanceSession.findUnique({ where: { id: existing.sessionId } });
      if (session?.status === AttendanceSessionStatus.CLOSED) {
        throw new BadRequestException('Cannot delete attendance for a closed session');
      }
    }

    return this.prisma.attendance.delete({ where: { id } });
  }

  // ============================================
  // ATTENDANCE REPORTS & ANALYTICS
  // ============================================

  async getClassAttendanceReport(classId: string, params: {
    dateFrom?: Date;
    dateTo?: Date;
    subjectId?: string;
  } = {}) {
    const { dateFrom, dateTo, subjectId } = params;

    const where: Prisma.AttendanceWhereInput = { classId };
    if (subjectId) where.subjectId = subjectId;
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = dateFrom;
      if (dateTo) where.date.lte = dateTo;
    }

    // Get all students in class
    const students = await this.prisma.student.findMany({
      where: { classId },
      include: { user: true },
      orderBy: { user: { firstName: 'asc' } },
    });

    // Get attendance records
    const attendances = await this.prisma.attendance.findMany({
      where,
      include: { subject: true, session: true },
      orderBy: { date: 'asc' },
    });

    // Group by student
    const report = students.map((student) => {
      const studentAttendances = attendances.filter((a: typeof attendances[0]) => a.studentId === student.id);
      const total = studentAttendances.length;
      const present = studentAttendances.filter((a: typeof attendances[0]) => a.status === AttendanceStatus.PRESENT).length;
      const absent = studentAttendances.filter((a: typeof attendances[0]) => a.status === AttendanceStatus.ABSENT).length;
      const late = studentAttendances.filter((a: typeof attendances[0]) => a.status === AttendanceStatus.LATE).length;
      const excused = studentAttendances.filter((a: typeof attendances[0]) => a.status === AttendanceStatus.EXCUSED).length;

      return {
        student: { id: student.id, studentId: student.studentId, user: student.user },
        summary: { total, present, absent, late, excused },
        attendanceRate: total > 0 ? ((present + late) / total) * 100 : 0,
        records: studentAttendances,
      };
    });

    return {
      classId,
      dateFrom,
      dateTo,
      subjectId,
      report,
    };
  }

  async getStudentAttendanceReport(studentId: string, params: {
    dateFrom?: Date;
    dateTo?: Date;
    classId?: string;
    subjectId?: string;
  } = {}) {
    const { dateFrom, dateTo, classId, subjectId } = params;

    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true, class: { include: { gradeLevel: true } } },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const where: Prisma.AttendanceWhereInput = { studentId };
    if (classId) where.classId = classId;
    if (subjectId) where.subjectId = subjectId;
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = dateFrom;
      if (dateTo) where.date.lte = dateTo;
    }

    const attendances = await this.prisma.attendance.findMany({
      where,
      include: { class: { include: { gradeLevel: true } }, subject: true, session: true, recordedBy: true },
      orderBy: { date: 'desc' },
    });

    const total = attendances.length;
    const present = attendances.filter((a: typeof attendances[0]) => a.status === AttendanceStatus.PRESENT).length;
    const absent = attendances.filter((a: typeof attendances[0]) => a.status === AttendanceStatus.ABSENT).length;
    const late = attendances.filter((a: typeof attendances[0]) => a.status === AttendanceStatus.LATE).length;
    const excused = attendances.filter((a: typeof attendances[0]) => a.status === AttendanceStatus.EXCUSED).length;

    // Group by subject
    const bySubject = attendances.reduce((acc: Record<string, { total: number; present: number; absent: number; late: number; excused: number }>, a: typeof attendances[0]) => {
      const subjectName = a.subject?.name || 'General (Homeroom)';
      if (!acc[subjectName]) {
        acc[subjectName] = { total: 0, present: 0, absent: 0, late: 0, excused: 0 };
      }
      acc[subjectName].total++;
      const statusKey = a.status.toLowerCase() as keyof typeof acc[string];
      acc[subjectName][statusKey]++;
      return acc;
    }, {} as Record<string, { total: number; present: number; absent: number; late: number; excused: number }>);

    // Group by month
    const byMonth = attendances.reduce((acc: Record<string, { total: number; present: number; absent: number; late: number; excused: number }>, a: typeof attendances[0]) => {
      const month = a.date.toISOString().substring(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = { total: 0, present: 0, absent: 0, late: 0, excused: 0 };
      }
      acc[month].total++;
      const statusKey = a.status.toLowerCase() as keyof typeof acc[string];
      acc[month][statusKey]++;
      return acc;
    }, {} as Record<string, { total: number; present: number; absent: number; late: number; excused: number }>);

    return {
      student: { id: student.id, studentId: student.studentId, user: student.user, class: student.class },
      summary: { total, present, absent, late, excused },
      attendanceRate: total > 0 ? ((present + late) / total) * 100 : 0,
      bySubject,
      byMonth,
      records: attendances,
    };
  }

  async getAttendanceStats(schoolId?: string, params: {
    dateFrom?: Date;
    dateTo?: Date;
    classId?: string;
  } = {}) {
    const { dateFrom, dateTo, classId } = params;

    // Build where clause for sessions
    const sessionWhere: Prisma.AttendanceSessionWhereInput = {};
    if (classId) sessionWhere.classId = classId;
    if (schoolId) {
      sessionWhere.class = { gradeLevel: { schoolId } };
    }
    if (dateFrom || dateTo) {
      sessionWhere.date = {};
      if (dateFrom) sessionWhere.date.gte = dateFrom;
      if (dateTo) sessionWhere.date.lte = dateTo;
    }

    // Get sessions
    const sessions = await this.prisma.attendanceSession.findMany({
      where: sessionWhere,
      include: { class: true },
    });

    // Get attendance records for those sessions
    const sessionIds = sessions.map((s) => s.id);
    const attendanceWhere: Prisma.AttendanceWhereInput = { sessionId: { in: sessionIds } };

    const attendances = await this.prisma.attendance.findMany({
      where: attendanceWhere,
    });

    const totalRecords = attendances.length;
    const present = attendances.filter((a: typeof attendances[0]) => a.status === AttendanceStatus.PRESENT).length;
    const absent = attendances.filter((a: typeof attendances[0]) => a.status === AttendanceStatus.ABSENT).length;
    const late = attendances.filter((a: typeof attendances[0]) => a.status === AttendanceStatus.LATE).length;
    const excused = attendances.filter((a: typeof attendances[0]) => a.status === AttendanceStatus.EXCUSED).length;

    // Sessions stats
    const totalSessions = sessions.length;
    const openSessions = sessions.filter((s: typeof sessions[0]) => s.status === AttendanceSessionStatus.OPEN).length;
    const closedSessions = sessions.filter((s: typeof sessions[0]) => s.status === AttendanceSessionStatus.CLOSED).length;
    const cancelledSessions = sessions.filter((s: typeof sessions[0]) => s.status === AttendanceSessionStatus.CANCELLED).length;

    // Daily stats
    const dailyStats = attendances.reduce((acc: Record<string, { total: number; present: number; absent: number; late: number; excused: number }>, a: typeof attendances[0]) => {
      const day = a.date.toISOString().split('T')[0];
      if (!acc[day]) {
        acc[day] = { total: 0, present: 0, absent: 0, late: 0, excused: 0 };
      }
      acc[day].total++;
      const statusKey = a.status.toLowerCase() as keyof typeof acc[string];
      acc[day][statusKey]++;
      return acc;
    }, {} as Record<string, { total: number; present: number; absent: number; late: number; excused: number }>);

    return {
      overview: {
        totalRecords,
        totalSessions,
        present,
        absent,
        late,
        excused,
        attendanceRate: totalRecords > 0 ? ((present + late) / totalRecords) * 100 : 0,
      },
      sessions: {
        total: totalSessions,
        open: openSessions,
        closed: closedSessions,
        cancelled: cancelledSessions,
      },
      dailyStats,
    };
  }

  async getLowAttendanceAlerts(params: {
    threshold?: number; // percentage
    dateFrom?: Date;
    dateTo?: Date;
    classId?: string;
  } = {}) {
    const { threshold = 75, dateFrom, dateTo, classId } = params;

    const where: Prisma.StudentWhereInput = {};
    if (classId) where.classId = classId;

    const students = await this.prisma.student.findMany({
      where,
      include: { user: true, class: { include: { gradeLevel: true } } },
    });

    const alerts = [];

    for (const student of students) {
      const attendanceWhere: Prisma.AttendanceWhereInput = { studentId: student.id };
      if (dateFrom || dateTo) {
        attendanceWhere.date = {};
        if (dateFrom) attendanceWhere.date.gte = dateFrom;
        if (dateTo) attendanceWhere.date.lte = dateTo;
      }

      const attendances = await this.prisma.attendance.findMany({ where: attendanceWhere });
      const total = attendances.length;
      if (total === 0) continue;

      const present = attendances.filter((a: typeof attendances[0]) => a.status === AttendanceStatus.PRESENT).length;
      const late = attendances.filter((a: typeof attendances[0]) => a.status === AttendanceStatus.LATE).length;
      const rate = ((present + late) / total) * 100;

      if (rate < threshold) {
        alerts.push({
          student: { id: student.id, studentId: student.studentId, user: student.user, class: student.class },
          attendanceRate: rate,
          totalRecords: total,
          present: present + late,
          absent: attendances.filter((a: typeof attendances[0]) => a.status === AttendanceStatus.ABSENT).length,
        });
      }
    }

    // Sort by lowest attendance rate first
    alerts.sort((a, b) => a.attendanceRate - b.attendanceRate);

    return { threshold, alerts, count: alerts.length };
  }

  async getTodaysAttendance(classId: string, subjectId?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const where: Prisma.AttendanceWhereInput = {
      classId,
      date: today,
    };
    if (subjectId) where.subjectId = subjectId;

    const attendances = await this.prisma.attendance.findMany({
      where,
      include: { student: { include: { user: true } } },
    });

    // Get all students in class
    const students = await this.prisma.student.findMany({
      where: { classId, status: 'ACTIVE' },
      include: { user: true },
      orderBy: { user: { firstName: 'asc' } },
    });

    // Map attendance by student
    const attendanceMap = new Map(attendances.map((a: typeof attendances[0]) => [a.studentId, a]));

    return students.map((student) => ({
      student: { id: student.id, studentId: student.studentId, user: student.user },
      attendance: attendanceMap.get(student.id) || null,
    }));
  }

  // ============================================
  // HELPER METHODS FOR TEACHERS
  // ============================================

  async getMyAttendanceSessions(teacherId: string, params: {
    date?: Date;
    dateFrom?: Date;
    dateTo?: Date;
    status?: AttendanceSessionStatus;
  } = {}) {
    const { date, dateFrom, dateTo, status } = params;

    const where: Prisma.AttendanceSessionWhereInput = { teacherId };
    if (status) where.status = status;
    if (date) {
      where.date = date;
    } else if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = dateFrom;
      if (dateTo) where.date.lte = dateTo;
    }

    return this.prisma.attendanceSession.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        class: { include: { gradeLevel: true } },
        subject: true,
        _count: { select: { attendances: true } },
      },
    });
  }

  async getMyTodaysSessions(teacherId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.attendanceSession.findMany({
      where: { teacherId, date: today },
      orderBy: { startTime: 'asc' },
      include: {
        class: { include: { gradeLevel: true } },
        subject: true,
        _count: { select: { attendances: true } },
      },
    });
  }
}