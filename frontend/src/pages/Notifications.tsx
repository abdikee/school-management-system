import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, CheckCheck, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { communicationApi } from "@/services/api";
import type { Notification } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

export function Notifications() {
  const queryClient = useQueryClient();
  const notificationsQuery = useQuery({
    queryKey: ["notifications", "all"],
    queryFn: () => communicationApi.getNotifications({ skip: 0, take: 50 }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["notifications"] });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => communicationApi.markNotificationAsRead(id),
    onSuccess: invalidate,
    onError: () => toast.error("Unable to update notification"),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => communicationApi.markAllNotificationsAsRead(),
    onSuccess: () => {
      invalidate();
      toast.success("All notifications marked as read");
    },
    onError: () => toast.error("Unable to update notifications"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => communicationApi.deleteNotification(id),
    onSuccess: invalidate,
    onError: () => toast.error("Unable to delete notification"),
  });

  const notifications = useMemo<Notification[]>(
    () => notificationsQuery.data?.data ?? [],
    [notificationsQuery.data],
  );
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Updates</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Notifications</h1>
          <p className="mt-2 text-slate-500">
            {unreadCount ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}` : "You are all caught up."}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
          >
            <CheckCheck className="mr-2 h-4 w-4" /> Mark all as read
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl"><Bell className="h-5 w-5 text-emerald-700" /> Your notifications</CardTitle>
          <CardDescription>Announcements, attendance, grades, fees, and account updates.</CardDescription>
        </CardHeader>
        <CardContent>
          {notificationsQuery.isLoading && (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading notifications...
            </div>
          )}
          {notificationsQuery.isError && (
            <div className="py-16 text-center">
              <p className="font-medium text-slate-900">Notifications could not be loaded.</p>
              <Button className="mt-4" onClick={() => notificationsQuery.refetch()}>Try again</Button>
            </div>
          )}
          {!notificationsQuery.isLoading && !notificationsQuery.isError && notifications.length === 0 && (
            <div className="py-16 text-center">
              <Bell className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-4 font-medium text-slate-900">No notifications yet</p>
              <p className="mt-1 text-sm text-slate-500">New school updates will appear here.</p>
            </div>
          )}
          <div className="space-y-3">
            {notifications.map((notification) => (
              <article
                key={notification.id}
                className={`flex gap-4 rounded-2xl border p-4 transition ${notification.isRead ? "border-slate-200 bg-white" : "border-emerald-200 bg-emerald-50/60"}`}
              >
                <div className={`mt-1 rounded-xl p-2 ${notification.isRead ? "bg-slate-100 text-slate-500" : "bg-emerald-600 text-white"}`}>
                  <Bell className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="font-semibold text-slate-900">{notification.title}</h2>
                    <time className="text-xs text-slate-500">{formatDate(notification.createdAt)}</time>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{notification.body}</p>
                  <div className="mt-3 flex items-center gap-2">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markReadMutation.mutate(notification.id)}
                        disabled={markReadMutation.isPending}
                      >
                        <Check className="mr-1 h-4 w-4" /> Mark read
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-600 hover:text-rose-700"
                      onClick={() => deleteMutation.mutate(notification.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="mr-1 h-4 w-4" /> Delete
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
