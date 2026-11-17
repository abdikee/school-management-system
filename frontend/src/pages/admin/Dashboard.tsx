import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Building2, CalendarDays, CheckCircle2, ChevronRight, DollarSign, GraduationCap, Megaphone, RefreshCw, Users } from "lucide-react";
import { academicApi, communicationApi, reportsApi, usersApi } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useDashboardOverview } from "@/hooks/useReports";
import type { Announcement, Class, Student } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const palette = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6"];

const formatCurrency = (value?: number) => {
  const amount = value ?? 0;
  return amount >= 1000000 ? `$${(amount / 1000000).toFixed(1)}M` : amount >= 1000 ? `$${(amount / 1000).toFixed(1)}K` : `$${amount.toLocaleString()}`;
};

const formatDate = (value: string) => new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));

export function AdminDashboard() {
  const { user } = useAuth();
  const dashboardQuery = useDashboardOverview({ schoolId: user?.schoolId });
  const announcementsQuery = useQuery({ queryKey: ["admin-dashboard-announcements"], queryFn: () => communicationApi.getAnnouncements({ take: 5 }) });
  const classesQuery = useQuery({ queryKey: ["admin-dashboard-classes"], queryFn: () => academicApi.getClasses({ take: 100 }) });
  const studentsQuery = useQuery({ queryKey: ["admin-dashboard-students"], queryFn: () => usersApi.getStudents({ take: 5 }) });
  const gradesQuery = useQuery({ queryKey: ["admin-dashboard-grades"], queryFn: () => reportsApi.getGradeSummary({ schoolId: user?.schoolId }) });

  const dashboard = dashboardQuery.data;
  const attendanceRecords = dashboard?.attendance?.records ?? 0;
  const attendanceRate = dashboard?.attendance?.rate ?? 0;
  const attendanceData = [
    { name: "Present", value: Math.round(attendanceRecords * attendanceRate / 100) },
    { name: "Absent", value: Math.max(0, attendanceRecords - Math.round(attendanceRecords * attendanceRate / 100)) },
  ];
  const subjectGrades = gradesQuery.data?.bySubject?.slice(0, 6).map((item) => ({ name: item.subject.name, average: Number(item.average.toFixed(1)) })) ?? [];
  const classes = classesQuery.data?.data ?? [];
  const students = studentsQuery.data?.data ?? [];
  const announcements = announcementsQuery.data?.data ?? [];
  const isLoading = dashboardQuery.isLoading;

  if (isLoading) {
    return <div className="space-y-6"><div className="h-28 animate-pulse rounded-3xl bg-emerald-100" /><div className="grid gap-6 lg:grid-cols-2">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-72 animate-pulse rounded-3xl bg-white" />)}</div></div>;
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-7 text-white shadow-xl shadow-slate-950/10 sm:px-8">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">Administration</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">School dashboard</h1><p className="mt-2 text-sm text-slate-300">Manage students, academics, finance, attendance, and communication from one workspace.</p></div><Button asChild variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20"><Link to="/admin/reports"><BarChart3Icon /> View reports</Link></Button></div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Students" value={dashboard?.counts?.students ?? 0} detail="Active enrolment" icon={Users} color="bg-blue-600" href="/admin/users" />
        <Metric label="Teachers" value={dashboard?.counts?.teachers ?? 0} detail="Teaching staff" icon={GraduationCap} color="bg-emerald-600" href="/admin/users?role=TEACHER" />
        <Metric label="Classes" value={dashboard?.counts?.classes ?? classes.length} detail="Academic year" icon={Building2} color="bg-violet-600" href="/admin/academic" />
        <Metric label="Collected" value={formatCurrency(dashboard?.finance?.collectedAmount)} detail="Recorded payments" icon={DollarSign} color="bg-amber-500" href="/admin/finance" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.85fr]">
        <Card className="glass portal-card"><CardHeader className="flex flex-row items-center justify-between"><div><p className="text-sm font-medium text-emerald-700">School performance</p><CardTitle className="mt-1">Attendance overview</CardTitle></div><select className="rounded-xl border bg-white/70 px-3 py-2 text-sm text-slate-600"><option>Last 30 days</option><option>Yearly</option></select></CardHeader><CardContent><div className="flex flex-col items-center gap-8 sm:flex-row"><div className="h-56 w-56 shrink-0"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={attendanceData} dataKey="value" innerRadius={66} outerRadius={92} paddingAngle={4}>{attendanceData.map((_, index) => <Cell key={index} fill={palette[index]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div><div className="grid flex-1 gap-4 sm:grid-cols-2"><LegendStat label="Present" value={attendanceData[0].value} color="bg-blue-600" /><LegendStat label="Absent or follow-up" value={attendanceData[1].value} color="bg-emerald-500" /><div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2"><p className="text-sm text-slate-500">Attendance rate</p><p className="mt-1 text-3xl font-semibold text-slate-950">{attendanceRate.toFixed(1)}%</p><p className="mt-1 text-xs text-slate-500">{attendanceRecords.toLocaleString()} attendance records analysed</p></div></div></div></CardContent></Card>
        <Card className="glass portal-card"><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5 text-amber-600" /> Finance overview</CardTitle><Link to="/admin/finance" className="text-sm text-emerald-700">Details <ChevronRight className="inline h-4 w-4" /></Link></CardHeader><CardContent className="space-y-3"><FinanceRow label="Collected" value={formatCurrency(dashboard?.finance?.collectedAmount)} tone="text-emerald-700 bg-emerald-50" /><FinanceRow label="Pending" value={formatCurrency(dashboard?.finance?.pendingAmount)} tone="text-amber-700 bg-amber-50" /><FinanceRow label="Overdue" value={formatCurrency(dashboard?.finance?.overdueAmount)} tone="text-rose-700 bg-rose-50" /><div className="mt-5 rounded-2xl border border-dashed p-4 text-sm text-slate-500">Online payment processing is not configured. Use the finance workspace for recorded payments and reconciliation.</div></CardContent></Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <Card className="glass portal-card"><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5 text-emerald-700" /> Notice board</CardTitle><Link to="/admin/communication" className="text-sm text-emerald-700">Manage</Link></CardHeader><CardContent className="space-y-1">{announcements.length === 0 ? <EmptyState label="No published announcements yet." /> : announcements.map((item: Announcement) => <Link key={item.id} to="/admin/communication" className="block border-b py-4 last:border-0"><p className="text-xs text-slate-500">{formatDate(item.createdAt)}</p><p className="mt-1 font-semibold text-slate-900">{item.title}</p><p className="mt-1 line-clamp-2 text-sm text-slate-500">{item.body}</p></Link>)}</CardContent></Card>
        <Card className="glass portal-card"><CardHeader><CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5 text-violet-600" /> Subject performance</CardTitle></CardHeader><CardContent>{subjectGrades.length === 0 ? <EmptyState label="No published grade data is available yet." /> : <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={subjectGrades} margin={{ left: 0, right: 12 }}><XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip /><Bar dataKey="average" fill="#8b5cf6" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div>}</CardContent></Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="glass portal-card"><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-blue-600" /> Recent students</CardTitle><Link to="/admin/users" className="text-sm text-blue-700">View all</Link></CardHeader><CardContent>{students.length === 0 ? <EmptyState label="No students are available yet." /> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-xs uppercase tracking-wide text-slate-500"><th className="pb-3">Student</th><th className="pb-3">Student ID</th><th className="pb-3">Class</th><th className="pb-3">Status</th></tr></thead><tbody>{students.map((student: Student) => <tr key={student.id} className="border-b last:border-0"><td className="py-4 font-medium text-slate-900">{student.user?.firstName} {student.user?.lastName}</td><td className="py-4 text-slate-500">{student.studentId}</td><td className="py-4 text-slate-500">{student.class?.name || "Not assigned"}</td><td className="py-4"><span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">{student.status}</span></td></tr>)}</tbody></table></div>}</CardContent></Card>
        <Card className="glass portal-card"><CardHeader><CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-emerald-600" /> School snapshot</CardTitle></CardHeader><CardContent className="space-y-3"><Snapshot label="Active classes" value={classes.length} /><Snapshot label="Pending fees" value={formatCurrency(dashboard?.finance?.pendingAmount)} /><Snapshot label="Overdue fees" value={formatCurrency(dashboard?.finance?.overdueAmount)} /><div className="mt-5 rounded-2xl bg-emerald-50 p-4"><p className="text-sm font-medium text-emerald-900">Today</p><p className="mt-1 text-xs text-emerald-700">{new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(new Date())}</p></div><Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700"><Link to="/admin/academic">Open academic workspace</Link></Button></CardContent></Card>
      </section>
    </div>
  );
}

function Metric({ label, value, detail, icon: Icon, color, href }: { label: string; value: string | number; detail: string; icon: typeof Users; color: string; href: string }) {
  return <Link to={href}><Card className="glass portal-card transition hover:-translate-y-0.5 hover:shadow-lg"><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></div><div className={`rounded-2xl p-3 ${color}`}><Icon className="h-5 w-5 text-white" /></div></CardContent></Card></Link>;
}

function LegendStat({ label, value, color }: { label: string; value: number; color: string }) {
  return <div className="flex items-center gap-3"><span className={`h-3 w-3 rounded-full ${color}`} /><div><p className="text-2xl font-semibold text-slate-950">{value.toLocaleString()}</p><p className="text-xs text-slate-500">{label}</p></div></div>;
}

function FinanceRow({ label, value, tone }: { label: string; value: string; tone: string }) {
  return <div className={`flex items-center justify-between rounded-2xl p-4 ${tone}`}><span className="text-sm font-medium">{label}</span><strong>{value}</strong></div>;
}

function Snapshot({ label, value }: { label: string; value: string | number }) {
  return <div className="flex items-center justify-between border-b py-3 last:border-0"><span className="text-sm text-slate-500">{label}</span><strong className="text-slate-900">{value}</strong></div>;
}

function EmptyState({ label }: { label: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">{label}</div>;
}

function BarChart3Icon() {
  return <CheckCircle2 className="mr-2 h-4 w-4" />;
}
