"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { communicationApi, academicApi, usersApi } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Send,
  Bell,
  Mail,
  MessageSquare,
  Users,
  PaperPlane,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { cn, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import { Message, Announcement, Notification, User, Class } from "@/types/api";

const communicationTabs = [
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "announcements", label: "Announcements", icon: Bell },
  { id: "notifications", label: "Notifications", icon: AlertCircle },
] as const;

type CommunicationTab = (typeof communicationTabs)[number]["id"];

export function AdminCommunication() {
  const [activeTab, setActiveTab] = useState<CommunicationTab>("messages");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedGradeLevelId, setSelectedGradeLevelId] = useState("");
  const [selectedRecipientId, setSelectedRecipientId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: string } | null>(null);
  const [recipients, setRecipients] = useState<User[]>([]);

  const queryClient = useQueryClient();

  // ============================================
  // CLASSES
  // ============================================
  const { data: classesData } = useQuery({
    queryKey: ["classes"],
    queryFn: () => academicApi.getClasses({ take: 100 }),
  });

  // ============================================
  // USERS (for recipients)
  // ============================================
  const { data: usersData } = useQuery({
    queryKey: ["users", selectedClassId, selectedGradeLevelId],
    queryFn: () => usersApi.getUsers({
      classId: selectedClassId || undefined,
      gradeLevelId: selectedGradeLevelId || undefined,
      take: 200,
    }),
  });

  // ============================================
  // MESSAGES
  // ============================================
  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ["messages", search, statusFilter, page, pageSize],
    queryFn: () => communicationApi.getMessages({
      skip: (page - 1) * pageSize,
      take: pageSize,
      search: search || undefined,
      status: statusFilter || undefined,
    }),
  });

  const createMessageMutation = useMutation({
    mutationFn: (data: any) => communicationApi.createMessage(data),
    onSuccess: () => {
      toast.success("Message sent");
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      setCreateDialogOpen(false);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to send message"),
  });

  const updateMessageMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => communicationApi.updateMessage(id, data),
    onSuccess: () => {
      toast.success("Message updated");
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      setEditDialogOpen(false);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to update message"),
  });

  const deleteMessageMutation = useMutation({
    mutationFn: (id: string) => communicationApi.deleteMessage(id),
    onSuccess: () => {
      toast.success("Message deleted");
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      setDeleteConfirmOpen(false);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to delete message"),
  });

  const markMessageReadMutation = useMutation({
    mutationFn: (id: string) => communicationApi.markMessageRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });

  // ============================================
  // ANNOUNCEMENTS
  // ============================================
  const { data: announcementsData, isLoading: announcementsLoading } = useQuery({
    queryKey: ["announcements", search, statusFilter, page, pageSize],
    queryFn: () => communicationApi.getAnnouncements({
      skip: (page - 1) * pageSize,
      take: pageSize,
      search: search || undefined,
      isPublished: statusFilter === "PUBLISHED" ? true : statusFilter === "DRAFT" ? false : undefined,
    }),
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: (data: any) => communicationApi.createAnnouncement(data),
    onSuccess: () => {
      toast.success("Announcement created");
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      setCreateDialogOpen(false);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to create announcement"),
  });

  const updateAnnouncementMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => communicationApi.updateAnnouncement(id, data),
    onSuccess: () => {
      toast.success("Announcement updated");
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      setEditDialogOpen(false);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to update announcement"),
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: (id: string) => communicationApi.deleteAnnouncement(id),
    onSuccess: () => {
      toast.success("Announcement deleted");
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      setDeleteConfirmOpen(false);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to delete announcement"),
  });

  const publishAnnouncementMutation = useMutation({
    mutationFn: (id: string) => communicationApi.publishAnnouncement(id),
    onSuccess: () => {
      toast.success("Announcement published");
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to publish announcement"),
  });

  // ============================================
  // NOTIFICATIONS
  // ============================================
  const { data: notificationsData, isLoading: notificationsLoading } = useQuery({
    queryKey: ["notifications", search, statusFilter, page, pageSize],
    queryFn: () => communicationApi.getNotifications({
      skip: (page - 1) * pageSize,
      take: pageSize,
      search: search || undefined,
      isRead: statusFilter === "READ" ? true : statusFilter === "UNREAD" ? false : undefined,
    }),
  });

  const createNotificationMutation = useMutation({
    mutationFn: (data: any) => communicationApi.createNotification(data),
    onSuccess: () => {
      toast.success("Notification sent");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      setCreateDialogOpen(false);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to send notification"),
  });

  const markNotificationReadMutation = useMutation({
    mutationFn: (id: string) => communicationApi.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllNotificationsReadMutation = useMutation({
    mutationFn: () => communicationApi.markAllNotificationsRead(),
    onSuccess: () => {
      toast.success("All notifications marked as read");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to mark all as read"),
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id: string) => communicationApi.deleteNotification(id),
    onSuccess: () => {
      toast.success("Notification deleted");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      setDeleteConfirmOpen(false);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to delete notification"),
  });

  const handleDelete = (id: string, type: string) => {
    setItemToDelete({ id, type });
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!itemToDelete) return;
    switch (itemToDelete.type) {
      case "message":
        deleteMessageMutation.mutate(itemToDelete.id);
        break;
      case "announcement":
        deleteAnnouncementMutation.mutate(itemToDelete.id);
        break;
      case "notification":
        deleteNotificationMutation.mutate(itemToDelete.id);
        break;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "messages":
        return renderMessagesTab();
      case "announcements":
        return renderAnnouncementsTab();
      case "notifications":
        return renderNotificationsTab();
    }
  };

  const renderMessagesTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
            <div className="w-full sm:w-48">
              <Label className="block text-sm font-medium mb-1">Status</Label>
              <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
                <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="READ">Read</SelectItem>
                  <SelectItem value="UNREAD">Unread</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={() => { setSelectedItem(null); setCreateDialogOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                Send Message
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Preview</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messagesLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    </TableCell>
                  </TableRow>
                ) : messagesData?.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No messages found
                    </TableCell>
                  </TableRow>
                ) : (
                  messagesData?.data?.map((message: Message) => (
                    <TableRow key={message.id} className={!message.isRead ? "bg-blue-50" : ""}>
                      <TableCell className="font-medium">{message.subject || "No Subject"}</TableCell>
                      <TableCell>{message.sender?.firstName} {message.sender?.lastName}</TableCell>
                      <TableCell>{message.recipient?.firstName} {message.recipient?.lastName}</TableCell>
                      <TableCell className="max-w-xs truncate text-gray-600">{message.body.substring(0, 100)}...</TableCell>
                      <TableCell>
                        {message.isRead ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="mr-1 h-3 w-3" /> Read
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Mail className="mr-1 h-3 w-3" /> Unread
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{formatDateTime(message.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedItem(message); setCreateDialogOpen(true); }}><Eye className="h-4 w-4" /></Button>
                          {!message.isRead && (
                            <Button variant="ghost" size="icon" onClick={() => markMessageReadMutation.mutate(message.id)}>
                              <Mail className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(message.id, "message")} disabled={deleteMessageMutation.isPending}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {messagesData && messagesData.meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Page {messagesData.meta.page} of {messagesData.meta.totalPages} ({messagesData.meta.total} total)
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(messagesData.meta.totalPages, p + 1))} disabled={page === messagesData.meta.totalPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderAnnouncementsTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search announcements..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
            <div className="w-full sm:w-48">
              <Label className="block text-sm font-medium mb-1">Status</Label>
              <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
                <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={() => { setSelectedItem(null); setCreateDialogOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                Create Announcement
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Announcements Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Target Roles</TableHead>
                  <TableHead>Target Class</TableHead>
                  <TableHead>Target Grade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcementsLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    </TableCell>
                  </TableRow>
                ) : announcementsData?.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No announcements found
                    </TableCell>
                  </TableRow>
                ) : (
                  announcementsData?.data?.map((announcement: Announcement) => (
                    <TableRow key={announcement.id}>
                      <TableCell className="font-medium max-w-xs truncate">{announcement.title}</TableCell>
                      <TableCell>{announcement.author?.firstName} {announcement.author?.lastName}</TableCell>
                      <TableCell>
                        {announcement.targetRoles?.map((r: string) => (
                          <span key={r} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 mr-1 mb-1">
                            {r}
                          </span>
                        ))}
                      </TableCell>
                      <TableCell>{announcement.targetClass?.name || "All"}</TableCell>
                      <TableCell>{announcement.targetGradeLevel?.name || "All"}</TableCell>
                      <TableCell>
                        {announcement.isPublished ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Draft
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{announcement.publishedAt ? formatDateTime(announcement.publishedAt) : "—"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedItem(announcement); setCreateDialogOpen(true); }}><Eye className="h-4 w-4" /></Button>
                          {!announcement.isPublished && (
                            <Button variant="ghost" size="icon" onClick={() => publishAnnouncementMutation.mutate(announcement.id)} disabled={publishAnnouncementMutation.isPending}>
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(announcement.id, "announcement")} disabled={deleteAnnouncementMutation.isPending}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {announcementsData && announcementsData.meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Page {announcementsData.meta.page} of {announcementsData.meta.totalPages} ({announcementsData.meta.total} total)
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(announcementsData.meta.totalPages, p + 1))} disabled={page === announcementsData.meta.totalPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      {/* Header with actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search notifications..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="pl-10"
                />
              </div>
              <div className="w-full sm:w-48">
                <Label className="block text-sm font-medium mb-1">Status</Label>
                <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
                  <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    <SelectItem value="READ">Read</SelectItem>
                    <SelectItem value="UNREAD">Unread</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => markAllNotificationsReadMutation.mutate()} disabled={markAllNotificationsReadMutation.isPending}>
                {markAllNotificationsReadMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />} Mark All Read
              </Button>
              <Button onClick={() => { setSelectedItem(null); setCreateDialogOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                Send Notification
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Channels</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Read</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notificationsLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    </TableCell>
                  </TableRow>
                ) : notificationsData?.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No notifications found
                    </TableCell>
                  </TableRow>
                ) : (
                  notificationsData?.data?.map((notification: Notification) => (
                    <TableRow key={notification.id} className={!notification.isRead ? "bg-blue-50" : ""}>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {notification.type}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium max-w-xs truncate">{notification.title}</TableCell>
                      <TableCell>{notification.user?.firstName} {notification.user?.lastName}</TableCell>
                      <TableCell>
                        {notification.channels?.map((c: string) => (
                          <span key={c} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 mr-1 mb-1">
                            {c}
                          </span>
                        ))}
                      </TableCell>
                      <TableCell>
                        {notification.isRead ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Read
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Unread
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{notification.sentAt ? formatDateTime(notification.sentAt) : "—"}</TableCell>
                      <TableCell>{notification.readAt ? formatDateTime(notification.readAt) : "—"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!notification.isRead && (
                            <Button variant="ghost" size="icon" onClick={() => markNotificationReadMutation.mutate(notification.id)}>
                              <Mail className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(notification.id, "notification")} disabled={deleteNotificationMutation.isPending}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {notificationsData && notificationsData.meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Page {notificationsData.meta.page} of {notificationsData.meta.totalPages} ({notificationsData.meta.total} total)
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(notificationsData.meta.totalPages, p + 1))} disabled={page === notificationsData.meta.totalPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Communication Center</h1>
          <p className="text-gray-600 mt-1">
            Manage messages, announcements, and notifications
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          {communicationTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center justify-center gap-2">
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {renderTabContent()}
      </Tabs>

      {/* Create/Edit Dialogs */}
      <Dialog open={createDialogOpen || editDialogOpen} onOpenChange={(open) => { if (!open) { setCreateDialogOpen(false); setEditDialogOpen(false); setSelectedItem(null); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedItem ? "Edit" : "Create"} {activeTab === "messages" ? "Message" : activeTab === "announcements" ? "Announcement" : "Notification"}</DialogTitle>
            <DialogDescription>
              {selectedItem ? "Update the details below." : "Fill in the details below to create a new record."}
            </DialogDescription>
          </DialogHeader>
          {activeTab === "messages" && (
            <MessageForm
              message={selectedItem}
              users={usersData?.data || []}
              onSubmit={(data) => {
                if (selectedItem) {
                  updateMessageMutation.mutate({ id: selectedItem.id, data });
                } else {
                  createMessageMutation.mutate(data);
                }
              }}
              isLoading={createMessageMutation.isPending || updateMessageMutation.isPending}
              onClose={() => { setCreateDialogOpen(false); setEditDialogOpen(false); setSelectedItem(null); }}
            />
          )}
          {activeTab === "announcements" && (
            <AnnouncementForm
              announcement={selectedItem}
              classes={classesData?.data || []}
              onSubmit={(data) => {
                if (selectedItem) {
                  updateAnnouncementMutation.mutate({ id: selectedItem.id, data });
                } else {
                  createAnnouncementMutation.mutate(data);
                }
              }}
              isLoading={createAnnouncementMutation.isPending || updateAnnouncementMutation.isPending}
              onClose={() => { setCreateDialogOpen(false); setEditDialogOpen(false); setSelectedItem(null); }}
            />
          )}
          {activeTab === "notifications" && (
            <NotificationForm
              notification={selectedItem}
              users={usersData?.data || []}
              onSubmit={(data) => {
                createNotificationMutation.mutate(data);
              }}
              isLoading={createNotificationMutation.isPending}
              onClose={() => { setCreateDialogOpen(false); setEditDialogOpen(false); setSelectedItem(null); }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleteMessageMutation.isPending || deleteAnnouncementMutation.isPending || deleteNotificationMutation.isPending}>
              {deleteMessageMutation.isPending || deleteAnnouncementMutation.isPending || deleteNotificationMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Message Form
function MessageForm({
  message,
  users,
  onSubmit,
  isLoading,
  onClose,
}: {
  message: any;
  users: User[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
  onClose: () => void;
}) {
  const form = useForm({
    resolver: zodResolver(
      z.object({
        recipientId: z.string().min(1, "Recipient is required"),
        subject: z.string().optional(),
        body: z.string().min(1, "Message body is required"),
      })
    ),
    defaultValues: message || {
      recipientId: "",
      subject: "",
      body: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="recipientId" render={({ field }) => (
          <FormItem><FormLabel>Recipient *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select recipient" /></SelectTrigger></FormControl>
              <SelectContent>
                {users.map((u) => <SelectItem key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.role})</SelectItem>)}
              </SelectContent>
            </Select>
          <FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="subject" render={({ field }) => (
          <FormItem><FormLabel>Subject</FormLabel><FormControl><Input placeholder="Optional subject" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="body" render={({ field }) => (
          <FormItem><FormLabel>Message *</FormLabel>
            <FormControl>
              <textarea {...field} className="w-full min-h-[120px] p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
            </FormControl>
          <FormMessage /></FormItem>
        )} />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>{isLoading ? "Sending..." : (message ? "Update" : "Send")}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

// Announcement Form
function AnnouncementForm({
  announcement,
  classes,
  onSubmit,
  isLoading,
  onClose,
}: {
  announcement: any;
  classes: Class[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
  onClose: () => void;
}) {
  const form = useForm({
    resolver: zodResolver(
      z.object({
        title: z.string().min(1, "Title is required"),
        body: z.string().min(1, "Body is required"),
        targetRoles: z.array(z.string()).min(1, "At least one target role is required"),
        targetClassId: z.string().optional(),
        targetGradeLevelId: z.string().optional(),
        isPublished: z.boolean().default(false),
        publishedAt: z.string().optional(),
        expiresAt: z.string().optional(),
      })
    ),
    defaultValues: announcement || {
      title: "",
      body: "",
      targetRoles: ["STUDENT", "PARENT", "TEACHER"],
      targetClassId: "",
      targetGradeLevelId: "",
      isPublished: false,
      publishedAt: "",
      expiresAt: "",
    },
  });

  const roles = ["ADMIN", "TEACHER", "STUDENT", "PARENT"];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem><FormLabel>Title *</FormLabel><FormControl><Input placeholder="e.g., Parent-Teacher Meeting Next Week" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="body" render={({ field }) => (
          <FormItem><FormLabel>Body *</FormLabel>
            <FormControl>
              <textarea {...field} className="w-full min-h-[120px] p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
            </FormControl>
          <FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="targetRoles" render={({ field }) => (
          <FormItem><FormLabel>Target Roles *</FormLabel>
            <FormControl>
              <div className="flex flex-wrap gap-2">
                {roles.map((role) => (
                  <label key={role} className="inline-flex items-center gap-2 px-3 py-1.5 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={field.value?.includes(role)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          field.onChange([...(field.value || []), role]);
                        } else {
                          field.onChange((field.value || []).filter((r: string) => r !== role));
                        }
                      }}
                    />
                    <span className="text-sm">{role}</span>
                  </label>
                ))}
              </div>
            </FormControl>
          <FormMessage /></FormItem>
        )} />
        <div className="grid gap-4 md:grid-cols-2">
          <FormField control={form.control} name="targetClassId" render={({ field }) => (
            <FormItem><FormLabel>Target Class</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select class (optional)" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="">All Classes</SelectItem>
                  {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name} ({c.gradeLevel?.name})</SelectItem>)}
                </SelectContent>
              </Select>
            <FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="targetGradeLevelId" render={({ field }) => (
            <FormItem><FormLabel>Target Grade Level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select grade (optional)" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="">All Grades</SelectItem>
                </SelectContent>
              </Select>
            <FormMessage /></FormItem>
          )} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField control={form.control} name="publishedAt" render={({ field }) => (
            <FormItem><FormLabel>Publish At</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="expiresAt" render={({ field }) => (
            <FormItem><FormLabel>Expires At</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={form.control} name="isPublished" render={({ field }) => (
          <FormItem className="flex items-center">
            <FormControl>
              <label className="flex items-center gap-2">
                <input type="checkbox" {...field} /> <FormLabel>Publish immediately</FormLabel>
              </label>
            </FormControl>
          </FormItem>
        )} />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : (announcement ? "Update" : "Create")}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

// Notification Form
function NotificationForm({
  notification,
  users,
  onSubmit,
  isLoading,
  onClose,
}: {
  notification: any;
  users: User[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
  onClose: () => void;
}) {
  const form = useForm({
    resolver: zodResolver(
      z.object({
        userId: z.string().min(1, "User is required"),
        type: z.enum(["ANNOUNCEMENT", "ATTENDANCE_ALERT", "GRADE_POSTED", "FEE_DUE", "FEE_OVERDUE", "PAYMENT_RECEIVED", "MESSAGE", "SYSTEM"]),
        title: z.string().min(1, "Title is required"),
        body: z.string().min(1, "Body is required"),
        channels: z.array(z.string()).min(1, "At least one channel is required"),
      })
    ),
    defaultValues: notification || {
      userId: "",
      type: "SYSTEM",
      title: "",
      body: "",
      channels: ["IN_APP"],
    },
  });

  const types = ["ANNOUNCEMENT", "ATTENDANCE_ALERT", "GRADE_POSTED", "FEE_DUE", "FEE_OVERDUE", "PAYMENT_RECEIVED", "MESSAGE", "SYSTEM"];
  const channels = ["IN_APP", "EMAIL", "SMS", "PUSH"];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="userId" render={({ field }) => (
          <FormItem><FormLabel>User *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger></FormControl>
              <SelectContent>
                {users.map((u) => <SelectItem key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.role})</SelectItem>)}
              </SelectContent>
            </Select>
          <FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="type" render={({ field }) => (
          <FormItem><FormLabel>Type *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
              <SelectContent>
                {types.map((t) => <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>)}
              </SelectContent>
            </Select>
          <FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem><FormLabel>Title *</FormLabel><FormControl><Input placeholder="Notification title" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="body" render={({ field }) => (
          <FormItem><FormLabel>Body *</FormLabel>
            <FormControl>
              <textarea {...field} className="w-full min-h-[80px] p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
            </FormControl>
          <FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="channels" render={({ field }) => (
          <FormItem><FormLabel>Channels *</FormLabel>
            <FormControl>
              <div className="flex flex-wrap gap-2">
                {channels.map((channel) => (
                  <label key={channel} className="inline-flex items-center gap-2 px-3 py-1.5 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={field.value?.includes(channel)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          field.onChange([...(field.value || []), channel]);
                        } else {
                          field.onChange((field.value || []).filter((c: string) => c !== channel));
                        }
                      }}
                    />
                    <span className="text-sm">{channel}</span>
                  </label>
                ))}
              </div>
            </FormControl>
          <FormMessage /></FormItem>
        )} />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>{isLoading ? "Sending..." : "Send Notification"}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}