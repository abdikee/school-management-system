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

import { CommunicationService } from './communication.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, NotificationType, NotificationChannel } from '@prisma/client';
import { Prisma } from '@prisma/client';

@ApiTags('communication')
@Controller('communication')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CommunicationController {
  constructor(private communicationService: CommunicationService) {}

  // ============================================
  // MESSAGE OPERATIONS
  // ============================================

  @Post('messages')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send a message' })
  async sendMessage(@Body() data: {
    recipientId: string;
    subject?: string;
    body: string;
    parentId?: string;
    attachments?: any[];
  }, @CurrentUser('id') senderId: string) {
    return this.communicationService.sendMessage({
      ...data,
      senderId,
    });
  }

  @Get('messages')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  @ApiOperation({ summary: 'Get messages (sent, received, or all)' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'role', required: false, enum: ['sent', 'received', 'all'] })
  @ApiQuery({ name: 'isRead', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getMessages(
    @CurrentUser('id') userId: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('role') role?: 'sent' | 'received' | 'all',
    @Query('isRead') isRead?: string,
    @Query('search') search?: string,
  ) {
    return this.communicationService.getMessages({
      skip: skip ? Number(skip) : 0,
      take: take ? Number(take) : 20,
      userId,
      role,
      isRead: isRead !== undefined ? isRead === 'true' : undefined,
      search,
    });
  }

  @Get('messages/unread-count')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  @ApiOperation({ summary: 'Get unread message count' })
  async getUnreadMessageCount(@CurrentUser('id') userId: string) {
    return this.communicationService.getUnreadMessageCount(userId);
  }

  @Get('messages/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  @ApiOperation({ summary: 'Get message by ID with thread' })
  async getMessageById(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.communicationService.getMessageById(id, userId);
  }

  @Get('messages/:id/thread')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  @ApiOperation({ summary: 'Get message thread (parent + replies)' })
  async getMessageThread(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.communicationService.getMessageThread(id, userId);
  }

  @Put('messages/:id/read')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark message as read' })
  async markMessageAsRead(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.communicationService.markMessageAsRead(id, userId);
  }

  @Put('messages/:id/unread')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark message as unread' })
  async markMessageAsUnread(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.communicationService.markMessageAsUnread(id, userId);
  }

  @Delete('messages/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete message' })
  async deleteMessage(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.communicationService.deleteMessage(id, userId);
  }

  // ============================================
  // ANNOUNCEMENT OPERATIONS
  // ============================================

  @Post('announcements')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create announcement' })
  async createAnnouncement(@Body() data: {
    title: string;
    body: string;
    targetRoles: UserRole[];
    targetClassId?: string;
    targetGradeLevelId?: string;
    expiresAt?: string;
    attachments?: any[];
  }, @CurrentUser('id') authorId: string) {
    return this.communicationService.createAnnouncement({
      ...data,
      authorId,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
    });
  }

  @Get('announcements')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get announcements with filters (admin/teacher view)' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'targetRoles', required: false, type: String, isArray: true })
  @ApiQuery({ name: 'targetClassId', required: false, type: String })
  @ApiQuery({ name: 'targetGradeLevelId', required: false, type: String })
  @ApiQuery({ name: 'isPublished', required: false, type: Boolean })
  @ApiQuery({ name: 'authorId', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'includeExpired', required: false, type: Boolean })
  async getAnnouncements(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('targetRoles') targetRoles?: string[],
    @Query('targetClassId') targetClassId?: string,
    @Query('targetGradeLevelId') targetGradeLevelId?: string,
    @Query('isPublished') isPublished?: string,
    @Query('authorId') authorId?: string,
    @Query('search') search?: string,
    @Query('includeExpired') includeExpired?: string,
  ) {
    return this.communicationService.getAnnouncements({
      skip: skip ? Number(skip) : 0,
      take: take ? Number(take) : 20,
      targetRoles: targetRoles as UserRole[] | undefined,
      targetClassId,
      targetGradeLevelId,
      isPublished: isPublished !== undefined ? isPublished === 'true' : undefined,
      authorId,
      search,
      includeExpired: includeExpired === 'true',
    });
  }

  @Get('announcements/my')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  @ApiOperation({ summary: 'Get announcements for current user' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'includeExpired', required: false, type: Boolean })
  async getAnnouncementsForUser(
    @CurrentUser('id') userId: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('includeExpired') includeExpired?: string,
  ) {
    return this.communicationService.getAnnouncementsForUser(userId, {
      skip: skip ? Number(skip) : 0,
      take: take ? Number(take) : 20,
      includeExpired: includeExpired === 'true',
    });
  }

  @Get('announcements/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  @ApiOperation({ summary: 'Get announcement by ID' })
  async getAnnouncementById(@Param('id') id: string) {
    return this.communicationService.getAnnouncementById(id);
  }

  @Put('announcements/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Update announcement' })
  async updateAnnouncement(
    @Param('id') id: string,
    @Body() data: Prisma.AnnouncementUpdateInput,
    @CurrentUser('id') userId: string,
  ) {
    return this.communicationService.updateAnnouncement(id, data, userId);
  }

  @Put('announcements/:id/publish')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish announcement' })
  async publishAnnouncement(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.communicationService.publishAnnouncement(id, userId);
  }

  @Put('announcements/:id/unpublish')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unpublish announcement' })
  async unpublishAnnouncement(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.communicationService.unpublishAnnouncement(id, userId);
  }

  @Delete('announcements/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete announcement' })
  async deleteAnnouncement(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.communicationService.deleteAnnouncement(id, userId);
  }

  // ============================================
  // NOTIFICATION OPERATIONS
  // ============================================

  @Post('notifications')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create notification (admin only)' })
  async createNotification(@Body() data: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    data?: any;
    channels?: NotificationChannel[];
  }) {
    return this.communicationService.createNotification(data);
  }

  @Post('notifications/send')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send notification with channels (admin only)' })
  async sendNotification(@Body() data: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    data?: any;
    channels?: NotificationChannel[];
    sendEmail?: boolean;
    sendSms?: boolean;
    sendPush?: boolean;
  }) {
    return this.communicationService.sendNotification(data);
  }

  @Get('notifications')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  @ApiOperation({ summary: 'Get notifications for current user' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'isRead', required: false, type: Boolean })
  @ApiQuery({ name: 'type', required: false, enum: NotificationType })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  async getNotifications(
    @CurrentUser('id') userId: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('isRead') isRead?: string,
    @Query('type') type?: NotificationType,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.communicationService.getNotifications({
      skip: skip ? Number(skip) : 0,
      take: take ? Number(take) : 20,
      userId,
      isRead: isRead !== undefined ? isRead === 'true' : undefined,
      type,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
    });
  }

  @Get('notifications/unread-count')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  @ApiOperation({ summary: 'Get unread notification count' })
  async getUnreadNotificationCount(@CurrentUser('id') userId: string) {
    return this.communicationService.getUnreadNotificationCount(userId);
  }

  @Get('notifications/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  @ApiOperation({ summary: 'Get notification by ID' })
  async getNotificationById(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.communicationService.getNotificationById(id, userId);
  }

  @Put('notifications/:id/read')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark notification as read' })
  async markNotificationAsRead(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.communicationService.markNotificationAsRead(id, userId);
  }

  @Put('notifications/read-all')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllNotificationsAsRead(@CurrentUser('id') userId: string) {
    return this.communicationService.markAllNotificationsAsRead(userId);
  }

  @Delete('notifications/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete notification' })
  async deleteNotification(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.communicationService.deleteNotification(id, userId);
  }
}