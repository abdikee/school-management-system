"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { usersApi, academicApi, attendanceApi, gradesApi, financeApi, reportsApi } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock, BookOpen, DollarSign, User, Calendar, GraduationCap, Award, TrendingUp } from "lucide-react";
import { cn, formatDate, formatCurrency } from "@/lib/utils";
import { Student, Parent, Invoice, Grade, Assessment } from "@/types/api";

const parentChildTabs = [
  { id: "overview", label: "Overview", icon: User },
  { id: "attendance", label: "Attendance", icon: Calendar },
  { id: "grades", label: "Grades", icon: Award },
  { id: "fees", label: "Fees", icon: DollarSign },
] as const;

type ParentChildTab = (typeof parentChildTabs)[number]["id"];

export function ParentChildren() {
  const [activeTab, setActiveTab] = useState<ParentChildTab>("overview");
  const [selectedChildId, setSelectedChildId] = useState<string>("");

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
  // OVERVIEW DATA
  // ============================================
  // Attendance summary using stats endpoint
  const { data: attendanceSummary } = useQuery({
    queryKey: ["parent-attendance-summary", selectedChildId],
    queryFn: () => attendanceApi.getAttendanceStats({
      classId: selectedChild?.classId || undefined,
    }),
    enabled: !!selectedChildId,
  });

  // Grade summary using reports API
  const { data: gradeSummary } = useQuery({
    queryKey: ["parent-grade-summary", selectedChildId],
    queryFn: () => reportsApi.getStudentGradeReport(selectedChildId),
    enabled: !!selectedChildId,
  });

  // Invoices
  const { data: invoicesData } = useQuery({
    queryKey: ["parent-invoices", selectedChildId],
    queryFn: () => financeApi.getInvoices({
      studentId: selectedChildId,
      take: 5,
    }),
    enabled: !!selectedChildId,
  });

  // Recent grades - need to get student grade report and extract recent assessments
  const { data: recentGradesData } = useQuery({
    queryKey: ["parent-recent-grades", selectedChildId],
    queryFn: () => reportsApi.getStudentGradeReport(selectedChildId),
    enabled: !!selectedChildId,
  });

  // Recent attendance
  const { data: recentAttendanceData } = useQuery({
    queryKey: ["parent-recent-attendance", selectedChildId],
    queryFn: () => attendanceApi.getAttendances({
      studentId: selectedChildId,
      take: 5,
      // orderBy and orderDir not supported by API
    }),
    enabled: !!selectedChildId,
  });

  const renderTabContent = () => {
    if (!selectedChild) {
      return (
        <Card>
          <CardContent className="py-12 text-center">
            <User className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500">No children linked to your account</p>
          </CardContent>
        </Card>
      );
    }

    switch (activeTab) {
      case "overview":
        return renderOverviewTab();
      case "attendance":
        return renderAttendanceTab();
      case "grades":
        return renderGradesTab();
      case "fees":
        return renderFeesTab();
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Child Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedChild.user?.firstName} {selectedChild.user?.lastName}
                </h2>
                <p className="text-gray-600">{selectedChild.studentId}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    {selectedChild.class?.gradeLevel?.name} - {selectedChild.class?.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {selectedChild.class?.academicYear?.name}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 md:ml-auto">
              {children.map((child: Student) => (
                <Button
                  key={child.id}
                  variant={child.id === selectedChildId ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedChildId(child.id)}
                  className="whitespace-nowrap"
                >
                  {child.user?.firstName} {child.user?.lastName}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg"><Calendar className="h-6 w-6 text-blue-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Attendance Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {attendanceSummary?.attendanceRate?.toFixed(1) || "—"}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg"><Award className="h-6 w-6 text-green-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Average Grade</p>
                <p className="text-2xl font-bold text-gray-900">
                  {gradeSummary?.overall?.average?.toFixed(1) || "—"}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg"><Clock className="h-6 w-6 text-yellow-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Days Present</p>
                <p className="text-2xl font-bold text-gray-900">
                  {attendanceSummary?.presentCount || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg"><AlertCircle className="h-6 w-6 text-red-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Outstanding Balance</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(
                    invoicesData?.data
                      ?.filter((i: Invoice) => i.status !== "PAID" && i.status !== "CANCELLED")
                      ?.reduce((sum: number, i: Invoice) => sum + Number(i.totalAmount), 0) || 0
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Grades */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Recent Grades
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentGradesData?.subjectReports?.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent grades</p>
            ) : (
              <div className="space-y-3">
                {recentGradesData?.subjectReports?.flatMap((sr: any) =>
                  sr.assessments?.filter((a: any) => a.grade).map((a: any) => ({
                    subject: sr.subject?.name,
                    assessment: a.assessment?.name,
                    percentage: a.percentage,
                    date: a.assessment?.date,
                  })) || []
                ).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)
                .map((item: any) => (
                  <div key={`${item.subject}-${item.assessment}-${item.date}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{item.subject}</p>
                      <p className="text-sm text-gray-500">{item.assessment}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{item.percentage?.toFixed(1)}%</p>
                      <p className="text-xs text-gray-500">{formatDate(item.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentAttendanceData?.data?.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent attendance records</p>
            ) : (
              <div className="space-y-3">
                {recentAttendanceData?.data?.map((att: any) => (
                  <div key={att.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{att.session?.class?.name || "Class"}</p>
                      <p className="text-sm text-gray-500">{formatDate(att.date)}</p>
                    </div>
                    <Badge variant={getAttendanceBadgeVariant(att.status)}>
                      {att.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Upcoming Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoicesData?.data?.filter((i: Invoice) => i.status !== "PAID" && i.status !== "CANCELLED").length === 0 ? (
            <p className="text-gray-500 text-center py-4">All payments up to date</p>
          ) : (
            <div className="space-y-3">
              {invoicesData?.data
                ?.filter((i: Invoice) => i.status !== "PAID" && i.status !== "CANCELLED")
                ?.slice(0, 3)
                ?.map((invoice: Invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{invoice.feeStructure?.name}</p>
                      <p className="text-sm text-gray-500">Due: {formatDate(invoice.dueDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">{formatCurrency(Number(invoice.totalAmount))}</p>
                      <Badge variant={getInvoiceStatusVariant(invoice.status)} className="text-xs">
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderAttendanceTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Details</CardTitle>
        </CardHeader>
        <CardContent>
          {attendanceSummary && (
            <div className="grid gap-4 md:grid-cols-4 mb-6">
              <StatCard label="Present" value={attendanceSummary.presentCount || 0} icon={CheckCircle} color="text-green-600" bg="bg-green-100" />
              <StatCard label="Absent" value={attendanceSummary.absentCount || 0} icon={AlertCircle} color="text-red-600" bg="bg-red-100" />
              <StatCard label="Late" value={attendanceSummary.lateCount || 0} icon={Clock} color="text-yellow-600" bg="bg-yellow-100" />
              <StatCard label="Excused" value={attendanceSummary.excusedCount || 0} icon={BookOpen} color="text-blue-600" bg="bg-blue-100" />
            </div>
          )}
          {recentAttendanceData?.data?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-gray-500"><th className="p-3">Date</th><th className="p-3">Subject</th><th className="p-3">Status</th></tr></thead>
                <tbody>
                  {recentAttendanceData.data.map((record: any) => (
                    <tr key={record.id} className="border-b last:border-0">
                      <td className="p-3">{record.date ? formatDate(record.date) : record.session?.date ? formatDate(record.session.date) : "-"}</td>
                      <td className="p-3">{record.subject?.name || record.session?.subject?.name || "-"}</td>
                      <td className="p-3"><Badge variant={record.status === "PRESENT" ? "default" : "destructive"}>{record.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="py-8 text-center text-gray-500">No attendance records available.</p>}
        </CardContent>
      </Card>
    </div>
  );

  const renderGradesTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Grade Report</CardTitle>
        </CardHeader>
        <CardContent>
          {gradeSummary && (
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <StatCard label="Average" value={`${gradeSummary.overall?.average?.toFixed(1) || "—"}%`} icon={TrendingUp} color="text-green-600" bg="bg-green-100" />
              <StatCard label="Total Assessments" value={gradeSummary.overall?.totalAssessments || 0} icon={Award} color="text-blue-600" bg="bg-blue-100" />
              <StatCard label="Passed" value={gradeSummary.overall?.totalAssessments || 0} icon={CheckCircle} color="text-green-600" bg="bg-green-100" />
            </div>
          )}
          {gradeSummary?.subjectReports?.length ? (
            <div className="space-y-3">
              {gradeSummary.subjectReports.map((subject: any) => (
                <div key={subject.subject} className="flex items-center justify-between rounded-lg border p-4">
                  <div><p className="font-medium">{subject.subject}</p><p className="text-sm text-gray-500">{subject.count} assessments</p></div>
                  <p className="text-lg font-semibold text-green-700">{subject.average?.toFixed(1) || "—"}%</p>
                </div>
              ))}
            </div>
          ) : <p className="py-8 text-center text-gray-500">No grade records available.</p>}
        </CardContent>
      </Card>
    </div>
  );

  const renderFeesTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Fee Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <StatCard label="Total Invoiced" value={formatCurrency(invoicesData?.data?.reduce((sum: number, i: Invoice) => sum + Number(i.totalAmount), 0) || 0)} icon={DollarSign} color="text-blue-600" bg="bg-blue-100" />
            <StatCard label="Total Paid" value={formatCurrency(invoicesData?.data?.filter((i: Invoice) => i.status === "PAID").reduce((sum: number, i: Invoice) => sum + Number(i.totalAmount), 0) || 0)} icon={CheckCircle} color="text-green-600" bg="bg-green-100" />
            <StatCard label="Balance Due" value={formatCurrency(invoicesData?.data?.filter((i: Invoice) => i.status !== "PAID" && i.status !== "CANCELLED").reduce((sum: number, i: Invoice) => sum + Number(i.totalAmount), 0) || 0)} icon={AlertCircle} color="text-red-600" bg="bg-red-100" />
            <StatCard label="Overdue" value={formatCurrency(invoicesData?.data?.filter((i: Invoice) => i.status === "OVERDUE").reduce((sum: number, i: Invoice) => sum + Number(i.totalAmount), 0) || 0)} icon={Clock} color="text-yellow-600" bg="bg-yellow-100" />
          </div>
          {invoicesData?.data?.length ? (
            <div className="space-y-3">
              {invoicesData.data.map((invoice: Invoice) => (
                <div key={invoice.id} className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div><p className="font-medium">{invoice.feeStructure?.name || invoice.invoiceNumber}</p><p className="text-sm text-gray-500">Due {formatDate(invoice.dueDate)}</p></div>
                  <div className="flex items-center gap-3"><span className="font-semibold">{formatCurrency(Number(invoice.totalAmount))}</span><Badge variant={getInvoiceStatusVariant(invoice.status)}>{invoice.status}</Badge></div>
                </div>
              ))}
            </div>
          ) : <p className="py-8 text-center text-gray-500">No invoices available.</p>}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Children</h1>
        <p className="text-gray-600 mt-1">View your children's academic progress, attendance, and fees</p>
      </div>

      {/* Child Selector */}
      {children.length > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              {children.map((child: Student) => (
                <Button
                  key={child.id}
                  variant={child.id === selectedChildId ? "default" : "outline"}
                  onClick={() => setSelectedChildId(child.id)}
                  className="whitespace-nowrap"
                >
                  {child.user?.firstName} {child.user?.lastName}
                  <span className="ml-2 text-xs opacity-70">
                    ({child.class?.gradeLevel?.name})
                  </span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as ParentChildTab)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          {parentChildTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center justify-center gap-2">
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {renderTabContent()}
      </Tabs>
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

function getInvoiceStatusVariant(status: string) {
  switch (status) {
    case "PAID": return "default";
    case "PENDING": return "secondary";
    case "PARTIAL": return "secondary";
    case "OVERDUE": return "destructive";
    case "CANCELLED": return "outline";
    default: return "secondary";
  }
}