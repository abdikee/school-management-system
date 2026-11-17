"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useTeacherDashboard } from "@/hooks/useReports";
import { useClassAttendanceReport, useAttendanceTrends, useClassGradeReport } from "@/hooks/useReports";
import { useClasses } from "@/hooks/useAcademic";
import {
  AttendanceChart,
  AttendanceRateChart,
  GradeDistributionChart,
} from "@/components/charts/AttendanceChart";
import {
  useExportAttendance,
  useExportGrades,
} from "@/hooks/useReports";
import { Download, RefreshCw, Calendar, ClipboardCheck, Award, BarChart3, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Term } from "@/types/api";
import { useAttendanceSummary, useGradeSummary } from "@/hooks/useReports";

export function TeacherReports() {
  const [dateFrom, setDateFrom] = useState(() => format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"));
  const [dateTo, setDateTo] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [academicYearId, setAcademicYearId] = useState("");
  const [term, setTerm] = useState<Term | "">("");
  const [groupBy, setGroupBy] = useState<"day" | "week" | "month">("day");
  const [activeTab, setActiveTab] = useState<"overview" | "attendance" | "grades">("overview");

  const { data: teacherDashboard } = useTeacherDashboard();
  const { data: classes } = useClasses();
  const teacherClasses = teacherDashboard?.counts ? teacherDashboard.counts.classes : 0;

  const { data: attendanceSummary, isLoading: attendanceLoading, refetch: refetchAttendance } = useAttendanceSummary(
    classId ? { classId, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined } : undefined
  );

  const { data: classAttendance, isLoading: classAttendanceLoading, refetch: refetchClassAttendance } = useClassAttendanceReport(
    classId,
    { dateFrom: dateFrom || undefined, dateTo: dateTo || undefined }
  );

  const { data: attendanceTrends, isLoading: trendsLoading, refetch: refetchTrends } = useAttendanceTrends(
    classId ? { classId, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined, groupBy } : undefined
  );

  const { data: gradeSummary, isLoading: gradeSummaryLoading } = useGradeSummary(
    classId ? { classId, subjectId: subjectId || undefined, academicYearId: academicYearId || undefined, term: term || undefined } : undefined
  );

  const { data: classGrades, isLoading: classGradesLoading, refetch: refetchClassGrades } = useClassGradeReport(
    classId,
    { subjectId: subjectId || undefined, academicYearId: academicYearId || undefined, term: term || undefined }
  );

  const exportAttendance = useExportAttendance();
  const exportGrades = useExportGrades();

  const handleRefresh = () => {
    refetchAttendance();
    refetchClassAttendance();
    refetchTrends();
    refetchClassGrades();
  };

  const handleExportAttendance = () => {
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

  const handleExportGrades = () => {
    if (!classId) {
      alert("Please select a class to export grades report");
      return;
    }
    exportGrades.mutate({
      classId,
      subjectId: subjectId || undefined,
      academicYearId: academicYearId || undefined,
      term: term || undefined,
    });
  };

  const myClasses = classes?.data || [];
  const trendData = attendanceTrends?.trends || [];
  const gradeDist = gradeSummary?.distribution || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Reports</h1>
          <p className="text-muted-foreground mt-1">
            Reports for your assigned classes and students
          </p>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <>
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-blue-600" />
                  My Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{teacherDashboard?.counts?.students || 0}</div>
                <p className="text-sm text-muted-foreground">Total students across your classes</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Award className="h-4 w-4 text-green-600" />
                  My Classes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{teacherDashboard?.counts?.classes || 0}</div>
                <p className="text-sm text-muted-foreground">Classes you teach</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Attendance Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {(teacherDashboard?.attendance?.rate || 0).toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">Overall for your classes</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Unread Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{teacherDashboard?.unreadNotifications || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Class Quick View */}
          <Card>
            <CardHeader>
              <CardTitle>My Classes Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {myClasses.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {myClasses.map((cls) => (
                    <Card key={cls.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{cls.name}</h3>
                          <p className="text-sm text-muted-foreground">{cls.gradeLevel?.name}</p>
                          <p className="text-sm text-muted-foreground">{cls.academicYear?.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{cls._count?.students || 0}</p>
                          <p className="text-xs text-muted-foreground">Students</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No classes assigned</p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Attendance Tab */}
      {activeTab === "attendance" && (
        <>
          {/* Filters */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Attendance Filters</CardTitle>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={attendanceLoading || classAttendanceLoading || trendsLoading}>
                <RefreshCw className={cn("mr-2 h-4 w-4", (attendanceLoading || classAttendanceLoading || trendsLoading) && "animate-spin")} />
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
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {myClasses.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} ({cls.gradeLevel?.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Group By</label>
                <Select value={groupBy} onValueChange={(v) => setGroupBy(v as "day" | "week" | "month")}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Daily</SelectItem>
                    <SelectItem value="week">Weekly</SelectItem>
                    <SelectItem value="month">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 lg:col-span-2 flex items-end gap-2">
                <Button onClick={handleExportAttendance} disabled={exportAttendance.isPending || !classId}>
                  <Download className="mr-2 h-4 w-4" />
                  {exportAttendance.isPending ? "Exporting..." : "Export Attendance CSV"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Records</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{attendanceSummary?.totalRecords || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Present</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{attendanceSummary?.presentCount || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Absent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{attendanceSummary?.absentCount || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Late</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{attendanceSummary?.lateCount || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {attendanceSummary?.attendanceRate?.toFixed(1) || 0}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 lg:col-span-4">
              <CardHeader>
                <CardTitle>Attendance Rate Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {trendsLoading ? (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading...</div>
                ) : (
                  <AttendanceRateChart
                    data={trendData.map((t) => ({ date: t.date, rate: t.attendanceRate }))}
                    height={300}
                  />
                )}
              </CardContent>
            </Card>
            <Card className="col-span-3 lg:col-span-3">
              <CardHeader>
                <CardTitle>Attendance Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {trendsLoading ? (
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

          {/* Class Detail */}
          {classId && (
            <Card>
              <CardHeader>
                <CardTitle>Class Attendance Detail</CardTitle>
              </CardHeader>
              <CardContent>
                {classAttendanceLoading ? (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading...</div>
                ) : classAttendance ? (
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
                        {classAttendance.studentSummaries?.map((student: any) => (
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
        </>
      )}

      {/* Grades Tab */}
      {activeTab === "grades" && (
        <>
          {/* Filters */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Grade Filters</CardTitle>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={gradeSummaryLoading || classGradesLoading}>
                <RefreshCw className={cn("mr-2 h-4 w-4", (gradeSummaryLoading || classGradesLoading) && "animate-spin")} />
                Refresh
              </Button>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
              <div>
                <label className="block text-sm font-medium mb-1">Class</label>
                <Select value={classId} onValueChange={setClassId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {myClasses.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} ({cls.gradeLevel?.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <Select value={subjectId} onValueChange={setSubjectId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Subjects</SelectItem>
                    {/* Subjects would come from class subjects */}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Term</label>
                <Select value={term} onValueChange={(v) => setTerm(v as Term | "")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Terms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Terms</SelectItem>
                    <SelectItem value="TERM_1">Term 1</SelectItem>
                    <SelectItem value="TERM_2">Term 2</SelectItem>
                    <SelectItem value="TERM_3">Term 3</SelectItem>
                    <SelectItem value="SEMESTER_1">Semester 1</SelectItem>
                    <SelectItem value="SEMESTER_2">Semester 2</SelectItem>
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
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 lg:col-span-2 flex items-end gap-2">
                <Button onClick={handleExportGrades} disabled={exportGrades.isPending || !classId}>
                  <Download className="mr-2 h-4 w-4" />
                  {exportGrades.isPending ? "Exporting..." : "Export Grades CSV"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Grade Summary Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Grades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{gradeSummary?.count || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{gradeSummary?.average?.toFixed(1) || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Subjects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{Object.keys(gradeSummary?.bySubject || {}).length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pass Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {(() => {
                    const dist = gradeDist;
                    const total = Object.values(dist as Record<string, number>).reduce((a, b) => a + b, 0);
                    const pass = (dist["60-69"] || 0) + (dist["70-79"] || 0) + (dist["80-89"] || 0) + (dist["90-100"] || 0);
                    return total > 0 ? ((pass / total) * 100).toFixed(1) : 0;
                  })()}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 lg:col-span-4">
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {gradeSummaryLoading ? (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading...</div>
                ) : (
                  <GradeDistributionChart
                    data={gradeDist}
                    height={300}
                  />
                )}
              </CardContent>
            </Card>
            <Card className="col-span-3 lg:col-span-3">
              <CardHeader>
                <CardTitle>Average by Subject</CardTitle>
              </CardHeader>
              <CardContent>
                {gradeSummaryLoading ? (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading...</div>
                ) : gradeSummary?.bySubject ? (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {Object.entries(gradeSummary.bySubject).map(([subject, data]: [string, any]) => (
                      <div key={subject} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{subject}</p>
                          <p className="text-sm text-muted-foreground">{data.count} grades</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{data.average?.toFixed(1) || 0}</p>
                          <p className="text-xs text-muted-foreground">Average</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No subject data available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Class Grade Detail */}
          {classId && (
            <Card>
              <CardHeader>
                <CardTitle>Class Grade Detail</CardTitle>
              </CardHeader>
              <CardContent>
                {classGradesLoading ? (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading...</div>
                ) : classGrades ? (
                  <>
                    <div className="space-y-4 mb-6">
                      <h4 className="font-medium">Student Performance</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left p-3 font-medium">Student</th>
                              <th className="text-center p-3 font-medium">Grades</th>
                              <th className="text-center p-3 font-medium">Average</th>
                            </tr>
                          </thead>
                          <tbody>
                            {classGrades.studentReports?.map((student: any) => (
                              <tr key={student.student?.id} className="border-b border-border/50">
                                <td className="p-3">
                                  <div className="font-medium">{student.student?.user?.firstName} {student.student?.user?.lastName}</div>
                                  <div className="text-sm text-muted-foreground">{student.student?.studentId}</div>
                                </td>
                                <td className="text-center p-3">{student.gradeCount}</td>
                                <td className="text-center p-3 font-medium text-primary">{student.average?.toFixed(1) || 0}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Assessment Performance</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left p-3 font-medium">Assessment</th>
                              <th className="text-left p-3 font-medium">Type</th>
                              <th className="text-center p-3 font-medium">Max Score</th>
                              <th className="text-center p-3 font-medium">Class Avg</th>
                              <th className="text-center p-3 font-medium">Students</th>
                              <th className="text-center p-3 font-medium">Distribution</th>
                            </tr>
                          </thead>
                          <tbody>
                            {classGrades.assessmentReports?.map((assessment: any) => (
                              <tr key={assessment.assessment?.id} className="border-b border-border/50">
                                <td className="p-3">
                                  <div className="font-medium">{assessment.assessment?.name}</div>
                                  <div className="text-sm text-muted-foreground">{assessment.assessment?.type}</div>
                                </td>
                                <td className="p-3">{assessment.assessment?.type}</td>
                                <td className="text-center p-3">{assessment.assessment?.maxScore}</td>
                                <td className="text-center p-3 font-medium text-primary">{assessment.classAverage?.toFixed(1) || 0}</td>
                                <td className="text-center p-3">{assessment.studentCount}</td>
                                <td className="text-center p-3">
                                  <div className="flex justify-center gap-1">
                                    <span className="text-xs text-green-600">90-100: {assessment.distribution?.["90-100"] || 0}</span>
                                    <span className="text-xs text-blue-600">80-89: {assessment.distribution?.["80-89"] || 0}</span>
                                    <span className="text-xs text-yellow-600">70-79: {assessment.distribution?.["70-79"] || 0}</span>
                                    <span className="text-xs text-orange-600">60-69: {assessment.distribution?.["60-69"] || 0}</span>
                                    <span className="text-xs text-red-600">Below 60: {assessment.distribution?.["Below 60"] || 0}</span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">Select a class to view detailed grades</p>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Tabs Navigation */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("overview")}
            className={cn(
              "py-2 px-1 text-sm font-medium border-b-2 transition-colors",
              activeTab === "overview"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
            )}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("attendance")}
            className={cn(
              "py-2 px-1 text-sm font-medium border-b-2 transition-colors",
              activeTab === "attendance"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
            )}
          >
            Attendance
          </button>
          <button
            onClick={() => setActiveTab("grades")}
            className={cn(
              "py-2 px-1 text-sm font-medium border-b-2 transition-colors",
              activeTab === "grades"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
            )}
          >
            Grades
          </button>
        </nav>
      </div>
    </div>
  );
}