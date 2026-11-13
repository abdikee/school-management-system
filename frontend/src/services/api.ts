import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import type { AuthTokens, LoginDto, RegisterDto, ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto } from "@/types/api";
import type { User, UserRole, UserStatus, Student, Teacher, Parent, School, AcademicYear, GradeLevel, Subject, Class, TimetableEntry, Message, Announcement, Notification } from "@/types/api";
import type { DashboardOverview, TeacherDashboard, StudentDashboard, ParentDashboard } from "@/types/api";
import type { AttendanceSummary, StudentAttendanceReport, ClassAttendanceReport, AttendanceTrends } from "@/types/api";
import type { GradeSummary, StudentGradeReport, ClassGradeReport } from "@/types/api";
import type { FinanceDashboard, FeeCollectionReport, EnrollmentReport, TeacherWorkloadReport } from "@/types/api";

// API Base URL - in production this should come from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookies (refresh token)
});

// Request interceptor - add access token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - extract data from response
api.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (data: LoginDto): Promise<AuthTokens> => api.post<AuthTokens>("/auth/login", data) as unknown as Promise<AuthTokens>,
  register: (data: RegisterDto): Promise<AuthTokens> => api.post<AuthTokens>("/auth/register", data) as unknown as Promise<AuthTokens>,
  refresh: (refreshToken?: string): Promise<AuthTokens> => api.post<AuthTokens>("/auth/refresh", { refreshToken }) as unknown as Promise<AuthTokens>,
  logout: (): Promise<void> => api.post("/auth/logout") as unknown as Promise<void>,
  getProfile: (): Promise<User> => api.get("/auth/profile") as unknown as Promise<User>,
  changePassword: (data: ChangePasswordDto): Promise<void> => api.post("/auth/change-password", data) as unknown as Promise<void>,
  forgotPassword: (data: ForgotPasswordDto): Promise<void> => api.post("/auth/forgot-password", data) as unknown as Promise<void>,
  resetPassword: (data: ResetPasswordDto): Promise<void> => api.post("/auth/reset-password", data) as unknown as Promise<void>,
  verifyEmail: (token: string): Promise<void> => api.get(`/auth/verify-email?token=${token}`) as unknown as Promise<void>,
};

// Users API
export const usersApi = {
  // General
  getAll: (params?: { skip?: number; take?: number; role?: UserRole; status?: UserStatus }): Promise<PaginatedResponse<User>> =>
    api.get("/users", { params }) as unknown as Promise<PaginatedResponse<User>>,
  getProfile: (): Promise<User> => api.get("/users/profile") as unknown as Promise<User>,
  updateProfile: (data: Partial<User>): Promise<User> => api.put("/users/profile", data) as unknown as Promise<User>,
  getById: (id: string): Promise<User> => api.get(`/users/${id}`) as unknown as Promise<User>,
  updateStatus: (id: string, status: UserStatus): Promise<User> => api.put(`/users/${id}/status`, { status }) as unknown as Promise<User>,
  delete: (id: string): Promise<void> => api.delete(`/users/${id}`) as unknown as Promise<void>,

  // Students
  createStudent: (data: any): Promise<Student> => api.post("/users/students", data) as unknown as Promise<Student>,
  getStudents: (params?: { skip?: number; take?: number; classId?: string; gradeLevelId?: string; search?: string }): Promise<PaginatedResponse<Student>> =>
    api.get("/users/students", { params }) as unknown as Promise<PaginatedResponse<Student>>,
  getStudentById: (id: string): Promise<Student> => api.get(`/users/students/${id}`) as unknown as Promise<Student>,
  updateStudent: (id: string, data: Partial<Student>): Promise<Student> => api.put(`/users/students/${id}`, data) as unknown as Promise<Student>,
  enrollStudent: (studentId: string, classId: string): Promise<Student> => api.post(`/users/students/${studentId}/enroll`, { classId }) as unknown as Promise<Student>,
  transferStudent: (studentId: string, classId: string): Promise<Student> => api.post(`/users/students/${studentId}/transfer`, { classId }) as unknown as Promise<Student>,

  // Teachers
  createTeacher: (data: any): Promise<Teacher> => api.post("/users/teachers", data) as unknown as Promise<Teacher>,
  getTeachers: (params?: { skip?: number; take?: number; search?: string }): Promise<PaginatedResponse<Teacher>> =>
    api.get("/users/teachers", { params }) as unknown as Promise<PaginatedResponse<Teacher>>,
  getTeacherById: (id: string): Promise<Teacher> => api.get(`/users/teachers/${id}`) as unknown as Promise<Teacher>,
  updateTeacher: (id: string, data: Partial<Teacher>): Promise<Teacher> => api.put(`/users/teachers/${id}`, data) as unknown as Promise<Teacher>,

  // Parents
  createParent: (data: any): Promise<Parent> => api.post("/users/parents", data) as unknown as Promise<Parent>,
  getParents: (params?: { skip?: number; take?: number; search?: string }): Promise<PaginatedResponse<Parent>> =>
    api.get("/users/parents", { params }) as unknown as Promise<PaginatedResponse<Parent>>,
  getParentById: (id: string): Promise<Parent> => api.get(`/users/parents/${id}`) as unknown as Promise<Parent>,
  updateParent: (id: string, data: Partial<Parent>): Promise<Parent> => api.put(`/users/parents/${id}`, data) as unknown as Promise<Parent>,
  linkParentToStudent: (parentId: string, data: { studentId: string; relationship: string; isPrimary?: boolean }): Promise<void> =>
    api.post(`/users/parents/${parentId}/students`, data) as unknown as Promise<void>,
  unlinkParentFromStudent: (parentId: string, studentId: string): Promise<void> =>
    api.delete(`/users/parents/${parentId}/students/${studentId}`) as unknown as Promise<void>,

  // Bulk
  bulkCreateUsers: (users: any[]): Promise<void> => api.post("/users/bulk", users) as unknown as Promise<void>,
};

// Academic API
export const academicApi = {
  // Schools
  createSchool: (data: any): Promise<School> => api.post("/academic/schools", data) as unknown as Promise<School>,
  getSchools: (params?: { skip?: number; take?: number; search?: string }): Promise<PaginatedResponse<School>> =>
    api.get("/academic/schools", { params }) as unknown as Promise<PaginatedResponse<School>>,
  getSchoolById: (id: string): Promise<School> => api.get(`/academic/schools/${id}`) as unknown as Promise<School>,
  updateSchool: (id: string, data: Partial<School>): Promise<School> => api.put(`/academic/schools/${id}`, data) as unknown as Promise<School>,
  deleteSchool: (id: string): Promise<void> => api.delete(`/academic/schools/${id}`) as unknown as Promise<void>,

  // Academic Years
  createAcademicYear: (schoolId: string, data: any): Promise<AcademicYear> => api.post(`/academic/schools/${schoolId}/academic-years`, data) as unknown as Promise<AcademicYear>,
  getAcademicYears: (schoolId: string, params?: { skip?: number; take?: number }): Promise<PaginatedResponse<AcademicYear>> =>
    api.get(`/academic/schools/${schoolId}/academic-years`, { params }) as unknown as Promise<PaginatedResponse<AcademicYear>>,
  getCurrentAcademicYear: (schoolId: string): Promise<AcademicYear> => api.get(`/academic/schools/${schoolId}/academic-years/current`) as unknown as Promise<AcademicYear>,
  getAcademicYearById: (id: string): Promise<AcademicYear> => api.get(`/academic/academic-years/${id}`) as unknown as Promise<AcademicYear>,
  updateAcademicYear: (id: string, data: Partial<AcademicYear>): Promise<AcademicYear> => api.put(`/academic/academic-years/${id}`, data) as unknown as Promise<AcademicYear>,
  deleteAcademicYear: (id: string): Promise<void> => api.delete(`/academic/academic-years/${id}`) as unknown as Promise<void>,

  // Grade Levels
  createGradeLevel: (schoolId: string, data: any): Promise<GradeLevel> => api.post(`/academic/schools/${schoolId}/grade-levels`, data) as unknown as Promise<GradeLevel>,
  getGradeLevels: (schoolId: string, params?: { skip?: number; take?: number }): Promise<PaginatedResponse<GradeLevel>> =>
    api.get(`/academic/schools/${schoolId}/grade-levels`, { params }) as unknown as Promise<PaginatedResponse<GradeLevel>>,
  getGradeLevelById: (id: string): Promise<GradeLevel> => api.get(`/academic/grade-levels/${id}`) as unknown as Promise<GradeLevel>,
  updateGradeLevel: (id: string, data: Partial<GradeLevel>): Promise<GradeLevel> => api.put(`/academic/grade-levels/${id}`, data) as unknown as Promise<GradeLevel>,
  deleteGradeLevel: (id: string): Promise<void> => api.delete(`/academic/grade-levels/${id}`) as unknown as Promise<void>,

  // Subjects
  createSubject: (gradeLevelId: string, data: any): Promise<Subject> => api.post(`/academic/grade-levels/${gradeLevelId}/subjects`, data) as unknown as Promise<Subject>,
  getSubjects: (gradeLevelId: string, params?: { skip?: number; take?: number }): Promise<PaginatedResponse<Subject>> =>
    api.get(`/academic/grade-levels/${gradeLevelId}/subjects`, { params }) as unknown as Promise<PaginatedResponse<Subject>>,
  getSubjectById: (id: string): Promise<Subject> => api.get(`/academic/subjects/${id}`) as unknown as Promise<Subject>,
  updateSubject: (id: string, data: Partial<Subject>): Promise<Subject> => api.put(`/academic/subjects/${id}`, data) as unknown as Promise<Subject>,
  deleteSubject: (id: string): Promise<void> => api.delete(`/academic/subjects/${id}`) as unknown as Promise<void>,

  // Classes
  createClass: (data: any): Promise<Class> => api.post("/academic/classes", data) as unknown as Promise<Class>,
  getClasses: (params?: { skip?: number; take?: number; gradeLevelId?: string; academicYearId?: string; search?: string }): Promise<PaginatedResponse<Class>> =>
    api.get("/academic/classes", { params }) as unknown as Promise<PaginatedResponse<Class>>,
  getClassById: (id: string): Promise<Class> => api.get(`/academic/classes/${id}`) as unknown as Promise<Class>,
  updateClass: (id: string, data: Partial<Class>): Promise<Class> => api.put(`/academic/classes/${id}`, data) as unknown as Promise<Class>,
  deleteClass: (id: string): Promise<void> => api.delete(`/academic/classes/${id}`) as unknown as Promise<void>,

  // Class Subjects
  assignSubjectToClass: (classId: string, data: { subjectId: string; teacherId?: string }): Promise<void> =>
    api.post(`/academic/classes/${classId}/subjects`, data) as unknown as Promise<void>,
  getClassSubjects: (classId: string): Promise<any[]> => api.get(`/academic/classes/${classId}/subjects`) as unknown as Promise<any[]>,
  updateClassSubject: (id: string, data: any): Promise<void> => api.put(`/academic/class-subjects/${id}`, data) as unknown as Promise<void>,
  removeSubjectFromClass: (classId: string, subjectId: string): Promise<void> =>
    api.delete(`/academic/classes/${classId}/subjects/${subjectId}`) as unknown as Promise<void>,

  // Timetable
  createTimetableEntry: (classId: string, data: any): Promise<TimetableEntry> => api.post(`/academic/classes/${classId}/timetable`, data) as unknown as Promise<TimetableEntry>,
  getTimetable: (classId: string): Promise<TimetableEntry[]> => api.get(`/academic/classes/${classId}/timetable`) as unknown as Promise<TimetableEntry[]>,
  getTeacherTimetable: (teacherId: string): Promise<TimetableEntry[]> => api.get(`/academic/teachers/${teacherId}/timetable`) as unknown as Promise<TimetableEntry[]>,
  updateTimetableEntry: (id: string, data: Partial<TimetableEntry>): Promise<TimetableEntry> => api.put(`/academic/timetable/${id}`, data) as unknown as Promise<TimetableEntry>,
  deleteTimetableEntry: (id: string): Promise<void> => api.delete(`/academic/timetable/${id}`) as unknown as Promise<void>,

  // Bulk
  bulkCreateClasses: (classes: any[]): Promise<void> => api.post("/academic/classes/bulk", classes) as unknown as Promise<void>,
  promoteStudents: (data: { currentAcademicYearId: string; nextAcademicYearId: string }): Promise<void> =>
    api.post("/academic/promote-students", data) as unknown as Promise<void>,
};

// Communication API
export const communicationApi = {
  // Messages
  sendMessage: (data: { recipientId: string; subject?: string; body: string; parentId?: string; attachments?: any[] }): Promise<Message> =>
    api.post("/communication/messages", data) as unknown as Promise<Message>,
  getMessages: (params?: { skip?: number; take?: number; role?: "sent" | "received" | "all"; isRead?: boolean; search?: string }): Promise<PaginatedResponse<Message>> =>
    api.get("/communication/messages", { params }) as unknown as Promise<PaginatedResponse<Message>>,
  getUnreadMessageCount: (): Promise<number> => api.get("/communication/messages/unread-count") as unknown as Promise<number>,
  getMessageById: (id: string): Promise<Message> => api.get(`/communication/messages/${id}`) as unknown as Promise<Message>,
  getMessageThread: (id: string): Promise<Message[]> => api.get(`/communication/messages/${id}/thread`) as unknown as Promise<Message[]>,
  markMessageAsRead: (id: string): Promise<void> => api.put(`/communication/messages/${id}/read`) as unknown as Promise<void>,
  markMessageAsUnread: (id: string): Promise<void> => api.put(`/communication/messages/${id}/unread`) as unknown as Promise<void>,
  deleteMessage: (id: string): Promise<void> => api.delete(`/communication/messages/${id}`) as unknown as Promise<void>,

  // Announcements
  createAnnouncement: (data: { title: string; body: string; targetRoles: UserRole[]; targetClassId?: string; targetGradeLevelId?: string; expiresAt?: string; attachments?: any[] }): Promise<Announcement> =>
    api.post("/communication/announcements", data) as unknown as Promise<Announcement>,
  getAnnouncements: (params?: { skip?: number; take?: number; targetRoles?: UserRole[]; targetClassId?: string; targetGradeLevelId?: string; isPublished?: boolean; authorId?: string; search?: string; includeExpired?: boolean }): Promise<PaginatedResponse<Announcement>> =>
    api.get("/communication/announcements", { params }) as unknown as Promise<PaginatedResponse<Announcement>>,
  getAnnouncementsForUser: (params?: { skip?: number; take?: number; includeExpired?: boolean }): Promise<PaginatedResponse<Announcement>> =>
    api.get("/communication/announcements/my", { params }) as unknown as Promise<PaginatedResponse<Announcement>>,
  getAnnouncementById: (id: string): Promise<Announcement> => api.get(`/communication/announcements/${id}`) as unknown as Promise<Announcement>,
  updateAnnouncement: (id: string, data: Partial<Announcement>): Promise<Announcement> => api.put(`/communication/announcements/${id}`, data) as unknown as Promise<Announcement>,
  publishAnnouncement: (id: string): Promise<void> => api.put(`/communication/announcements/${id}/publish`) as unknown as Promise<void>,
  unpublishAnnouncement: (id: string): Promise<void> => api.put(`/communication/announcements/${id}/unpublish`) as unknown as Promise<void>,
  deleteAnnouncement: (id: string): Promise<void> => api.delete(`/communication/announcements/${id}`) as unknown as Promise<void>,

  // Notifications
  createNotification: (data: { userId: string; type: string; title: string; body: string; data?: any; channels?: string[] }): Promise<Notification> =>
    api.post("/communication/notifications", data) as unknown as Promise<Notification>,
  sendNotification: (data: { userId: string; type: string; title: string; body: string; data?: any; channels?: string[]; sendEmail?: boolean; sendSms?: boolean; sendPush?: boolean }): Promise<void> =>
    api.post("/communication/notifications/send", data) as unknown as Promise<void>,
  getNotifications: (params?: { skip?: number; take?: number; isRead?: boolean; type?: string; dateFrom?: string; dateTo?: string }): Promise<PaginatedResponse<Notification>> =>
    api.get("/communication/notifications", { params }) as unknown as Promise<PaginatedResponse<Notification>>,
  getUnreadNotificationCount: (): Promise<number> => api.get("/communication/notifications/unread-count") as unknown as Promise<number>,
  getNotificationById: (id: string): Promise<Notification> => api.get(`/communication/notifications/${id}`) as unknown as Promise<Notification>,
  markNotificationAsRead: (id: string): Promise<void> => api.put(`/communication/notifications/${id}/read`) as unknown as Promise<void>,
  markAllNotificationsAsRead: (): Promise<void> => api.put("/communication/notifications/read-all") as unknown as Promise<void>,
  deleteNotification: (id: string): Promise<void> => api.delete(`/communication/notifications/${id}`) as unknown as Promise<void>,
};

// Reports API
export const reportsApi = {
  // Dashboard
  getDashboardOverview: (params?: { schoolId?: string; academicYearId?: string }): Promise<DashboardOverview> =>
    api.get("/reports/dashboard", { params }) as unknown as Promise<DashboardOverview>,
  getTeacherDashboard: (params?: { schoolId?: string; academicYearId?: string }): Promise<TeacherDashboard> =>
    api.get("/reports/dashboard/teacher", { params }) as unknown as Promise<TeacherDashboard>,
  getStudentDashboard: (): Promise<StudentDashboard> => api.get("/reports/dashboard/student") as unknown as Promise<StudentDashboard>,
  getParentDashboard: (): Promise<ParentDashboard> => api.get("/reports/dashboard/parent") as unknown as Promise<ParentDashboard>,

  // Attendance Reports
  getAttendanceSummary: (params?: { schoolId?: string; academicYearId?: string; classId?: string; dateFrom?: string; dateTo?: string }): Promise<AttendanceSummary> =>
    api.get("/reports/attendance/summary", { params }) as unknown as Promise<AttendanceSummary>,
  getStudentAttendanceReport: (studentId: string, params?: { academicYearId?: string; dateFrom?: string; dateTo?: string }): Promise<StudentAttendanceReport> =>
    api.get(`/reports/attendance/student/${studentId}`, { params }) as unknown as Promise<StudentAttendanceReport>,
  getClassAttendanceReport: (classId: string, params?: { dateFrom?: string; dateTo?: string; subjectId?: string }): Promise<ClassAttendanceReport> =>
    api.get(`/reports/attendance/class/${classId}`, { params }) as unknown as Promise<ClassAttendanceReport>,
  getAttendanceTrends: (params?: { schoolId?: string; academicYearId?: string; classId?: string; dateFrom?: string; dateTo?: string; groupBy?: "day" | "week" | "month" }): Promise<AttendanceTrends> =>
    api.get("/reports/attendance/trends", { params }) as unknown as Promise<AttendanceTrends>,

  // Grade Reports
  getGradeSummary: (params?: { schoolId?: string; academicYearId?: string; classId?: string; subjectId?: string; term?: string }): Promise<GradeSummary> =>
    api.get("/reports/grades/summary", { params }) as unknown as Promise<GradeSummary>,
  getStudentGradeReport: (studentId: string, params?: { academicYearId?: string; classSubjectId?: string; term?: string }): Promise<StudentGradeReport> =>
    api.get(`/reports/grades/student/${studentId}`, { params }) as unknown as Promise<StudentGradeReport>,
  getClassGradeReport: (classId: string, params?: { subjectId?: string; academicYearId?: string; term?: string }): Promise<ClassGradeReport> =>
    api.get(`/reports/grades/class/${classId}`, { params }) as unknown as Promise<ClassGradeReport>,

  // Finance Reports
  getFinanceDashboard: (params?: { schoolId?: string; academicYearId?: string; dateFrom?: string; dateTo?: string }): Promise<FinanceDashboard> =>
    api.get("/reports/finance/dashboard", { params }) as unknown as Promise<FinanceDashboard>,
  getFeeCollectionReport: (params?: { schoolId?: string; academicYearId?: string; feeStructureId?: string; dateFrom?: string; dateTo?: string }): Promise<FeeCollectionReport> =>
    api.get("/reports/finance/fee-collection", { params }) as unknown as Promise<FeeCollectionReport>,

  // Enrollment Reports
  getEnrollmentReport: (params?: { schoolId?: string; academicYearId?: string; gradeLevelId?: string }): Promise<EnrollmentReport> =>
    api.get("/reports/enrollment", { params }) as unknown as Promise<EnrollmentReport>,
  getTeacherWorkloadReport: (params?: { schoolId?: string; academicYearId?: string }): Promise<TeacherWorkloadReport> =>
    api.get("/reports/teachers/workload", { params }) as unknown as Promise<TeacherWorkloadReport>,

  // Exports
  exportAttendance: (params: { classId: string; dateFrom?: string; dateTo?: string; subjectId?: string }): Promise<Blob> =>
    api.get("/reports/export/attendance", { params, responseType: "blob" }) as unknown as Promise<Blob>,
  exportGrades: (params: { classId: string; subjectId?: string; academicYearId?: string; term?: string }): Promise<Blob> =>
    api.get("/reports/export/grades", { params, responseType: "blob" }) as unknown as Promise<Blob>,
  exportFinance: (params?: { schoolId?: string; academicYearId?: string; feeStructureId?: string; dateFrom?: string; dateTo?: string }): Promise<Blob> =>
    api.get("/reports/export/finance", { params, responseType: "blob" }) as unknown as Promise<Blob>,
  exportEnrollment: (params?: { schoolId?: string; academicYearId?: string; gradeLevelId?: string }): Promise<Blob> =>
    api.get("/reports/export/enrollment", { params, responseType: "blob" }) as unknown as Promise<Blob>,
};

// Attendance API
export const attendanceApi = {
  // Add attendance endpoints when needed
};

// Grades API
export const gradesApi = {
  // Add grades endpoints when needed
};

// Finance API
export const financeApi = {
  // Add finance endpoints when needed
};

// Pagination type
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default api;