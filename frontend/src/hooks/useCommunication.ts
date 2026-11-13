import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { communicationApi } from "@/services/api";
import type { UserRole } from "@/types/api";

// Query keys
export const communicationKeys = {
  all: ["communication"] as const,
  messages: () => [...communicationKeys.all, "messages"] as const,
  messagesList: (filters: Record<string, any>) => [...communicationKeys.messages(), filters] as const,
  message: (id: string) => [...communicationKeys.messages(), id] as const,
  messageThread: (id: string) => [...communicationKeys.messages(), "thread", id] as const,
  unreadMessageCount: () => [...communicationKeys.messages(), "unread-count"] as const,
  announcements: () => [...communicationKeys.all, "announcements"] as const,
  announcementsList: (filters: Record<string, any>) => [...communicationKeys.announcements(), filters] as const,
  announcementsForUser: (filters: Record<string, any>) => [...communicationKeys.announcements(), "my", filters] as const,
  announcement: (id: string) => [...communicationKeys.announcements(), id] as const,
  notifications: () => [...communicationKeys.all, "notifications"] as const,
  notificationsList: (filters: Record<string, any>) => [...communicationKeys.notifications(), filters] as const,
  unreadNotificationCount: () => [...communicationKeys.notifications(), "unread-count"] as const,
  notification: (id: string) => [...communicationKeys.notifications(), id] as const,
};

// ============================================
// MESSAGE QUERIES & MUTATIONS
// ============================================

export const useMessages = (params?: {
  skip?: number;
  take?: number;
  role?: "sent" | "received" | "all";
  isRead?: boolean;
  search?: string;
}) => {
  return useQuery({
    queryKey: communicationKeys.messagesList(params || {}),
    queryFn: () => communicationApi.getMessages(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useUnreadMessageCount = () => {
  return useQuery({
    queryKey: communicationKeys.unreadMessageCount(),
    queryFn: () => communicationApi.getUnreadMessageCount(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

export const useMessage = (id: string) => {
  return useQuery({
    queryKey: communicationKeys.message(id),
    queryFn: () => communicationApi.getMessageById(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
  });
};

export const useMessageThread = (id: string) => {
  return useQuery({
    queryKey: communicationKeys.messageThread(id),
    queryFn: () => communicationApi.getMessageThread(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      recipientId: string;
      subject?: string;
      body: string;
      parentId?: string;
      attachments?: any[];
    }) => communicationApi.sendMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.messages() });
      queryClient.invalidateQueries({ queryKey: communicationKeys.unreadMessageCount() });
    },
  });
};

export const useMarkMessageAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => communicationApi.markMessageAsRead(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.message(id) });
      queryClient.invalidateQueries({ queryKey: communicationKeys.messages() });
      queryClient.invalidateQueries({ queryKey: communicationKeys.unreadMessageCount() });
    },
  });
};

export const useMarkMessageAsUnread = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => communicationApi.markMessageAsUnread(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.message(id) });
      queryClient.invalidateQueries({ queryKey: communicationKeys.messages() });
      queryClient.invalidateQueries({ queryKey: communicationKeys.unreadMessageCount() });
    },
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => communicationApi.deleteMessage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.messages() });
      queryClient.invalidateQueries({ queryKey: communicationKeys.unreadMessageCount() });
    },
  });
};

// ============================================
// ANNOUNCEMENT QUERIES & MUTATIONS
// ============================================

export const useAnnouncements = (params?: {
  skip?: number;
  take?: number;
  targetRoles?: UserRole[];
  targetClassId?: string;
  targetGradeLevelId?: string;
  isPublished?: boolean;
  authorId?: string;
  search?: string;
  includeExpired?: boolean;
}) => {
  return useQuery({
    queryKey: communicationKeys.announcementsList(params || {}),
    queryFn: () => communicationApi.getAnnouncements(params),
    staleTime: 2 * 60 * 1000,
  });
};

export const useAnnouncementsForUser = (params?: { skip?: number; take?: number; includeExpired?: boolean }) => {
  return useQuery({
    queryKey: communicationKeys.announcementsForUser(params || {}),
    queryFn: () => communicationApi.getAnnouncementsForUser(params),
    staleTime: 1 * 60 * 1000,
  });
};

export const useAnnouncement = (id: string) => {
  return useQuery({
    queryKey: communicationKeys.announcement(id),
    queryFn: () => communicationApi.getAnnouncementById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      title: string;
      body: string;
      targetRoles: UserRole[];
      targetClassId?: string;
      targetGradeLevelId?: string;
      expiresAt?: string;
      attachments?: any[];
    }) => communicationApi.createAnnouncement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.announcements() });
      queryClient.invalidateQueries({ queryKey: communicationKeys.announcementsForUser({}) });
    },
  });
};

export const useUpdateAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => communicationApi.updateAnnouncement(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.announcement(id) });
      queryClient.invalidateQueries({ queryKey: communicationKeys.announcements() });
      queryClient.invalidateQueries({ queryKey: communicationKeys.announcementsForUser({}) });
    },
  });
};

export const usePublishAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => communicationApi.publishAnnouncement(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.announcement(id) });
      queryClient.invalidateQueries({ queryKey: communicationKeys.announcements() });
      queryClient.invalidateQueries({ queryKey: communicationKeys.announcementsForUser({}) });
    },
  });
};

export const useUnpublishAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => communicationApi.unpublishAnnouncement(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.announcement(id) });
      queryClient.invalidateQueries({ queryKey: communicationKeys.announcements() });
      queryClient.invalidateQueries({ queryKey: communicationKeys.announcementsForUser({}) });
    },
  });
};

export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => communicationApi.deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.announcements() });
      queryClient.invalidateQueries({ queryKey: communicationKeys.announcementsForUser({}) });
    },
  });
};

// ============================================
// NOTIFICATION QUERIES & MUTATIONS
// ============================================

export const useNotifications = (params?: {
  skip?: number;
  take?: number;
  isRead?: boolean;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  return useQuery({
    queryKey: communicationKeys.notificationsList(params || {}),
    queryFn: () => communicationApi.getNotifications(params),
    staleTime: 1 * 60 * 1000,
  });
};

export const useUnreadNotificationCount = () => {
  return useQuery({
    queryKey: communicationKeys.unreadNotificationCount(),
    queryFn: () => communicationApi.getUnreadNotificationCount(),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
};

export const useNotification = (id: string) => {
  return useQuery({
    queryKey: communicationKeys.notification(id),
    queryFn: () => communicationApi.getNotificationById(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
  });
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      userId: string;
      type: string;
      title: string;
      body: string;
      data?: any;
      channels?: string[];
    }) => communicationApi.createNotification(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.notifications() });
      queryClient.invalidateQueries({ queryKey: communicationKeys.unreadNotificationCount() });
    },
  });
};

export const useSendNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      userId: string;
      type: string;
      title: string;
      body: string;
      data?: any;
      channels?: string[];
      sendEmail?: boolean;
      sendSms?: boolean;
      sendPush?: boolean;
    }) => communicationApi.sendNotification(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.notifications() });
      queryClient.invalidateQueries({ queryKey: communicationKeys.unreadNotificationCount() });
    },
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => communicationApi.markNotificationAsRead(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.notification(id) });
      queryClient.invalidateQueries({ queryKey: communicationKeys.notifications() });
      queryClient.invalidateQueries({ queryKey: communicationKeys.unreadNotificationCount() });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => communicationApi.markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.notifications() });
      queryClient.invalidateQueries({ queryKey: communicationKeys.unreadNotificationCount() });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => communicationApi.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.notifications() });
      queryClient.invalidateQueries({ queryKey: communicationKeys.unreadNotificationCount() });
    },
  });
};