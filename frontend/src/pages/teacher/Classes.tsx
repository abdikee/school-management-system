"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { academicApi, attendanceApi, gradesApi, usersApi } from "@/services/api";
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
  Users,
  Calendar,
  BookOpen,
  Clock,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Award,
  FileText,
} from "lucide-react";
import { cn, formatDate, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import { Class, Student, Subject, Assessment, Grade } from "@/types/api";

const teacherClassesTabs = [
  { id: "my-classes", label: "My Classes", icon: Users },
  { id: "students", label: "Students", icon: Users },
  { id: "timetable", label: "Timetable", icon: Calendar },
  { id: "attendance", label: "Attendance", icon: CheckCircle },
  { id: "grades", label: "Grades", icon: Award },
] as const;

type TeacherClassesTab = (typeof teacherClassesTabs)[number]["id"];

export function TeacherClasses() {
  const [activeTab, setActiveTab] = useState<TeacherClassesTab>("my-classes");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, string>>({});
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  // ============================================
  // MY CLASSES (classes where teacher is homeroom teacher or teaches a subject)
  // ============================================
  const { data: myClassesData, isLoading: myClassesLoading } = useQuery({
    queryKey: ["my-classes", search],
    queryFn: () => academicApi.getMyClasses({ search: search || undefined, take: 100 }),
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
  // STUDENTS FOR SELECTED CLASS
  // ============================================
  const loadStudents = async () => {
    if (!selectedClassId) return;
    setIsLoadingStudents(true);
    try {
      const data = await usersApi.getStudents({ classId: selectedClassId, take: 200 });
      setStudents(data.data || []);

      // Load existing attendance for selected date
      const records = await attendanceApi.getByDate(selectedDate, { classId: selectedClassId });
      const recordsMap: Record<string, string> = {};
      (records.data || []).forEach((r: any) => {
        recordsMap[r.studentId] = r.status;
      });
      setAttendanceRecords(recordsMap);
    } catch (error) {
      toast.error("Failed to load students");
    } finally {
      setIsLoadingStudents(false);
    }
  };

  // ============================================
  // ATTENDANCE SESSIONS FOR CLASS
  // ============================================
  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ["teacher-sessions", selectedClassId, selectedSubjectId],
    queryFn: () => attendanceApi.getSessions({
      classId: selectedClassId || undefined,
      subjectId: selectedSubjectId || undefined,
      take: 50,
    }),
    enabled: !!selectedClassId,
  });

  const createSessionMutation = useMutation({
    mutationFn: (data: any) => attendanceApi.createSession(data),
    onSuccess: () => {
      toast.success("Session created");
      queryClient.invalidateQueries({ queryKey: ["teacher-sessions"] });
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to create session"),
  });

  // ============================================
  // RECORD ATTENDANCE
  // ============================================
  const recordAttendanceMutation = useMutation({
    mutationFn: (records: Array<{ studentId: string; status: string; notes?: string }>) =>
      attendanceApi.bulkCreate({
        classId: selectedClassId!,
        subjectId: selectedSubjectId || undefined,
        date: selectedDate,
        records,
      }),
    onSuccess: () => {
      toast.success("Attendance recorded");
      loadStudents();
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to record attendance"),
  });

  const handleAttendanceChange = (studentId: string, status: string) => {
    setAttendanceRecords(prev => ({ ...prev, [studentId]: status }));
  };

  const handleBulkRecord = () => {
    const records = students
      .filter(s => attendanceRecords[s.id])
      .map(s => ({
        studentId: s.id,
        status: attendanceRecords[s.id],
      }));

    if (records.length === 0) {
      toast.error("No attendance records to save");
      return;
    }

    recordAttendanceMutation.mutate(records);
  };

  const handleQuickRecord = (status: string) => {
    const records = students.map(s => ({
      studentId: s.id,
      status,
    }));
    recordAttendanceMutation.mutate(records);
  };

  // ============================================
  // ASSESSMENTS FOR CLASS/SUBJECT
  // ============================================
  const { data: assessmentsData, isLoading: assessmentsLoading } = useQuery({
    queryKey: ["teacher-assessments", selectedClassId, selectedSubjectId],
    queryFn: () => gradesApi.getAssessments({
      classId: selectedClassId || undefined,
      subjectId: selectedSubjectId || undefined,
      take: 100,
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

  // ============================================
  // GRADES FOR SELECTED ASSESSMENT
  // ============================================
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [grades, setGrades] = useState<Record<string, { score: number; feedback?: string }>>({});
  const [isLoadingGrades, setIsLoadingGrades] = useState(false);

  const loadGrades = async (assessmentId: string) => {
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
      toast.error("Failed to load grades");
    } finally {
      setIsLoadingGrades(false);
    }
  };

  const saveGradesMutation = useMutation({
    mutationFn: (records: Array<{ studentId: string; score: number; feedback?: string }>) =>
      gradesApi.bulkCreateGrades({ assessmentId: selectedAssessment!.id, records }),
    onSuccess: () => {
      toast.success("Grades saved");
      if (selectedAssessment) loadGrades(selectedAssessment.id);
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

  const renderTabContent = () => {
    switch (activeTab) {
      case "my-classes":
        return renderMyClassesTab();
      case "students":
        return renderStudentsTab();
      case "timetable":
        return renderTimetableTab();
      case "attendance":
        return renderAttendanceTab();
      case "grades":
        return renderGradesTab();
    }
  };

  const renderMyClassesTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search classes..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Classes Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            My Classes
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {myClassesLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="pt-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-8 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 mt-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : myClassesData?.data?.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No classes assigned to you</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myClassesData?.data?.map((cls: Class) => (
                <Card key={cls.id} className="hover:shadow-md transition-shadow" onClick={() => { setSelectedClassId(cls.id); setActiveTab("students"); }}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{cls.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{cls.gradeLevel?.name}</p>
                        <p className="text-sm text-gray-500">{cls.academicYear?.name}</p>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {cls._count?.subjects || 0} subjects
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {cls._count?.students || 0} students
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {cls.capacity} capacity
                      </span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); setSelectedClassId(cls.id); setActiveTab("students"); }}>
                        View Students
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); setSelectedClassId(cls.id); setActiveTab("attendance"); }}>
                        Attendance
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); setSelectedClassId(cls.id); setActiveTab("grades"); }}>
                        Grades
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderStudentsTab = () => (
    <div className="space-y-6">
      {/* Class Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-64">
              <Label className="block text-sm font-medium mb-1">Select Class *</Label>
              <Select value={selectedClassId} onValueChange={(value) => { setSelectedClassId(value); setStudents([]); }}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {myClassesData?.data?.map((c: Class) => (
                    <SelectItem key={c.id} value={c.id}>{c.name} ({c.gradeLevel?.name})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={loadStudents} disabled={!selectedClassId || isLoadingStudents}>
                {isLoadingStudents ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Load Students"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      {selectedClassId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Students ({students.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {students.length === 0 && !isLoadingStudents ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No students found in this class</p>
                <Button variant="outline" onClick={loadStudents} className="mt-4">Refresh</Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Enrollment Date</TableHead>
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
                        <TableCell>{student.user?.email}</TableCell>
                        <TableCell>{student.user?.phone || "—"}</TableCell>
                        <TableCell>
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                            student.status === "ACTIVE" && "bg-green-100 text-green-800",
                            student.status === "INACTIVE" && "bg-gray-100 text-gray-800",
                            student.status === "PENDING" && "bg-yellow-100 text-yellow-800",
                            student.status === "SUSPENDED" && "bg-red-100 text-red-800"
                          )}>
                            {student.status}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(student.enrollmentDate)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!selectedClassId && (
        <Card>
          <CardContent className="pt-6 text-center py-8">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Please select a class to view students</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderTimetableTab = () => (
    <div className="space-y-6">
      {/* Class Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-64">
              <Label className="block text-sm font-medium mb-1">Select Class *</Label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {myClassesData?.data?.map((c: Class) => (
                    <SelectItem key={c.id} value={c.id}>{c.name} ({c.gradeLevel?.name})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timetable */}
      {selectedClassId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timetable
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Day</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* This would come from a timetable API */}
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Timetable data would be loaded here
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedClassId && (
        <Card>
          <CardContent className="pt-6 text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Please select a class to view timetable</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderAttendanceTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-64">
              <Label className="block text-sm font-medium mb-1">Class *</Label>
              <Select value={selectedClassId} onValueChange={(value) => { setSelectedClassId(value); setSelectedSubjectId(""); setStudents([]); }}>
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
                  <SelectItem value="">General Attendance</SelectItem>
                  {classSubjectsData?.map((s: Subject) => (
                    <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Label className="block text-sm font-medium mb-1">Date *</Label>
              <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button onClick={loadStudents} disabled={!selectedClassId || !selectedDate || isLoadingStudents}>
                {isLoadingStudents ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Load Students"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {selectedClassId && selectedDate && students.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Record Attendance - {selectedDate}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4 flex-wrap">
              <Button variant="default" onClick={() => handleQuickRecord("PRESENT")} size="sm">
                <CheckCircle className="mr-2 h-4 w-4" /> Mark All Present
              </Button>
              <Button variant="destructive" onClick={() => handleQuickRecord("ABSENT")} size="sm">
                <XCircle className="mr-2 h-4 w-4" /> Mark All Absent
              </Button>
              <Button variant="secondary" onClick={() => handleQuickRecord("LATE")} size="sm">
                <Clock className="mr-2 h-4 w-4" /> Mark All Late
              </Button>
              <Button variant="outline" onClick={() => handleQuickRecord("EXCUSED")} size="sm">
                <AlertCircle className="mr-2 h-4 w-4" /> Mark All Excused
              </Button>
              <Button onClick={handleBulkRecord} disabled={recordAttendanceMutation.isPending} className="ml-auto">
                {recordAttendanceMutation.isPending ? "Saving..." : "Save Attendance"}
              </Button>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Status</TableHead>
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
                        <div className="flex gap-2">
                          {["PRESENT", "ABSENT", "LATE", "EXCUSED"].map((status) => (
                            <button
                              key={status}
                              onClick={() => handleAttendanceChange(student.id, status)}
                              className={cn(
                                "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                                attendanceRecords[student.id] === status
                                  ? "bg-primary text-white"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                                status === "PRESENT" && "hover:bg-green-100 hover:text-green-700",
                                status === "ABSENT" && "hover:bg-red-100 hover:text-red-700",
                                status === "LATE" && "hover:bg-yellow-100 hover:text-yellow-700",
                                status === "EXCUSED" && "hover:bg-blue-100 hover:text-blue-700"
                              )}
                            >
                              {status.charAt(0)}
                            </button>
                          ))}
                        </div>
                        {attendanceRecords[student.id] && (
                          <span className={cn(
                            "ml-2 text-xs font-medium",
                            attendanceRecords[student.id] === "PRESENT" && "text-green-600",
                            attendanceRecords[student.id] === "ABSENT" && "text-red-600",
                            attendanceRecords[student.id] === "LATE" && "text-yellow-600",
                            attendanceRecords[student.id] === "EXCUSED" && "text-blue-600"
                          )}>
                            {attendanceRecords[student.id]}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attendance Sessions */}
      {selectedClassId && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Attendance Sessions
            </CardTitle>
            <Button onClick={() => { setSelectedItem(null); setCreateDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Create Session
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessionsLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                      </TableCell>
                    </TableRow>
                  ) : sessionsData?.data?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No sessions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    sessionsData?.data?.map((session: any) => (
                      <TableRow key={session.id}>
                        <TableCell>{formatDate(session.date)}</TableCell>
                        <TableCell>{session.startTime} - {session.endTime}</TableCell>
                        <TableCell>{session.subject?.name || "General"}</TableCell>
                        <TableCell>
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                            session.status === "OPEN" && "bg-green-100 text-green-800",
                            session.status === "CLOSED" && "bg-gray-100 text-gray-800",
                            session.status === "CANCELLED" && "bg-red-100 text-red-800"
                          )}>
                            {session.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => { setSelectedItem(session); setCreateDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedClassId && (
        <Card>
          <CardContent className="pt-6 text-center py-8">
            <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Please select a class to manage attendance</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderGradesTab = () => (
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
              <Label className="block text-sm font-medium mb-1">Assessment</Label>
              <Select value={selectedAssessment?.id || ""} onValueChange={(value) => {
                const assessment = assessmentsData?.data?.find((a: Assessment) => a.id === value);
                setSelectedAssessment(assessment);
                if (assessment) loadGrades(assessment.id);
              }}>
                <SelectTrigger><SelectValue placeholder="Select assessment" /></SelectTrigger>
                <SelectContent>
                  {assessmentsData?.data?.map((a: Assessment) => (
                    <SelectItem key={a.id} value={a.id}>{a.name} ({a.type?.name}) - {formatDate(a.date)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={() => { setSelectedItem(null); setCreateDialogOpen(true); }} disabled={!selectedClassId}>
                <Plus className="mr-2 h-4 w-4" />
                Create Assessment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessments List */}
      {selectedClassId && selectedSubjectId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Assessments
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
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
                      <TableCell colSpan={7} className="text-center py-8">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                      </TableCell>
                    </TableRow>
                  ) : assessmentsData?.data?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No assessments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    assessmentsData?.data?.map((assessment: Assessment) => (
                      <TableRow key={assessment.id}>
                        <TableCell className="font-medium">{assessment.name}</TableCell>
                        <TableCell>{assessment.type?.name || "—"}</TableCell>
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
                            <Button variant="ghost" size="icon" onClick={() => { setSelectedAssessment(assessment); loadGrades(assessment.id); }}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grade Entry */}
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
            <Button variant="outline" onClick={() => loadGrades(selectedAssessment.id)} className="mt-4">
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
          <p className="text-gray-600 mt-1">
            Manage your classes, students, attendance, and grades
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          {teacherClassesTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center justify-center gap-2">
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {renderTabContent()}
      </Tabs>

      {/* Create/Edit Assessment Dialog */}
      <Dialog open={createDialogOpen || editDialogOpen} onOpenChange={(open) => { if (!open) { setCreateDialogOpen(false); setEditDialogOpen(false); setSelectedItem(null); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedItem ? "Edit" : "Create"} Assessment</DialogTitle>
            <DialogDescription>
              {selectedItem ? "Update the assessment details below." : "Fill in the details below to create a new assessment."}
            </DialogDescription>
          </DialogHeader>
          <AssessmentForm
            assessment={selectedItem}
            classes={myClassesData?.data || []}
            subjects={classSubjectsData || []}
            onSubmit={(data) => {
              if (selectedItem) {
                // updateAssessmentMutation.mutate({ id: selectedItem.id, data });
              } else {
                createAssessmentMutation.mutate(data);
              }
            }}
            isLoading={createAssessmentMutation.isPending}
            onClose={() => { setCreateDialogOpen(false); setEditDialogOpen(false); setSelectedItem(null); }}
          />
        </DialogContent>
      </Dialog>

      {/* Create/Edit Session Dialog */}
      <Dialog open={false} onOpenChange={() => {}}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Attendance Session</DialogTitle>
          </DialogHeader>
          <SessionForm
            subjects={classSubjectsData || []}
            onSubmit={(data) => {
              createSessionMutation.mutate(data);
            }}
            isLoading={createSessionMutation.isPending}
            onClose={() => {}}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Assessment Form
function AssessmentForm({
  assessment,
  classes,
  subjects,
  onSubmit,
  isLoading,
  onClose,
}: {
  assessment: any;
  classes: Class[];
  subjects: Subject[];
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
    defaultValues: assessment || {
      name: "",
      typeId: "",
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
                <SelectItem value="exam">Exam</SelectItem>
                <SelectItem value="quiz">Quiz</SelectItem>
                <SelectItem value="assignment">Assignment</SelectItem>
                <SelectItem value="project">Project</SelectItem>
                <SelectItem value="participation">Participation</SelectItem>
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
                <input type="checkbox" {...field} /> <FormLabel>Publish immediately</FormLabel>
              </label>
            </FormControl>
          </FormItem>
        )} />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : (assessment ? "Update" : "Create")}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

// Session Form
function SessionForm({
  subjects,
  onSubmit,
  isLoading,
  onClose,
}: {
  subjects: Subject[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
  onClose: () => void;
}) {
  const form = useForm({
    resolver: zodResolver(
      z.object({
        subjectId: z.string().optional(),
        date: z.string().min(1, "Date is required"),
        startTime: z.string().min(1, "Start time is required"),
        endTime: z.string().min(1, "End time is required"),
        status: z.enum(["OPEN", "CLOSED", "CANCELLED"]).default("OPEN"),
      })
    ),
    defaultValues: {
      subjectId: "",
      date: new Date().toISOString().split("T")[0],
      startTime: "08:00",
      endTime: "09:00",
      status: "OPEN",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="subjectId" render={({ field }) => (
          <FormItem><FormLabel>Subject</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select subject (optional)" /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="">General Attendance</SelectItem>
                {subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>)}
              </SelectContent>
            </Select>
          <FormMessage /></FormItem>
        )} />
        <div className="grid gap-4 md:grid-cols-2">
          <FormField control={form.control} name="date" render={({ field }) => (
            <FormItem><FormLabel>Date *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem><FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            <FormMessage /></FormItem>
          )} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField control={form.control} name="startTime" render={({ field }) => (
            <FormItem><FormLabel>Start Time *</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="endTime" render={({ field }) => (
            <FormItem><FormLabel>End Time *</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Create Session"}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}