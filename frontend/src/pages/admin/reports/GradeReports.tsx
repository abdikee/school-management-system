"use client";

import React, { useState } from "react";
import { useGradeSummary, useClassGradeReport } from "@/hooks/useReports";
import { useClasses, useSubjects } from "@/hooks/useAcademic";
import {
  GradeDistributionChart,
} from "@/components/charts/AttendanceChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useExportGrades,
} from "@/hooks/useReports";
import { Download, RefreshCw, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Term } from "@/types/api";

export function AdminGradeReports() {
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [academicYearId, setAcademicYearId] = useState("");
  const [term, setTerm] = useState<Term | "">("");
  const [schoolId, setSchoolId] = useState("");

  const { data: classes } = useClasses();
  const { data: subjects } = useSubjects(""); // Would need gradeLevelId

  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = useGradeSummary({
    schoolId: schoolId || undefined,
    academicYearId: academicYearId || undefined,
    classId: classId || undefined,
    subjectId: subjectId || undefined,
    term: term || undefined,
  });

  const { data: classReport, isLoading: classLoading, refetch: refetchClass } = useClassGradeReport(
    classId,
    {
      subjectId: subjectId || undefined,
      academicYearId: academicYearId || undefined,
      term: term || undefined,
    }
  );

  const exportGrades = useExportGrades();

  const handleRefresh = () => {
    refetchSummary();
    refetchClass();
  };

  const handleExport = () => {
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

  const summaryData = summary || {};
  const distribution = summaryData.distribution || {};

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Filters</CardTitle>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={summaryLoading || classLoading}>
            <RefreshCw className={cn("mr-2 h-4 w-4", (summaryLoading || classLoading) && "animate-spin")} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
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
            <label className="block text-sm font-medium mb-1">Subject</label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Subjects</SelectItem>
                {subjects?.data?.map((subj) => (
                  <SelectItem key={subj.id} value={subj.id}>
                    {subj.name} ({subj.code})
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
          <div>
            <label className="block text-sm font-medium mb-1">Academic Year</label>
            <Select value={academicYearId} onValueChange={setAcademicYearId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Years</SelectItem>
                {/* Academic years would be fetched */}
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
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 lg:col-span-1 flex items-end">
            <Button onClick={handleExport} disabled={exportGrades.isPending || !classId} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              {exportGrades.isPending ? "Exporting..." : "Export CSV"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Grades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summaryData.count || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{summaryData.average?.toFixed(1) || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Object.keys(summaryData.bySubject || {}).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Assessment Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Object.keys(summaryData.byAssessmentType || {}).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pass Rate (60+)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {(() => {
                const dist = distribution;
                const total = Object.values(dist).reduce((a, b) => a + b, 0);
                const pass = (dist["60-69"] || 0) + (dist["70-79"] || 0) + (dist["80-89"] || 0) + (dist["90-100"] || 0);
                return total > 0 ? ((pass / total) * 100).toFixed(1) : 0;
              })()}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Grade Distribution */}
        <Card className="col-span-4 lg:col-span-4">
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading...</div>
            ) : (
              <GradeDistributionChart
                data={distribution}
                height={300}
              />
            )}
          </CardContent>
        </Card>

        {/* Average by Subject */}
        <Card className="col-span-3 lg:col-span-3">
          <CardHeader>
            <CardTitle>Average by Subject</CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading...</div>
            ) : summaryData.bySubject ? (
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {Object.entries(summaryData.bySubject).map(([subject, data]: [string, any]) => (
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

      {/* Assessment Type Averages */}
      <Card>
        <CardHeader>
          <CardTitle>Average by Assessment Type</CardTitle>
        </CardHeader>
        <CardContent>
          {summaryLoading ? (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">Loading...</div>
          ) : summaryData.byAssessmentType ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Object.entries(summaryData.byAssessmentType).map(([type, data]: [string, any]) => (
                <div key={type} className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">{type}</p>
                  <p className="text-2xl font-bold text-primary">{data.average?.toFixed(1) || 0}</p>
                  <p className="text-xs text-muted-foreground">{data.count} assessments</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">No assessment type data available</p>
          )}
        </CardContent>
      </Card>

      {/* Class Grade Detail */}
      {classId && (
        <Card>
          <CardHeader>
            <CardTitle>Class Grade Detail</CardTitle>
          </CardHeader>
          <CardContent>
            {classLoading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading...</div>
            ) : classReport ? (
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
                        {classReport.studentReports?.map((student: any) => (
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
                        {classReport.assessmentReports?.map((assessment: any) => (
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
    </div>
  );
}