import { Injectable } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export type SearchResultType = 'user' | 'class' | 'subject' | 'message' | 'announcement';

export interface SearchResult {
  type: SearchResultType;
  id: string;
  title: string;
  description: string;
  href: string;
}

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: string, userId: string, role: UserRole) {
    const textFilter = { contains: query, mode: 'insensitive' as const };
    const results: SearchResult[] = [];

    if (role === UserRole.ADMIN) {
      const users = await this.prisma.user.findMany({
        where: {
          OR: [
            { firstName: textFilter },
            { lastName: textFilter },
            { email: textFilter },
          ],
        },
        select: { id: true, firstName: true, lastName: true, email: true, role: true },
        take: 8,
        orderBy: { firstName: 'asc' },
      });

      results.push(...users.map((user) => ({
        type: 'user' as const,
        id: user.id,
        title: `${user.firstName} ${user.lastName}`,
        description: `${user.role} · ${user.email}`,
        href: `/admin/users?search=${encodeURIComponent(query)}`,
      })));
    }

    const classAccess = await this.getClassAccess(userId, role);
    const classes = await this.prisma.class.findMany({
      where: {
        AND: [
          classAccess,
          {
            OR: [
              { name: textFilter },
              { room: textFilter },
              { gradeLevel: { name: textFilter } },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        room: true,
        gradeLevel: { select: { name: true } },
      },
      take: 8,
      orderBy: { name: 'asc' },
    });

    results.push(...classes.map((schoolClass) => ({
      type: 'class' as const,
      id: schoolClass.id,
      title: schoolClass.name,
      description: `${schoolClass.gradeLevel.name}${schoolClass.room ? ` · Room ${schoolClass.room}` : ''}`,
      href: role === UserRole.ADMIN ? `/admin/academic?classId=${schoolClass.id}` : '/teacher/classes',
    })));

    const subjectAccess: Prisma.SubjectWhereInput = role === UserRole.ADMIN
      ? {}
      : { classSubjects: { some: { class: classAccess } } };
    const subjects = await this.prisma.subject.findMany({
      where: {
        AND: [
          subjectAccess,
          {
            OR: [
              { name: textFilter },
              { code: textFilter },
              { description: textFilter },
            ],
          },
        ],
      },
      select: { id: true, name: true, code: true, gradeLevel: { select: { name: true } } },
      take: 8,
      orderBy: { name: 'asc' },
    });

    results.push(...subjects.map((subject) => ({
      type: 'subject' as const,
      id: subject.id,
      title: subject.name,
      description: `${subject.code} · ${subject.gradeLevel.name}`,
      href: role === UserRole.ADMIN ? '/admin/academic' : role === UserRole.TEACHER ? '/teacher/classes' : '/student/reports',
    })));

    const announcements = await this.prisma.announcement.findMany({
      where: {
        isPublished: true,
        targetRoles: { has: role },
        OR: [{ title: textFilter }, { body: textFilter }],
      },
      select: { id: true, title: true, body: true, createdAt: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
    });

    results.push(...announcements.map((announcement) => ({
      type: 'announcement' as const,
      id: announcement.id,
      title: announcement.title,
      description: announcement.body.slice(0, 120),
      href: role === UserRole.ADMIN ? '/admin/communication' : role === UserRole.TEACHER ? '/teacher/communication' : role === UserRole.PARENT ? '/parent/communication' : '/notifications',
    })));

    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { recipientId: userId },
        ],
        AND: [{ OR: [{ subject: textFilter }, { body: textFilter }] }],
      },
      select: {
        id: true,
        subject: true,
        body: true,
        createdAt: true,
        sender: { select: { firstName: true, lastName: true } },
        recipient: { select: { firstName: true, lastName: true } },
      },
      take: 8,
      orderBy: { createdAt: 'desc' },
    });

    results.push(...messages.map((message) => ({
      type: 'message' as const,
      id: message.id,
      title: message.subject || 'Message',
      description: `${message.sender.firstName} ${message.sender.lastName} · ${message.body.slice(0, 100)}`,
      href: role === UserRole.ADMIN ? '/admin/communication' : role === UserRole.TEACHER ? '/teacher/communication' : role === UserRole.PARENT ? '/parent/communication' : '/notifications',
    })));

    return { query, total: results.length, results };
  }

  private async getClassAccess(userId: string, role: UserRole): Promise<Prisma.ClassWhereInput> {
    if (role === UserRole.ADMIN) return {};

    if (role === UserRole.TEACHER) {
      return {
        OR: [
          { homeroomTeacher: { userId } },
          { classSubjects: { some: { teacher: { userId } } } },
        ],
      };
    }

    if (role === UserRole.STUDENT) {
      const student = await this.prisma.student.findUnique({ where: { userId }, select: { classId: true } });
      return student?.classId ? { id: student.classId } : { id: '__none__' };
    }

    const parent = await this.prisma.parent.findUnique({ where: { userId }, select: { id: true } });
    return parent
      ? { students: { some: { OR: [{ parentId: parent.id }, { parentRelations: { some: { parentId: parent.id } } }] } } }
      : { id: '__none__' };
  }
}
