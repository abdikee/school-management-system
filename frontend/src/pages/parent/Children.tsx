"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usersApi, academicApi, attendanceApi, gradesApi, financeApi } from "@/services/api";
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
import { Student, AttendanceSummary, GradeSummary, Invoice } from "@/types/api";

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

  // Get current parent's children
  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => usersApi.getProfile(),
  });

  const children = currentUser?.data?.parent?.children || [];

  // Select first child by default
  if (children.length > 0 && !selectedChildId) {
    setSelectedChildId(children[0].id);
  }

  const selectedChild = children.find((c: Student) => c.id === selectedChildId);

  // ============================================
  // OVERVIEW DATA
  // ============================================
  const { data: attendanceSummary } = useQuery({
    queryKey: ["parent-attendance-summary", selectedChildId],
    queryFn: () => attendanceApi.getAttendanceSummary({
      studentId: selectedChildId,
    }),
    enabled: !!selectedChildId,
  });

  const { data: gradeSummary } = useQuery({
    queryKey: ["parent-grade-summary", selectedChildId],
    queryFn: () => gradesApi.getGradeSummary({
      studentId: selectedChildId,
    }),
    enabled: !!selectedChildId,
  });

  const { data: invoicesData } = useQuery({
    queryKey: ["parent-invoices", selectedChildId],
    queryFn: () => financeApi.getInvoices({
      studentId: selectedChildId,
      take: 5,
    }),
    enabled: !!selectedChildId,
  });

  const { data: recentGradesData } = useQuery({
    queryKey: ["parent-recent-grades", selectedChildId],
    queryFn: () => gradesApi.getGrades({
      studentId: selectedChildId,
      take: 5,
      orderBy: "createdAt",
      orderDir: "desc",
    }),
    enabled: !!selectedChildId,
  });

  const { data: recentAttendanceData } = useQuery({
    queryKey: ["parent-recent-attendance", selectedChildId],
    queryFn: () => attendanceApi.getAttendance({
      studentId: selectedChildId,
      take: 5,
      orderBy: "date",
      orderDir: "desc",
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
                  {attendanceSummary?.data?.attendanceRate?.toFixed(1) || "—"}%
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
                  {gradeSummary?.data?.averagePercentage?.toFixed(1) || "—"}%
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
                  {attendanceSummary?.data?.presentCount || 0}
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
                  {formatCurrency(invoicesData?.data?.reduce((sum: number, i: Invoice) => sum + Number(i.balance), 0) || 0)}
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
            {recentGradesData?.data?.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent grades</p>
            ) : (
              <div className="space-y-3">
                {recentGradesData?.data?.map((grade: any) => (
                  <div key={grade.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{grade.assessment?.subject?.name}</p>
                      <p className="text-sm text-gray-500">{grade.assessment?.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{grade.percentage?.toFixed(1)}%</p>
                      <p className="text-xs text-gray-500">{formatDate(grade.assessment?.date)}</p>
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
                      <p className="font-medium">{att.session?.class?.name}</p>
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
                      <p className="font-bold text-red-600">{formatCurrency(invoice.balance)}</p>
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
          {attendanceSummary?.data && (
            <div className="grid gap-4 md:grid-cols-4 mb-6">
              <StatCard label="Present" value={attendanceSummary.data.presentCount} icon={CheckCircle} color="text-green-600" bg="bg-green-100" />
              <StatCard label="Absent" value={attendanceSummary.data.absentCount} icon={AlertCircle} color="text-red-600" bg="bg-red-100" />
              <StatCard label="Late" value={attendanceSummary.data.lateCount} icon={Clock} color="text-yellow-600" bg="bg-yellow-100" />
              <StatCard label="Excused" value={attendanceSummary.data.excusedCount} icon={BookOpen} color="text-blue-600" bg="bg-blue-100" />
            </div>
          )}
          <div className="text-center py-8 text-gray-500">
            Detailed attendance view coming soon
          </div>
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
          {gradeSummary?.data && (
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <StatCard label="Average" value={`${gradeSummary.data.averagePercentage?.toFixed(1) || "—"}%`} icon={TrendingUp} color="text-green-600" bg="bg-green-100" />
              <StatCard label="Total Assessments" value={gradeSummary.data.totalAssessments || 0} icon={Award} color="text-blue-600" bg="bg-blue-100" />
              <StatCard label="Passed" value={gradeSummary.data.passedCount || 0} icon={CheckCircle} color="text-green-600" bg="bg-green-100" />
            </div>
          )}
          <div className="text-center py-8 text-gray-500">
            Detailed grade report view coming soon
          </div>
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
            <StatCard label="Total Paid" value={formatCurrency(invoicesData?.data?.reduce((sum: number, i: Invoice) => sum + Number(i.paidAmount), 0) || 0)} icon={CheckCircle} color="text-green-600" bg="bg-green-100" />
            <StatCard label="Balance Due" value={formatCurrency(invoicesData?.data?.reduce((sum: number, i: Invoice) => sum + Number(i.balance), 0) || 0)} icon={AlertCircle} color="text-red-600" bg="bg-red-100" />
            <StatCard label="Overdue" value={formatCurrency(invoicesData?.data?.filter((i: Invoice) => i.status === "OVERDUE").reduce((sum: number, i: Invoice) => sum + Number(i.balance), 0) || 0)} icon={Clock} color="text-yellow-600" bg="bg-yellow-100" />
          </div>
          <div className="text-center py-8 text-gray-500">
            Detailed fee breakdown view coming soon
          </div>
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
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