"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { attendanceApi, usersApi } from "@/services/api";
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
import { Calendar, ChevronLeft, ChevronRight, Search, Download, AlertCircle, CheckCircle, Clock, BookOpen, Users } from "lucide-react";
import { cn, formatDate, formatDateTime } from "@/lib/utils";
import { Attendance, Student, Parent, AttendanceSession, Class, Subject, Teacher, User } from "@/types/api";

// Extended Attendance type with optional expanded relations
interface AttendanceWithRelations extends Attendance {
  session?: AttendanceSession & {
    class?: Class;
    subject?: Subject;
    teacher?: Teacher & { user?: User };
  };
}

export function ParentAttendance() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedChildId, setSelectedChildId] = useState("");

  // Get current user profile
  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => usersApi.getProfile(),
  });

  // Get parent's children - fetch parent record if user is a parent
  const { data: parentData, isLoading: parentLoading } = useQuery({
    queryKey: ["parent-data", currentUser?.id],
    queryFn: async () => {
      if (!currentUser || currentUser.role !== "PARENT") return null;
      // Try to get parent by userId - we need to use getParents and find the one with matching userId
      const parentsResponse = await usersApi.getParents({ search: "", take: 100 });
      const parent = parentsResponse.data.find((p: Parent) => p.userId === currentUser.id);
      return parent;
    },
    enabled: !!currentUser && currentUser.role === "PARENT",
  });

  const children = parentData?.students || [];

  // Auto-select first child if none selected
  useEffect(() => {
    if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  const selectedChild = children.find((c: Student) => c.id === selectedChildId);

  // ============================================
  // ATTENDANCE RECORDS
  // ============================================
  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ["parent-attendance", selectedChildId, search, statusFilter, dateFrom, dateTo, page, pageSize],
    queryFn: () => attendanceApi.getAttendances({
      studentId: selectedChildId || undefined,
      skip: (page - 1) * pageSize,
      take: pageSize,
      // search not supported by API
      status: statusFilter || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }),
    enabled: !!selectedChildId,
  });

  // ============================================
  // ATTENDANCE SUMMARY (using stats endpoint)
  // ============================================
  const { data: summaryData } = useQuery({
    queryKey: ["parent-attendance-summary", selectedChildId, dateFrom, dateTo],
    queryFn: () => attendanceApi.getAttendanceStats({
      // studentId not supported by getAttendanceStats, filter by class instead
      classId: selectedChild?.classId || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }),
    enabled: !!selectedChildId,
  });

  // ============================================
  // ATTENDANCE SESSIONS (for context)
  // ============================================
  const { data: sessionsData } = useQuery({
    queryKey: ["parent-attendance-sessions", selectedChildId],
    queryFn: () => attendanceApi.getAttendanceSessions({
      classId: selectedChild?.classId || undefined,
      take: 20,
    }),
    enabled: !!selectedChildId,
  });

  if (parentLoading || !selectedChild) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-600 mt-1">View attendance records for your children</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500">Loading children...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-600 mt-1">
            {selectedChild.user?.firstName} {selectedChild.user?.lastName} • {selectedChild.class?.gradeLevel?.name} - {selectedChild.class?.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {children.length > 1 && (
            <Select value={selectedChildId} onValueChange={setSelectedChildId}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Select child" /></SelectTrigger>
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
          <div className="grid gap-4 md:grid-cols-5">
            <StatCard label="Attendance Rate" value={`${summaryData?.attendanceRate?.toFixed(1) || "—"}%`} icon={CheckCircle} color="text-green-600" bg="bg-green-100" />
            <StatCard label="Present" value={summaryData?.presentCount || 0} icon={CheckCircle} color="text-green-600" bg="bg-green-100" />
            <StatCard label="Absent" value={summaryData?.absentCount || 0} icon={AlertCircle} color="text-red-600" bg="bg-red-100" />
            <StatCard label="Late" value={summaryData?.lateCount || 0} icon={Clock} color="text-yellow-600" bg="bg-yellow-100" />
            <StatCard label="Excused" value={summaryData?.excusedCount || 0} icon={BookOpen} color="text-blue-600" bg="bg-blue-100" />
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search attendance..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
            <div className="w-full sm:w-40">
              <Label className="block text-sm font-medium mb-1">Status</Label>
              <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
                <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="PRESENT">Present</SelectItem>
                  <SelectItem value="ABSENT">Absent</SelectItem>
                  <SelectItem value="LATE">Late</SelectItem>
                  <SelectItem value="EXCUSED">Excused</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-40">
              <Label className="block text-sm font-medium mb-1">From</Label>
              <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} />
            </div>
            <div className="w-full sm:w-40">
              <Label className="block text-sm font-medium mb-1">To</Label>
              <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Attendance Records</h3>
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
                  <TableHead>Class</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : attendanceData?.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No attendance records found
                    </TableCell>
                  </TableRow>
                ) : (
                  attendanceData?.data?.map((attendance: AttendanceWithRelations) => (
                    <TableRow key={attendance.id}>
                      <TableCell>{formatDate(attendance.date)}</TableCell>
                      <TableCell>{attendance.session?.class?.name || "—"}</TableCell>
                      <TableCell>{attendance.session?.subject?.name || "—"}</TableCell>
                      <TableCell>{attendance.session?.teacher?.user?.firstName} {attendance.session?.teacher?.user?.lastName || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={getAttendanceBadgeVariant(attendance.status)}>
                          {attendance.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{attendance.checkInTime ? formatDateTime(attendance.checkInTime) : "—"}</TableCell>
                      <TableCell>{attendance.checkOutTime ? formatDateTime(attendance.checkOutTime) : "—"}</TableCell>
                      <TableCell className="max-w-xs truncate text-gray-600">{attendance.notes || "—"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {attendanceData && attendanceData.meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Page {attendanceData.meta.page} of {attendanceData.meta.totalPages} ({attendanceData.meta.total} total)
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(attendanceData.meta.totalPages, p + 1))} disabled={page === attendanceData.meta.totalPages}>
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

function getAttendanceBadgeVariant(status: string) {
  switch (status) {
    case "PRESENT": return "default";
    case "ABSENT": return "destructive";
    case "LATE": return "secondary";
    case "EXCUSED": return "outline";
    default: return "secondary";
  }
}