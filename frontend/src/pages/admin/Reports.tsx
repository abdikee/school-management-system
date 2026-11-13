"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminAttendanceReports } from "./reports/AttendanceReports";
import { AdminGradeReports } from "./reports/GradeReports";
import { AdminFinanceReports } from "./reports/FinanceReports";
import { AdminEnrollmentReports } from "./reports/EnrollmentReports";
import { ClipboardCheck, Award, DollarSign, Users, GraduationCap, Building2, BarChart3, TrendingUp } from "lucide-react";

const reportTabs = [
  { id: "attendance", label: "Attendance", icon: ClipboardCheck, component: AdminAttendanceReports },
  { id: "grades", label: "Grades", icon: Award, component: AdminGradeReports },
  { id: "finance", label: "Finance", icon: DollarSign, component: AdminFinanceReports },
  { id: "enrollment", label: "Enrollment", icon: Users, component: AdminEnrollmentReports },
] as const;

type ReportTabId = (typeof reportTabs)[number]["id"];

export function AdminReports() {
  const [activeTab, setActiveTab] = useState<ReportTabId>(reportTabs[0].id);

  const handleTabChange = (value: string) => {
    setActiveTab(value as ReportTabId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive reports and analytics for school management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleString()}</span>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-blue-600" />
              Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">View attendance reports, trends, and class summaries</p>
            <p className="text-sm text-muted-foreground mt-2">Track student attendance across all classes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Award className="h-4 w-4 text-green-600" />
              Grades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">View grade distributions, subject averages, and assessments</p>
            <p className="text-sm text-muted-foreground mt-2">Analyze academic performance across subjects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-yellow-600" />
              Finance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">View revenue, fee collections, and invoice status</p>
            <p className="text-sm text-muted-foreground mt-2">Monitor financial health and fee payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              Enrollment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">View enrollment trends, class utilization, and teacher workload</p>
            <p className="text-sm text-muted-foreground mt-2">Track student enrollment and teacher allocation</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Report Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4">
          {reportTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center justify-center gap-2">
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {reportTabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-4">
            <React.Suspense fallback={<div className="flex items-center justify-center h-[400px]">Loading {tab.label} reports...</div>}>
              <tab.component />
            </React.Suspense>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}