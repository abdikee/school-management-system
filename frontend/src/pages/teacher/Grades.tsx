"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { academicApi, gradesApi, usersApi, reportsApi } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Search,
  Edit,
  Eye,
  Calendar,
  Users,
  Award,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Download,
  BarChart3,
} from "lucide-react";
import { cn, formatDate, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import { Class, Subject, AssessmentType, Assessment, Student, Grade } from "@/types/api";
import { useGradeSummary, useClassGradeReport, useStudentGradeReport, useExportGrades } from "@/hooks/useReports";

const teacherGradesTabs = [
  { id: "assessments", label: "Assessments", icon: FileText },
  { id: "enter-grades", label: "Enter Grades", icon: Award },
  { id: "reports", label: "Reports", icon: BarChart3 },
] as const;

type TeacherGradesTab = (typeof teacherGradesTabs)[number]["id"];

export function TeacherGrades() {
  const [activeTab, setActiveTab] = useState<TeacherGradesTab>("assessments");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedAssessmentTypeId, setSelectedAssessmentTypeId] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Record<string, { score: number; feedback?: string }>>({});
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Assessment | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  // ============================================
  // MY CLASSES
  // ============================================
  const { data: myClassesData, isLoading: myClassesLoading } = useQuery({
    queryKey: ["my-classes"],
    queryFn: () => academicApi.getMyClasses({ take: 100 }),
  });

  // ============================================
  // SUBJECTS FOR SELECTED CLASS
  // ============================================
  const { data: classSubjectsData, isLoading: classSubjectsLoading } = useQuery({
    queryKey: ["class-subjects", selectedClassId],
    queryFn: () => academicApi.getSubjectsByClass(selectedClassId),
    enabled: !!selectedClassId,
  });

  // ============================================
  // ASSESSMENT TYPES
  // ============================================
  const { data: assessmentTypesData, isLoading: assessmentTypesLoading } = useQuery({
    queryKey: ["assessment-types"],
    queryFn: () => gradesApi.getAssessmentTypes(),
  });

  // ============================================
  // ASSESSMENTS
  // ============================================
  const { data: assessmentsData, isLoading: assessmentsLoading } = useQuery({
    queryKey: ["teacher-assessments", selectedClassId, selectedSubjectId, selectedAssessmentTypeId, page, pageSize],
    queryFn: () => gradesApi.getAssessments({
      skip: (page - 1) * pageSize,
      take: pageSize,
      classId: selectedClassId || undefined,
      subjectId: selectedSubjectId || undefined,
      typeId: selectedAssessmentTypeId || undefined,
    }),
    enabled: !!selectedClassId,
  });

  const createAssessmentMutation = useMutation({
    mutationFn: (data: any) => gradesApi.createAssessment(data),
    onSuccess: () => {
      toast.success("Assessment created");
      queryClient.invalidateQueries({ queryKey: ["teacher-assessments"] });
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to create assessment"),
  });

  const updateAssessmentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => gradesApi.updateAssessment(id, data),
    onSuccess: () => {
      toast.success("Assessment updated");
      queryClient.invalidateQueries({ queryKey: ["teacher-assessments"] });
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to update assessment"),
  });

  const deleteAssessmentMutation = useMutation({
    mutationFn: (id: string) => gradesApi.deleteAssessment(id),
    onSuccess: () => {
      toast.success("Assessment deleted");
      queryClient.invalidateQueries({ queryKey: ["teacher-assessments"] });
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to delete assessment"),
  });

  // ============================================
  // LOAD STUDENTS AND GRADES FOR SELECTED ASSESSMENT
  // ============================================
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [isLoadingGrades, setIsLoadingGrades] = useState(false);

  const loadGradesForAssessment = async (assessmentId: string) => {
    if (!selectedClassId) return;
    setIsLoadingGrades(true);
    try {
      const studentsData = await usersApi.getStudents({ classId: selectedClassId, take: 200 });
      setStudents(studentsData.data || []);

      const gradesData = await gradesApi.getGradesByAssessment(assessmentId);
      const gradesMap: Record<string, { score: number; feedback?: string }> = {};
      (gradesData.data || []).forEach((g: any) => {
        gradesMap[g.studentId] = { score: g.score, feedback: g.feedback };
      });
      setGrades(gradesMap);
    } catch (error) {
      toast.error("Failed to load students/grades");
    } finally {
      setIsLoadingGrades(false);
    }
  };

  const saveGradesMutation = useMutation({
    mutationFn: (records: Array<{ studentId: string; score: number; feedback?: string }>) =>
      gradesApi.bulkCreateGrades({ assessmentId: selectedAssessment!.id, records }),
    onSuccess: () => {
      toast.success("Grades saved");
      if (selectedAssessment) loadGradesForAssessment(selectedAssessment.id);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to save grades"),
  });

  const handleGradeChange = (studentId: string, score: number, feedback?: string) => {
    setGrades(prev => ({ ...prev, [studentId]: { score, feedback } }));
  };

  const handleBulkSaveGrades = () => {
    const records = students
      .filter(s => grades[s.id] !== undefined)
      .map(s => ({
        studentId: s.id,
        score: grades[s.id].score,
        feedback: grades[s.id].feedback,
      }));

    if (records.length === 0) {
      toast.error("No grades to save");
      return;
    }

    saveGradesMutation.mutate(records);
  };

  // ============================================
  // REPORTS
  // ============================================
  const { data: gradeSummary, isLoading: summaryLoading } = useGradeSummary({
    classId: selectedClassId || undefined,
    subjectId: selectedSubjectId || undefined,
    term: selectedTerm as any,
  });

  const { data: classGradeReport, isLoading: classReportLoading } = useClassGradeReport(
    selectedClassId,
    { subjectId: selectedSubjectId || undefined, term: selectedTerm as any }
  );

  const exportGradesMutation = useExportGrades();

  const handleExportGrades = () => {
    if (!selectedClassId) {
      toast.error("Please select a class");
      return;
    }
    exportGradesMutation.mutate({
      classId: selectedClassId,
      subjectId: selectedSubjectId || undefined,
      term: selectedTerm as any,
    });
  };

  const handleDelete = (id: string, type: string) => {
    if (type === "assessment") {
      deleteAssessmentMutation.mutate(id);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "assessments":
        return renderAssessmentsTab();
      case "enter-grades":
        return renderEnterGradesTab();
      case "reports":
        return renderReportsTab();
    }
  };

  const renderAssessmentsTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-64">
              <Label className="block text-sm font-medium mb-1">Class *</Label>
              <Select value={selectedClassId} onValueChange={(value) => { setSelectedClassId(value); setSelectedSubjectId(""); setSelectedAssessmentTypeId(""); setPage(1); }}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {myClassesData?.data?.map((c: Class) => (
                    <SelectItem key={c.id} value={c.id}>{c.name} ({c.gradeLevel?.name})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-64">
              <Label className="block text-sm font-medium mb-1">Subject</Label>
              <Select value={selectedSubjectId} onValueChange={(value) => { setSelectedSubjectId(value); setPage(1); }}>
                <SelectTrigger><SelectValue placeholder="Select subject (optional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Subjects</SelectItem>
                  {classSubjectsData?.map((s: Subject) => (
                    <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Label className="block text-sm font-medium mb-1">Type</Label>
              <Select value={selectedAssessmentTypeId} onValueChange={(value) => { setSelectedAssessmentTypeId(value); setPage(1); }}>
                <SelectTrigger><SelectValue placeholder="Select type (optional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  {assessmentTypesData?.data?.map((t: AssessmentType) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={() => { setSelectedItem(null); setCreateDialogOpen(true); }} disabled={!selectedClassId}>
                <Plus className="mr-2 h-4 w-4" />
                Create Assessment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessments Table */}
      {selectedClassId && (
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Max Score</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assessmentsLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                      </TableCell>
                    </TableRow>
                  ) : assessmentsData?.data?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No assessments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    assessmentsData?.data?.map((assessment: Assessment) => (
                      <TableRow key={assessment.id}>
                        <TableCell className="font-medium">{assessment.name}</TableCell>
                        <TableCell>{assessment.type?.name || "—"}</TableCell>
                        <TableCell>{assessment.subject?.name || "—"}</TableCell>
                        <TableCell>{formatDate(assessment.date)}</TableCell>
                        <TableCell>{assessment.maxScore}</TableCell>
                        <TableCell>{assessment.weight || assessment.type?.weight || 0}%</TableCell>
                        <TableCell>
                          {assessment.isPublished ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Yes</span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">No</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => { setSelectedItem(assessment); setCreateDialogOpen(true); }}><Eye className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(assessment.id, "assessment")} disabled={deleteAssessmentMutation.isPending}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {assessmentsData && assessmentsData.meta.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  Page {assessmentsData.meta.page} of {assessmentsData.meta.totalPages} ({assessmentsData.meta.total} total)
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(assessmentsData.meta.totalPages, p + 1))} disabled={page === assessmentsData.meta.totalPages}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!selectedClassId && (
        <Card>
          <CardContent className="pt-6 text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Please select a class to view assessments</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderEnterGradesTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-64">
              <Label className="block text-sm font-medium mb-1">Class *</Label>
              <Select value={selectedClassId} onValueChange={(value) => { setSelectedClassId(value); setSelectedSubjectId(""); setSelectedAssessment(null); }}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {myClassesData?.data?.map((c: Class) => (
                    <SelectItem key={c.id} value={c.id}>{c.name} ({c.gradeLevel?.name})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-64">
              <Label className="block text-sm font-medium mb-1">Subject</Label>
              <Select value={selectedSubjectId} onValueChange={(value) => { setSelectedSubjectId(value); setSelectedAssessment(null); }}>
                <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Select subject</SelectItem>
                  {classSubjectsData?.map((s: Subject) => (
                    <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-64">
              <Label className="block text-sm font-medium mb-1">Assessment *</Label>
              <Select value={selectedAssessment?.id || ""} onValueChange={(value) => {
                const assessment = assessmentsData?.data?.find((a: Assessment) => a.id === value);
                setSelectedAssessment(assessment);
                if (assessment) loadGradesForAssessment(assessment.id);
              }}>
                <SelectTrigger><SelectValue placeholder="Select assessment" /></SelectTrigger>
                <SelectContent>
                  {assessmentsData?.data?.map((a: Assessment) => (
                    <SelectItem key={a.id} value={a.id}>{a.name} ({a.type?.name}) - {formatDate(a.date)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={() => loadGradesForAssessment(selectedAssessment?.id)} disabled={!selectedAssessment?.id || isLoadingGrades}>
                {isLoadingGrades ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Load Students"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grades Entry */}
      {selectedAssessment && students.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              {selectedAssessment.name} - {selectedAssessment.maxScore} pts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4 flex-wrap">
              <Button onClick={handleBulkSaveGrades} disabled={saveGradesMutation.isPending}>
                {saveGradesMutation.isPending ? "Saving..." : "Save All Grades"}
              </Button>
              <Button variant="outline" onClick={() => {
                const newGrades = { ...grades };
                students.forEach(s => { newGrades[s.id] = { score: selectedAssessment.maxScore }; });
                setGrades(newGrades);
              }}>
                Fill Max Score
              </Button>
              <Button variant="outline" onClick={() => {
                const newGrades = { ...grades };
                students.forEach(s => { newGrades[s.id] = { score: 0 }; });
                setGrades(newGrades);
              }}>
                Clear All
              </Button>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Score / Max</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Feedback</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student, index) => (
                    <TableRow key={student.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">
                        {student.user?.firstName} {student.user?.lastName}
                      </TableCell>
                      <TableCell>{student.studentId}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          max={selectedAssessment.maxScore}
                          step={0.5}
                          value={grades[student.id]?.score ?? ""}
                          onChange={(e) => handleGradeChange(student.id, parseFloat(e.target.value) || 0, grades[student.id]?.feedback)}
                          className="w-24"
                          placeholder="Score"
                        />
                        <span className="text-gray-400 ml-1">/ {selectedAssessment.maxScore}</span>
                      </TableCell>
                      <TableCell>
                        {grades[student.id] !== undefined
                          ? `${((grades[student.id].score / selectedAssessment.maxScore) * 100).toFixed(1)}%`
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={grades[student.id]?.feedback || ""}
                          onChange={(e) => handleGradeChange(student.id, grades[student.id]?.score || 0, e.target.value)}
                          className="w-full max-w-xs"
                          placeholder="Optional feedback"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedAssessment && students.length === 0 && !isLoadingGrades && (
        <Card>
          <CardContent className="pt-6 text-center py-8">
            <Award className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No students found in this class</p>
            <Button variant="outline" onClick={() => loadGradesForAssessment(selectedAssessment.id)} className="mt-4">
              Refresh
            </Button>
          </CardContent>
        </Card>
      )}

      {!selectedAssessment && (
        <Card>
          <CardContent className="pt-6 text-center py-8">
            <Award className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Please select a class, subject, and assessment to enter grades</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderReportsTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-64">
              <Label className="block text-sm font-medium mb-1">Class *</Label>
              <Select value={selectedClassId} onValueChange={(value) => { setSelectedClassId(value); setSelectedSubjectId(""); }}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {myClassesData?.data?.map((c: Class) => (
                    <SelectItem key={c.id} value={c.id}>{c.name} ({c.gradeLevel?.name})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-64">
              <Label className="block text-sm font-medium mb-1">Subject</Label>
              <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                <SelectTrigger><SelectValue placeholder="Select subject (optional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Subjects</SelectItem>
                  {classSubjectsData?.map((s: Subject) => (
                    <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Label className="block text-sm font-medium mb-1">Term</Label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger><SelectValue placeholder="Select term" /></SelectTrigger>
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
            <div className="flex items-end">
              <Button onClick={handleExportGrades} disabled={exportGradesMutation.isPending || !selectedClassId}>
                {exportGradesMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />} Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {selectedClassId && gradeSummary && !summaryLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{gradeSummary.averageScore.toFixed(1)}%</p>
                <p className="text-sm text-gray-500">Average Score</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{gradeSummary.passRate.toFixed(1)}%</p>
                <p className="text-sm text-gray-500">Pass Rate</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{gradeSummary.totalAssessments}</p>
                <p className="text-sm text-gray-500">Total Assessments</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">{gradeSummary.totalGrades}</p>
                <p className="text-sm text-gray-500">Total Grades</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Subject Breakdown */}
      {selectedClassId && gradeSummary && !summaryLoading && gradeSummary.bySubject && gradeSummary.bySubject.length > 0 && (
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
                    <TableHead>Average</TableHead>
                    <TableHead>Assessments</TableHead>
                    <TableHead>Grades Entered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gradeSummary.bySubject.map((subject: any) => (
                    <TableRow key={subject.subject.id}>
                      <TableCell className="font-medium">{subject.subject.name} ({subject.subject.code})</TableCell>
                      <TableCell className="font-medium">{subject.average.toFixed(1)}%</TableCell>
                      <TableHead>{subject.count}</TableHead>
                      <TableCell>{subject.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student Details */}
      {selectedClassId && classGradeReport && !classReportLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Student Grade Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Assessments</TableHead>
                    <TableHead>Average</TableHead>
                    <TableHead className="text-right">Subjects</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classGradeReport.studentReports.map((report: any) => (
                    <TableRow key={report.student.id}>
                      <TableCell className="font-medium">
                        {report.student.user?.firstName} {report.student.user?.lastName}
                      </TableCell>
                      <TableCell>{report.gradeCount}</TableCell>
                      <TableCell className="font-medium">{report.average.toFixed(1)}%</TableCell>
                      <TableCell className="text-right">
                        {classGradeReport.subjectAverages.map((sa: any) => (
                          <span key={sa.subject.id} className="mr-2 text-sm">
                            {sa.subject.code}: {sa.average.toFixed(1)}%
                          </span>
                        ))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedClassId && (
        <Card>
          <CardContent className="pt-6 text-center py-8">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Please select a class to view grade reports</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Grades</h1>
          <p className="text-gray-600 mt-1">
            Create assessments, enter grades, and view performance reports
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          {teacherGradesTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center justify-center gap-2">
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {renderTabContent()}
      </Tabs>

      {/* Create/Edit Assessment Dialog */}
      <Dialog open={false} onOpenChange={() => {}}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Assessment</DialogTitle>
          </DialogHeader>
          <AssessmentForm
            classes={myClassesData?.data || []}
            subjects={classSubjectsData || []}
            assessmentTypes={assessmentTypesData?.data || []}
            onSubmit={(data) => {
              createAssessmentMutation.mutate(data);
            }}
            isLoading={createAssessmentMutation.isPending}
            onClose={() => {}}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Assessment Form
function AssessmentForm({
  classes,
  subjects,
  assessmentTypes,
  onSubmit,
  isLoading,
  onClose,
}: {
  classes: Class[];
  subjects: Subject[];
  assessmentTypes: AssessmentType[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
  onClose: () => void;
}) {
  const form = useForm({
    resolver: zodResolver(
      z.object({
        name: z.string().min(1, "Name is required"),
        typeId: z.string().min(1, "Type is required"),
        classId: z.string().min(1, "Class is required"),
        subjectId: z.string().optional(),
        date: z.string().min(1, "Date is required"),
        maxScore: z.number().min(1, "Max score must be at least 1"),
        weight: z.number().min(0).max(100).optional(),
        description: z.string().optional(),
        instructions: z.string().optional(),
        isPublished: z.boolean().default(false),
      })
    ),
    defaultValues: {
      name: "",
      typeId: assessmentTypes[0]?.id || "",
      classId: classes[0]?.id || "",
      subjectId: subjects[0]?.id || "",
      date: new Date().toISOString().split("T")[0],
      maxScore: 100,
      weight: 0,
      description: "",
      instructions: "",
      isPublished: false,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem><FormLabel>Name *</FormLabel><FormControl><Input placeholder="e.g., Midterm Exam" {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField control={form.control} name="classId" render={({ field }) => (
            <FormItem><FormLabel>Class *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger></FormControl>
                <SelectContent>
                  {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name} ({c.gradeLevel?.name})</SelectItem>)}
                </SelectContent>
              </Select>
            <FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="subjectId" render={({ field }) => (
            <FormItem><FormLabel>Subject *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger></FormControl>
                <SelectContent>
                  {subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>)}
                </SelectContent>
              </Select>
            <FormMessage /></FormItem>
          )} />
        </div>

        <FormField control={form.control} name="typeId" render={({ field }) => (
          <FormItem><FormLabel>Type *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
              <SelectContent>
                {assessmentTypes.map((t) => <SelectItem key={t.id} value={t.id}>{t.name} ({t.weight}%)</SelectItem>)}
              </SelectContent>
            </Select>
          <FormMessage /></FormItem>
        )} />

        <div className="grid gap-4 md:grid-cols-3">
          <FormField control={form.control} name="date" render={({ field }) => (
            <FormItem><FormLabel>Date *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="maxScore" render={({ field }) => (
            <FormItem><FormLabel>Max Score *</FormLabel><FormControl><Input type="number" min="1" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="weight" render={({ field }) => (
            <FormItem><FormLabel>Weight %</FormLabel><FormControl><Input type="number" min="0" max="100" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        <FormField control={form.control} name="instructions" render={({ field }) => (
          <FormItem><FormLabel>Instructions</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        <FormField control={form.control} name="isPublished" render={({ field }) => (
          <FormItem className="flex items-center">
            <FormControl>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={field.value} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} /> <FormLabel>Publish immediately</FormLabel>
              </label>
            </FormControl>
          </FormItem>
        )} />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Create"}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

// Import missing icons
import { Trash2 } from "lucide-react";