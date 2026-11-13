import React from "react";
import { useParentDashboard } from "@/hooks/useReports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ClipboardCheck, Award, DollarSign, Bell, Calendar, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

const StatCard = ({
  title,
  value,
  icon: Icon,
  iconColor,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className={cn("h-4 w-4", iconColor)} aria-hidden="true" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const ChildCard = ({ child }: { child: any }) => (
  <Card className="overflow-hidden">
    <CardHeader className="pb-3">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
          <Users className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">{child.student.user.firstName} {child.student.user.lastName}</h3>
          <p className="text-sm text-muted-foreground">{child.student.studentId} • {child.student.class?.name}</p>
        </div>
      </div>
    </CardHeader>
    <CardContent className="grid grid-cols-4 gap-4">
      <div className="text-center p-3 bg-muted/50 rounded-lg">
        <p className="text-2xl font-bold text-blue-600">{(child.attendance.rate || 0).toFixed(1)}%</p>
        <p className="text-xs text-muted-foreground">Attendance</p>
      </div>
      <div className="text-center p-3 bg-muted/50 rounded-lg">
        <p className="text-2xl font-bold text-green-600">{(child.grades.overall || 0).toFixed(1)}%</p>
        <p className="text-xs text-muted-foreground">Overall Grade</p>
      </div>
      <div className="text-center p-3 bg-muted/50 rounded-lg">
        <p className="text-2xl font-bold text-yellow-600">{child.fees.pendingInvoices}</p>
        <p className="text-xs text-muted-foreground">Pending Fees</p>
      </div>
      <div className="text-center p-3 bg-muted/50 rounded-lg">
        <p className="text-2xl font-bold text-purple-600">{child.grades.subjects}</p>
        <p className="text-xs text-muted-foreground">Subjects</p>
      </div>
    </CardContent>
  </Card>
);

export function ParentDashboard() {
  const { data: dashboard, isLoading, error } = useParentDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Loading...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted animate-pulse rounded w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent>
            <div className="h-48 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load dashboard data</p>
      </div>
    );
  }

  const children = dashboard?.children || [];

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Children"
          value={children.length}
          icon={Users}
          iconColor="text-blue-500"
        />
        <StatCard
          title="Avg Attendance"
          value={`${(children.reduce((acc: number, c: any) => acc + (c.attendance.rate || 0), 0) / (children.length || 1)).toFixed(1)}%`}
          icon={ClipboardCheck}
          iconColor="text-green-500"
        />
        <StatCard
          title="Avg Grade"
          value={`${(children.reduce((acc: number, c: any) => acc + (c.grades.overall || 0), 0) / (children.length || 1)).toFixed(1)}%`}
          icon={Award}
          iconColor="text-yellow-500"
        />
        <StatCard
          title="Total Pending Fees"
          value={children.reduce((acc: number, c: any) => acc + (c.fees.pendingInvoices || 0), 0)}
          icon={DollarSign}
          iconColor="text-red-500"
        />
      </div>

      {/* Children Cards */}
      <div>
        <h2 className="text-xl font-semibold mb-4">My Children</h2>
        {children.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {children.map((child: any) => (
              <ChildCard key={child.student.id} child={child} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No children linked</h3>
              <p className="text-muted-foreground">Contact the school administration to link your children</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}