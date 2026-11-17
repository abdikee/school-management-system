"use client";

import React, { useState } from "react";
import { useFinanceDashboard, useFeeCollectionReport } from "@/hooks/useReports";
import {
  FinanceChart,
} from "@/components/charts/AttendanceChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useExportFinance,
} from "@/hooks/useReports";
import { Download, RefreshCw, DollarSign, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export function AdminFinanceReports() {
  const [dateFrom, setDateFrom] = useState(() => format(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"));
  const [dateTo, setDateTo] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [schoolId, setSchoolId] = useState("");
  const [academicYearId, setAcademicYearId] = useState("");
  const [feeStructureId, setFeeStructureId] = useState("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "collection">("dashboard");

  const { data: dashboard, isLoading: dashboardLoading, refetch: refetchDashboard } = useFinanceDashboard({
    schoolId: schoolId || undefined,
    academicYearId: academicYearId || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const { data: feeCollection, isLoading: feeCollectionLoading, refetch: refetchFeeCollection } = useFeeCollectionReport({
    schoolId: schoolId || undefined,
    academicYearId: academicYearId || undefined,
    feeStructureId: feeStructureId || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const exportFinance = useExportFinance();

  const handleRefresh = () => {
    refetchDashboard();
    refetchFeeCollection();
  };

  const handleExport = () => {
    exportFinance.mutate({
      schoolId: schoolId || undefined,
      academicYearId: academicYearId || undefined,
      feeStructureId: feeStructureId || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });
  };

  const financeData = dashboard || {
    totalRevenue: 0,
    pendingAmount: 0,
    overdueAmount: 0,
    collectedAmount: 0,
    byFeeStructure: [],
    recentPayments: []
  };
  const byFeeStructure = financeData.byFeeStructure || [];
  const monthlyRevenue = dashboard?.monthlyRevenue || [];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Filters</CardTitle>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={dashboardLoading || feeCollectionLoading}>
            <RefreshCw className={cn("mr-2 h-4 w-4", (dashboardLoading || feeCollectionLoading) && "animate-spin")} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <div>
            <label className="block text-sm font-medium mb-1">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
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
            <label className="block text-sm font-medium mb-1">Fee Structure</label>
            <Select value={feeStructureId} onValueChange={setFeeStructureId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Structures" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Structures</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 lg:col-span-1 flex items-end">
            <Button onClick={handleExport} disabled={exportFinance.isPending} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              {exportFinance.isPending ? "Exporting..." : "Export CSV"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={cn(
              "py-2 px-1 text-sm font-medium border-b-2 transition-colors",
              activeTab === "dashboard"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
            )}
          >
            Finance Dashboard
          </button>
          <button
            onClick={() => setActiveTab("collection")}
            className={cn(
              "py-2 px-1 text-sm font-medium border-b-2 transition-colors",
              activeTab === "collection"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
            )}
          >
            Fee Collection
          </button>
        </nav>
      </div>

      {activeTab === "dashboard" && (
        <>
          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  ${(financeData.totalRevenue || 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">
                  ${(financeData.pendingAmount || 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  Overdue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  ${(financeData.overdueAmount || 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Collected</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">${(financeData.collectedAmount || 0).toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Fee Structures</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{byFeeStructure.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Recent Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{financeData.recentPayments?.length || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Monthly Revenue */}
            <Card className="col-span-4 lg:col-span-4">
              <CardHeader>
                <CardTitle>Monthly Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardLoading ? (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading...</div>
                ) : (
                  <FinanceChart
                    data={monthlyRevenue}
                    height={300}
                  />
                )}
              </CardContent>
            </Card>

            {/* Revenue by Fee Structure */}
            <Card className="col-span-3 lg:col-span-3">
              <CardHeader>
                <CardTitle>Revenue by Fee Structure</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardLoading ? (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading...</div>
                ) : byFeeStructure.length > 0 ? (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {byFeeStructure.map((fs: any) => (
                      <div key={fs.feeStructure?.id} className="p-3 bg-muted/50 rounded-lg">
                        <p className="font-medium">{fs.feeStructure?.name || "Unknown"}</p>
                        <p className="text-sm text-muted-foreground">{fs.feeStructure?.frequency || ""}</p>
                        <div className="flex justify-between mt-2">
                          <span className="text-lg font-bold text-primary">${(fs.total || 0).toLocaleString()}</span>
                          <span className="text-sm text-muted-foreground">{fs.collected ? `${fs.collected} collected` : ""}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No fee structure data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {activeTab === "collection" && (
        <Card>
          <CardHeader>
            <CardTitle>Fee Collection Report</CardTitle>
          </CardHeader>
          <CardContent>
            {feeCollectionLoading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading...</div>
            ) : feeCollection ? (
              <>
                {/* Summary */}
                <div className="grid gap-4 md:grid-cols-4 mb-6">
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Total Invoiced</p>
                      <p className="text-3xl font-bold">${(feeCollection.summary?.totalAmount || 0).toLocaleString()}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Collected</p>
                      <p className="text-3xl font-bold text-green-600">${(feeCollection.summary?.collectedAmount || 0).toLocaleString()}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Outstanding</p>
                      <p className="text-3xl font-bold text-red-600">${(feeCollection.summary?.outstandingAmount || 0).toLocaleString()}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Collection Rate</p>
                      <p className="text-3xl font-bold text-primary">
                        {(feeCollection.summary?.totalAmount && feeCollection.summary?.collectedAmount
                          ? ((feeCollection.summary.collectedAmount / feeCollection.summary.totalAmount) * 100).toFixed(1)
                          : 0)}%
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Invoice Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 font-medium">Invoice #</th>
                        <th className="text-left p-3 font-medium">Student</th>
                        <th className="text-left p-3 font-medium">Class</th>
                        <th className="text-left p-3 font-medium">Parent</th>
                        <th className="text-left p-3 font-medium">Fee Structure</th>
                        <th className="text-right p-3 font-medium">Amount</th>
                        <th className="text-right p-3 font-medium">Paid</th>
                        <th className="text-right p-3 font-medium">Outstanding</th>
                        <th className="text-center p-3 font-medium">Status</th>
                        <th className="text-center p-3 font-medium">Due Date</th>
                        <th className="text-center p-3 font-medium">Last Payment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feeCollection.invoices?.map((inv: any) => (
                        <tr key={inv.invoice?.id} className="border-b border-border/50">
                          <td className="p-3 font-mono text-sm">{inv.invoice?.invoiceNumber}</td>
                          <td className="p-3">
                            <div className="font-medium">{inv.student?.name}</div>
                            <div className="text-sm text-muted-foreground">{inv.student?.studentId}</div>
                          </td>
                          <td className="p-3">{inv.student?.class || "-"}</td>
                          <td className="p-3">{inv.parent?.name || "-"}</td>
                          <td className="p-3">
                            <div className="font-medium">{inv.feeStructure?.name}</div>
                            <div className="text-sm text-muted-foreground">{inv.feeStructure?.frequency}</div>
                          </td>
                          <td className="text-right p-3">${(inv.amount || 0).toLocaleString()}</td>
                          <td className="text-right p-3 text-green-600">${(inv.paidAmount || 0).toLocaleString()}</td>
                          <td className="text-right p-3 text-red-600">${(inv.outstanding || 0).toLocaleString()}</td>
                          <td className="text-center p-3">
                            <span className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                              inv.invoice?.status === "PAID" && "bg-green-100 text-green-800",
                              inv.invoice?.status === "PENDING" && "bg-yellow-100 text-yellow-800",
                              inv.invoice?.status === "OVERDUE" && "bg-red-100 text-red-800",
                              inv.invoice?.status === "PARTIAL" && "bg-blue-100 text-blue-800",
                              inv.invoice?.status === "CANCELLED" && "bg-gray-100 text-gray-800"
                            )}>
                              {inv.invoice?.status}
                            </span>
                          </td>
                          <td className="text-center p-3">{inv.invoice?.dueDate ? format(new Date(inv.invoice.dueDate), "MMM dd, yyyy") : "-"}</td>
                          <td className="text-center p-3">{inv.lastPaymentDate ? format(new Date(inv.lastPaymentDate), "MMM dd, yyyy") : "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p className="text-center py-8 text-muted-foreground">No fee collection data available</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}