"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { gradesApi, usersApi } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Download, Award, TrendingUp, BookOpen, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { cn, formatDate, formatCurrency } from "@/lib/utils";
import { Grade, Student, Assessment } from "@/types/api";

export function ParentGrades() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [subjectFilter, setSubjectFilter] = useState("");
  const [assessmentTypeFilter, setAssessmentTypeFilter] = useState("");
  const [selectedChildId, setSelectedChildId] = useState("");

  // Get current parent's children
  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => usersApi.getProfile(),
  });

  const children = currentUser?.data?.parent?.children || [];

  if (children.length > 0 && !selectedChildId) {
    setSelectedChildId(children[0].id);
  }

  const selectedChild = children.find((c: Student) => c.id === selectedChildId);

  // ============================================
  // GRADES
  // ============================================
  const { data: gradesData, isLoading } = useQuery({
    queryKey: ["parent-grades", selectedChildId, search, subjectFilter, assessmentTypeFilter, page, pageSize],
    queryFn: () => gradesApi.getGrades({
      studentId: selectedChildId || undefined,
      skip: (page - 1) * pageSize,
      take: pageSize,
      search: search || undefined,
      subjectId: subjectFilter || undefined,
      assessmentType: assessmentTypeFilter || undefined,
    }),
    enabled: !!selectedChildId,
  });

  // ============================================
  // GRADE SUMMARY
  // ============================================
  const { data: summaryData } = useQuery({
    queryKey: ["parent-grade-summary", selectedChildId],
    queryFn: () => gradesApi.getGradeSummary({
      studentId: selectedChildId || undefined,
    }),
    enabled: !!selectedChildId,
  });

  // ============================================
  // SUBJECTS (for filter)
  // ============================================
  const { data: subjectsData } = useQuery({
    queryKey: ["parent-subjects", selectedChildId],
    queryFn: () => gradesApi.getSubjectsForStudent(selectedChildId || ""),
    enabled: !!selectedChildId,
  });

  if (!selectedChild) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Grades</h1>
          <p className="text-gray-600 mt-1">View grades and academic performance for your children</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500">No children linked to your account</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const assessmentTypes = ["QUIZ", "ASSIGNMENT", "MIDTERM", "FINAL", "PROJECT", "PARTICIPATION"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Grades</h1>
          <p className="text-gray-600 mt-1">
            {selectedChild.user?.firstName} {selectedChild.user?.lastName} • {selectedChild.class?.gradeLevel?.name} - {selectedChild.class?.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {children.length > 1 && (
            <Select value={selectedChildId} onValueChange={setSelectedChildId} className="w-48">
              <SelectTrigger><SelectValue placeholder="Select child" /></SelectTrigger>
              <SelectContent>
                {children.map((child: Student) => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.user?.firstName} {child.user?.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard label="Average Grade" value={`${summaryData?.data?.averagePercentage?.toFixed(1) || "—"}%`} icon={TrendingUp} color="text-green-600" bg="bg-green-100" />
            <StatCard label="Total Assessments" value={summaryData?.data?.totalAssessments || 0} icon={Award} color="text-blue-600" bg="bg-blue-100" />
            <StatCard label="Passed" value={summaryData?.data?.passedCount || 0} icon={Award} color="text-green-600" bg="bg-green-100" />
            <StatCard label="Failed" value={summaryData?.data?.failedCount || 0} icon={Award} color="text-red-600" bg="bg-red-100" />
          </div>
        </CardContent>
      </Card>

      {/* Subject Breakdown */}
      {summaryData?.data?.subjectBreakdown && summaryData.data.subjectBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance by Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Assessments</TableHead>
                    <TableHead>Average</TableHead>
                    <TableHead>Highest</TableHead>
                    <TableHead>Lowest</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summaryData.data.subjectBreakdown.map((subject: any) => (
                    <TableRow key={subject.subjectId}>
                      <TableCell className="font-medium">{subject.subjectName}</TableCell>
                      <TableCell>{subject.assessmentCount}</TableCell>
                      <TableCell className="font-medium">{subject.averagePercentage?.toFixed(1)}%</TableCell>
                      <TableCell>{subject.highestPercentage?.toFixed(1)}%</TableCell>
                      <TableCell>{subject.lowestPercentage?.toFixed(1)}%</TableCell>
                      <TableCell>
                        <Badge variant={subject.averagePercentage >= 60 ? "default" : "destructive"}>
                          {subject.averagePercentage >= 60 ? "Passing" : "Needs Improvement"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search grades..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
            <div className="w-full sm:w-48">
              <Label className="block text-sm font-medium mb-1">Subject</Label>
              <Select value={subjectFilter} onValueChange={(value) => { setSubjectFilter(value); setPage(1); }}>
                <SelectTrigger><SelectValue placeholder="All subjects" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  {subjectsData?.data?.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Label className="block text-sm font-medium mb-1">Type</Label>
              <Select value={assessmentTypeFilter} onValueChange={(value) => { setAssessmentTypeFilter(value); setPage(1); }}>
                <SelectTrigger><SelectValue placeholder="All types" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  {assessmentTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grades Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Grade Details</h3>
            <Button variant="outline" size="sm" disabled>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Assessment</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Max Score</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : gradesData?.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No grades found
                    </TableCell>
                  </TableRow>
                ) : (
                  gradesData?.data?.map((grade: Grade) => (
                    <TableRow key={grade.id}>
                      <TableCell>{formatDate(grade.assessment?.date)}</TableCell>
                      <TableCell className="font-medium">{grade.assessment?.title}</TableCell>
                      <TableCell>{grade.assessment?.subject?.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{grade.assessment?.type?.name}</Badge>
                      </TableCell>
                      <TableCell>{grade.score}/{grade.assessment?.maxScore}</TableCell>
                      <TableCell>{grade.assessment?.maxScore}</TableCell>
                      <TableCell className="font-medium">{grade.percentage?.toFixed(1)}%</TableCell>
                      <TableCell>{grade.letterGrade || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={grade.percentage >= 60 ? "default" : "destructive"}>
                          {grade.percentage >= 60 ? "Pass" : "Fail"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {gradesData && gradesData.meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Page {gradesData.meta.page} of {gradesData.meta.totalPages} ({gradesData.meta.total} total)
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(gradesData.meta.totalPages, p + 1))} disabled={page === gradesData.meta.totalPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bg }: { label: string; value: string | number; icon: any; color: string; bg: string }) {
  return (
    <Card className="border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-3 rounded-lg", bg)}>
            <Icon className={cn("h-6 w-6", color)} />
          </div>
          <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}