import { useMutation, useQuery } from "@tanstack/react-query";
import { reportsApi } from "@/services/api";
import type {
  Term,
  DashboardOverview,
  TeacherDashboard,
  StudentDashboard,
  ParentDashboard,
  AttendanceSummary,
  StudentAttendanceReport,
  ClassAttendanceReport,
  AttendanceTrends,
  GradeSummary,
  StudentGradeReport,
  ClassGradeReport,
  FinanceDashboard,
  FeeCollectionReport,
  EnrollmentReport,
  TeacherWorkloadReport,
} from "@/types/api";

// Query keys
export const reportsKeys = {
  all: ["reports"] as const,
  dashboard: () => [...reportsKeys.all, "dashboard"] as const,
  dashboardOverview: (params: Record<string, any>) => [...reportsKeys.dashboard(), "overview", params] as const,
  teacherDashboard: (params: Record<string, any>) => [...reportsKeys.dashboard(), "teacher", params] as const,
  studentDashboard: () => [...reportsKeys.dashboard(), "student"] as const,
  parentDashboard: () => [...reportsKeys.dashboard(), "parent"] as const,
  attendance: () => [...reportsKeys.all, "attendance"] as const,
  attendanceSummary: (params: Record<string, any>) => [...reportsKeys.attendance(), "summary", params] as const,
  studentAttendance: (studentId: string, params: Record<string, any>) => [...reportsKeys.attendance(), "student", studentId, params] as const,
  classAttendance: (classId: string, params: Record<string, any>) => [...reportsKeys.attendance(), "class", classId, params] as const,
  attendanceTrends: (params: Record<string, any>) => [...reportsKeys.attendance(), "trends", params] as const,
  grades: () => [...reportsKeys.all, "grades"] as const,
  gradeSummary: (params: Record<string, any>) => [...reportsKeys.grades(), "summary", params] as const,
  studentGrades: (studentId: string, params: Record<string, any>) => [...reportsKeys.grades(), "student", studentId, params] as const,
  classGrades: (classId: string, params: Record<string, any>) => [...reportsKeys.grades(), "class", classId, params] as const,
  finance: () => [...reportsKeys.all, "finance"] as const,
  financeDashboard: (params: Record<string, any>) => [...reportsKeys.finance(), "dashboard", params] as const,
  feeCollection: (params: Record<string, any>) => [...reportsKeys.finance(), "fee-collection", params] as const,
  enrollment: () => [...reportsKeys.all, "enrollment"] as const,
  enrollmentReport: (params: Record<string, any>) => [...reportsKeys.enrollment(), params] as const,
  teacherWorkload: (params: Record<string, any>) => [...reportsKeys.all, "teacher-workload", params] as const,
  exports: () => [...reportsKeys.all, "exports"] as const,
};

// ============================================
// DASHBOARD QUERIES
// ============================================

export const useDashboardOverview = (params?: { schoolId?: string; academicYearId?: string }, enabled = true) => {
  return useQuery<DashboardOverview>({
    queryKey: reportsKeys.dashboardOverview(params || {}),
    queryFn: () => reportsApi.getDashboardOverview(params),
    staleTime: 2 * 60 * 1000,
    enabled,
  });
};

export const useTeacherDashboard = (params?: { schoolId?: string; academicYearId?: string }, enabled = true) => {
  return useQuery<TeacherDashboard>({
    queryKey: reportsKeys.teacherDashboard(params || {}),
    queryFn: () => reportsApi.getTeacherDashboard(params),
    staleTime: 2 * 60 * 1000,
    enabled,
  });
};

export const useStudentDashboard = (enabled = true) => {
  return useQuery<StudentDashboard>({
    queryKey: reportsKeys.studentDashboard(),
    queryFn: () => reportsApi.getStudentDashboard(),
    staleTime: 2 * 60 * 1000,
    enabled,
  });
};

export const useParentDashboard = (enabled = true) => {
  return useQuery<ParentDashboard>({
    queryKey: reportsKeys.parentDashboard(),
    queryFn: () => reportsApi.getParentDashboard(),
    staleTime: 2 * 60 * 1000,
    enabled,
  });
};

// ============================================
// ATTENDANCE REPORTS
// ============================================

export const useAttendanceSummary = (params?: {
  schoolId?: string;
  academicYearId?: string;
  classId?: string;
  studentId?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  return useQuery<AttendanceSummary>({
    queryKey: reportsKeys.attendanceSummary(params || {}),
    queryFn: () => reportsApi.getAttendanceSummary(params),
    staleTime: 2 * 60 * 1000,
    enabled: !!(params?.classId || params?.schoolId || params?.academicYearId),
  });
};

export const useStudentAttendanceReport = (
  studentId: string,
  params?: { academicYearId?: string; dateFrom?: string; dateTo?: string }
) => {
  return useQuery<StudentAttendanceReport>({
    queryKey: reportsKeys.studentAttendance(studentId, params || {}),
    queryFn: () => reportsApi.getStudentAttendanceReport(studentId, params),
    enabled: !!studentId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useClassAttendanceReport = (
  classId: string,
  params?: { dateFrom?: string; dateTo?: string; subjectId?: string }
) => {
  return useQuery<ClassAttendanceReport>({
    queryKey: reportsKeys.classAttendance(classId, params || {}),
    queryFn: () => reportsApi.getClassAttendanceReport(classId, params),
    enabled: !!classId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useAttendanceTrends = (params?: {
  schoolId?: string;
  academicYearId?: string;
  classId?: string;
  studentId?: string;
  dateFrom?: string;
  dateTo?: string;
  groupBy?: "day" | "week" | "month";
}) => {
  return useQuery<AttendanceTrends>({
    queryKey: reportsKeys.attendanceTrends(params || {}),
    queryFn: () => reportsApi.getAttendanceTrends(params),
    staleTime: 5 * 60 * 1000,
    enabled: !!(params?.schoolId || params?.academicYearId || params?.classId || params?.studentId),
  });
};

// ============================================
// GRADE REPORTS
// ============================================

export const useGradeSummary = (params?: {
  schoolId?: string;
  academicYearId?: string;
  classId?: string;
  subjectId?: string;
  term?: Term;
}) => {
  return useQuery<GradeSummary>({
    queryKey: reportsKeys.gradeSummary(params || {}),
    queryFn: () => reportsApi.getGradeSummary(params),
    staleTime: 2 * 60 * 1000,
    enabled: !!(params?.schoolId || params?.academicYearId || params?.classId),
  });
};

export const useStudentGradeReport = (
  studentId: string,
  params?: { academicYearId?: string; classSubjectId?: string; term?: Term }
) => {
  return useQuery<StudentGradeReport>({
    queryKey: reportsKeys.studentGrades(studentId, params || {}),
    queryFn: () => reportsApi.getStudentGradeReport(studentId, params),
    enabled: !!studentId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useClassGradeReport = (
  classId: string,
  params?: { subjectId?: string; academicYearId?: string; term?: Term }
) => {
  return useQuery<ClassGradeReport>({
    queryKey: reportsKeys.classGrades(classId, params || {}),
    queryFn: () => reportsApi.getClassGradeReport(classId, params),
    enabled: !!classId,
    staleTime: 2 * 60 * 1000,
  });
};

// ============================================
// FINANCE REPORTS
// ============================================

export const useFinanceDashboard = (params?: {
  schoolId?: string;
  academicYearId?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  return useQuery<FinanceDashboard>({
    queryKey: reportsKeys.financeDashboard(params || {}),
    queryFn: () => reportsApi.getFinanceDashboard(params),
    staleTime: 2 * 60 * 1000,
  });
};

export const useFeeCollectionReport = (params?: {
  schoolId?: string;
  academicYearId?: string;
  feeStructureId?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  return useQuery<FeeCollectionReport>({
    queryKey: reportsKeys.feeCollection(params || {}),
    queryFn: () => reportsApi.getFeeCollectionReport(params),
    staleTime: 2 * 60 * 1000,
  });
};

// ============================================
// ENROLLMENT REPORTS
// ============================================

export const useEnrollmentReport = (params?: {
  schoolId?: string;
  academicYearId?: string;
  gradeLevelId?: string;
}) => {
  return useQuery<EnrollmentReport>({
    queryKey: reportsKeys.enrollmentReport(params || {}),
    queryFn: () => reportsApi.getEnrollmentReport(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useTeacherWorkloadReport = (params?: { schoolId?: string; academicYearId?: string }) => {
  return useQuery<TeacherWorkloadReport>({
    queryKey: reportsKeys.teacherWorkload(params || {}),
    queryFn: () => reportsApi.getTeacherWorkloadReport(params),
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================
// EXPORT MUTATIONS
// ============================================

export const useExportAttendance = () => {
  return useMutation({
    mutationFn: (params: { classId: string; dateFrom?: string; dateTo?: string; subjectId?: string }) =>
      reportsApi.exportAttendance(params),
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `attendance-report-${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
  });
};

export const useExportGrades = () => {
  return useMutation({
    mutationFn: (params: { classId: string; subjectId?: string; academicYearId?: string; term?: Term }) =>
      reportsApi.exportGrades(params),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `grades-report-${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
  });
};

export const useExportFinance = () => {
  return useMutation({
    mutationFn: (params?: { schoolId?: string; academicYearId?: string; feeStructureId?: string; dateFrom?: string; dateTo?: string }) =>
      reportsApi.exportFinance(params),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `finance-report-${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
  });
};

export const useExportEnrollment = () => {
  return useMutation({
    mutationFn: (params?: { schoolId?: string; academicYearId?: string; gradeLevelId?: string }) =>
      reportsApi.exportEnrollment(params),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `enrollment-report-${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
  });
};