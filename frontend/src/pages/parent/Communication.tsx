"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { communicationApi, usersApi } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Bell, Mail, MessageSquare, AlertCircle, CheckCircle, ChevronLeft, ChevronRight, Download, Users } from "lucide-react";
import { cn, formatDateTime } from "@/lib/utils";
import { Message, Announcement, Notification, Student, Parent } from "@/types/api";
import { toast } from "sonner";

const parentCommunicationTabs = [
  { id: "announcements", label: "Announcements", icon: Bell },
  { id: "notifications", label: "Notifications", icon: AlertCircle },
  { id: "messages", label: "Messages", icon: MessageSquare },
] as const;

type ParentCommunicationTab = (typeof parentCommunicationTabs)[number]["id"];

export function ParentCommunication() {
  const [activeTab, setActiveTab] = useState<ParentCommunicationTab>("announcements");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedChildId, setSelectedChildId] = useState("");

  // Get current user profile
  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => usersApi.getProfile(),
  });

  // Get parent's children - fetch parent record if user is a parent
  const { data: parentData, isLoading: parentLoading } = useQuery({
    queryKey: ["parent-data", currentUser?.id],
    queryFn: async () => {
      if (!currentUser || currentUser.role !== "PARENT") return null;
      const parentsResponse = await usersApi.getParents({ search: "", take: 100 });
      const parent = parentsResponse.data.find((p: Parent) => p.userId === currentUser.id);
      return parent;
    },
    enabled: !!currentUser && currentUser.role === "PARENT",
  });

  const children = parentData?.students || [];

  // Auto-select first child if none selected
  useEffect(() => {
    if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  const selectedChild = children.find((c: Student) => c.id === selectedChildId);

  // Get target classes/grades for announcements filtering
  const targetClassIds = children.map((c: Student) => c.classId).filter(Boolean);
  const targetGradeLevelIds = children.map((c: Student) => c.gradeLevelId).filter(Boolean);

  // ============================================
  // ANNOUNCEMENTS
  // ============================================
  const { data: announcementsData, isLoading: announcementsLoading } = useQuery({
    queryKey: ["parent-announcements", targetClassIds, targetGradeLevelIds, search, statusFilter, page, pageSize],
    queryFn: () => communicationApi.getAnnouncements({
      skip: (page - 1) * pageSize,
      take: pageSize,
      search: search || undefined,
      isPublished: statusFilter === "PUBLISHED" ? true : statusFilter === "DRAFT" ? false : undefined,
      targetClassId: targetClassIds.length > 0 ? targetClassIds[0] : undefined, // API accepts single classId
      targetGradeLevelId: targetGradeLevelIds.length > 0 ? targetGradeLevelIds[0] : undefined, // API accepts single gradeLevelId
    }),
    enabled: targetClassIds.length > 0 || targetGradeLevelIds.length > 0,
  });

  // ============================================
  // NOTIFICATIONS
  // ============================================
  const { data: notificationsData, isLoading: notificationsLoading } = useQuery({
    queryKey: ["parent-notifications", search, statusFilter, page, pageSize],
    queryFn: () => communicationApi.getNotifications({
      skip: (page - 1) * pageSize,
      take: pageSize,
      // search not supported by getNotifications API
      isRead: statusFilter === "READ" ? true : statusFilter === "UNREAD" ? false : undefined,
      // type filter not used for statusFilter
    }),
  });

  // ============================================
  // MESSAGES (with teachers)
  // ============================================
  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ["parent-messages", selectedChildId, search, statusFilter, page, pageSize],
    queryFn: () => communicationApi.getMessages({
      skip: (page - 1) * pageSize,
      take: pageSize,
      search: search || undefined,
      role: statusFilter === "READ" || statusFilter === "UNREAD" ? "all" : "all", // role param, not status
      isRead: statusFilter === "READ" ? true : statusFilter === "UNREAD" ? false : undefined,
    }),
  });

  if (parentLoading || !selectedChild) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Communication</h1>
          <p className="text-gray-600 mt-1">View announcements, notifications, and messages for your children</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500">Loading children...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "announcements":
        return renderAnnouncementsTab();
      case "notifications":
        return renderNotificationsTab();
      case "messages":
        return renderMessagesTab();
    }
  };

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
          </div>
        </CardContent>
      </Card>

      {/* Announcements Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">School Announcements</h3>
            <Button variant="outline" size="sm" disabled>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

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
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : announcementsData?.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No announcements found for your children's classes
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
                          <Badge variant="default">Published</Badge>
                        ) : (
                          <Badge variant="secondary">Draft</Badge>
                        )}
                      </TableCell>
                      <TableCell>{announcement.publishedAt ? formatDateTime(announcement.publishedAt) : "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-primary" disabled>
                          <Mail className="h-4 w-4" />
                        </Button>
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
      {/* Filters */}
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
              <Button variant="outline" onClick={() => { /* mark all read */ }} disabled>
                <CheckCircle className="mr-2 h-4 w-4" /> Mark All Read
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Notifications</h3>
            <Button variant="outline" size="sm" disabled>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Message</TableHead>
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
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
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
                        <Badge variant="secondary">{notification.type}</Badge>
                      </TableCell>
                      <TableCell className="font-medium max-w-xs truncate">{notification.title}</TableCell>
                      <TableCell className="max-w-xs truncate text-gray-600">{notification.body}</TableCell>
                      <TableCell>
                        {notification.channels?.map((c: string) => (
                          <span key={c} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 mr-1 mb-1">
                            {c}
                          </span>
                        ))}
                      </TableCell>
                      <TableCell>
                        {notification.isRead ? (
                          <Badge variant="default">Read</Badge>
                        ) : (
                          <Badge variant="secondary">Unread</Badge>
                        )}
                      </TableCell>
                      <TableCell>{notification.sentAt ? formatDateTime(notification.sentAt) : "—"}</TableCell>
                      <TableCell>{notification.readAt ? formatDateTime(notification.readAt) : "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-primary" disabled>
                          {!notification.isRead && <CheckCircle className="h-4 w-4" />}
                        </Button>
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
          </div>
        </CardContent>
      </Card>

      {/* Messages Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Messages</h3>
            <Button variant="outline" size="sm" disabled>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>Preview</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messagesLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : messagesData?.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No messages found
                    </TableCell>
                  </TableRow>
                ) : (
                  messagesData?.data?.map((message: Message) => (
                    <TableRow key={message.id} className={!message.isRead ? "bg-blue-50" : ""}>
                      <TableCell className="font-medium">{message.subject || "No Subject"}</TableCell>
                      <TableCell>{message.sender?.firstName} {message.sender?.lastName} ({message.sender?.role})</TableCell>
                      <TableCell className="max-w-xs truncate text-gray-600">{message.body.substring(0, 100)}...</TableCell>
                      <TableCell>
                        {message.isRead ? (
                          <Badge variant="default">Read</Badge>
                        ) : (
                          <Badge variant="secondary">Unread</Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatDateTime(message.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-primary" disabled>
                          {!message.isRead && <CheckCircle className="h-4 w-4" />}
                        </Button>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Communication</h1>
          <p className="text-gray-600 mt-1">
            {selectedChild.user?.firstName} {selectedChild.user?.lastName} • View announcements, notifications, and messages
          </p>
        </div>
        <div className="flex items-center gap-2">
          {children.length > 1 && (
            <Select value={selectedChildId} onValueChange={setSelectedChildId}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Select child" /></SelectTrigger>
              <SelectContent>
                {children.map((child: Student) => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.user?.firstName} {child.user?.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as ParentCommunicationTab)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          {parentCommunicationTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center justify-center gap-2">
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {renderTabContent()}
      </Tabs>
    </div>
  );
}