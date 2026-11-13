"use client";

import { useTeacherDashboard } from "@/hooks/useReports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, CheckCircle, Award, MessageSquare, Calendar, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const quickActions = [
  { name: "Take Attendance", href: "/teacher/attendance", icon: CheckCircle, color: "bg-orange-500" },
  { name: "Enter Grades", href: "/teacher/grades", icon: Award, color: "bg-emerald-500" },
  { name: "View Schedule", href: "/teacher/classes", icon: Calendar, color: "bg-blue-500" },
  { name: "Message Parents", href: "/teacher/communication", icon: MessageSquare, color: "bg-purple-500" },
  { name: "My Reports", href: "/teacher/reports", icon: TrendingUp, color: "bg-indigo-500" },
  { name: "Class Roster", href: "/teacher/classes", icon: Users, color: "bg-pink-500" },
];

const myClasses = [
  { id: 1, name: "Grade 10A - Mathematics", students: 28, nextClass: "Today 10:00 AM", room: "Room 201" },
  { id: 2, name: "Grade 10B - Mathematics", students: 25, nextClass: "Tomorrow 9:00 AM", room: "Room 202" },
  { id: 3, name: "Grade 11A - Calculus", students: 22, nextClass: "Today 2:00 PM", room: "Lab 3" },
  { id: 4, name: "Grade 12A - Statistics", students: 18, nextClass: "Friday 11:00 AM", room: "Room 105" },
];

const recentMessages = [
  { id: 1, from: "Sarah Johnson (Parent)", subject: "Question about homework", time: "2 hours ago", unread: true },
  { id: 2, from: "Principal Anderson", subject: "Staff meeting reminder", time: "4 hours ago", unread: false },
  { id: 3, from: "Michael Chen (Student)", subject: "Extension request", time: "6 hours ago", unread: true },
];

export function TeacherDashboard() {
  const { data: dashboard, isLoading } = useTeacherDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
          <p className="text-gray-600">Your classes, attendance, and grades at a glance</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-8 bg-gray-200 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
          <p className="text-gray-600 mt-1">Your classes, attendance, and grades at a glance</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">My Students</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {dashboard?.counts?.students?.toLocaleString() || "0"}
                </p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Active this term
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">My Classes</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {dashboard?.counts?.classes?.toLocaleString() || "0"}
                </p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  This academic year
                </p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {dashboard?.attendance?.rate?.toFixed(1) || "0"}%
                </p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Last 30 days
                </p>
              </div>
              <div className="p-3 rounded-xl bg-orange-500">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread Messages</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {dashboard?.unreadNotifications || "0"}
                </p>
                <p className="text-xs text-gray-500 mt-1">Requires attention</p>
              </div>
              <div className="p-3 rounded-xl bg-red-500">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* My Classes */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              My Classes
            </CardTitle>
            <a href="/teacher/classes" className="text-sm text-primary hover:underline">View all</a>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Class</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Students</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Next Class</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Room</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {myClasses.map((cls) => (
                    <tr key={cls.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <p className="font-medium text-gray-900">{cls.name}</p>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{cls.students}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{cls.nextClass}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{cls.room}</td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <a href={`/teacher/attendance?class=${cls.id}`} className="text-sm text-primary hover:underline">Attendance</a>
                          <a href={`/teacher/grades?class=${cls.id}`} className="text-sm text-primary hover:underline">Grades</a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <a
                  key={action.name}
                  href={action.href}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-center group"
                >
                  <div className={cn("p-2 rounded-lg mx-auto mb-2", action.color)}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors">{action.name}</p>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Recent Messages
            </CardTitle>
            <a href="/teacher/communication" className="text-sm text-primary hover:underline">View all</a>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn("p-3 rounded-lg border", msg.unread ? "border-blue-200 bg-blue-50" : "border-gray-100")}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-medium", msg.unread ? "text-gray-900" : "text-gray-600")}>
                        {msg.from}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{msg.subject}</p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{msg.time}</span>
                  </div>
                  {msg.unread && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-blue-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      Unread
                    </div>
                  )}
                </div>
              ))}
              {recentMessages.length === 0 && (
                <div className="text-center py-6 text-gray-500">No recent messages</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Attendance Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Attendance Trend (Weekly)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end justify-between gap-2 px-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, i) => (
                <div
                  key={day}
                  className="flex-1 bg-orange-500/20 rounded-t transition-all hover:bg-orange-500"
                  style={{ height: `${60 + Math.random() * 30}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 px-2 mt-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
                <span key={day} className="flex-1 text-center">{day}</span>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-4 text-center">
              Average attendance: <span className="font-medium text-orange-600">94.2%</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}