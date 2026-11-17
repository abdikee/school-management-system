import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Bell, BookOpen, CheckCircle2, ChevronRight, Clock3, MessageSquare, Users } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { academicApi, communicationApi } from "@/services/api";
import { useTeacherDashboard } from "@/hooks/useReports";
import { useAuth } from "@/context/AuthContext";
import type { Class, Message } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const colors = ["#2563eb", "#10b981", "#f59e0b", "#ec4899"];

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

export function TeacherDashboard() {
  const { user } = useAuth();
  const [selectedClassId, setSelectedClassId] = useState("");
  const dashboardQuery = useTeacherDashboard({ schoolId: user?.schoolId });
  const classesQuery = useQuery({
    queryKey: ["teacher-dashboard-classes"],
    queryFn: () => academicApi.getMyClasses({ take: 100 }),
  });
  const messagesQuery = useQuery({
    queryKey: ["teacher-dashboard-messages"],
    queryFn: () => communicationApi.getMessages({ role: "received", take: 5 }),
  });

  const classes = classesQuery.data?.data ?? [];
  const selectedClass = classes.find((item: Class) => item.id === selectedClassId) ?? classes[0];
  const messages = messagesQuery.data?.data ?? [];
  const attendance = dashboardQuery.data?.attendance?.rate ?? 0;
  const classCount = dashboardQuery.data?.counts?.classes ?? classes.length;
  const studentCount = dashboardQuery.data?.counts?.students ?? 0;
  const unreadCount = dashboardQuery.data?.unreadNotifications ?? 0;

  const performanceData = useMemo(() => [
    { name: "Present", value: Math.max(0, Math.round(attendance)) },
    { name: "Needs attention", value: Math.max(0, 100 - Math.round(attendance)) },
  ], [attendance]);

  if (dashboardQuery.isLoading || classesQuery.isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 animate-pulse rounded-3xl bg-emerald-100" />
        <div className="grid gap-4 md:grid-cols-3">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-32 animate-pulse rounded-2xl bg-white" />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-7 text-white shadow-xl shadow-slate-950/10 sm:px-8">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-300">Teacher workspace</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Good morning, {user?.firstName || "Teacher"}.</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">Review your classes, student progress, attendance, and messages from one professional overview.</p>
          </div>
          <label className="text-sm text-slate-300">
            Active class
            <select value={selectedClass?.id ?? ""} onChange={(event) => setSelectedClassId(event.target.value)} className="mt-2 block min-w-52 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white outline-none backdrop-blur-md">
              {classes.length === 0 && <option value="">No assigned classes</option>}
              {classes.map((item: Class) => <option key={item.id} value={item.id} className="text-slate-900">{item.name}</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Total students", value: studentCount, detail: "Across assigned classes", icon: Users, color: "bg-blue-600" },
          { label: "Assigned classes", value: classCount, detail: "This academic year", icon: BookOpen, color: "bg-emerald-600" },
          { label: "Attendance rate", value: `${attendance.toFixed(1)}%`, detail: "Last 30 days", icon: CheckCircle2, color: "bg-amber-500" },
        ].map((metric) => {
          const Icon = metric.icon;
          return <Card key={metric.label} className="glass portal-card"><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm text-slate-500">{metric.label}</p><p className="mt-2 text-3xl font-semibold text-slate-950">{metric.value}</p><p className="mt-1 text-xs text-slate-500">{metric.detail}</p></div><div className={`rounded-2xl p-3 ${metric.color}`}><Icon className="h-5 w-5 text-white" /></div></CardContent></Card>;
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
        <Card className="glass portal-card">
          <CardHeader className="flex flex-row items-center justify-between"><div><p className="text-sm font-medium text-blue-600">Class statistics</p><CardTitle className="mt-1">{selectedClass?.name || "Your classes"}</CardTitle></div><Link to="/teacher/classes" className="text-sm font-medium text-blue-600 hover:text-blue-800">View details <ChevronRight className="inline h-4 w-4" /></Link></CardHeader>
          <CardContent>
            {selectedClass ? <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-blue-50 p-4"><Users className="h-5 w-5 text-blue-600" /><p className="mt-5 text-2xl font-semibold text-slate-950">{selectedClass._count?.students ?? 0}</p><p className="text-xs text-slate-500">Students enrolled</p></div>
              <div className="rounded-2xl bg-emerald-50 p-4"><BookOpen className="h-5 w-5 text-emerald-600" /><p className="mt-5 text-2xl font-semibold text-slate-950">{selectedClass._count?.classSubjects ?? 0}</p><p className="text-xs text-slate-500">Subjects assigned</p></div>
              <div className="rounded-2xl bg-amber-50 p-4"><Clock3 className="h-5 w-5 text-amber-600" /><p className="mt-5 text-2xl font-semibold text-slate-950">{selectedClass.room || "Not set"}</p><p className="text-xs text-slate-500">Classroom</p></div>
            </div> : <EmptyState label="No assigned classes are available yet." />}
            <div className="mt-6 flex flex-wrap gap-3"><Button asChild size="sm"><Link to="/teacher/attendance">Take attendance</Link></Button><Button asChild variant="outline" size="sm"><Link to="/teacher/grades">Enter grades</Link></Button><Button asChild variant="outline" size="sm"><Link to="/teacher/classes">Manage classes</Link></Button></div>
          </CardContent>
        </Card>

        <Card className="glass portal-card">
          <CardHeader><p className="text-sm font-medium text-blue-600">Overall class performance</p><CardTitle className="mt-1">Attendance health</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-5">
              <div className="h-40 w-40 shrink-0"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={performanceData} dataKey="value" innerRadius={45} outerRadius={66} paddingAngle={4}><Cell fill="#10b981" /><Cell fill="#f1f5f9" /></Pie><Tooltip /></PieChart></ResponsiveContainer></div>
              <div className="space-y-3 text-sm"><div><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />Present <strong className="ml-2">{attendance.toFixed(1)}%</strong></div><div><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-slate-200" />Needs attention <strong className="ml-2">{(100 - attendance).toFixed(1)}%</strong></div><p className="pt-2 text-xs leading-5 text-slate-500">Use attendance reports to review individual students and follow up on concerns.</p></div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
        <Card className="glass portal-card"><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-blue-600" /> My classes</CardTitle><Link to="/teacher/classes" className="text-sm text-blue-600">View all</Link></CardHeader><CardContent className="space-y-3">{classes.length === 0 ? <EmptyState label="Assigned classes will appear here." /> : classes.slice(0, 5).map((item: Class) => <Link key={item.id} to={`/teacher/classes?class=${item.id}`} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50/50"><span><span className="block font-medium text-slate-900">{item.name}</span><span className="mt-1 block text-xs text-slate-500">{item._count?.students ?? 0} students · {item.room || "Room not assigned"}</span></span><ChevronRight className="h-4 w-4 text-slate-400" /></Link>)}</CardContent></Card>
        <Card className="glass portal-card"><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-blue-600" /> Recent messages</CardTitle><Link to="/teacher/communication" className="text-sm text-blue-600">View all</Link></CardHeader><CardContent className="space-y-3">{messages.length === 0 ? <EmptyState label="No messages yet." /> : messages.map((message: Message) => <Link key={message.id} to="/teacher/communication" className="block rounded-2xl border border-slate-200 p-4 transition hover:border-blue-300"><div className="flex items-start justify-between gap-3"><div><p className="font-medium text-slate-900">{message.subject || "Message"}</p><p className="mt-1 text-xs text-slate-500">From {message.sender?.firstName} {message.sender?.lastName}</p></div>{!message.isRead && <Badge>Unread</Badge>}</div><p className="mt-3 line-clamp-2 text-sm text-slate-600">{message.body}</p><p className="mt-2 text-xs text-slate-400">{formatDate(message.createdAt)}</p></Link>)}</CardContent></Card>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-5"><div className="flex items-center gap-3"><div className="rounded-xl bg-blue-600 p-2 text-white"><Bell className="h-5 w-5" /></div><div><p className="font-semibold text-slate-900">Stay on top of your work</p><p className="text-sm text-slate-500">{unreadCount} unread notification{unreadCount === 1 ? "" : "s"} need your attention.</p></div></div><Button asChild variant="outline"><Link to="/notifications">Open notifications</Link></Button></section>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">{label}</div>;
}
