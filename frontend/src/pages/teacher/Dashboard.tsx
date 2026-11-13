import React from "react";
import { useTeacherDashboard } from "@/hooks/useReports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, ClipboardCheck, Bell, Award } from "lucide-react";
import { cn } from "@/lib/utils";

const StatCard = ({
  title,
  value,
  icon: Icon,
  iconColor,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className={cn("h-4 w-4", iconColor)} aria-hidden="true" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

export function TeacherDashboard() {
  const { data: dashboard, isLoading, error } = useTeacherDashboard();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load dashboard data</p>
      </div>
    );
  }

  const counts = dashboard?.counts || {};
  const attendance = dashboard?.attendance || {};

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="My Students"
          value={counts.students || 0}
          icon={Users}
          iconColor="text-blue-500"
        />
        <StatCard
          title="My Classes"
          value={counts.classes || 0}
          icon={BookOpen}
          iconColor="text-green-500"
        />
        <StatCard
          title="Attendance Rate"
          value={`${(attendance.rate || 0).toFixed(1)}%`}
          icon={ClipboardCheck}
          iconColor="text-purple-500"
        />
        <StatCard
          title="Unread Notifications"
          value={dashboard?.unreadNotifications || 0}
          icon={Bell}
          iconColor="text-yellow-500"
        />
      </div>

      {/* My Classes Overview */}
      <Card>
        <CardHeader>
          <CardTitle>My Classes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Class overview will be displayed here
          </p>
        </CardContent>
      </Card>

      {/* Recent Enrollments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Enrollments</CardTitle>
        </CardHeader>
        <CardContent>
          {dashboard?.recentEnrollments?.length > 0 ? (
            <div className="space-y-3">
              {dashboard.recentEnrollments.slice(0, 5).map((enrollment: any) => (
                <div key={enrollment.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{enrollment.user?.firstName} {enrollment.user?.lastName}</p>
                      <p className="text-sm text-muted-foreground">{enrollment.class?.name}</p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No recent enrollments</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}