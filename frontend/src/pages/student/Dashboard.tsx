import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Bell, BookOpen, CalendarDays, CheckCircle2, ChevronRight, Clock3, GraduationCap, Megaphone } from "lucide-react";
import { academicApi, communicationApi, usersApi } from "@/services/api";
import { useStudentDashboard } from "@/hooks/useReports";
import { useAuth } from "@/context/AuthContext";
import type { Announcement, TimetableEntry, User } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const accents = ["border-l-blue-500", "border-l-emerald-500", "border-l-orange-500", "border-l-pink-500", "border-l-violet-500"];

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));

export function StudentDashboard() {
  const { user } = useAuth();
  const dashboardQuery = useStudentDashboard();
  const profileQuery = useQuery({ queryKey: ["student-dashboard-profile"], queryFn: () => usersApi.getProfile() });
  const announcementsQuery = useQuery({
    queryKey: ["student-dashboard-announcements"],
    queryFn: () => communicationApi.getAnnouncementsForUser({ take: 5 }),
  });

  const profile = profileQuery.data as User | undefined;
  const student = profile?.student ?? user?.student;
  const classId = student?.classId;
  const timetableQuery = useQuery({
    queryKey: ["student-dashboard-timetable", classId],
    queryFn: () => academicApi.getTimetable({ classId }),
    enabled: !!classId,
  });

  const entries = useMemo(() => {
    const raw = timetableQuery.data;
    const data = Array.isArray(raw)
      ? raw
      : (raw as { data?: TimetableEntry[] } | undefined)?.data ?? [];
    return (data as TimetableEntry[]).sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime));
  }, [timetableQuery.data]);
  const announcements = announcementsQuery.data?.data ?? [];
  const attendance = dashboardQuery.data?.attendance?.rate ?? 0;
  const grades = dashboardQuery.data?.grades?.overall ?? 0;
  const todayEntries = entries.filter((entry) => entry.dayOfWeek === new Date().getDay());

  if (dashboardQuery.isLoading || profileQuery.isLoading) {
    return <div className="space-y-6"><div className="h-28 animate-pulse rounded-3xl bg-blue-100" /><div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]"><div className="h-[480px] animate-pulse rounded-3xl bg-white" /><div className="h-[480px] animate-pulse rounded-3xl bg-white" /></div></div>;
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 px-6 py-7 text-white shadow-xl shadow-blue-900/20 sm:px-8">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-100">Student portal</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Welcome back, {user?.firstName || "Student"}.</h1><p className="mt-2 text-sm text-blue-100">Here is your timetable, attendance, and the latest school information.</p></div>
          <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm backdrop-blur-md"><p className="text-blue-100">Class</p><p className="font-semibold">{student?.class?.name || "Not assigned"}</p></div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Metric label="Attendance" value={`${attendance.toFixed(1)}%`} detail="Your recent record" icon={CheckCircle2} color="text-emerald-600" />
        <Metric label="Overall grade" value={`${grades.toFixed(1)}%`} detail={`${dashboardQuery.data?.grades?.subjects ?? 0} subjects`} icon={GraduationCap} color="text-blue-600" />
        <Metric label="Notifications" value={dashboardQuery.data?.notifications ?? 0} detail="Unread school updates" icon={Bell} color="text-violet-600" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.8fr]">
        <Card className="glass portal-card">
          <CardHeader className="flex flex-row items-center justify-between"><div><p className="text-sm font-medium text-blue-600">Today&apos;s learning</p><CardTitle className="mt-1">Timetable</CardTitle></div><Link to="/student/schedule" className="text-sm font-medium text-blue-600">Full timetable <ChevronRight className="inline h-4 w-4" /></Link></CardHeader>
          <CardContent>
            <div className="mb-5 flex items-center justify-between text-sm text-slate-500"><span>{new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(new Date())}</span><span className="font-medium text-slate-700">{days[new Date().getDay()]}</span></div>
            {todayEntries.length === 0 ? <EmptyState label={classId ? "No classes scheduled for today." : "Your class timetable is not available yet."} /> : <div className="space-y-3">{todayEntries.map((entry, index) => <TimetableCard key={entry.id} entry={entry} index={index} />)}</div>}
            <div className="mt-5 flex items-center gap-2 text-xs text-slate-500"><Clock3 className="h-4 w-4" /> {entries.length} scheduled class{entries.length === 1 ? "" : "es"} this week</div>
          </CardContent>
        </Card>

        <Card className="glass portal-card">
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5 text-blue-600" /> Class noticeboard</CardTitle><Link to="/student/communication" className="text-sm text-blue-600">View all</Link></CardHeader>
          <CardContent className="space-y-1">{announcements.length === 0 ? <EmptyState label="No class announcements yet." /> : announcements.map((announcement: Announcement) => <Link key={announcement.id} to="/student/communication" className="block border-b border-slate-100 py-4 last:border-0"><p className="text-xs text-slate-500">{formatDate(announcement.createdAt)}</p><p className="mt-1 font-semibold text-slate-900">{announcement.title}</p><p className="mt-1 line-clamp-2 text-sm text-slate-500">{announcement.body}</p></Link>)}</CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="glass portal-card"><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-600" /> My attendance</CardTitle><Link to="/student/reports" className="text-sm text-blue-600">View report</Link></CardHeader><CardContent><div className="grid grid-cols-3 gap-3"><div className="rounded-2xl bg-emerald-50 p-4"><p className="text-xs text-slate-500">Present rate</p><p className="mt-2 text-2xl font-semibold text-emerald-700">{attendance.toFixed(1)}%</p></div><div className="rounded-2xl bg-blue-50 p-4"><p className="text-xs text-slate-500">Records</p><p className="mt-2 text-2xl font-semibold text-blue-700">{dashboardQuery.data?.attendance?.records ?? 0}</p></div><div className="rounded-2xl bg-amber-50 p-4"><p className="text-xs text-slate-500">Follow up</p><p className="mt-2 text-2xl font-semibold text-amber-700">{Math.max(0, 100 - Math.round(attendance))}%</p></div></div></CardContent></Card>
        <Card className="glass portal-card"><CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-blue-600" /> Continue learning</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-3"><Button asChild variant="outline"><Link to="/student/reports">My grades</Link></Button><Button asChild variant="outline"><Link to="/student/fees">Fees</Link></Button><Button asChild variant="outline"><Link to="/student/communication">Messages</Link></Button></CardContent></Card>
      </section>
    </div>
  );
}

function Metric({ label, value, detail, icon: Icon, color }: { label: string; value: string | number; detail: string; icon: typeof Bell; color: string }) {
  return <Card className="glass portal-card"><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></div><Icon className={`h-7 w-7 ${color}`} /></CardContent></Card>;
}

function TimetableCard({ entry, index }: { entry: TimetableEntry; index: number }) {
  return <div className={`rounded-xl border border-l-4 bg-white/80 p-4 shadow-sm ${accents[index % accents.length]}`}><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-slate-900">{entry.subject?.name || "Subject"}</p><p className="mt-1 text-xs text-slate-500">{entry.room || "Room not assigned"} · {entry.teacher?.user ? `${entry.teacher.user.firstName} ${entry.teacher.user.lastName}` : "Teacher not assigned"}</p></div><span className="text-sm font-medium text-blue-600">{entry.startTime} - {entry.endTime}</span></div></div>;
}

function EmptyState({ label }: { label: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-12 text-center text-sm text-slate-500">{label}</div>;
}
