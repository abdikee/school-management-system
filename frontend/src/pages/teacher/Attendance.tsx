"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { attendanceApi, academicApi, usersApi, reportsApi } from "@/services/api";
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
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Download,
  AlertCircle,
  FileText,
  BarChart3,
} from "lucide-react";
import { cn, formatDate, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import { Class, Student, Subject, AttendanceSession } from "@/types/api";
import { useAttendanceSummary, useClassAttendanceReport, useAttendanceTrends, useExportAttendance } from "@/hooks/useReports";

const teacherAttendanceTabs = [
  { id: "record", label: "Record Attendance", icon: Plus },
  { id: "sessions", label: "My Sessions", icon: Calendar },
  { id: "reports", label: "Reports", icon: BarChart3 },
] as const;

type TeacherAttendanceTab = (typeof teacherAttendanceTabs)[number]["id"];

export function TeacherAttendance() {
  const [activeTab, setActiveTab] = useState<TeacherAttendanceTab>("record");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, string>>({});
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AttendanceSession | null>(null);
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
  // ATTENDANCE SESSIONS (teacher's sessions)
  // ============================================
  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ["teacher-sessions", selectedClassId, selectedSubjectId, dateFrom, dateTo, page, pageSize],
    queryFn: () => attendanceApi.getSessions({
      skip: (page - 1) * pageSize,
      take: pageSize,
      classId: selectedClassId || undefined,
      subjectId: selectedSubjectId || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
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

  const updateSessionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => attendanceApi.updateSession(id, data),
    onSuccess: () => {
      toast.success("Session updated");
      queryClient.invalidateQueries({ queryKey: ["teacher-sessions"] });
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to update session"),
  });

  const deleteSessionMutation = useMutation({
    mutationFn: (id: string) => attendanceApi.deleteSession(id),
    onSuccess: () => {
      toast.success("Session deleted");
      queryClient.invalidateQueries({ queryKey: ["teacher-sessions"] });
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to delete session"),
  });

  // ============================================
  // RECORD ATTENDANCE
  // ============================================
  const loadStudentsForClass = async () => {
    if (!selectedClassId || !selectedDate) return;
    setIsLoadingStudents(true);
    try {
      const data = await usersApi.getStudents({ classId: selectedClassId, take: 200 });
      setStudents(data.data || []);

      // Load existing attendance for this date
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
      loadStudentsForClass();
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
  // REPORTS
  // ============================================
  const { data: attendanceSummary, isLoading: summaryLoading } = useAttendanceSummary({
    classId: selectedClassId || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const { data: classAttendanceReport, isLoading: classReportLoading } = useClassAttendanceReport(
    selectedClassId,
    { dateFrom: dateFrom || undefined, dateTo: dateTo || undefined, subjectId: selectedSubjectId || undefined }
  );

  const { data: attendanceTrends, isLoading: trendsLoading } = useAttendanceTrends({
    classId: selectedClassId || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    groupBy: "day",
  });

  const exportAttendanceMutation = useExportAttendance();

  const handleExportAttendance = () => {
    if (!selectedClassId) {
      toast.error("Please select a class");
      return;
    }
    exportAttendanceMutation.mutate({
      classId: selectedClassId,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      subjectId: selectedSubjectId || undefined,
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "record":
        return renderRecordTab();
      case "sessions":
        return renderSessionsTab();
      case "reports":
        return renderReportsTab();
    }
  };

  const renderRecordTab = () => (
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
              <Button onClick={loadStudentsForClass} disabled={!selectedClassId || !selectedDate || isLoadingStudents}>
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

      {selectedClassId && selectedDate && students.length === 0 && !isLoadingStudents && (
        <Card>
          <CardContent className="pt-6 text-center py-8">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No students found in this class</p>
            <Button variant="outline" onClick={loadStudentsForClass} className="mt-4">
              Refresh
            </Button>
          </CardContent>
        </Card>
      )}

      {!selectedClassId && (
        <Card>
          <CardContent className="pt-6 text-center py-8">
            <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Please select a class and date to record attendance</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderSessionsTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-64">
              <Label className="block text-sm font-medium mb-1">Class *</Label>
              <Select value={selectedClassId} onValueChange={(value) => { setSelectedClassId(value); setSelectedSubjectId(""); setPage(1); }}>
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
            <div className="w-full sm:w-40">
              <Label className="block text-sm font-medium mb-1">Date From</Label>
              <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} />
            </div>
            <div className="w-full sm:w-40">
              <Label className="block text-sm font-medium mb-1">Date To</Label>
              <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} />
            </div>
            <div className="flex items-end">
              <Button onClick={() => { setSelectedItem(null); setCreateDialogOpen(true); }} disabled={!selectedClassId}>
                <Plus className="mr-2 h-4 w-4" />
                Create Session
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      {selectedClassId && (
        <Card>
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
                    sessionsData?.data?.map((session: AttendanceSession) => (
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
                            <Button variant="ghost" size="icon" onClick={() => deleteSessionMutation.mutate(session.id)} disabled={deleteSessionMutation.isPending}><XCircle className="h-4 w-4 text-red-600" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {sessionsData && sessionsData.meta.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  Page {sessionsData.meta.page} of {sessionsData.meta.totalPages} ({sessionsData.meta.total} total)
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(sessionsData.meta.totalPages, p + 1))} disabled={page === sessionsData.meta.totalPages}>
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
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Please select a class to view sessions</p>
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
            <div className="w-full sm:w-40">
              <Label className="block text-sm font-medium mb-1">Date From</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="w-full sm:w-40">
              <Label className="block text-sm font-medium mb-1">Date To</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button onClick={handleExportAttendance} disabled={exportAttendanceMutation.isPending || !selectedClassId}>
                {exportAttendanceMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />} Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {selectedClassId && attendanceSummary && !summaryLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{attendanceSummary.present}</p>
                <p className="text-sm text-gray-500">Present</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">{attendanceSummary.absent}</p>
                <p className="text-sm text-gray-500">Absent</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600">{attendanceSummary.late}</p>
                <p className="text-sm text-gray-500">Late</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{attendanceSummary.excused}</p>
                <p className="text-sm text-gray-500">Excused</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{attendanceSummary.attendanceRate.toFixed(1)}%</p>
                <p className="text-sm text-gray-500">Rate</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Student Attendance Details */}
      {selectedClassId && classAttendanceReport && !classReportLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Student Attendance Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Absent</TableHead>
                    <TableHead>Late</TableHead>
                    <TableHead>Excused</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classAttendanceReport.studentSummaries.map((summary: any) => (
                    <TableRow key={summary.student.id}>
                      <TableCell className="font-medium">
                        {summary.student.user?.firstName} {summary.student.user?.lastName}
                      </TableCell>
                      <TableCell className="text-green-600 font-medium">{summary.present}</TableCell>
                      <TableCell className="text-red-600 font-medium">{summary.absent}</TableCell>
                      <TableCell className="text-yellow-600 font-medium">{summary.late}</TableCell>
                      <TableCell className="text-blue-600 font-medium">{summary.excused}</TableCell>
                      <TableCell>{summary.total}</TableCell>
                      <TableCell className="font-medium">{summary.attendanceRate.toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attendance Trends Chart */}
      {selectedClassId && attendanceTrends && !trendsLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2 px-2">
              {attendanceTrends.data.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex items-end justify-between h-48 gap-1">
                    <div
                      className="flex-1 bg-green-500/20 rounded-t transition-all hover:bg-green-500"
                      style={{ height: `${day.rate}%` }}
                    />
                    <div
                      className="flex-1 bg-red-500/20 rounded-t transition-all hover:bg-red-500"
                      style={{ height: `${100 - day.rate}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 mt-2">{attendanceTrends.labels[i]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedClassId && (
        <Card>
          <CardContent className="pt-6 text-center py-8">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Please select a class to view attendance reports</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-600 mt-1">
            Record attendance, manage sessions, and view reports
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          {teacherAttendanceTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center justify-center gap-2">
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {renderTabContent()}
      </Tabs>

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