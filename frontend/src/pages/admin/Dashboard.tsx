import React from "react";
import { useDashboardOverview } from "@/hooks/useReports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, BookOpen, DollarSign, TrendingUp, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const StatCard = ({
  title,
  value,
  change,
  icon: Icon,
  iconColor,
}: {
  title: string;
  value: string | number;
  change?: string;
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
      {change && <p className="text-xs text-muted-foreground">{change}</p>}
    </CardContent>
  </Card>
);

export function AdminDashboard() {
  const { data: dashboard, isLoading, error } = useDashboardOverview();

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
  const finance = dashboard?.finance || {};

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={counts.students || 0}
          icon={Users}
          iconColor="text-blue-500"
          change="+12% from last month"
        />
        <StatCard
          title="Total Teachers"
          value={counts.teachers || 0}
          icon={GraduationCap}
          iconColor="text-green-500"
          change="+5% from last month"
        />
        <StatCard
          title="Total Classes"
          value={counts.classes || 0}
          icon={BookOpen}
          iconColor="text-purple-500"
          change="+3% from last month"
        />
        <StatCard
          title="Revenue"
          value={`$${(finance.totalRevenue || 0).toLocaleString()}`}
          icon={DollarSign}
          iconColor="text-yellow-500"
          change={`$${(finance.pendingAmount || 0).toLocaleString()} pending`}
        />
      </div>

      {/* Charts and Additional Info */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Attendance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Attendance Rate</span>
                  <span className="font-medium">{attendance.rate?.toFixed(1) || 0}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${attendance.rate || 0}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Total Records: {attendance.records || 0}</span>
                <span>This Month</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Finance Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Collected</span>
              <span className="font-medium text-green-600">${(finance.collectedAmount || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pending</span>
              <span className="font-medium text-yellow-600">${(finance.pendingAmount || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Overdue</span>
              <span className="font-medium text-red-600">${(finance.overdueAmount || 0).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
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