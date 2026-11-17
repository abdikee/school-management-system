"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useStudentDashboard, useExportAttendance, useExportGrades } from "@/hooks/useReports";
import { useStudentAttendanceReport, useAttendanceTrends, useStudentGradeReport } from "@/hooks/useReports";
import {
  AttendanceChart,
  AttendanceRateChart,
  GradeDistributionChart,
} from "@/components/charts/AttendanceChart";
import { Download, RefreshCw, Calendar, ClipboardCheck, Award, BarChart3, TrendingUp, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Term } from "@/types/api";

export function StudentReports() {
  const [dateFrom, setDateFrom] = useState(() => format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"));
  const [dateTo, setDateTo] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [academicYearId, setAcademicYearId] = useState("");
  const [classSubjectId, setClassSubjectId] = useState("");
  const [term, setTerm] = useState<Term | "">("");
  const [groupBy, setGroupBy] = useState<"day" | "week" | "month">("day");
  const [activeTab, setActiveTab] = useState<"overview" | "attendance" | "grades">("overview");

  const { data: studentDashboard } = useStudentDashboard();

  const { data: attendanceReport, isLoading: attendanceLoading, refetch: refetchAttendance } = useStudentAttendanceReport(
    studentDashboard?.attendance?.studentId || "",
    { academicYearId: academicYearId || undefined, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined }
  );

  const { data: attendanceTrends, isLoading: trendsLoading, refetch: refetchTrends } = useAttendanceTrends(
    studentDashboard?.attendance?.studentId ? { studentId: studentDashboard.attendance.studentId, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined, groupBy } : undefined
  );

  const { data: gradeReport, isLoading: gradeLoading, refetch: refetchGrades } = useStudentGradeReport(
    studentDashboard?.grades?.studentId || "",
    { academicYearId: academicYearId || undefined, classSubjectId: classSubjectId || undefined, term: term || undefined }
  );

  const exportAttendance = useExportAttendance(); // This would need a student-specific export
  const exportGrades = useExportGrades(); // This would need a student-specific export

  const handleRefresh = () => {
    refetchAttendance();
    refetchTrends();
    refetchGrades();
  };

  const trendData = attendanceTrends?.trends || [];
  const gradeDist = gradeReport?.subjectReports?.reduce((acc: any, subj: any) => {
    // Calculate distribution from subject grades
    subj.grades?.forEach((g: any) => {
      const pct = g.percentage;
      if (pct >= 90) acc["90-100"] = (acc["90-100"] || 0) + 1;
      else if (pct >= 80) acc["80-89"] = (acc["80-89"] || 0) + 1;
      else if (pct >= 70) acc["70-79"] = (acc["70-79"] || 0) + 1;
      else if (pct >= 60) acc["60-69"] = (acc["60-69"] || 0) + 1;
      else acc["Below 60"] = (acc["Below 60"] || 0) + 1;
    });
    return acc;
  }, {}) || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Reports</h1>
          <p className="text-muted-foreground mt-1">
            Your personal attendance and grade reports
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
                  Attendance Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {(studentDashboard?.attendance?.rate || 0).toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Award className="h-4 w-4 text-green-600" />
                  Overall Grade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {(studentDashboard?.grades?.overall || 0).toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">{studentDashboard?.grades?.subjects || 0} subjects</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-yellow-600" />
                  Pending Fees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{studentDashboard?.fees?.pendingInvoices || 0}</div>
                <p className="text-sm text-muted-foreground">Invoices to pay</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{studentDashboard?.notifications || 0}</div>
                <p className="text-sm text-muted-foreground">Unread notifications</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <Card className="cursor-pointer hover:border-primary/50 transition-colors p-6 text-center">
                <Calendar className="h-12 w-12 text-primary mx-auto mb-2" />
                <h3 className="font-medium">My Schedule</h3>
                <p className="text-sm text-muted-foreground">View your timetable</p>
              </Card>
              <Card className="cursor-pointer hover:border-primary/50 transition-colors p-6 text-center">
                <BookOpen className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <h3 className="font-medium">My Grades</h3>
                <p className="text-sm text-muted-foreground">View detailed grades</p>
              </Card>
              <Card className="cursor-pointer hover:border-primary/50 transition-colors p-6 text-center">
                <Award className="h-12 w-12 text-yellow-600 mx-auto mb-2" />
                <h3 className="font-medium">Fee Payments</h3>
                <p className="text-sm text-muted-foreground">Pay pending fees</p>
              </Card>
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
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={attendanceLoading || trendsLoading}>
                <RefreshCw className={cn("mr-2 h-4 w-4", (attendanceLoading || trendsLoading) && "animate-spin")} />
                Refresh
              </Button>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            </CardContent>
          </Card>

          {/* Attendance Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Records</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{attendanceReport?.summary?.total || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Present</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{attendanceReport?.summary?.PRESENT || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Absent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{attendanceReport?.summary?.ABSENT || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Late</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{attendanceReport?.summary?.LATE || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {attendanceReport?.summary?.attendanceRate?.toFixed(1) || 0}%
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

          {/* Attendance Records */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
            </CardHeader>
            <CardContent>
              {attendanceLoading ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading...</div>
              ) : attendanceReport?.records?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 font-medium">Date</th>
                        <th className="text-left p-3 font-medium">Class</th>
                        <th className="text-left p-3 font-medium">Subject</th>
                        <th className="text-center p-3 font-medium">Status</th>
                        <th className="text-left p-3 font-medium">Check In</th>
                        <th className="text-left p-3 font-medium">Check Out</th>
                        <th className="text-left p-3 font-medium">Recorded By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceReport.records.map((record: any) => (
                        <tr key={record.id} className="border-b border-border/50">
                          <td className="p-3">{format(new Date(record.date), "MMM dd, yyyy")}</td>
                          <td className="p-3">{record.class?.name}</td>
                          <td className="p-3">{record.subject?.name || "Homeroom"}</td>
                          <td className="text-center p-3">
                            <span className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                              record.status === "PRESENT" && "bg-green-100 text-green-800",
                              record.status === "ABSENT" && "bg-red-100 text-red-800",
                              record.status === "LATE" && "bg-yellow-100 text-yellow-800",
                              record.status === "EXCUSED" && "bg-blue-100 text-blue-800"
                            )}>
                              {record.status}
                            </span>
                          </td>
                          <td className="p-3">{record.checkInTime ? format(new Date(record.checkInTime), "HH:mm") : "-"}</td>
                          <td className="p-3">{record.checkOutTime ? format(new Date(record.checkOutTime), "HH:mm") : "-"}</td>
                          <td className="p-3">{record.recordedBy?.firstName} {record.recordedBy?.lastName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No attendance records found for the selected period</p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Grades Tab */}
      {activeTab === "grades" && (
        <>
          {/* Filters */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Grade Filters</CardTitle>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={gradeLoading}>
                <RefreshCw className={cn("mr-2 h-4 w-4", gradeLoading && "animate-spin")} />
                Refresh
              </Button>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <Select value={classSubjectId} onValueChange={setClassSubjectId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Subjects</SelectItem>
                    {gradeReport?.subjectReports?.map((subj: any) => (
                      <SelectItem key={subj.subject} value={subj.subject}>
                        {subj.subject}
                      </SelectItem>
                    ))}
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
            </CardContent>
          </Card>

          {/* Grade Summary Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Overall Average</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{gradeReport?.overall?.average?.toFixed(1) || 0}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Assessments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{gradeReport?.overall?.totalAssessments || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Subjects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{gradeReport?.subjectReports?.length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pass Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {(() => {
                    const total = Object.values(gradeDist as Record<string, number>).reduce((a, b) => a + b, 0);
                    const pass = (gradeDist["60-69"] || 0) + (gradeDist["70-79"] || 0) + (gradeDist["80-89"] || 0) + (gradeDist["90-100"] || 0);
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
                {gradeLoading ? (
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
                <CardTitle>Subject Averages</CardTitle>
              </CardHeader>
              <CardContent>
                {gradeLoading ? (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading...</div>
                ) : gradeReport?.subjectReports?.length > 0 ? (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {gradeReport.subjectReports.map((subj: any) => (
                      <div key={subj.subject} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{subj.subject}</p>
                          <p className="text-sm text-muted-foreground">{subj.count} assessments</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{subj.average?.toFixed(1) || 0}%</p>
                          <p className="text-xs text-muted-foreground">Average</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No grade data available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Subject Detail */}
          <Card>
            <CardHeader>
              <CardTitle>Subject Details</CardTitle>
            </CardHeader>
            <CardContent>
              {gradeLoading ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading...</div>
              ) : gradeReport?.subjectReports?.length > 0 ? (
                <div className="space-y-6">
                  {gradeReport.subjectReports.map((subj: any) => (
                    <div key={subj.subject} className="border-b border-border/50 pb-6 last:border-0 last:pb-0">
                      <h4 className="font-medium mb-4">{subj.subject} <span className="text-sm text-muted-foreground font-normal">({subj.count} assessments)</span></h4>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left p-3 font-medium">Assessment</th>
                              <th className="text-left p-3 font-medium">Type</th>
                              <th className="text-center p-3 font-medium">Score</th>
                              <th className="text-center p-3 font-medium">Max Score</th>
                              <th className="text-center p-3 font-medium">Percentage</th>
                              <th className="text-center p-3 font-medium">Date</th>
                              <th className="text-left p-3 font-medium">Feedback</th>
                            </tr>
                          </thead>
                          <tbody>
                            {subj.grades?.map((grade: any) => (
                              <tr key={grade.assessment} className="border-b border-border/50">
                                <td className="p-3 font-medium">{grade.assessment}</td>
                                <td className="p-3">{grade.type}</td>
                                <td className="text-center p-3">{grade.score}/{grade.maxScore}</td>
                                <td className="text-center p-3">{grade.maxScore}</td>
                                <td className="text-center p-3 font-medium text-primary">{grade.percentage?.toFixed(1) || 0}%</td>
                                <td className="text-center p-3">{grade.gradedAt ? format(new Date(grade.gradedAt), "MMM dd, yyyy") : "-"}</td>
                                <td className="p-3 text-sm text-muted-foreground">{grade.feedback || "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No grade data available</p>
              )}
            </CardContent>
          </Card>
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