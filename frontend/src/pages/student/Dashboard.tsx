import React from "react";
import { useStudentDashboard } from "@/hooks/useReports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardCheck, Award, DollarSign, Bell, Calendar, BookOpen } from "lucide-react";
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

export function StudentDashboard() {
  const { data: dashboard, isLoading, error } = useStudentDashboard();

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

  const attendance = dashboard?.attendance || {};
  const grades = dashboard?.grades || {};
  const fees = dashboard?.fees || {};

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Attendance Rate"
          value={`${(attendance.rate || 0).toFixed(1)}%`}
          icon={ClipboardCheck}
          iconColor="text-blue-500"
        />
        <StatCard
          title="Overall Grade"
          value={`${(grades.overall || 0).toFixed(1)}%`}
          icon={Award}
          iconColor="text-green-500"
        />
        <StatCard
          title="Pending Invoices"
          value={fees.pendingInvoices || 0}
          icon={DollarSign}
          iconColor="text-yellow-500"
        />
        <StatCard
          title="Notifications"
          value={dashboard?.notifications || 0}
          icon={Bell}
          iconColor="text-purple-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Calendar className="h-10 w-10 text-primary mb-2" />
              <h3 className="font-medium">My Schedule</h3>
              <p className="text-sm text-muted-foreground">View your timetable</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <BookOpen className="h-10 w-10 text-green-500 mb-2" />
              <h3 className="font-medium">My Grades</h3>
              <p className="text-sm text-muted-foreground">View detailed grades</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <DollarSign className="h-10 w-10 text-yellow-500 mb-2" />
              <h3 className="font-medium">Fee Payments</h3>
              <p className="text-sm text-muted-foreground">Pay pending fees</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Attendance chart will be displayed here
          </p>
        </CardContent>
      </Card>
    </div>
  );
}