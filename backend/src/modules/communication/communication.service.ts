import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, NotificationType, NotificationChannel, UserRole, Message } from '@prisma/client';

interface CreateMessageInput {
  senderId: string;
  recipientId: string;
  subject?: string;
  body: string;
  parentId?: string;
  attachments?: any[];
}

interface CreateAnnouncementInput {
  authorId: string;
  title: string;
  body: string;
  targetRoles: UserRole[];
  targetClassId?: string;
  targetGradeLevelId?: string;
  expiresAt?: Date;
  attachments?: any[];
}

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: any;
  channels?: NotificationChannel[];
}

interface SendNotificationInput extends CreateNotificationInput {
  sendEmail?: boolean;
  sendSms?: boolean;
  sendPush?: boolean;
}

@Injectable()
export class CommunicationService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // MESSAGE OPERATIONS
  // ============================================

  async sendMessage(data: CreateMessageInput) {
    // Validate sender exists
    const sender = await this.prisma.user.findUnique({ where: { id: data.senderId } });
    if (!sender) {
      throw new NotFoundException('Sender not found');
    }

    // Validate recipient exists
    const recipient = await this.prisma.user.findUnique({ where: { id: data.recipientId } });
    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }

    // Validate parent message if provided
    if (data.parentId) {
      const parentMessage = await this.prisma.message.findUnique({ where: { id: data.parentId } });
      if (!parentMessage) {
        throw new NotFoundException('Parent message not found');
      }
      // Ensure parent message is between same users
      if (
        parentMessage.senderId !== data.recipientId ||
        parentMessage.recipientId !== data.senderId
      ) {
        throw new BadRequestException('Cannot reply to this message');
      }
    }

    const message = await this.prisma.message.create({
      data: {
        ...data,
        attachments: data.attachments ? data.attachments : Prisma.JsonNull,
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true, role: true } },
        recipient: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true, role: true } },
        parent: { include: { sender: true, recipient: true } },
      },
    });

    // Create in-app notification for recipient
    await this.createNotification({
      userId: data.recipientId,
      type: NotificationType.MESSAGE,
      title: `New message from ${sender.firstName} ${sender.lastName}`,
      body: data.subject || data.body.substring(0, 100),
      data: { messageId: message.id },
      channels: [NotificationChannel.IN_APP],
    });

    return message;
  }

  async getMessages(params: {
    skip?: number;
    take?: number;
    userId: string; // Current user
    role?: 'sent' | 'received' | 'all';
    isRead?: boolean;
    search?: string;
  }) {
    const { skip, take, userId, role = 'all', isRead, search } = params;

    const where: Prisma.MessageWhereInput = {};

    if (role === 'sent') {
      where.senderId = userId;
    } else if (role === 'received') {
      where.recipientId = userId;
    } else {
      where.OR = [{ senderId: userId }, { recipientId: userId }];
    }

    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    if (search) {
      where.AND = [
        {
          OR: [
            { subject: { contains: search, mode: 'insensitive' } },
            { body: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    // Only show top-level messages (not replies) in list view
    where.parentId = null;

    const [data, total] = await Promise.all([
      this.prisma.message.findMany({
        skip,
        take,
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true, role: true } },
          recipient: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true, role: true } },
          _count: { select: { replies: true } },
        },
      }),
      this.prisma.message.count({ where }),
    ]);

    return { data, total };
  }

  async getMessageById(id: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true, role: true } },
        recipient: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true, role: true } },
        parent: {
          include: {
            sender: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true, role: true } },
            recipient: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true, role: true } },
          },
        },
        replies: {
          include: {
            sender: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true, role: true } },
            recipient: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true, role: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Check authorization - user must be sender or recipient
    if (message.senderId !== userId && message.recipientId !== userId) {
      throw new ForbiddenException('Not authorized to view this message');
    }

    // Mark as read if recipient is viewing
    if (message.recipientId === userId && !message.isRead) {
      await this.prisma.message.update({
        where: { id },
        data: { isRead: true, readAt: new Date() },
      });
      message.isRead = true;
      message.readAt = new Date();
    }

    return message;
  }

  async getMessageThread(parentId: string, userId: string) {
    const parentMessage = await this.prisma.message.findUnique({
      where: { id: parentId },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true, role: true } },
        recipient: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true, role: true } },
      },
    });

    if (!parentMessage) {
      throw new NotFoundException('Message not found');
    }

    // Check authorization
    if (parentMessage.senderId !== userId && parentMessage.recipientId !== userId) {
      throw new ForbiddenException('Not authorized to view this thread');
    }

    const replies = await this.prisma.message.findMany({
      where: { parentId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true, role: true } },
        recipient: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true, role: true } },
      },
    });

    return { parent: parentMessage, replies };
  }

  async markMessageAsRead(id: string, userId: string) {
    const message = await this.prisma.message.findUnique({ where: { id } });
    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.recipientId !== userId) {
      throw new ForbiddenException('Only recipient can mark message as read');
    }

    if (message.isRead) {
      return message;
    }

    return this.prisma.message.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true, role: true } },
        recipient: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true, role: true } },
      },
    });
  }

  async markMessageAsUnread(id: string, userId: string) {
    const message = await this.prisma.message.findUnique({ where: { id } });
    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.recipientId !== userId) {
      throw new ForbiddenException('Only recipient can mark message as unread');
    }

    return this.prisma.message.update({
      where: { id },
      data: { isRead: false, readAt: null },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true, role: true } },
        recipient: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true, role: true } },
      },
    });
  }

  async deleteMessage(id: string, userId: string) {
    const message = await this.prisma.message.findUnique({ where: { id } });
    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Only sender can delete their sent messages, recipient can delete received messages
    if (message.senderId !== userId && message.recipientId !== userId) {
      throw new ForbiddenException('Not authorized to delete this message');
    }

    // If sender deletes, soft delete by marking for sender
    // If recipient deletes, soft delete by marking for recipient
    // For simplicity, we'll hard delete if both parties should not see it
    // In a real app, you might want soft deletes with a deletedBy field

    return this.prisma.message.delete({ where: { id } });
  }

  async getUnreadMessageCount(userId: string) {
    const count = await this.prisma.message.count({
      where: { recipientId: userId, isRead: false },
    });
    return { count };
  }

  // ============================================
  // ANNOUNCEMENT OPERATIONS
  // ============================================

  async createAnnouncement(data: CreateAnnouncementInput) {
    // Validate author exists
    const author = await this.prisma.user.findUnique({ where: { id: data.authorId } });
    if (!author) {
      throw new NotFoundException('Author not found');
    }

    // Validate target class if provided
    if (data.targetClassId) {
      const classData = await this.prisma.class.findUnique({ where: { id: data.targetClassId } });
      if (!classData) {
        throw new NotFoundException('Target class not found');
      }
    }

    // Validate target grade level if provided
    if (data.targetGradeLevelId) {
      const gradeLevel = await this.prisma.gradeLevel.findUnique({ where: { id: data.targetGradeLevelId } });
      if (!gradeLevel) {
        throw new NotFoundException('Target grade level not found');
      }
    }

    const announcement = await this.prisma.announcement.create({
      data: {
        ...data,
        attachments: data.attachments ? data.attachments : Prisma.JsonNull,
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true, role: true } },
      },
    });

    // Create notifications for target users
    await this.createAnnouncementNotifications(announcement);

    return announcement;
  }

  async getAnnouncements(params: {
    skip?: number;
    take?: number;
    targetRoles?: UserRole[];
    targetClassId?: string;
    targetGradeLevelId?: string;
    isPublished?: boolean;
    authorId?: string;
    search?: string;
    includeExpired?: boolean;
  }) {
    const { skip, take, targetRoles, targetClassId, targetGradeLevelId, isPublished, authorId, search, includeExpired } = params;

    const where: Prisma.AnnouncementWhereInput = {};

    if (targetRoles && targetRoles.length > 0) {
      where.targetRoles = { hasSome: targetRoles };
    }
    if (targetClassId) {
      where.targetClassId = targetClassId;
    }
    if (targetGradeLevelId) {
      where.targetGradeLevelId = targetGradeLevelId;
    }
    if (isPublished !== undefined) {
      where.isPublished = isPublished;
    }
    if (authorId) {
      where.authorId = authorId;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { body: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (!includeExpired) {
      where.OR = [
        { expiresAt: null },
        { expiresAt: { gte: new Date() } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.announcement.findMany({
        skip,
        take,
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true, role: true } },
        },
      }),
      this.prisma.announcement.count({ where }),
    ]);

    return { data, total };
  }

  async getAnnouncementById(id: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true, role: true } },
      },
    });

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    return announcement;
  }

  async updateAnnouncement(id: string, data: Prisma.AnnouncementUpdateInput, userId: string) {
    const announcement = await this.prisma.announcement.findUnique({ where: { id } });
    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    // Only author or admin can update
    if (announcement.authorId !== userId) {
      // Check if user is admin
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user?.role !== UserRole.ADMIN) {
        throw new ForbiddenException('Not authorized to update this announcement');
      }
    }

    return this.prisma.announcement.update({
      where: { id },
      data,
      include: {
        author: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true, role: true } },
      },
    });
  }

  async publishAnnouncement(id: string, userId: string) {
    const announcement = await this.prisma.announcement.findUnique({ where: { id } });
    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    if (announcement.authorId !== userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user?.role !== UserRole.ADMIN) {
        throw new ForbiddenException('Not authorized to publish this announcement');
      }
    }

    if (announcement.isPublished) {
      throw new BadRequestException('Announcement is already published');
    }

    const updated = await this.prisma.announcement.update({
      where: { id },
      data: { isPublished: true, publishedAt: new Date() },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true, role: true } },
      },
    });

    // Create notifications for target users
    await this.createAnnouncementNotifications(updated);

    return updated;
  }

  async unpublishAnnouncement(id: string, userId: string) {
    const announcement = await this.prisma.announcement.findUnique({ where: { id } });
    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    if (announcement.authorId !== userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user?.role !== UserRole.ADMIN) {
        throw new ForbiddenException('Not authorized to unpublish this announcement');
      }
    }

    return this.prisma.announcement.update({
      where: { id },
      data: { isPublished: false, publishedAt: null },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true, role: true } },
      },
    });
  }

  async deleteAnnouncement(id: string, userId: string) {
    const announcement = await this.prisma.announcement.findUnique({ where: { id } });
    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    if (announcement.authorId !== userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user?.role !== UserRole.ADMIN) {
        throw new ForbiddenException('Not authorized to delete this announcement');
      }
    }

    return this.prisma.announcement.delete({ where: { id } });
  }

  async getAnnouncementsForUser(userId: string, params: {
    skip?: number;
    take?: number;
    includeExpired?: boolean;
  } = {}) {
    const { skip, take, includeExpired } = params;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get user's role
    const userRole = user.role;

    // Get student/parent class info if applicable
    let classId: string | undefined;
    let gradeLevelId: string | undefined;

    if (userRole === UserRole.STUDENT) {
      const student = await this.prisma.student.findUnique({ where: { userId } });
      if (student) {
        classId = student.classId || undefined;
        gradeLevelId = student.gradeLevelId || undefined;
      }
    } else if (userRole === UserRole.PARENT) {
      const parent = await this.prisma.parent.findUnique({ where: { userId } });
      if (parent) {
        const children = await this.prisma.student.findMany({ where: { parentId: parent.id } });
        if (children.length > 0) {
          // Get announcements for any of the children's classes/grades
          classId = children[0].classId || undefined;
          gradeLevelId = children[0].gradeLevelId || undefined;
        }
      }
    } else if (userRole === UserRole.TEACHER) {
      const teacher = await this.prisma.teacher.findUnique({ where: { userId } });
      if (teacher) {
        // Teacher sees announcements for their classes
        const classes = await this.prisma.class.findMany({ where: { homeroomTeacherId: teacher.id } });
        if (classes.length > 0) {
          classId = classes[0].id;
          gradeLevelId = classes[0].gradeLevelId;
        }
      }
    }

    const where: Prisma.AnnouncementWhereInput = {
      isPublished: true,
      targetRoles: { has: userRole },
      OR: [
        { targetClassId: null },
        { targetClassId: classId },
      ],
      AND: [
        {
          OR: [
            { targetGradeLevelId: null },
            { targetGradeLevelId: gradeLevelId },
          ],
        },
      ],
    };

    if (!includeExpired) {
      where.OR = [
        { expiresAt: null },
        { expiresAt: { gte: new Date() } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.announcement.findMany({
        skip,
        take,
        where,
        orderBy: { publishedAt: 'desc' },
        include: {
          author: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true, role: true } },
        },
      }),
      this.prisma.announcement.count({ where }),
    ]);

    return { data, total };
  }

  private async createAnnouncementNotifications(announcement: any) {
    // Find all users matching the target criteria
    const where: Prisma.UserWhereInput = {
      role: { in: announcement.targetRoles },
      status: 'ACTIVE',
    };

    if (announcement.targetClassId) {
      where.student = { classId: announcement.targetClassId };
    } else if (announcement.targetGradeLevelId) {
      where.student = { gradeLevelId: announcement.targetGradeLevelId };
    }

    const users = await this.prisma.user.findMany({ where, select: { id: true } });

    if (users.length > 0) {
      const notifications = users.map((user) => ({
        userId: user.id,
        type: NotificationType.ANNOUNCEMENT,
        title: announcement.title,
        body: announcement.body,
        data: { announcementId: announcement.id },
        channels: [NotificationChannel.IN_APP],
      }));

      await this.prisma.notification.createMany({ data: notifications });
    }
  }

  // ============================================
  // NOTIFICATION OPERATIONS
  // ============================================

  async createNotification(data: CreateNotificationInput) {
    // Validate user exists
    const user = await this.prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.notification.create({
      data: {
        ...data,
        channels: data.channels || [NotificationChannel.IN_APP],
        data: data.data || null,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
      },
    });
  }

  async sendNotification(data: SendNotificationInput) {
    const requestedExternalChannels = [
      ...(data.sendEmail ? [NotificationChannel.EMAIL] : []),
      ...(data.sendSms ? [NotificationChannel.SMS] : []),
      ...(data.sendPush ? [NotificationChannel.PUSH] : []),
      ...(data.channels || []).filter((channel) => channel !== NotificationChannel.IN_APP),
    ];

    if (requestedExternalChannels.length > 0) {
      throw new BadRequestException(
        'External notification delivery is not configured. Only in-app notifications are available.',
      );
    }

    // Create in-app notification
    const notification = await this.createNotification({
      userId: data.userId,
      type: data.type,
      title: data.title,
      body: data.body,
      data: data.data,
      channels: data.channels || [NotificationChannel.IN_APP],
    });

    return this.prisma.notification.update({
      where: { id: notification.id },
      data: { sentAt: new Date(), channels: [NotificationChannel.IN_APP] },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
      },
    });
  }

  async getNotifications(params: {
    skip?: number;
    take?: number;
    userId: string;
    isRead?: boolean;
    type?: NotificationType;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    const { skip, take, userId, isRead, type, dateFrom, dateTo } = params;

    const where: Prisma.NotificationWhereInput = { userId };

    if (isRead !== undefined) {
      where.isRead = isRead;
    }
    if (type) {
      where.type = type;
    }
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        skip,
        take,
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
        },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return { data, total };
  }

  async getNotificationById(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('Not authorized to view this notification');
    }

    return notification;
  }

  async markNotificationAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('Not authorized to update this notification');
    }

    if (notification.isRead) {
      return notification;
    }

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
      },
    });
  }

  async markAllNotificationsAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    return { success: true };
  }

  async deleteNotification(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('Not authorized to delete this notification');
    }

    return this.prisma.notification.delete({ where: { id } });
  }

  async getUnreadNotificationCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  // ============================================
  // HELPER METHODS FOR AUTOMATED NOTIFICATIONS
  // ============================================

  async notifyAttendanceAlert(studentId: string, message: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true, parent: { include: { user: true } } },
    });

    if (!student) return;

    // Notify student
    await this.createNotification({
      userId: student.userId,
      type: NotificationType.ATTENDANCE_ALERT,
      title: 'Attendance Alert',
      body: message,
      data: { studentId: student.id },
      channels: [NotificationChannel.IN_APP],
    });

    // Notify parent
    if (student.parent) {
      await this.createNotification({
        userId: student.parent.userId,
        type: NotificationType.ATTENDANCE_ALERT,
        title: `Attendance Alert for ${student.user.firstName} ${student.user.lastName}`,
        body: message,
        data: { studentId: student.id },
        channels: [NotificationChannel.IN_APP],
      });
    }
  }

  async notifyGradePosted(studentId: string, assessmentName: string, score: number, maxScore: number) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true, parent: { include: { user: true } } },
    });

    if (!student) return;

    const percentage = ((score / maxScore) * 100).toFixed(1);

    // Notify student
    await this.createNotification({
      userId: student.userId,
      type: NotificationType.GRADE_POSTED,
      title: 'New Grade Posted',
      body: `You received ${score}/${maxScore} (${percentage}%) on ${assessmentName}`,
      data: { studentId: student.id, assessmentName, score, maxScore },
      channels: [NotificationChannel.IN_APP],
    });

    // Notify parent
    if (student.parent) {
      await this.createNotification({
        userId: student.parent.userId,
        type: NotificationType.GRADE_POSTED,
        title: `New Grade for ${student.user.firstName} ${student.user.lastName}`,
        body: `${student.user.firstName} received ${score}/${maxScore} (${percentage}%) on ${assessmentName}`,
        data: { studentId: student.id, assessmentName, score, maxScore },
        channels: [NotificationChannel.IN_APP],
      });
    }
  }

  async notifyFeeDue(parentId: string, invoiceId: string, amount: number, dueDate: Date) {
    const parent = await this.prisma.parent.findUnique({
      where: { id: parentId },
      include: { user: true },
    });

    if (!parent) return;

    await this.createNotification({
      userId: parent.userId,
      type: NotificationType.FEE_DUE,
      title: 'Fee Payment Due',
      body: `Payment of $${amount.toFixed(2)} is due on ${dueDate.toLocaleDateString()}`,
      data: { invoiceId, amount, dueDate: dueDate.toISOString() },
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    });
  }

  async notifyFeeOverdue(parentId: string, invoiceId: string, amount: number, daysOverdue: number) {
    const parent = await this.prisma.parent.findUnique({
      where: { id: parentId },
      include: { user: true },
    });

    if (!parent) return;

    await this.createNotification({
      userId: parent.userId,
      type: NotificationType.FEE_OVERDUE,
      title: 'Fee Payment Overdue',
      body: `Payment of $${amount.toFixed(2)} is ${daysOverdue} day(s) overdue`,
      data: { invoiceId, amount, daysOverdue },
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.SMS],
    });
  }

  async notifyPaymentReceived(parentId: string, invoiceId: string, amount: number) {
    const parent = await this.prisma.parent.findUnique({
      where: { id: parentId },
      include: { user: true },
    });

    if (!parent) return;

    await this.createNotification({
      userId: parent.userId,
      type: NotificationType.PAYMENT_RECEIVED,
      title: 'Payment Received',
      body: `Payment of $${amount.toFixed(2)} has been received`,
      data: { invoiceId, amount },
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    });
  }

  async notifySystem(userId: string, title: string, body: string, data?: any) {
    await this.createNotification({
      userId,
      type: NotificationType.SYSTEM,
      title,
      body,
      data,
      channels: [NotificationChannel.IN_APP],
    });
  }
}