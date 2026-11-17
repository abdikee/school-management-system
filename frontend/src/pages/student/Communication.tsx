import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, Mail, MessageSquare, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { communicationApi } from "@/services/api";
import type { Announcement, Message, Notification } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Tab = "messages" | "announcements" | "notifications";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

export function StudentCommunication() {
  const [activeTab, setActiveTab] = useState<Tab>("messages");
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const messagesQuery = useQuery({
    queryKey: ["student-communication-messages", search],
    queryFn: () => communicationApi.getMessages({ search: search || undefined, take: 50, role: "all" }),
  });
  const announcementsQuery = useQuery({
    queryKey: ["student-communication-announcements"],
    queryFn: () => communicationApi.getAnnouncementsForUser({ take: 50 }),
  });
  const notificationsQuery = useQuery({
    queryKey: ["student-communication-notifications"],
    queryFn: () => communicationApi.getNotifications({ take: 50 }),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["student-communication"] });
    queryClient.invalidateQueries({ queryKey: ["student-communication-messages"] });
    queryClient.invalidateQueries({ queryKey: ["student-communication-notifications"] });
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const markMessageRead = useMutation({
    mutationFn: (id: string) => communicationApi.markMessageAsRead(id),
    onSuccess: invalidate,
    onError: () => toast.error("Unable to mark message as read"),
  });
  const markNotificationRead = useMutation({
    mutationFn: (id: string) => communicationApi.markNotificationAsRead(id),
    onSuccess: invalidate,
    onError: () => toast.error("Unable to mark notification as read"),
  });
  const deleteNotification = useMutation({
    mutationFn: (id: string) => communicationApi.deleteNotification(id),
    onSuccess: invalidate,
    onError: () => toast.error("Unable to delete notification"),
  });

  const messages = messagesQuery.data?.data ?? [];
  const announcements = announcementsQuery.data?.data ?? [];
  const notifications = notificationsQuery.data?.data ?? [];
  const unreadMessages = messages.filter((message: Message) => !message.isRead).length;
  const unreadNotifications = notifications.filter((notification: Notification) => !notification.isRead).length;

  const tabs: { id: Tab; label: string; icon: typeof Mail; count: number }[] = [
    { id: "messages", label: "Messages", icon: MessageSquare, count: unreadMessages },
    { id: "announcements", label: "Announcements", icon: Bell, count: 0 },
    { id: "notifications", label: "Notifications", icon: Bell, count: unreadNotifications },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Communication</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">School communication</h1>
        <p className="mt-2 text-slate-500">Keep up with teachers, announcements, and important school updates.</p>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border bg-white p-2">
        {tabs.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition ${activeTab === id ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-emerald-50"}`}
          >
            <Icon className="h-4 w-4" /> {label}
            {count > 0 && <span className={`rounded-full px-2 py-0.5 text-xs ${activeTab === id ? "bg-white/20" : "bg-emerald-100 text-emerald-700"}`}>{count}</span>}
          </button>
        ))}
      </div>

      {activeTab === "messages" && (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2 text-xl"><MessageSquare className="h-5 w-5 text-emerald-700" /> Inbox</CardTitle>
              <div className="relative w-full sm:w-72"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search messages..." className="pl-9" /></div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {messagesQuery.isLoading ? <p className="py-12 text-center text-slate-500">Loading messages...</p> : messages.length === 0 ? <p className="py-12 text-center text-slate-500">No messages found.</p> : messages.map((message: Message) => (
              <article key={message.id} className={`rounded-2xl border p-4 ${message.isRead ? "bg-white" : "border-emerald-200 bg-emerald-50/50"}`}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div><h2 className="font-semibold text-slate-900">{message.subject || "Message"}</h2><p className="text-xs text-slate-500">From {message.sender?.firstName} {message.sender?.lastName} · {formatDate(message.createdAt)}</p></div>
                  {!message.isRead && <Badge>Unread</Badge>}
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{message.body}</p>
                {!message.isRead && <Button variant="ghost" size="sm" className="mt-2" onClick={() => markMessageRead.mutate(message.id)}><Check className="mr-1 h-4 w-4" /> Mark read</Button>}
              </article>
            ))}
          </CardContent>
        </Card>
      )}

      {activeTab === "announcements" && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-xl"><Bell className="h-5 w-5 text-emerald-700" /> School announcements</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {announcementsQuery.isLoading ? <p className="py-12 text-center text-slate-500">Loading announcements...</p> : announcements.length === 0 ? <p className="py-12 text-center text-slate-500">No announcements available.</p> : announcements.map((announcement: Announcement) => (
              <article key={announcement.id} className="rounded-2xl border p-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"><h2 className="font-semibold text-slate-900">{announcement.title}</h2><time className="text-xs text-slate-500">{formatDate(announcement.createdAt)}</time></div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{announcement.body}</p>
              </article>
            ))}
          </CardContent>
        </Card>
      )}

      {activeTab === "notifications" && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-xl"><Bell className="h-5 w-5 text-emerald-700" /> Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {notificationsQuery.isLoading ? <p className="py-12 text-center text-slate-500">Loading notifications...</p> : notifications.length === 0 ? <p className="py-12 text-center text-slate-500">No notifications available.</p> : notifications.map((notification: Notification) => (
              <article key={notification.id} className={`flex gap-4 rounded-2xl border p-4 ${notification.isRead ? "bg-white" : "border-emerald-200 bg-emerald-50/50"}`}>
                <Bell className="mt-1 h-5 w-5 shrink-0 text-emerald-700" />
                <div className="min-w-0 flex-1"><div className="flex flex-col gap-1 sm:flex-row sm:justify-between"><h2 className="font-semibold text-slate-900">{notification.title}</h2><time className="text-xs text-slate-500">{formatDate(notification.createdAt)}</time></div><p className="mt-1 text-sm text-slate-600">{notification.body}</p><div className="mt-2 flex gap-2">{!notification.isRead && <Button variant="ghost" size="sm" onClick={() => markNotificationRead.mutate(notification.id)}><Check className="mr-1 h-4 w-4" /> Mark read</Button>}<Button variant="ghost" size="sm" className="text-rose-600" onClick={() => deleteNotification.mutate(notification.id)}><Trash2 className="mr-1 h-4 w-4" /> Delete</Button></div></div>
              </article>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
