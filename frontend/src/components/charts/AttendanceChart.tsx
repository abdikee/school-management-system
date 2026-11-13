"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import { cn } from "@/lib/utils";

interface AttendanceChartProps {
  data: Array<{
    date: string;
    present: number;
    absent: number;
    late: number;
    excused: number;
    rate: number;
  }>;
  type?: "bar" | "line" | "area";
  className?: string;
  height?: number;
}

export function AttendanceChart({
  data,
  type = "bar",
  className,
  height = 300,
}: AttendanceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-[300px] text-muted-foreground", className)}>
        No attendance data available
      </div>
    );
  }

  if (type === "line") {
    return (
      <ResponsiveContainer width="100%" height={height} className={className}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "hsl(var(--border))" }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "hsl(var(--border))" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            labelFormatter={(value) => `Date: ${value}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="present"
            stroke="hsl(var(--chart-1))"
            name="Present"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="absent"
            stroke="hsl(var(--chart-2))"
            name="Absent"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="late"
            stroke="hsl(var(--chart-3))"
            name="Late"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="excused"
            stroke="hsl(var(--chart-4))"
            name="Excused"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (type === "area") {
    return (
      <ResponsiveContainer width="100%" height={height} className={className}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "hsl(var(--border))" }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "hsl(var(--border))" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            labelFormatter={(value) => `Date: ${value}`}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="present"
            stroke="hsl(var(--chart-1))"
            fill="hsl(var(--chart-1))"
            fillOpacity={0.3}
            name="Present"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="absent"
            stroke="hsl(var(--chart-2))"
            fill="hsl(var(--chart-2))"
            fillOpacity={0.3}
            name="Absent"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="late"
            stroke="hsl(var(--chart-3))"
            fill="hsl(var(--chart-3))"
            fillOpacity={0.3}
            name="Late"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="excused"
            stroke="hsl(var(--chart-4))"
            fill="hsl(var(--chart-4))"
            fillOpacity={0.3}
            name="Excused"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height} className={className}>
      <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "hsl(var(--border))" }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "hsl(var(--border))" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            labelFormatter={(value) => `Date: ${value}`}
          />
          <Legend />
          <Bar dataKey="present" fill="hsl(var(--chart-1))" name="Present" radius={[4, 4, 0, 0]} />
          <Bar dataKey="absent" fill="hsl(var(--chart-2))" name="Absent" radius={[4, 4, 0, 0]} />
          <Bar dataKey="late" fill="hsl(var(--chart-3))" name="Late" radius={[4, 4, 0, 0]} />
          <Bar dataKey="excused" fill="hsl(var(--chart-4))" name="Excused" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface AttendanceRateChartProps {
  data: Array<{
    date: string;
    rate: number;
  }>;
  className?: string;
  height?: number;
}

export function AttendanceRateChart({
  data,
  className,
  height = 300,
}: AttendanceRateChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-[300px] text-muted-foreground", className)}>
        No attendance rate data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height} className={className}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="attendanceRateGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: "hsl(var(--border))" }}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 12 }}
          tickFormatter={(val) => `${val}%`}
          tickLine={false}
          axisLine={{ stroke: "hsl(var(--border))" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
          labelFormatter={(value) => `Date: ${value}`}
          formatter={(value) => [`${value}%`, "Attendance Rate"]}
        />
        <Area
          type="monotone"
          dataKey="rate"
          stroke="hsl(var(--chart-1))"
          fill="url(#attendanceRateGradient)"
          strokeWidth={2}
          name="Attendance Rate"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface GradeDistributionChartProps {
  data: Record<string, number>;
  className?: string;
  height?: number;
}

export function GradeDistributionChart({
  data,
  className,
  height = 300,
}: GradeDistributionChartProps) {
  const chartData = Object.entries(data).map(([range, count]) => ({ range, count }));

  if (!chartData.length) {
    return (
      <div className={cn("flex items-center justify-center h-[300px] text-muted-foreground", className)}>
        No grade distribution data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height} className={className}>
      <BarChart data={chartData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: "hsl(var(--border))" }} />
        <YAxis
          dataKey="range"
          type="category"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: "hsl(var(--border))" }}
          width={80}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
        <Bar dataKey="count" fill="hsl(var(--chart-1))" name="Students" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface FinanceChartProps {
  data: Array<{
    month: string;
    amount: number;
  }>;
  className?: string;
  height?: number;
}

export function FinanceChart({
  data,
  className,
  height = 300,
}: FinanceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-[300px] text-muted-foreground", className)}>
        No finance data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height} className={className}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="financeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--chart-5))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--chart-5))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: "hsl(var(--border))" }}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickFormatter={(val) => `$${val.toLocaleString()}`}
          tickLine={false}
          axisLine={{ stroke: "hsl(var(--border))" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
          formatter={(value) => [`$${value.toLocaleString()}`, "Revenue"]}
        />
        <Area
          type="monotone"
          dataKey="amount"
          stroke="hsl(var(--chart-5))"
          fill="url(#financeGradient)"
          strokeWidth={2}
          name="Revenue"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface EnrollmentChartProps {
  data: Array<{
    class: string;
    count: number;
    capacity: number;
    utilization: number;
  }>;
  className?: string;
  height?: number;
}

export function EnrollmentChart({
  data,
  className,
  height = 350,
}: EnrollmentChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-[300px] text-muted-foreground", className)}>
        No enrollment data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height} className={className}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: "hsl(var(--border))" }} />
        <YAxis
          dataKey="class"
          type="category"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: "hsl(var(--border))" }}
          width={100}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
        <Legend />
        <Bar dataKey="count" fill="hsl(var(--chart-1))" name="Enrolled" radius={[0, 4, 4, 0]} />
        <Bar dataKey="capacity" fill="hsl(var(--muted))" name="Capacity" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface TeacherWorkloadChartProps {
  data: Array<{
    teacher: string;
    weeklyHours: number;
    subjectCount: number;
    classCount: number;
  }>;
  className?: string;
  height?: number;
}

export function TeacherWorkloadChart({
  data,
  className,
  height = 350,
}: TeacherWorkloadChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-[300px] text-muted-foreground", className)}>
        No teacher workload data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height} className={className}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: "hsl(var(--border))" }} />
        <YAxis
          dataKey="teacher"
          type="category"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: "hsl(var(--border))" }}
          width={120}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
        <Legend />
        <Bar dataKey="weeklyHours" fill="hsl(var(--chart-1))" name="Weekly Hours" radius={[0, 4, 4, 0]} />
        <Bar dataKey="classCount" fill="hsl(var(--chart-2))" name="Classes" radius={[0, 4, 4, 0]} />
        <Bar dataKey="subjectCount" fill="hsl(var(--chart-3))" name="Subjects" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}