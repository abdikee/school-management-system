import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  FileText,
  Loader2,
  ReceiptText,
  Search,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";
import { financeApi } from "@/services/api";
import type { Invoice, Payment, PaymentMethod } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type CashierPortalProps = { initialTab?: "overview" | "payments" };

const paymentMethods: PaymentMethod[] = ["CASH", "CARD", "BANK_TRANSFER", "MOBILE_MONEY", "CHECK", "OTHER"];

const formatCurrency = (amount = 0) => `ETB ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function GlassPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <Card className={`glass portal-card bg-white/70 backdrop-blur-xl ${className}`}>{children}</Card>;
}

export function CashierPortal({ initialTab = "overview" }: CashierPortalProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const queryClient = useQueryClient();

  const invoicesQuery = useQuery({
    queryKey: ["cashier-invoices", search, status],
    queryFn: () => financeApi.getInvoices({
      take: 50,
      search: search || undefined,
      status: status === "ALL" ? undefined : status,
    }),
  });
  const paymentsQuery = useQuery({
    queryKey: ["cashier-payments"],
    queryFn: () => financeApi.getPayments({ take: 50 }),
  });

  const paymentMutation = useMutation({
    mutationFn: (data: { invoiceId: string; amount: number; method: string; reference?: string; notes?: string }) =>
      financeApi.createPayment(data),
    onSuccess: () => {
      toast.success("Payment recorded successfully");
      queryClient.invalidateQueries({ queryKey: ["cashier-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["cashier-payments"] });
      setSelectedInvoice(null);
      setAmount("");
      setReference("");
      setNotes("");
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Unable to record payment"),
  });

  const invoices = invoicesQuery.data?.data || [];
  const payments = paymentsQuery.data?.data || [];
  const outstanding = invoices.reduce((sum, invoice) => sum + (invoice.balance ?? invoice.totalAmount), 0);
  const collected = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const pendingInvoices = invoices.filter((invoice) => invoice.status !== "PAID" && invoice.status !== "CANCELLED").length;
  const todayPayments = payments.filter((payment) => new Date(payment.paidAt).toDateString() === new Date().toDateString());
  const selectedBalance = selectedInvoice?.balance ?? selectedInvoice?.totalAmount ?? 0;
  const canSubmit = selectedInvoice && Number(amount) > 0 && Number(amount) <= selectedBalance && !paymentMutation.isPending;

  const recentPayments = useMemo(() => payments.slice(0, 8), [payments]);

  const openPaymentDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setAmount(String(invoice.balance ?? invoice.totalAmount));
  };

  const recordPayment = () => {
    if (!selectedInvoice || !canSubmit) return;
    paymentMutation.mutate({
      invoiceId: selectedInvoice.id,
      amount: Number(amount),
      method,
      reference: reference || undefined,
      notes: notes || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#092f2b] px-6 py-7 text-white shadow-2xl shadow-emerald-950/10 sm:px-8 sm:py-9">
        <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300"><WalletCards className="h-4 w-4" /> Cashier desk</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Receive and reconcile payments.</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-100/70">Find an invoice, record an authorized payment, and issue a receipt without accessing finance configuration.</p>
          </div>
          <Button onClick={() => setActiveTab("payments")} className="rounded-xl bg-emerald-300 text-[#092f2b] hover:bg-emerald-200"><ReceiptText className="mr-2 h-4 w-4" />Payment history</Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Today collected", value: formatCurrency(todayPayments.reduce((sum, payment) => sum + payment.amount, 0)), icon: CheckCircle2, tone: "bg-emerald-600" },
          { label: "Recent collection", value: formatCurrency(collected), icon: CircleDollarSign, tone: "bg-teal-600" },
          { label: "Outstanding in view", value: formatCurrency(outstanding), icon: WalletCards, tone: "bg-amber-500" },
          { label: "Open invoices", value: pendingInvoices.toLocaleString(), icon: FileText, tone: "bg-indigo-500" },
        ].map((metric) => (
          <GlassPanel key={metric.label}>
            <CardContent className="flex items-center justify-between p-5">
              <div><p className="text-sm text-slate-500">{metric.label}</p><p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{metric.value}</p></div>
              <span className={`rounded-2xl p-3 ${metric.tone}`}><metric.icon className="h-5 w-5 text-white" /></span>
            </CardContent>
          </GlassPanel>
        ))}
      </section>

      <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/60 p-1 shadow-sm backdrop-blur-xl">
        {(["overview", "payments"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition ${activeTab === tab ? "bg-emerald-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-900"}`}>{tab}</button>
        ))}
      </div>

      <GlassPanel>
        <CardContent className="p-5 sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div><p className="text-sm font-semibold text-emerald-700">{activeTab === "payments" ? "Payment history" : "Collection queue"}</p><h2 className="mt-1 text-xl font-semibold text-slate-950">{activeTab === "payments" ? "Recent transactions" : "Find an invoice to collect"}</h2></div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search invoice or student" className="pl-9 sm:w-64" /></div>
              <Select value={status} onValueChange={setStatus}><SelectTrigger className="sm:w-40"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="ALL">All statuses</SelectItem><SelectItem value="PENDING">Pending</SelectItem><SelectItem value="PARTIAL">Partial</SelectItem><SelectItem value="PAID">Paid</SelectItem><SelectItem value="OVERDUE">Overdue</SelectItem></SelectContent></Select>
            </div>
          </div>

          {activeTab === "payments" ? (
            <div className="mt-6 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-slate-200 text-xs uppercase tracking-[0.12em] text-slate-500"><th className="px-3 py-3">Invoice</th><th className="px-3 py-3">Student</th><th className="px-3 py-3">Method</th><th className="px-3 py-3">Amount</th><th className="px-3 py-3">Date</th></tr></thead><tbody>{recentPayments.map((payment: Payment) => <tr key={payment.id} className="border-b border-slate-100 hover:bg-emerald-50/50"><td className="px-3 py-4 font-semibold text-slate-800">{payment.invoice?.invoiceNumber || payment.invoiceId.slice(0, 8)}</td><td className="px-3 py-4 text-slate-600">{payment.invoice?.student?.user?.firstName} {payment.invoice?.student?.user?.lastName}</td><td className="px-3 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{payment.method.replace("_", " ")}</span></td><td className="px-3 py-4 font-semibold text-emerald-700">{formatCurrency(payment.amount)}</td><td className="px-3 py-4 text-slate-500">{new Date(payment.paidAt).toLocaleDateString()}</td></tr>)}</tbody></table>{recentPayments.length === 0 && <p className="py-12 text-center text-sm text-slate-500">No payments found.</p>}</div>
          ) : (
            <div className="mt-6 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-slate-200 text-xs uppercase tracking-[0.12em] text-slate-500"><th className="px-3 py-3">Invoice</th><th className="px-3 py-3">Student</th><th className="px-3 py-3">Total</th><th className="px-3 py-3">Balance</th><th className="px-3 py-3">Status</th><th className="px-3 py-3 text-right">Action</th></tr></thead><tbody>{invoices.map((invoice: Invoice) => <tr key={invoice.id} className="border-b border-slate-100 hover:bg-emerald-50/50"><td className="px-3 py-4 font-semibold text-slate-800">{invoice.invoiceNumber}</td><td className="px-3 py-4 text-slate-600">{invoice.student?.user?.firstName} {invoice.student?.user?.lastName}</td><td className="px-3 py-4 text-slate-700">{formatCurrency(invoice.totalAmount)}</td><td className="px-3 py-4 font-semibold text-amber-700">{formatCurrency(invoice.balance ?? invoice.totalAmount)}</td><td className="px-3 py-4"><span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">{invoice.status}</span></td><td className="px-3 py-4 text-right"><Button size="sm" onClick={() => openPaymentDialog(invoice)} disabled={invoice.status === "PAID" || invoice.status === "CANCELLED"} className="rounded-lg bg-emerald-600 hover:bg-emerald-700">Record payment</Button></td></tr>)}</tbody></table>{invoices.length === 0 && <p className="py-12 text-center text-sm text-slate-500">{invoicesQuery.isLoading ? "Loading invoices..." : "No invoices found."}</p>}</div>
          )}
        </CardContent>
      </GlassPanel>

      <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
        <DialogContent className="rounded-2xl sm:max-w-lg">
          <DialogHeader><DialogTitle>Record payment</DialogTitle><DialogDescription>{selectedInvoice?.invoiceNumber} · Balance {formatCurrency(selectedBalance)}</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div><label className="mb-2 block text-sm font-medium text-slate-700">Amount</label><Input type="number" min="0.01" max={selectedBalance} value={amount} onChange={(event) => setAmount(event.target.value)} /></div>
            <div><label className="mb-2 block text-sm font-medium text-slate-700">Payment method</label><Select value={method} onValueChange={(value) => setMethod(value as PaymentMethod)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{paymentMethods.map((item) => <SelectItem key={item} value={item}>{item.replace("_", " ")}</SelectItem>)}</SelectContent></Select></div>
            <div><label className="mb-2 block text-sm font-medium text-slate-700">Reference (optional)</label><Input value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Receipt or transaction reference" /></div>
            <div><label className="mb-2 block text-sm font-medium text-slate-700">Notes (optional)</label><Input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Internal note" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setSelectedInvoice(null)}>Cancel</Button><Button onClick={recordPayment} disabled={!canSubmit} className="bg-emerald-600 hover:bg-emerald-700">{paymentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Confirm payment</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
