"use client";

import React, { useState } from "react";
import { useAttendanceSummary, useClassAttendanceReport, useAttendanceTrends } from "@/hooks/useReports";
import { useClasses } from "@/hooks/useAcademic";
import {
  AttendanceChart,
  AttendanceRateChart,
} from "@/components/charts/AttendanceChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  useExportAttendance,
} from "@/hooks/useReports";
import { Download, Calendar, Filter, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export function AdminAttendanceReports() {
  const [dateFrom, setDateFrom] = useState(() => format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"));
  const [dateTo, setDateTo] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [classId, setClassId] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [academicYearId, setAcademicYearId] = useState("");
  const [groupBy, setGroupBy] = useState<"day" | "week" | "month">("day");
  const [activeTab, setActiveTab] = useState<"summary" | "class" | "trends">("summary");

  const { data: classes } = useClasses();

  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = useAttendanceSummary({
    schoolId: schoolId || undefined,
    academicYearId: academicYearId || undefined,
    classId: classId || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const { data: classReport, isLoading: classLoading, refetch: refetchClass } = useClassAttendanceReport(
    classId,
    {
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }
  );

  const { data: trends, isLoading: trendsLoading, refetch: refetchTrends } = useAttendanceTrends({
    schoolId: schoolId || undefined,
    academicYearId: academicYearId || undefined,
    classId: classId || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    groupBy,
  });

  const exportAttendance = useExportAttendance();

  const handleRefresh = () => {
    refetchSummary();
    refetchClass();
    refetchTrends();
  };

  const handleExport = () => {
    if (!classId) {
      alert("Please select a class to export attendance report");
      return;
    }
    exportAttendance.mutate({
      classId,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });
  };

  const summaryStats = summary || { totalRecords: 0, present: 0, absent: 0, late: 0, excused: 0, attendanceRate: 0 };
  const trendData = trends?.trends || [];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Filters</CardTitle>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={summaryLoading || classLoading || trendsLoading}>
            <RefreshCw className={cn("mr-2 h-4 w-4", (summaryLoading || classLoading || trendsLoading) && "animate-spin")} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <div>
            <label className="block text-sm font-medium mb-1">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Class</label>
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Classes</SelectItem>
                {classes?.data?.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name} ({cls.gradeLevel?.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">School</label>
            <Select value={schoolId} onValueChange={setSchoolId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Schools" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Schools</SelectItem>
                {/* Schools would be fetched from a hook */}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Academic Year</label>
            <Select value={academicYearId} onValueChange={setAcademicYearId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Years</SelectItem>
                {/* Academic years would be fetched from a hook */}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 lg:col-span-1 flex items-end">
            <Button onClick={handleExport} disabled={exportAttendance.isPending || !classId} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              {exportAttendance.isPending ? "Exporting..." : "Export CSV"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summaryStats.totalRecords || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Present</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{summaryStats.present || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Absent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{summaryStats.absent || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Late</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{summaryStats.late || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Excused</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{summaryStats.excused || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {summaryStats.attendanceRate?.toFixed(1) || 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different reports */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("summary")}
            className={cn(
              "py-2 px-1 text-sm font-medium border-b-2 transition-colors",
              activeTab === "summary"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
            )}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab("class")}
            className={cn(
              "py-2 px-1 text-sm font-medium border-b-2 transition-colors",
              activeTab === "class"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
            )}
            disabled={!classId}
          >
            Class Detail {classId && "📊"}
          </button>
          <button
            onClick={() => setActiveTab("trends")}
            className={cn(
              "py-2 px-1 text-sm font-medium border-b-2 transition-colors",
              activeTab === "trends"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
            )}
          >
            Trends
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "summary" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Attendance Rate Chart */}
          <Card className="col-span-4 lg:col-span-4">
            <CardHeader>
              <CardTitle>Attendance Rate Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading...</div>
              ) : (
                <AttendanceRateChart
                  data={trendData.map((t) => ({ date: t.date, rate: t.rate }))}
                  height={300}
                />
              )}
            </CardContent>
          </Card>

          {/* Attendance Breakdown Chart */}
          <Card className="col-span-3 lg:col-span-3">
            <CardHeader>
              <CardTitle>Attendance Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading...</div>
              ) : (
                <AttendanceChart
                  data={trendData}
                  type="bar"
                  height={300}
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "class" && classId && (
        <Card>
          <CardHeader>
            <CardTitle>Class Attendance Detail</CardTitle>
          </CardHeader>
          <CardContent>
            {classLoading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading...</div>
            ) : classReport ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-medium">Student</th>
                      <th className="text-center p-3 font-medium">Present</th>
                      <th className="text-center p-3 font-medium">Absent</th>
                      <th className="text-center p-3 font-medium">Late</th>
                      <th className="text-center p-3 font-medium">Excused</th>
                      <th className="text-center p-3 font-medium">Total</th>
                      <th className="text-center p-3 font-medium">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classReport.studentSummaries?.map((student: any) => (
                      <tr key={student.student?.id} className="border-b border-border/50">
                        <td className="p-3">
                          <div className="font-medium">{student.student?.user?.firstName} {student.student?.user?.lastName}</div>
                          <div className="text-sm text-muted-foreground">{student.student?.studentId}</div>
                        </td>
                        <td className="text-center p-3 text-green-600">{student.present}</td>
                        <td className="text-center p-3 text-red-600">{student.absent}</td>
                        <td className="text-center p-3 text-yellow-600">{student.late}</td>
                        <td className="text-center p-3 text-blue-600">{student.excused}</td>
                        <td className="text-center p-3">{student.total}</td>
                        <td className="text-center p-3 font-medium">{student.attendanceRate?.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">Select a class to view detailed attendance</p>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "trends" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Attendance Trends Over Time</CardTitle>
            <Select value={groupBy} onValueChange={(v) => setGroupBy(v as "day" | "week" | "month")}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Daily</SelectItem>
                <SelectItem value="week">Weekly</SelectItem>
                <SelectItem value="month">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {trendsLoading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading...</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <AttendanceRateChart
                  data={trendData.map((t) => ({ date: t.date, rate: t.rate }))}
                  height={300}
                />
                <AttendanceChart
                  data={trendData}
                  type="line"
                  height={300}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}