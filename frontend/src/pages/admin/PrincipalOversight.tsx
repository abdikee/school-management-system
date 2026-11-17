import { useQuery } from "@tanstack/react-query";
import { Activity, BookOpen, Clock3, Users } from "lucide-react";
import { academicApi, usersApi } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PrincipalOversight() {
  const activityQuery = useQuery({
    queryKey: ["principal-activity"],
    queryFn: () => usersApi.getActivity({ take: 50 }),
  });
  const classesQuery = useQuery({
    queryKey: ["principal-classes"],
    queryFn: () => academicApi.getClasses({ skip: 0, take: 100 }),
  });

  const activities = activityQuery.data?.data || [];
  const classes = classesQuery.data?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Principal controls</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">School oversight</h2>
        <p className="mt-2 text-sm text-slate-500">Monitor staff activity and review every class from one place.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="portal-card"><CardContent className="p-5"><div className="flex items-center gap-3"><div className="rounded-xl bg-emerald-100 p-3 text-emerald-700"><Activity className="h-5 w-5" /></div><div><p className="text-sm text-slate-500">Logged activities</p><p className="text-2xl font-semibold">{activityQuery.data?.total ?? 0}</p></div></div></CardContent></Card>
        <Card className="portal-card"><CardContent className="p-5"><div className="flex items-center gap-3"><div className="rounded-xl bg-teal-100 p-3 text-teal-700"><BookOpen className="h-5 w-5" /></div><div><p className="text-sm text-slate-500">Classes</p><p className="text-2xl font-semibold">{classesQuery.data?.meta.total ?? classes.length}</p></div></div></CardContent></Card>
        <Card className="portal-card"><CardContent className="p-5"><div className="flex items-center gap-3"><div className="rounded-xl bg-lime-100 p-3 text-lime-700"><Users className="h-5 w-5" /></div><div><p className="text-sm text-slate-500">Students in classes</p><p className="text-2xl font-semibold">{classes.reduce((total, item) => total + (item._count?.students || 0), 0)}</p></div></div></CardContent></Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <Card className="portal-card">
          <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-emerald-600" />Recent activity</CardTitle></CardHeader>
          <CardContent>
            {activityQuery.isLoading ? <p className="py-8 text-center text-sm text-slate-500">Loading activity...</p> : activities.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">No activity recorded yet.</p> : (
              <div className="divide-y divide-slate-100">
                {activities.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 py-4">
                    <div className="mt-0.5 rounded-lg bg-emerald-50 p-2 text-emerald-700"><Clock3 className="h-4 w-4" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800">{item.user ? `${item.user.firstName} ${item.user.lastName}` : "System"} <span className="font-normal text-slate-500">{item.action}</span></p>
                      <p className="mt-1 text-xs text-slate-400">{new Date(item.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="portal-card">
          <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-emerald-600" />Class overview</CardTitle></CardHeader>
          <CardContent>
            {classesQuery.isLoading ? <p className="py-8 text-center text-sm text-slate-500">Loading classes...</p> : classes.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">No classes found.</p> : (
              <div className="space-y-3">
                {classes.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                    <div><p className="font-medium text-slate-800">{item.name}</p><p className="mt-1 text-xs text-slate-500">{item.gradeLevel?.name || "Grade level not assigned"}{item.room ? ` · ${item.room}` : ""}</p></div>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">{item._count?.students || 0} students</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
