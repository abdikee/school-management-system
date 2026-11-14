"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { financeApi, reportsApi, academicApi, usersApi } from "@/services/api";
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
  Download,
  Edit,
  Trash2,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Receipt,
  CreditCard,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { cn, formatDate, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { FeeStructure, Invoice, Payment, Student, Class } from "@/types/api";
import { useFinanceDashboard, useFeeCollectionReport, useExportFinance } from "@/hooks/useReports";

const financeTabs = [
  { id: "fee-structures", label: "Fee Structures", icon: DollarSign },
  { id: "invoices", label: "Invoices", icon: Receipt },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "reports", label: "Reports", icon: FileText },
] as const;

type FinanceTab = (typeof financeTabs)[number]["id"];

export function AdminFinance() {
  const [activeTab, setActiveTab] = useState<FinanceTab>("fee-structures");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedGradeLevelId, setSelectedGradeLevelId] = useState("");
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState("");
  const [selectedFeeStructureId, setSelectedFeeStructureId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: string } | null>(null);

  const queryClient = useQueryClient();

  // ============================================
  // ACADEMIC YEARS & GRADE LEVELS & CLASSES
  // ============================================
  const { data: academicYearsData } = useQuery({
    queryKey: ["academic-years"],
    queryFn: () => academicApi.getAcademicYears("", { take: 100 }),
  });

  const { data: gradeLevelsData } = useQuery({
    queryKey: ["grade-levels"],
    queryFn: () => academicApi.getGradeLevels("", { take: 100 }),
  });

  const { data: classesData } = useQuery({
    queryKey: ["classes"],
    queryFn: () => academicApi.getClasses({ take: 100 }),
  });

  // ============================================
  // FEE STRUCTURES
  // ============================================
  const { data: feeStructuresData, isLoading: feeStructuresLoading } = useQuery({
    queryKey: ["fee-structures", selectedAcademicYearId, selectedGradeLevelId, page, pageSize],
    queryFn: () => financeApi.getFeeStructures({
      skip: (page - 1) * pageSize,
      take: pageSize,
      academicYearId: selectedAcademicYearId || undefined,
      gradeLevelId: selectedGradeLevelId || undefined,
    }),
  });

  const createFeeStructureMutation = useMutation({
    mutationFn: (data: any) => financeApi.createFeeStructure(data),
    onSuccess: () => {
      toast.success("Fee structure created");
      queryClient.invalidateQueries({ queryKey: ["fee-structures"] });
      setCreateDialogOpen(false);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to create fee structure"),
  });

  const updateFeeStructureMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => financeApi.updateFeeStructure(id, data),
    onSuccess: () => {
      toast.success("Fee structure updated");
      queryClient.invalidateQueries({ queryKey: ["fee-structures"] });
      setEditDialogOpen(false);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to update fee structure"),
  });

  const deleteFeeStructureMutation = useMutation({
    mutationFn: (id: string) => financeApi.deleteFeeStructure(id),
    onSuccess: () => {
      toast.success("Fee structure deleted");
      queryClient.invalidateQueries({ queryKey: ["fee-structures"] });
      setDeleteConfirmOpen(false);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to delete fee structure"),
  });

  // ============================================
  // INVOICES
  // ============================================
  const { data: invoicesData, isLoading: invoicesLoading } = useQuery({
    queryKey: ["invoices", selectedClassId, selectedFeeStructureId, statusFilter, dateFrom, dateTo, page, pageSize],
    queryFn: () => financeApi.getInvoices({
      skip: (page - 1) * pageSize,
      take: pageSize,
      classId: selectedClassId || undefined,
      feeStructureId: selectedFeeStructureId || undefined,
      status: statusFilter || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }),
  });

  const generateInvoicesMutation = useMutation({
    mutationFn: (data: any) => financeApi.generateInvoices(data),
    onSuccess: () => {
      toast.success("Invoices generated");
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to generate invoices"),
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => financeApi.updateInvoice(id, data),
    onSuccess: () => {
      toast.success("Invoice updated");
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setEditDialogOpen(false);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to update invoice"),
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: (id: string) => financeApi.deleteInvoice(id),
    onSuccess: () => {
      toast.success("Invoice deleted");
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setDeleteConfirmOpen(false);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to delete invoice"),
  });

  // ============================================
  // PAYMENTS
  // ============================================
  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ["payments", dateFrom, dateTo, page, pageSize],
    queryFn: () => financeApi.getPayments({
      skip: (page - 1) * pageSize,
      take: pageSize,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }),
  });

  const createPaymentMutation = useMutation({
    mutationFn: (data: any) => financeApi.createPayment(data),
    onSuccess: () => {
      toast.success("Payment recorded");
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setCreateDialogOpen(false);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to record payment"),
  });

  // ============================================
  // REPORTS
  // ============================================
  const { data: financeDashboard, isLoading: dashboardLoading } = useFinanceDashboard({
    academicYearId: selectedAcademicYearId || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const { data: feeCollectionReport, isLoading: feeCollectionLoading } = useFeeCollectionReport({
    academicYearId: selectedAcademicYearId || undefined,
    feeStructureId: selectedFeeStructureId || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const exportFinanceMutation = useExportFinance();

  const handleExportFinance = () => {
    exportFinanceMutation.mutate({
      academicYearId: selectedAcademicYearId || undefined,
      feeStructureId: selectedFeeStructureId || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });
  };

  const handleDelete = (id: string, type: string) => {
    setItemToDelete({ id, type });
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!itemToDelete) return;
    switch (itemToDelete.type) {
      case "fee-structure":
        deleteFeeStructureMutation.mutate(itemToDelete.id);
        break;
      case "invoice":
        deleteInvoiceMutation.mutate(itemToDelete.id);
        break;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "fee-structures":
        return renderFeeStructuresTab();
      case "invoices":
        return renderInvoicesTab();
      case "payments":
        return renderPaymentsTab();
      case "reports":
        return renderReportsTab();
    }
  };

  const renderFeeStructuresTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-64">
              <Label className="block text-sm font-medium mb-1">Academic Year</Label>
              <Select value={selectedAcademicYearId} onValueChange={(value) => { setSelectedAcademicYearId(value); setPage(1); }}>
                <SelectTrigger><SelectValue placeholder="Select year (optional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Years</SelectItem>
                  {academicYearsData?.data?.map((a: any) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-64">
              <Label className="block text-sm font-medium mb-1">Grade Level</Label>
              <Select value={selectedGradeLevelId} onValueChange={(value) => { setSelectedGradeLevelId(value); setPage(1); }}>
                <SelectTrigger><SelectValue placeholder="Select grade (optional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Grades</SelectItem>
                  {gradeLevelsData?.data?.map((g: any) => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search fee structures..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={() => { setSelectedItem(null); setCreateDialogOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                Create Fee Structure
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fee Structures Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Grade Level</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Due Day</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Optional</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeStructuresLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    </TableCell>
                  </TableRow>
                ) : feeStructuresData?.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No fee structures found
                    </TableCell>
                  </TableRow>
                ) : (
                  feeStructuresData?.data?.map((fs: FeeStructure) => (
                    <TableRow key={fs.id}>
                      <TableCell className="font-medium">{fs.name}</TableCell>
                      <TableCell>{fs.academicYear?.name || "—"}</TableCell>
                      <TableCell>{fs.gradeLevel?.name || "All Grades"}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(fs.amount)}</TableCell>
                      <TableCell>{fs.frequency}</TableCell>
                      <TableCell>{fs.dueDay}</TableCell>
                      <TableCell>
                        {fs.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Yes</span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">No</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {fs.isOptional ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Yes</span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">No</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedItem(fs); setCreateDialogOpen(true); }}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(fs.id, "fee-structure")} disabled={deleteFeeStructureMutation.isPending}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {feeStructuresData && feeStructuresData.meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Page {feeStructuresData.meta.page} of {feeStructuresData.meta.totalPages} ({feeStructuresData.meta.total} total)
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(feeStructuresData.meta.totalPages, p + 1))} disabled={page === feeStructuresData.meta.totalPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderInvoicesTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-48">
              <Label className="block text-sm font-medium mb-1">Class</Label>
              <Select value={selectedClassId} onValueChange={(value) => { setSelectedClassId(value); setPage(1); }}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Classes</SelectItem>
                  {classesData?.data?.map((c: Class) => (
                    <SelectItem key={c.id} value={c.id}>{c.name} ({c.gradeLevel?.name})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Label className="block text-sm font-medium mb-1">Fee Structure</Label>
              <Select value={selectedFeeStructureId} onValueChange={(value) => { setSelectedFeeStructureId(value); setPage(1); }}>
                <SelectTrigger><SelectValue placeholder="Select fee structure" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  {feeStructuresData?.data?.map((fs: FeeStructure) => (
                    <SelectItem key={fs.id} value={fs.id}>{fs.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <div className="w-full sm:w-40">
              <Label className="block text-sm font-medium mb-1">Date From</Label>
              <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} />
            </div>
            <div className="w-full sm:w-40">
              <Label className="block text-sm font-medium mb-1">Date To</Label>
              <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} />
            </div>
            <div className="flex items-end gap-2">
              <Button variant="outline" onClick={() => {
                if (!selectedClassId || !selectedFeeStructureId) {
                  toast.error("Please select class and fee structure");
                  return;
                }
                generateInvoicesMutation.mutate({
                  classId: selectedClassId,
                  feeStructureId: selectedFeeStructureId,
                });
              }} disabled={generateInvoicesMutation.isPending}>
                {generateInvoicesMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />} Generate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Fee Structure</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Tax</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoicesLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    </TableCell>
                  </TableRow>
                ) : invoicesData?.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No invoices found
                    </TableCell>
                  </TableRow>
                ) : (
                  invoicesData?.data?.map((invoice: Invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.student?.user?.firstName} {invoice.student?.user?.lastName}</TableCell>
                      <TableCell>{invoice.feeStructure?.name || "—"}</TableCell>
                      <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                      <TableCell>{formatCurrency(invoice.discount)}</TableCell>
                      <TableCell>{formatCurrency(invoice.tax)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(invoice.totalAmount)}</TableCell>
                      <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                      <TableCell>
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                          invoice.status === "PAID" && "bg-green-100 text-green-800",
                          invoice.status === "PENDING" && "bg-yellow-100 text-yellow-800",
                          invoice.status === "PARTIAL" && "bg-blue-100 text-blue-800",
                          invoice.status === "OVERDUE" && "bg-red-100 text-red-800",
                          invoice.status === "CANCELLED" && "bg-gray-100 text-gray-800"
                        )}>
                          {invoice.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedItem(invoice); setCreateDialogOpen(true); }}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(invoice.id, "invoice")} disabled={deleteInvoiceMutation.isPending}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                        </div>
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
            <div className="w-full sm:w-40">
              <Label className="block text-sm font-medium mb-1">Date From</Label>
              <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} />
            </div>
            <div className="w-full sm:w-40">
              <Label className="block text-sm font-medium mb-1">Date To</Label>
              <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} />
            </div>
            <div className="flex items-end">
              <Button onClick={() => { setSelectedItem(null); setCreateDialogOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                Record Payment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Recorded By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentsLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    </TableCell>
                  </TableRow>
                ) : paymentsData?.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No payments found
                    </TableCell>
                  </TableRow>
                ) : (
                  paymentsData?.data?.map((payment: Payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{formatDate(payment.paidAt)}</TableCell>
                      <TableCell>{payment.invoice?.invoiceNumber || "—"}</TableCell>
                      <TableCell>{payment.invoice?.student?.user?.firstName} {payment.invoice?.student?.user?.lastName}</TableCell>
                      <TableCell className="font-medium text-green-600">{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {payment.method}
                        </span>
                      </TableCell>
                      <TableCell>{payment.transactionId || "—"}</TableCell>
                      <TableCell>{payment.recordedBy?.firstName} {payment.recordedBy?.lastName}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedItem(payment); setCreateDialogOpen(true); }}><Eye className="h-4 w-4" /></Button>
                        </div>
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

  const renderReportsTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-64">
              <Label className="block text-sm font-medium mb-1">Academic Year</Label>
              <Select value={selectedAcademicYearId} onValueChange={(value) => { setSelectedAcademicYearId(value); }}>
                <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Current Year</SelectItem>
                  {academicYearsData?.data?.map((a: any) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Label className="block text-sm font-medium mb-1">Fee Structure</Label>
              <Select value={selectedFeeStructureId} onValueChange={setSelectedFeeStructureId}>
                <SelectTrigger><SelectValue placeholder="Select fee structure (optional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  {feeStructuresData?.data?.map((fs: FeeStructure) => (
                    <SelectItem key={fs.id} value={fs.id}>{fs.name}</SelectItem>
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
              <Button onClick={handleExportFinance} disabled={exportFinanceMutation.isPending}>
                {exportFinanceMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />} Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Summary */}
      {financeDashboard && !dashboardLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{formatCurrency(financeDashboard.collectedAmount)}</p>
                <p className="text-sm text-gray-500">Collected</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600">{formatCurrency(financeDashboard.pendingAmount)}</p>
                <p className="text-sm text-gray-500">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">{formatCurrency(financeDashboard.overdueAmount)}</p>
                <p className="text-sm text-gray-500">Overdue</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{formatCurrency(financeDashboard.totalRevenue)}</p>
                <p className="text-sm text-gray-500">Total Revenue</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">{financeDashboard.recentPayments?.length || 0}</p>
                <p className="text-sm text-gray-500">Recent Payments</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* By Fee Structure */}
      {financeDashboard && !dashboardLoading && financeDashboard.byFeeStructure && financeDashboard.byFeeStructure.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Fee Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fee Structure</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Collected</TableHead>
                    <TableHead>Pending</TableHead>
                    <TableHead>Overdue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financeDashboard.byFeeStructure.map((fs: any) => (
                    <TableRow key={fs.feeStructure.id}>
                      <TableCell className="font-medium">{fs.feeStructure.name}</TableCell>
                      <TableCell>{formatCurrency(fs.total)}</TableCell>
                      <TableCell className="text-green-600 font-medium">{formatCurrency(fs.collected)}</TableCell>
                      <TableCell className="text-yellow-600 font-medium">{formatCurrency(fs.pending)}</TableCell>
                      <TableCell className="text-red-600 font-medium">{formatCurrency(fs.overdue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fee Collection Report */}
      {feeCollectionReport && !feeCollectionLoading && feeCollectionReport.invoices && feeCollectionReport.invoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Fee Collection Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Fee Structure</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Outstanding</TableHead>
                    <TableHead>Last Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeCollectionReport.invoices.map((item: any) => (
                    <TableRow key={item.invoice.id}>
                      <TableCell className="font-medium">{item.invoice.invoiceNumber}</TableCell>
                      <TableCell>{item.student?.user?.firstName} {item.student?.user?.lastName}</TableCell>
                      <TableCell>{item.feeStructure?.name || "—"}</TableCell>
                      <TableCell>{formatCurrency(item.amount)}</TableCell>
                      <TableCell className="text-green-600 font-medium">{formatCurrency(item.paidAmount)}</TableCell>
                      <TableCell className="text-red-600 font-medium">{formatCurrency(item.outstanding)}</TableCell>
                      <TableCell>{item.lastPaymentDate ? formatDate(item.lastPaymentDate) : "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Payments */}
      {financeDashboard && !dashboardLoading && financeDashboard.recentPayments && financeDashboard.recentPayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financeDashboard.recentPayments.slice(0, 10).map((payment: Payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{formatDate(payment.paidAt)}</TableCell>
                      <TableCell>{payment.invoice?.invoiceNumber || "—"}</TableCell>
                      <TableCell>{payment.invoice?.student?.user?.firstName} {payment.invoice?.student?.user?.lastName}</TableCell>
                      <TableCell className="text-green-600 font-medium">{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>{payment.method}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {!financeDashboard && (
        <Card>
          <CardContent className="pt-6 text-center py-8">
            <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Select filters to view finance reports</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Finance Management</h1>
          <p className="text-gray-600 mt-1">
            Manage fee structures, invoices, payments, and view financial reports
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          {financeTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center justify-center gap-2">
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {renderTabContent()}
      </Tabs>

      {/* Create/Edit Dialogs */}
      <Dialog open={createDialogOpen || editDialogOpen} onOpenChange={(open) => { if (!open) { setCreateDialogOpen(false); setEditDialogOpen(false); setSelectedItem(null); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedItem ? "Edit" : "Create"} {activeTab === "fee-structures" ? "Fee Structure" : activeTab === "invoices" ? "Invoice" : "Payment"}</DialogTitle>
            <DialogDescription>
              {selectedItem ? "Update the details below." : "Fill in the details below to create a new record."}
            </DialogDescription>
          </DialogHeader>
          {activeTab === "fee-structures" && (
            <FeeStructureForm
              feeStructure={selectedItem}
              academicYears={academicYearsData?.data || []}
              gradeLevels={gradeLevelsData?.data || []}
              onSubmit={(data) => {
                if (selectedItem) {
                  updateFeeStructureMutation.mutate({ id: selectedItem.id, data });
                } else {
                  createFeeStructureMutation.mutate(data);
                }
              }}
              isLoading={createFeeStructureMutation.isPending || updateFeeStructureMutation.isPending}
              onClose={() => { setCreateDialogOpen(false); setEditDialogOpen(false); setSelectedItem(null); }}
            />
          )}
          {activeTab === "invoices" && (
            <InvoiceForm
              invoice={selectedItem}
              feeStructures={feeStructuresData?.data || []}
              onSubmit={(data) => {
                if (selectedItem) {
                  updateInvoiceMutation.mutate({ id: selectedItem.id, data });
                }
              }}
              isLoading={updateInvoiceMutation.isPending}
              onClose={() => { setCreateDialogOpen(false); setEditDialogOpen(false); setSelectedItem(null); }}
            />
          )}
          {activeTab === "payments" && (
            <PaymentForm
              payment={selectedItem}
              invoices={invoicesData?.data || []}
              onSubmit={(data) => {
                createPaymentMutation.mutate(data);
              }}
              isLoading={createPaymentMutation.isPending}
              onClose={() => { setCreateDialogOpen(false); setEditDialogOpen(false); setSelectedItem(null); }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleteFeeStructureMutation.isPending || deleteInvoiceMutation.isPending}>
              {deleteFeeStructureMutation.isPending || deleteInvoiceMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Fee Structure Form
function FeeStructureForm({
  feeStructure,
  academicYears,
  gradeLevels,
  onSubmit,
  isLoading,
  onClose,
}: {
  feeStructure: any;
  academicYears: any[];
  gradeLevels: any[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
  onClose: () => void;
}) {
  const form = useForm({
    resolver: zodResolver(
      z.object({
        name: z.string().min(1, "Name is required"),
        description: z.string().optional(),
        amount: z.number().min(1, "Amount must be at least 1"),
        frequency: z.enum(["MONTHLY", "QUARTERLY", "SEMI_ANNUAL", "ANNUAL", "ONE_TIME"]),
        gradeLevelId: z.string().optional(),
        academicYearId: z.string().min(1, "Academic year is required"),
        dueDay: z.number().min(1).max(31).default(1),
        isActive: z.boolean().default(true),
        isOptional: z.boolean().default(false),
      })
    ),
    defaultValues: feeStructure || {
      name: "",
      description: "",
      amount: 0,
      frequency: "MONTHLY",
      gradeLevelId: "",
      academicYearId: academicYears.find(a => a.isCurrent)?.id || academicYears[0]?.id || "",
      dueDay: 1,
      isActive: true,
      isOptional: false,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem><FormLabel>Name *</FormLabel><FormControl><Input placeholder="e.g., Tuition Fee - Term 1" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="grid gap-4 md:grid-cols-2">
          <FormField control={form.control} name="amount" render={({ field }) => (
            <FormItem><FormLabel>Amount *</FormLabel><FormControl><Input type="number" min="0.01" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="frequency" render={({ field }) => (
            <FormItem><FormLabel>Frequency *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                  <SelectItem value="SEMI_ANNUAL">Semi-Annual</SelectItem>
                  <SelectItem value="ANNUAL">Annual</SelectItem>
                  <SelectItem value="ONE_TIME">One Time</SelectItem>
                </SelectContent>
              </Select>
            <FormMessage /></FormItem>
          )} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField control={form.control} name="academicYearId" render={({ field }) => (
            <FormItem><FormLabel>Academic Year *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger></FormControl>
                <SelectContent>
                  {academicYears.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            <FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="gradeLevelId" render={({ field }) => (
            <FormItem><FormLabel>Grade Level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select grade (optional)" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="">All Grades</SelectItem>
                  {gradeLevels.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                </SelectContent>
              </Select>
            <FormMessage /></FormItem>
          )} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField control={form.control} name="dueDay" render={({ field }) => (
            <FormItem><FormLabel>Due Day *</FormLabel><FormControl><Input type="number" min="1" max="31" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <div className="flex gap-4">
          <FormField control={form.control} name="isActive" render={({ field }) => (
            <FormItem className="flex items-center">
              <FormControl>
                <label className="flex items-center gap-2">
                  <input type="checkbox" {...field} defaultChecked /> <FormLabel>Active</FormLabel>
                </label>
              </FormControl>
            </FormItem>
          )} />
          <FormField control={form.control} name="isOptional" render={({ field }) => (
            <FormItem className="flex items-center">
              <FormControl>
                <label className="flex items-center gap-2">
                  <input type="checkbox" {...field} /> <FormLabel>Optional</FormLabel>
                </label>
              </FormControl>
            </FormItem>
          )} />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : (feeStructure ? "Update" : "Create")}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

// Invoice Form (limited editable fields)
function InvoiceForm({
  invoice,
  feeStructures,
  onSubmit,
  isLoading,
  onClose,
}: {
  invoice: any;
  feeStructures: any[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
  onClose: () => void;
}) {
  const form = useForm({
    resolver: zodResolver(
      z.object({
        discount: z.number().min(0).default(0),
        tax: z.number().min(0).default(0),
        dueDate: z.string().min(1, "Due date is required"),
        status: z.enum(["PENDING", "PARTIAL", "PAID", "OVERDUE", "CANCELLED"]),
        description: z.string().optional(),
      })
    ),
    defaultValues: invoice || {
      discount: 0,
      tax: 0,
      dueDate: new Date().toISOString().split("T")[0],
      status: "PENDING",
      description: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField control={form.control} name="discount" render={({ field }) => (
            <FormItem><FormLabel>Discount</FormLabel><FormControl><Input type="number" min="0" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="tax" render={({ field }) => (
            <FormItem><FormLabel>Tax</FormLabel><FormControl><Input type="number" min="0" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={form.control} name="dueDate" render={({ field }) => (
          <FormItem><FormLabel>Due Date *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="status" render={({ field }) => (
          <FormItem><FormLabel>Status</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PARTIAL">Partial</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          <FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Update"}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

// Payment Form
function PaymentForm({
  payment,
  invoices,
  onSubmit,
  isLoading,
  onClose,
}: {
  payment: any;
  invoices: any[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
  onClose: () => void;
}) {
  const form = useForm({
    resolver: zodResolver(
      z.object({
        invoiceId: z.string().min(1, "Invoice is required"),
        amount: z.number().min(0.01, "Amount must be greater than 0"),
        method: z.enum(["CASH", "CARD", "BANK_TRANSFER", "MOBILE_MONEY", "CHECK", "OTHER"]),
        transactionId: z.string().optional(),
        reference: z.string().optional(),
        paidAt: z.string().min(1, "Payment date is required"),
        notes: z.string().optional(),
      })
    ),
    defaultValues: payment || {
      invoiceId: "",
      amount: 0,
      method: "CASH",
      transactionId: "",
      reference: "",
      paidAt: new Date().toISOString().split("T")[0],
      notes: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="invoiceId" render={({ field }) => (
          <FormItem><FormLabel>Invoice *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select invoice" /></SelectTrigger></FormControl>
              <SelectContent>
                {invoices.filter(i => i.status !== "PAID" && i.status !== "CANCELLED").map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.invoiceNumber} - {i.student?.user?.firstName} {i.student?.user?.lastName} ({i.totalAmount})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          <FormMessage /></FormItem>
        )} />
        <div className="grid gap-4 md:grid-cols-2">
          <FormField control={form.control} name="amount" render={({ field }) => (
            <FormItem><FormLabel>Amount *</FormLabel><FormControl><Input type="number" min="0.01" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="method" render={({ field }) => (
            <FormItem><FormLabel>Method *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="CARD">Card</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                  <SelectItem value="CHECK">Check</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            <FormMessage /></FormItem>
          )} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField control={form.control} name="transactionId" render={({ field }) => (
            <FormItem><FormLabel>Transaction ID</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="reference" render={({ field }) => (
            <FormItem><FormLabel>Reference</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={form.control} name="paidAt" render={({ field }) => (
          <FormItem><FormLabel>Payment Date *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem><FormLabel>Notes</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Record Payment"}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}