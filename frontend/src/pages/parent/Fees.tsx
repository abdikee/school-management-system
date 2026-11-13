"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { financeApi, usersApi } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Search, Download, CreditCard, AlertCircle, CheckCircle, Clock, DollarSign, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { cn, formatDate, formatCurrency } from "@/lib/utils";
import { Invoice, Payment, FeeStructure, Student } from "@/types/api";

const parentFeeTabs = [
  { id: "invoices", label: "Invoices", icon: DollarSign },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "fee-structures", label: "Fee Structures", icon: Clock },
] as const;

type ParentFeeTab = (typeof parentFeeTabs)[number]["id"];

export function ParentFees() {
  const [activeTab, setActiveTab] = useState<ParentFeeTab>("invoices");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState("");
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
  // INVOICES
  // ============================================
  const { data: invoicesData, isLoading: invoicesLoading } = useQuery({
    queryKey: ["parent-invoices", selectedChildId, search, statusFilter, page, pageSize],
    queryFn: () => financeApi.getInvoices({
      studentId: selectedChildId || undefined,
      skip: (page - 1) * pageSize,
      take: pageSize,
      search: search || undefined,
      status: statusFilter || undefined,
    }),
    enabled: !!selectedChildId,
  });

  // ============================================
  // PAYMENTS
  // ============================================
  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ["parent-payments", selectedChildId, search, page, pageSize],
    queryFn: () => financeApi.getPayments({
      studentId: selectedChildId || undefined,
      skip: (page - 1) * pageSize,
      take: pageSize,
      search: search || undefined,
    }),
    enabled: !!selectedChildId,
  });

  // ============================================
  // FEE STRUCTURES
  // ============================================
  const { data: feeStructuresData, isLoading: feeStructuresLoading } = useQuery({
    queryKey: ["parent-fee-structures", selectedChildId],
    queryFn: () => financeApi.getFeeStructures({
      gradeLevelId: selectedChild?.gradeLevelId || undefined,
    }),
    enabled: !!selectedChildId,
  });

  if (!selectedChild) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fees</h1>
          <p className="text-gray-600 mt-1">View invoices, payments, and fee structures for your children</p>
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

  const renderTabContent = () => {
    switch (activeTab) {
      case "invoices":
        return renderInvoicesTab();
      case "payments":
        return renderPaymentsTab();
      case "fee-structures":
        return renderFeeStructuresTab();
    }
  };

  const renderInvoicesTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
            <div className="w-full sm:w-48">
              <Label className="block text-sm font-medium mb-1">Status</Label>
              <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
                <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PARTIAL">Partial</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="OVERDUE">Overdue</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg"><AlertCircle className="h-6 w-6 text-red-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Overdue</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(invoicesData?.data?.filter((i: Invoice) => i.status === "OVERDUE").reduce((sum: number, i: Invoice) => sum + Number(i.balance), 0) || 0)}
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
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(invoicesData?.data?.filter((i: Invoice) => i.status === "PENDING").reduce((sum: number, i: Invoice) => sum + Number(i.balance), 0) || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg"><CheckCircle className="h-6 w-6 text-green-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Paid This Term</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(invoicesData?.data?.filter((i: Invoice) => i.status === "PAID").reduce((sum: number, i: Invoice) => sum + Number(i.totalAmount), 0) || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg"><DollarSign className="h-6 w-6 text-blue-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Total Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(invoicesData?.data?.reduce((sum: number, i: Invoice) => sum + Number(i.balance), 0) || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Invoices</h3>
            <Button variant="outline" size="sm" disabled>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Fee Structure</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoicesLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : invoicesData?.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No invoices found
                    </TableCell>
                  </TableRow>
                ) : (
                  invoicesData?.data?.map((invoice: Invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono text-sm">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.feeStructure?.name}</TableCell>
                      <TableCell>{invoice.feeStructure?.academicYear?.name}</TableCell>
                      <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                      <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                      <TableCell>{formatCurrency(invoice.paidAmount)}</TableCell>
                      <TableCell className={Number(invoice.balance) > 0 ? "text-red-600 font-medium" : "text-green-600"}>
                        {formatCurrency(invoice.balance)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getInvoiceStatusVariant(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-primary" disabled>
                          <CreditCard className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {invoicesData && invoicesData.meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Page {invoicesData.meta.page} of {invoicesData.meta.totalPages} ({invoicesData.meta.total} total)
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(invoicesData.meta.totalPages, p + 1))} disabled={page === invoicesData.meta.totalPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderPaymentsTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search payments..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Payment History</h3>
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
                  <TableHead>Invoice</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentsLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : paymentsData?.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No payment history found
                    </TableCell>
                  </TableRow>
                ) : (
                  paymentsData?.data?.map((payment: Payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                      <TableCell className="font-mono text-sm">{payment.invoice?.invoiceNumber}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{payment.paymentMethod}</Badge>
                      </TableCell>
                      <TableCell>{payment.referenceNumber || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={payment.status === "COMPLETED" ? "default" : payment.status === "PENDING" ? "secondary" : "destructive"}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-primary" disabled>
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {paymentsData && paymentsData.meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Page {paymentsData.meta.page} of {paymentsData.meta.totalPages} ({paymentsData.meta.total} total)
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(paymentsData.meta.totalPages, p + 1))} disabled={page === paymentsData.meta.totalPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderFeeStructuresTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Applicable Fee Structures</CardTitle>
        </CardHeader>
        <CardContent>
          {feeStructuresLoading ? (
            <div className="text-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            </div>
          ) : feeStructuresData?.data?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No fee structures found for your child's grade level
            </div>
          ) : (
            <div className="space-y-4">
              {feeStructuresData?.data?.map((fee: FeeStructure) => (
                <Card key={fee.id} className="border-gray-200">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">{fee.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {fee.gradeLevel?.name} • {fee.academicYear?.name} • {fee.frequency}
                        </p>
                        {fee.description && <p className="text-sm text-gray-600 mt-2">{fee.description}</p>}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">{formatCurrency(fee.amount)}</p>
                          <p className="text-xs text-gray-500">per {fee.frequency.toLowerCase()}</p>
                        </div>
                        <Badge variant={fee.isActive ? "default" : "secondary"}>
                          {fee.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fees</h1>
          <p className="text-gray-600 mt-1">
            {selectedChild.user?.firstName} {selectedChild.user?.lastName} • View invoices, payments, and fee structures
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          {parentFeeTabs.map((tab) => (
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