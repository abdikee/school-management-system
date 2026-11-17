import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  GraduationCap,
  MessageSquare,
  RefreshCw,
  Sparkles,
  Users,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  useDashboardOverview,
  useParentDashboard,
  useStudentDashboard,
  useTeacherDashboard,
} from "@/hooks/useReports";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Icon = typeof Users;
type Range = "7 days" | "30 days" | "Term";
type DashboardMetric = {
  label: string;
  value: string;
  detail: string;
  icon: Icon;
  tone: string;
  href: string;
  positive?: boolean;
};

const formatNumber = (value?: number) => (value ?? 0).toLocaleString();
const formatPercent = (value?: number) => `${(value ?? 0).toFixed(1)}%`;

function GlassPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <Card className={`glass portal-card overflow-hidden bg-white/65 backdrop-blur-xl ${className}`}>{children}</Card>;
}

function MetricCard({ metric }: { metric: DashboardMetric }) {
  const IconComponent = metric.icon;
  return (
    <Link to={metric.href} className="group">
      <GlassPanel className="h-full transition duration-200 group-hover:-translate-y-0.5">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-500">{metric.label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{metric.value}</p>
              <p className="mt-2 truncate text-xs text-slate-500">{metric.detail}</p>
            </div>
            <span className={`rounded-2xl p-3 ${metric.tone}`}>
              <IconComponent className="h-5 w-5 text-white" />
            </span>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-700">
            {metric.positive === false ? <ArrowDownRight className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
            <span>{metric.positive === false ? "Needs attention" : "On track"}</span>
            <ChevronRight className="ml-auto h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-600" />
          </div>
        </CardContent>
      </GlassPanel>
    </Link>
  );
}

function LoadingDashboard() {
  return (
    <div className="space-y-6">
      <div className="h-44 animate-pulse rounded-[2rem] bg-emerald-900/10" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-40 animate-pulse rounded-3xl bg-white/70" />)}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="h-80 animate-pulse rounded-3xl bg-white/70" />
        <div className="h-80 animate-pulse rounded-3xl bg-white/70" />
      </div>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <GlassPanel>
      <CardContent className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="rounded-2xl bg-rose-50 p-4 text-rose-600"><RefreshCw className="h-6 w-6" /></div>
        <h2 className="mt-5 text-lg font-semibold text-slate-950">We couldn&apos;t load your dashboard</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">Check that the API is available and try again.</p>
        <Button className="mt-6 rounded-xl bg-emerald-600 hover:bg-emerald-700" onClick={onRetry}>Try again</Button>
      </CardContent>
    </GlassPanel>
  );
}

export function PortalDashboard() {
  const { user } = useAuth();
  const [range, setRange] = useState<Range>("30 days");
  const [activePanel, setActivePanel] = useState<"overview" | "activity">("overview");
  const role = user?.role;
  const admin = useDashboardOverview({ schoolId: user?.schoolId }, role === "ADMIN");
  const teacher = useTeacherDashboard({ schoolId: user?.schoolId }, role === "TEACHER");
  const student = useStudentDashboard(role === "STUDENT");
  const parent = useParentDashboard(role === "PARENT");
  const query = role === "ADMIN" ? admin : role === "TEACHER" ? teacher : role === "STUDENT" ? student : parent;

  const firstName = user?.firstName || "there";
  const roleLabel = role ? role.charAt(0) + role.slice(1).toLowerCase() : "School";
  const data = query.data;
  const children = parent.data?.children || [];

  const metrics = useMemo<DashboardMetric[]>(() => {
    if (role === "ADMIN") {
      const value = admin.data;
      return [
        { label: "Active students", value: formatNumber(value?.counts?.students), detail: "Current enrolment", icon: Users, tone: "bg-emerald-600", href: "/admin/users" },
        { label: "Teaching staff", value: formatNumber(value?.counts?.teachers), detail: "Across the school", icon: GraduationCap, tone: "bg-teal-600", href: "/admin/users?role=TEACHER" },
        { label: "Attendance rate", value: formatPercent(value?.attendance?.rate), detail: `Last ${range.toLowerCase()}`, icon: CheckCircle2, tone: "bg-lime-600", href: "/admin/attendance" },
        { label: "Collected", value: `$${formatNumber(value?.finance?.collectedAmount)}`, detail: "Recorded payments", icon: CircleDollarSign, tone: "bg-green-700", href: "/admin/finance" },
      ];
    }
    if (role === "TEACHER") {
      const value = teacher.data;
      return [
        { label: "My students", value: formatNumber(value?.counts?.students), detail: "Across your classes", icon: Users, tone: "bg-emerald-600", href: "/teacher/classes" },
        { label: "My classes", value: formatNumber(value?.counts?.classes), detail: "This academic year", icon: BookOpen, tone: "bg-teal-600", href: "/teacher/classes" },
        { label: "Attendance", value: formatPercent(value?.attendance?.rate), detail: `Last ${range.toLowerCase()}`, icon: CheckCircle2, tone: "bg-lime-600", href: "/teacher/attendance" },
        { label: "Notifications", value: formatNumber(value?.unreadNotifications), detail: "Need your attention", icon: Bell, tone: "bg-amber-500", href: "/notifications", positive: false },
      ];
    }
    if (role === "STUDENT") {
      const value = student.data;
      return [
        { label: "Attendance", value: formatPercent(value?.attendance?.rate), detail: "Your recent record", icon: ClipboardCheck, tone: "bg-emerald-600", href: "/student/reports" },
        { label: "Overall grade", value: formatPercent(value?.grades?.overall), detail: `${formatNumber(value?.grades?.subjects)} subjects`, icon: GraduationCap, tone: "bg-teal-600", href: "/student/reports" },
        { label: "Pending fees", value: formatNumber(value?.fees?.pendingInvoices), detail: "Invoices to review", icon: CircleDollarSign, tone: "bg-amber-500", href: "/student/fees", positive: false },
        { label: "Notifications", value: formatNumber(value?.notifications), detail: "Unread updates", icon: Bell, tone: "bg-lime-600", href: "/notifications" },
      ];
    }
    const averageAttendance = children.length ? children.reduce((sum, child) => sum + (child.attendance?.rate || 0), 0) / children.length : 0;
    const averageGrade = children.length ? children.reduce((sum, child) => sum + (child.grades?.overall || 0), 0) / children.length : 0;
    return [
      { label: "Linked children", value: formatNumber(children.length), detail: "Verified relationships", icon: Users, tone: "bg-emerald-600", href: "/parent/children" },
      { label: "Attendance", value: formatPercent(averageAttendance), detail: "Average across children", icon: ClipboardCheck, tone: "bg-teal-600", href: "/parent/attendance" },
      { label: "Average grade", value: formatPercent(averageGrade), detail: "Across all subjects", icon: GraduationCap, tone: "bg-lime-600", href: "/parent/grades" },
      { label: "Pending fees", value: formatNumber(children.reduce((sum, child) => sum + (child.fees?.pendingInvoices || 0), 0)), detail: "Invoices to review", icon: CircleDollarSign, tone: "bg-amber-500", href: "/parent/fees", positive: false },
    ];
  }, [admin.data, children, range, role, student.data, teacher.data]);

  const primaryValue = Number(metrics[0]?.value.replace(/[^0-9.]/g, "")) || 0;
  const quickActions = [
    { label: role === "TEACHER" ? "Take attendance" : "Review attendance", href: role === "TEACHER" ? "/teacher/attendance" : role === "PARENT" ? "/parent/attendance" : "/admin/attendance", icon: ClipboardCheck },
    { label: role === "TEACHER" ? "Enter grades" : "Open grades", href: role === "TEACHER" ? "/teacher/grades" : role === "PARENT" ? "/parent/grades" : "/student/reports", icon: GraduationCap },
    { label: "View timetable", href: role === "STUDENT" ? "/student/schedule" : role === "TEACHER" ? "/teacher/classes" : "/admin/academic", icon: CalendarDays },
    { label: "Open messages", href: role === "TEACHER" ? "/teacher/communication" : role === "PARENT" ? "/parent/communication" : role === "STUDENT" ? "/student/communication" : "/admin/communication", icon: MessageSquare },
  ];
  const barHeights = [58, 72, 64, 82, 68, 88, 76];

  if (query.isLoading) return <LoadingDashboard />;
  if (query.isError) return <ErrorState onRetry={() => query.refetch()} />;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#092f2b] px-6 py-7 text-white shadow-2xl shadow-emerald-950/10 sm:px-8 sm:py-9">
        <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute -bottom-36 left-1/3 h-72 w-72 rounded-full bg-lime-300/10 blur-3xl" />
        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300"><Sparkles className="h-4 w-4" /> {roleLabel} portal</div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Good morning, {firstName}.</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-100/70">Your school activity, priorities, and progress are ready in one calm workspace.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(["7 days", "30 days", "Term"] as Range[]).map((option) => (
              <button key={option} onClick={() => setRange(option)} className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${range === option ? "bg-white text-[#092f2b]" : "bg-white/10 text-emerald-100 hover:bg-white/20"}`}>{option}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}
      </section>

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">Live workspace</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">A clear view of what matters</h2>
        </div>
        <div className="flex rounded-xl border border-slate-200 bg-white/70 p-1 shadow-sm">
          {(["overview", "activity"] as const).map((panel) => (
            <button key={panel} onClick={() => setActivePanel(panel)} className={`rounded-lg px-3 py-2 text-xs font-semibold capitalize transition ${activePanel === panel ? "bg-emerald-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-900"}`}>{panel}</button>
          ))}
        </div>
      </div>

      {activePanel === "overview" ? (
        <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <GlassPanel>
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-emerald-700">Performance pulse</p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-950">Your activity at a glance</h3>
                  <p className="mt-2 text-sm text-slate-500">Interactive snapshot for the selected period: {range.toLowerCase()}.</p>
                </div>
                <BarChart3 className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="mt-8 flex h-56 items-end gap-2 sm:gap-4">
                {barHeights.map((height, index) => (
                  <button key={index} className="group flex h-full flex-1 flex-col items-center justify-end gap-3" aria-label={`Activity ${index + 1}`}>
                    <span className="w-full rounded-t-xl bg-gradient-to-t from-emerald-600 to-teal-300 transition-all duration-200 group-hover:from-emerald-700 group-hover:to-lime-300" style={{ height: `${Math.min(100, height + (primaryValue % 9))}%` }} />
                    <span className="text-[11px] font-medium text-slate-400">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </GlassPanel>

          <GlassPanel className="bg-gradient-to-br from-white/80 to-emerald-50/60">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-semibold text-emerald-700">Focus score</p><h3 className="mt-1 text-xl font-semibold text-slate-950">Keep the momentum</h3></div>
                <Sparkles className="h-5 w-5 text-amber-500" />
              </div>
              <div className="mx-auto mt-8 flex h-44 w-44 items-center justify-center rounded-full" style={{ background: `conic-gradient(#059669 ${Math.min(100, primaryValue)}%, #d1fae5 0)` }}>
                <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white/90 shadow-inner">
                  <span className="text-3xl font-semibold text-slate-950">{Math.min(100, primaryValue).toFixed(0)}%</span>
                  <span className="mt-1 text-xs text-slate-500">overall pulse</span>
                </div>
              </div>
              <p className="mt-6 text-center text-sm leading-6 text-slate-500">Use the quick actions below to stay ahead of the next important task.</p>
            </CardContent>
          </GlassPanel>
        </section>
      ) : (
        <GlassPanel>
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center gap-3"><div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700"><Bell className="h-5 w-5" /></div><div><p className="text-sm font-semibold text-emerald-700">Recent activity</p><h3 className="mt-1 text-xl font-semibold text-slate-950">Your latest updates</h3></div></div>
            <div className="mt-7 divide-y divide-slate-100">
              {[...metrics, { label: "Messages", value: formatNumber((data as { unreadNotifications?: number; notifications?: number } | undefined)?.unreadNotifications ?? (data as { notifications?: number } | undefined)?.notifications), detail: "Unread conversations", icon: MessageSquare, tone: "bg-indigo-500", href: "/notifications" }].map((item, index) => (
                <Link to={item.href} key={`${item.label}-${index}`} className="flex items-center gap-4 py-4 transition hover:px-2">
                  <span className={`rounded-xl p-2.5 ${item.tone}`}><item.icon className="h-4 w-4 text-white" /></span>
                  <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-800">{item.label}</p><p className="text-xs text-slate-500">{item.detail}</p></div>
                  <span className="text-sm font-semibold text-slate-700">{item.value}</span><ChevronRight className="h-4 w-4 text-slate-300" />
                </Link>
              ))}
            </div>
          </CardContent>
        </GlassPanel>
      )}

      <GlassPanel>
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4"><div><p className="text-sm font-semibold text-emerald-700">Action center</p><h3 className="mt-1 text-xl font-semibold text-slate-950">Move work forward</h3></div><span className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700"><ClipboardCheck className="h-5 w-5" /></span></div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => <Link key={action.label} to={action.href} className="group flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/60 p-4 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50/70"><span className="flex items-center gap-3 text-sm font-semibold text-slate-700"><span className="rounded-xl bg-emerald-100 p-2 text-emerald-700"><action.icon className="h-4 w-4" /></span>{action.label}</span><ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-600" /></Link>)}
          </div>
        </CardContent>
      </GlassPanel>
    </div>
  );
}
