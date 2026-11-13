"use client";

import { useDashboardOverview } from "@/hooks/useReports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, Calendar, CheckCircle, DollarSign, TrendingUp, UserPlus, Clock, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  {
    name: "Total Students",
    value: "1,234",
    change: "+12%",
    icon: Users,
    color: "bg-blue-500",
    href: "/admin/users",
  },
  {
    name: "Total Teachers",
    value: "89",
    change: "+5%",
    icon: GraduationCap,
    color: "bg-green-500",
    href: "/admin/users?role=TEACHER",
  },
  {
    name: "Active Classes",
    value: "45",
    change: "+3",
    icon: Building2,
    color: "bg-purple-500",
    href: "/admin/academic",
  },
  {
    name: "Attendance Rate",
    value: "94.2%",
    change: "+1.2%",
    icon: CheckCircle,
    color: "bg-orange-500",
    href: "/admin/attendance",
  },
  {
    name: "Revenue This Month",
    value: "$125,430",
    change: "+8%",
    icon: DollarSign,
    color: "bg-emerald-500",
    href: "/admin/finance",
  },
  {
    name: "Pending Invoices",
    value: "23",
    change: "-5",
    icon: Clock,
    color: "bg-red-500",
    href: "/admin/finance",
  },
];

const recentActivity = [
  { id: 1, type: "enrollment", message: "New student enrolled: John Doe", time: "2 hours ago", icon: UserPlus, color: "text-green-600 bg-green-100" },
  { id: 2, type: "payment", message: "Payment received: $2,500 from Jane Smith", time: "4 hours ago", icon: DollarSign, color: "text-blue-600 bg-blue-100" },
  { id: 3, type: "attendance", message: "Attendance alert: 5 students absent in Grade 10A", time: "6 hours ago", icon: CheckCircle, color: "text-red-600 bg-red-100" },
  { id: 4, type: "grade", message: "Grades published for Midterm Exam - Grade 9", time: "8 hours ago", icon: GraduationCap, color: "text-purple-600 bg-purple-100" },
  { id: 5, type: "announcement", message: "New announcement: Parent-Teacher Meeting", time: "1 day ago", icon: Calendar, color: "text-orange-600 bg-orange-100" },
];

export function AdminDashboard() {
  const { data: dashboard, isLoading, refetch } = useDashboardOverview();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Overview of your school management system</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-8 bg-gray-200 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Helper to format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${amount.toLocaleString()}`;
  };

  // Helper to get stat value from dashboard data
  const getStatValue = (statName: string) => {
    switch (statName) {
      case "Total Students":
        return dashboard?.counts?.students?.toLocaleString() ?? "—";
      case "Total Teachers":
        return dashboard?.counts?.teachers?.toLocaleString() ?? "—";
      case "Active Classes":
        return dashboard?.counts?.classes?.toLocaleString() ?? "—";
      case "Attendance Rate":
        return dashboard?.attendance?.rate ? `${dashboard.attendance.rate.toFixed(1)}%` : "—";
      case "Revenue This Month":
        return dashboard?.finance?.collectedAmount ? formatCurrency(dashboard.finance.collectedAmount) : "—";
      case "Pending Invoices":
        return dashboard?.finance?.pendingAmount ? formatCurrency(dashboard.finance.pendingAmount) : "—";
      default:
        return "—";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your school management system</p>
        </div>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            onClick={() => {
              // TODO: Implement export
            }}
          >
            Export Report
          </button>
          <button
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
            onClick={() => refetch()}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <Card key={stat.name} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{getStatValue(stat.name)}</p>
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {stat.change}
                  </p>
                </div>
                <div className={cn("p-3 rounded-xl", stat.color)}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Attendance Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Attendance Overview (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard?.attendance ? (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {dashboard.attendance.records > 0
                        ? Math.round((dashboard.attendance.records * dashboard.attendance.rate) / 100)
                        : 0}
                    </p>
                    <p className="text-sm text-gray-600">Present</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">
                      {dashboard.attendance.records > 0
                        ? Math.round(dashboard.attendance.records * (100 - dashboard.attendance.rate) / 100)
                        : 0}
                    </p>
                    <p className="text-sm text-gray-600">Absent</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">
                      {dashboard.attendance.records > 0
                        ? Math.round(dashboard.attendance.records * 0.05)
                        : 0}
                    </p>
                    <p className="text-sm text-gray-600">Late</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{dashboard.attendance.rate.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">Rate</p>
                  </div>
                </div>
                <div className="h-48 flex items-end justify-between gap-2 px-2">
                  {/* Simple bar chart placeholder */}
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-primary/20 rounded-t transition-all hover:bg-primary"
                      style={{ height: `${20 + Math.random() * 60}%` }}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500 px-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <span key={day} className="flex-1 text-center">{day}</span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">Loading attendance data...</div>
            )}
          </CardContent>
        </Card>

        {/* Finance Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Finance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard?.finance ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {dashboard.finance.collectedAmount ? formatCurrency(dashboard.finance.collectedAmount) : "—"}
                    </p>
                    <p className="text-sm text-gray-600">Collected</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">
                      {dashboard.finance.pendingAmount ? formatCurrency(dashboard.finance.pendingAmount) : "—"}
                    </p>
                    <p className="text-sm text-gray-600">Pending</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">
                      {dashboard.finance.overdueAmount ? formatCurrency(dashboard.finance.overdueAmount) : "—"}
                    </p>
                    <p className="text-sm text-gray-600">Overdue</p>
                  </div>
                </div>
                <div className="h-48 flex items-end justify-between gap-2 px-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-emerald-500/20 rounded-t transition-all hover:bg-emerald-500"
                      style={{ height: `${30 + Math.random() * 50}%` }}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500 px-2">
                  {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((month) => (
                    <span key={month} className="flex-1 text-center">{month}</span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">Loading finance data...</div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <button className="text-sm text-primary hover:underline">View all</button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboard?.recentEnrollments && dashboard.recentEnrollments.length > 0 ? (
                dashboard.recentEnrollments.slice(0, 5).map((enrollment: any, index: number) => (
                  <div
                    key={enrollment.id ?? index}
                    className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-green-100 text-green-600">
                      <UserPlus className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        New student enrolled: {enrollment.student?.user?.firstName} {enrollment.student?.user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {enrollment.class?.name} • {new Date(enrollment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                      enrollment
                    </span>
                  </div>
                ))
              ) : (
                recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className={cn("p-2 rounded-lg", activity.color)}>
                      <activity.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                      {activity.type}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <a href="/admin/users" className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-center">
                <UserPlus className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Add Student</p>
              </a>
              <a href="/admin/users?role=TEACHER" className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-center">
                <GraduationCap className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Add Teacher</p>
              </a>
              <a href="/admin/academic" className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-center">
                <Building2 className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Manage Classes</p>
              </a>
              <a href="/admin/attendance" className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-center">
                <CheckCircle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Take Attendance</p>
              </a>
              <a href="/admin/grades" className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-center">
                <DollarSign className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Enter Grades</p>
              </a>
              <a href="/admin/finance" className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-center">
                <Calendar className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Generate Invoices</p>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}