"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { academicApi, usersApi } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, BookOpen, User, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { cn, formatDate, formatTime } from "@/lib/utils";
import { Class, TimetableEntry, Subject, Teacher, GradeLevel } from "@/types/api";

const daysOfWeek = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function StudentSchedule() {
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [selectedClassId, setSelectedClassId] = useState("");
  const [viewMode, setViewMode] = useState<"week" | "day">("week");

  // Get current student's class
  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => usersApi.getProfile(),
  });

  const studentClassId = currentUser?.data?.student?.classId;
  const studentId = currentUser?.data?.student?.id;

  // Get timetable entries for student's class
  const { data: timetableData, isLoading } = useQuery({
    queryKey: ["student-timetable", studentClassId, selectedWeek],
    queryFn: () => academicApi.getTimetable({
      classId: studentClassId || undefined,
      weekStart: formatDate(getWeekStart(selectedWeek)),
      weekEnd: formatDate(getWeekEnd(selectedWeek)),
    }),
    enabled: !!studentClassId,
  });

  // Get student's classes (for selector if they have multiple)
  const { data: classesData } = useQuery({
    queryKey: ["student-classes", studentId],
    queryFn: () => academicApi.getClasses({ studentId: studentId || undefined }),
  });

  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
    return new Date(d.setDate(diff));
  };

  const getWeekEnd = (date: Date): Date => {
    const start = getWeekStart(date);
    return new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
  };

  const formatWeekRange = (date: Date): string => {
    const start = getWeekStart(date);
    const end = getWeekEnd(date);
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const goToToday = () => setSelectedWeek(new Date());

  const prevWeek = () => setSelectedWeek(w => new Date(w.getTime() - 7 * 24 * 60 * 60 * 1000));
  const nextWeek = () => setSelectedWeek(w => new Date(w.getTime() + 7 * 24 * 60 * 60 * 1000));

  // Group timetable by day
  const timetableByDay = timetableData?.data?.reduce((acc: any, entry: TimetableEntry) => {
    const day = entry.dayOfWeek;
    if (!acc[day]) acc[day] = [];
    acc[day].push(entry);
    return acc;
  }, {}) || {};

  // Sort entries by start time
  Object.values(timetableByDay).forEach((entries: any) => {
    entries.sort((a: TimetableEntry, b: TimetableEntry) => a.startTime.localeCompare(b.startTime));
  });

  const currentDay = new Date().getDay(); // 0 = Sunday
  const currentDayIndex = currentDay === 0 ? 6 : currentDay - 1; // Convert to Monday=0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Schedule</h1>
          <p className="text-gray-600 mt-1">View your weekly class timetable</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={prevWeek}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" onClick={nextWeek}><ChevronRight className="h-4 w-4" /></Button>
          <Button variant="outline" onClick={goToToday}><Calendar className="mr-2 h-4 w-4" /> Today</Button>
        </div>
      </div>

      {/* Week selector & Class selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-4">
              <Calendar className="h-5 w-5 text-gray-400" />
              <span className="text-lg font-medium">{formatWeekRange(selectedWeek)}</span>
            </div>
            {(classesData?.data?.length || 0) > 1 && (
              <div className="w-full sm:w-64">
                <Select value={selectedClassId || studentClassId || ""} onValueChange={setSelectedClassId}>
                  <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>
                    {classesData?.data?.map((c: Class) => (
                      <SelectItem key={c.id} value={c.id}>{c.name} ({c.gradeLevel?.name})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex gap-2">
              <Button variant={viewMode === "week" ? "default" : "outline" } onClick={() => setViewMode("week")}>Week</Button>
              <Button variant={viewMode === "day" ? "default" : "outline" } onClick={() => setViewMode("day")}>Day</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {viewMode === "week" ? (
        <WeekView timetableByDay={timetableByDay} selectedWeek={selectedWeek} currentDayIndex={currentDayIndex} isLoading={isLoading} />
      ) : (
        <DayView timetableByDay={timetableByDay} selectedWeek={selectedWeek} currentDayIndex={currentDayIndex} isLoading={isLoading} />
      )}
    </div>
  );
}

function WeekView({ timetableByDay, selectedWeek, currentDayIndex, isLoading }: { timetableByDay: any; selectedWeek: Date; currentDayIndex: number; isLoading: boolean }) {
  const timeSlots = generateTimeSlots();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="w-32 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              {daysOfWeek.map((day, i) => (
                <th key={day} className={cn("px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider", i === currentDayIndex && "bg-blue-50 text-blue-700")}>
                  <div className="flex flex-col items-center gap-1">
                    <span>{dayLabels[i]}</span>
                    <span className="text-xs text-gray-400">{formatDate(getDateForDay(selectedWeek, i))}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot, slotIndex) => (
              <tr key={slot} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="w-32 px-3 py-1 text-xs text-gray-600 font-medium whitespace-nowrap">{slot}</td>
                {daysOfWeek.map((day, dayIndex) => (
                  <td key={day} className={cn("px-2 py-1.5 align-top min-h-[80px]", dayIndex === currentDayIndex && "bg-blue-50")}>
                    {renderDayEntries(timetableByDay[day], slot)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function DayView({ timetableByDay, selectedWeek, currentDayIndex, isLoading }: { timetableByDay: any; selectedWeek: Date; currentDayIndex: number; isLoading: boolean }) {
  const todayIndex = currentDayIndex;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const day = daysOfWeek[todayIndex];
  const entries = timetableByDay[day] || [];
  const date = getDateForDay(selectedWeek, todayIndex);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {dayLabels[todayIndex]}, {formatDate(date)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-lg">No classes scheduled for today</p>
            <p className="text-sm">Enjoy your free day!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry: any) => (
              <TimetableEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TimetableEntryCard({ entry }: { entry: any }) {
  return (
    <div className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-primary/50 hover:shadow-sm transition-all">
      <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
        <BookOpen className="h-8 w-8 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-semibold text-gray-900 truncate">{entry.subject?.name || "Unknown Subject"}</h4>
          <Badge variant="secondary" className="text-xs">{entry.class?.name || ""}</Badge>
        </div>
        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
          </span>
          {entry.teacher && (
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {entry.teacher.user?.firstName} {entry.teacher.user?.lastName}
            </span>
          )}
          {entry.classroom && (
            <span className="flex items-center gap-1 text-gray-500">
              Room: {entry.classroom}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = 7; hour <= 18; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`);
    slots.push(`${hour.toString().padStart(2, "0")}:30`);
  }
  return slots;
}

function renderDayEntries(entries: any[], timeSlot: string) {
  if (!entries || entries.length === 0) return null;

  return entries
    .filter((entry: any) => {
      const start = entry.startTime;
      const end = entry.endTime;
      return timeSlot >= start && timeSlot < end;
    })
    .map((entry: any) => (
      <div key={entry.id} className="mb-1 p-2 bg-primary/5 border border-primary/20 rounded text-xs">
        <div className="font-medium text-primary">{entry.subject?.name || "Class"}</div>
        <div className="text-gray-600">{entry.teacher?.user?.firstName} {entry.teacher?.user?.lastName}</div>
        <div className="text-gray-500">{entry.classroom || ""}</div>
      </div>
    ));
}

function getDateForDay(weekStart: Date, dayIndex: number): Date {
  const start = new Date(weekStart);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1) + dayIndex; // Monday as start
  return new Date(start.setDate(diff));
}