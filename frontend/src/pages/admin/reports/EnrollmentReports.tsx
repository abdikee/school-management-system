"use client";

import React, { useState } from "react";
import { useEnrollmentReport, useTeacherWorkloadReport } from "@/hooks/useReports";
import {
  EnrollmentChart,
  TeacherWorkloadChart,
} from "@/components/charts/AttendanceChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useExportEnrollment,
} from "@/hooks/useReports";
import { Download, RefreshCw, Users, GraduationCap, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminEnrollmentReports() {
  const [schoolId, setSchoolId] = useState("");
  const [academicYearId, setAcademicYearId] = useState("");
  const [gradeLevelId, setGradeLevelId] = useState("");
  const [activeTab, setActiveTab] = useState<"enrollment" | "workload">("enrollment");

  const { data: enrollment, isLoading: enrollmentLoading, refetch: refetchEnrollment } = useEnrollmentReport({
    schoolId: schoolId || undefined,
    academicYearId: academicYearId || undefined,
    gradeLevelId: gradeLevelId || undefined,
  });

  const { data: workload, isLoading: workloadLoading, refetch: refetchWorkload } = useTeacherWorkloadReport({
    schoolId: schoolId || undefined,
    academicYearId: academicYearId || undefined,
  });

  const exportEnrollment = useExportEnrollment();

  const handleRefresh = () => {
    refetchEnrollment();
    refetchWorkload();
  };

  const handleExport = () => {
    exportEnrollment.mutate({
      schoolId: schoolId || undefined,
      academicYearId: academicYearId || undefined,
      gradeLevelId: gradeLevelId || undefined,
    });
  };

  const enrollmentData = enrollment || { totalStudents: 0, newEnrollmentsThisYear: 0, withdrawnStudents: 0, byClass: [], byGradeLevel: [], byGender: [] };
  const byClass = enrollmentData.byClass || [];
  const byGradeLevel = enrollmentData.byGradeLevel || [];
  const byGender = enrollmentData.byGender || [];

  // Map data for charts
  const enrollmentChartData = byClass.map((cls) => ({
    class: cls.class?.name || "Unknown",
    count: cls.count,
    capacity: cls.capacity,
    utilization: cls.utilization,
  }));

  const workloadChartData = workload?.teachers?.map((t) => ({
    teacher: `${t.teacher?.user?.firstName || ""} ${t.teacher?.user?.lastName || ""}`.trim() || "Unknown",
    weeklyHours: t.studentsCount, // Using studentsCount as proxy since weeklyHours doesn't exist
    subjectCount: t.subjectsCount,
    classCount: t.classesCount,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Filters</CardTitle>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={enrollmentLoading || workloadLoading}>
            <RefreshCw className={cn("mr-2 h-4 w-4", (enrollmentLoading || workloadLoading) && "animate-spin")} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <div>
            <label className="block text-sm font-medium mb-1">School</label>
            <Select value={schoolId} onValueChange={setSchoolId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Schools" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Schools</SelectItem>
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
          <div>
            <label className="block text-sm font-medium mb-1">Grade Level</label>
            <Select value={gradeLevelId} onValueChange={setGradeLevelId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Grade Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Grade Levels</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 lg:col-span-1 flex items-end">
            <Button onClick={handleExport} disabled={exportEnrollment.isPending} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              {exportEnrollment.isPending ? "Exporting..." : "Export CSV"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("enrollment")}
            className={cn(
              "py-2 px-1 text-sm font-medium border-b-2 transition-colors",
              activeTab === "enrollment"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
            )}
          >
            Enrollment Report
          </button>
          <button
            onClick={() => setActiveTab("workload")}
            className={cn(
              "py-2 px-1 text-sm font-medium border-b-2 transition-colors",
              activeTab === "workload"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
            )}
          >
            Teacher Workload
          </button>
        </nav>
      </div>

      {activeTab === "enrollment" && (
        <>
          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  Total Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{enrollmentData.totalStudents || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">New Enrollments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{enrollmentData.newEnrollmentsThisYear || 0}</div>
                <p className="text-xs text-muted-foreground">This academic year</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Withdrawn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{enrollmentData.withdrawnStudents || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-purple-600" />
                  Grade Levels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{byGradeLevel.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-orange-600" />
                  Classes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{byClass.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Enrollment by Class */}
            <Card className="col-span-4 lg:col-span-4">
              <CardHeader>
                <CardTitle>Enrollment by Class</CardTitle>
              </CardHeader>
              <CardContent>
                {enrollmentLoading ? (
                  <div className="h-[350px] flex items-center justify-center text-muted-foreground">Loading...</div>
                ) : enrollmentChartData.length > 0 ? (
                  <EnrollmentChart
                    data={enrollmentChartData}
                    height={350}
                  />
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No class enrollment data available</p>
                )}
              </CardContent>
            </Card>

            {/* Enrollment by Grade Level */}
            <Card className="col-span-3 lg:col-span-3">
              <CardHeader>
                <CardTitle>Enrollment by Grade Level</CardTitle>
              </CardHeader>
              <CardContent>
                {enrollmentLoading ? (
                  <div className="h-[350px] flex items-center justify-center text-muted-foreground">Loading...</div>
                ) : byGradeLevel.length > 0 ? (
                  <div className="space-y-3 max-h-[350px] overflow-y-auto">
                    {byGradeLevel.map((gl: any) => (
                      <div key={gl.gradeLevel?.id} className="p-3 bg-muted/50 rounded-lg">
                        <p className="font-medium">{gl.gradeLevel?.name || "Unknown"}</p>
                        <p className="text-2xl font-bold text-primary">{gl.count}</p>
                        <p className="text-xs text-muted-foreground">Students</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No grade level data available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Gender Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Gender Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {byGender.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-3">
                  {byGender.map((g: any) => (
                    <div key={g.gender} className="p-6 bg-muted/50 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">{g.gender}</p>
                      <p className="text-4xl font-bold text-primary">{g.count}</p>
                      <p className="text-xs text-muted-foreground">
                        {((g.count / (enrollmentData.totalStudents || 1)) * 100).toFixed(1)}%
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No gender data available</p>
              )}
            </CardContent>
          </Card>

          {/* Class Detail Table */}
          <Card>
            <CardHeader>
              <CardTitle>Class Enrollment Details</CardTitle>
            </CardHeader>
            <CardContent>
              {enrollmentLoading ? (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">Loading...</div>
              ) : byClass.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 font-medium">Class</th>
                        <th className="text-left p-3 font-medium">Grade Level</th>
                        <th className="text-center p-3 font-medium">Students</th>
                        <th className="text-center p-3 font-medium">Capacity</th>
                        <th className="text-center p-3 font-medium">Utilization</th>
                      </tr>
                    </thead>
                    <tbody>
                      {byClass.map((cls: any) => (
                        <tr key={cls.class?.id} className="border-b border-border/50">
                          <td className="p-3 font-medium">{cls.class?.name}</td>
                          <td className="p-3">{cls.class?.gradeLevel?.name}</td>
                          <td className="text-center p-3">{cls.count}</td>
                          <td className="text-center p-3">{cls.capacity}</td>
                          <td className="text-center p-3">
                            <div className="w-32 mx-auto">
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full transition-all duration-500"
                                  style={{ width: `${cls.utilization || 0}%` }}
                                />
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 text-center">{cls.utilization?.toFixed(1)}%</p>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No class data available</p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === "workload" && (
        <Card>
          <CardHeader>
            <CardTitle>Teacher Workload Report</CardTitle>
          </CardHeader>
          <CardContent>
            {workloadLoading ? (
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">Loading...</div>
            ) : workload ? (
              <>
                <div className="grid gap-4 md:grid-cols-2 mb-6">
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Total Teachers</p>
                      <p className="text-3xl font-bold">{workload.totalTeachers || 0}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Avg Students per Teacher</p>
                      <p className="text-3xl font-bold">
                        {(workload.teachers?.reduce((acc: number, t: any) => acc + t.studentsCount, 0) / (workload.teachers?.length || 1)).toFixed(1)}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <TeacherWorkloadChart
                  data={workloadChartData}
                  height={350}
                />

                <div className="mt-6 overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 font-medium">Teacher</th>
                        <th className="text-center p-3 font-medium">Students</th>
                        <th className="text-center p-3 font-medium">Subjects</th>
                        <th className="text-center p-3 font-medium">Classes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workload.teachers?.map((teacher: any) => (
                        <tr key={teacher.teacher?.id} className="border-b border-border/50">
                          <td className="p-3">
                            <div className="font-medium">{teacher.teacher?.user?.firstName} {teacher.teacher?.user?.lastName}</div>
                            <div className="text-sm text-muted-foreground">{teacher.teacher?.employeeId}</div>
                          </td>
                          <td className="text-center p-3">{teacher.studentsCount}</td>
                          <td className="text-center p-3">{teacher.subjectsCount}</td>
                          <td className="text-center p-3">{teacher.classesCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p className="text-center py-8 text-muted-foreground">No teacher workload data available</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}