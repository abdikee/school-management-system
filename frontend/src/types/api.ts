// Enums
export type UserRole = "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";
export type UserStatus = "ACTIVE" | "INACTIVE" | "PENDING" | "SUSPENDED";
export type Gender = "MALE" | "FEMALE" | "OTHER";
export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
export type AttendanceSessionStatus = "OPEN" | "CLOSED" | "CANCELLED";
export type InvoiceStatus = "PENDING" | "PARTIAL" | "PAID" | "OVERDUE" | "CANCELLED";
export type PaymentMethod = "CASH" | "CARD" | "BANK_TRANSFER" | "MOBILE_MONEY" | "CHECK" | "OTHER";
export type FeeFrequency = "MONTHLY" | "QUARTERLY" | "SEMI_ANNUAL" | "ANNUAL" | "ONE_TIME";
export type Term = "TERM_1" | "TERM_2" | "TERM_3" | "SEMESTER_1" | "SEMESTER_2";
export type NotificationType = "ANNOUNCEMENT" | "ATTENDANCE_ALERT" | "GRADE_POSTED" | "FEE_DUE" | "FEE_OVERDUE" | "PAYMENT_RECEIVED" | "MESSAGE" | "SYSTEM";
export type NotificationChannel = "IN_APP" | "EMAIL" | "SMS" | "PUSH";

// Base types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  status: UserStatus;
  emailVerified: boolean;
  lastLoginAt?: string;
  schoolId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface School {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  academicYearStart: number;
  academicYearEnd: number;
  timezone: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GradeLevel {
  id: string;
  name: string;
  order: number;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  gradeLevelId: string;
  isCore: boolean;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Class {
  id: string;
  name: string;
  gradeLevelId: string;
  academicYearId: string;
  homeroomTeacherId?: string;
  capacity: number;
  room?: string;
  createdAt: string;
  updatedAt: string;
  gradeLevel?: GradeLevel;
  academicYear?: AcademicYear;
  homeroomTeacher?: Teacher;
}

export interface Teacher {
  id: string;
  userId: string;
  user: User;
  employeeId: string;
  hireDate: string;
  qualification?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  userId: string;
  user: User;
  studentId: string;
  dateOfBirth: string;
  gender: Gender;
  address?: string;
  bloodGroup?: string;
  medicalNotes?: string;
  parentId?: string;
  classId?: string;
  gradeLevelId?: string;
  enrollmentDate: string;
  status: UserStatus;
  previousSchool?: string;
  createdAt: string;
  updatedAt: string;
  class?: Class;
  gradeLevel?: GradeLevel;
}

export interface Parent {
  id: string;
  userId: string;
  user: User;
  occupation?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
  students?: Student[];
}

export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  subjectId?: string;
  sessionId?: string;
  date: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
  recordedById: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceSession {
  id: string;
  classId: string;
  subjectId?: string;
  classSubjectId?: string;
  date: string;
  startTime: string;
  endTime: string;
  teacherId: string;
  status: AttendanceSessionStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentType {
  id: string;
  name: string;
  weight: number;
  description?: string;
  color?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Assessment {
  id: string;
  name: string;
  typeId: string;
  type: AssessmentType;
  classSubjectId: string;
  subjectId?: string;
  date: string;
  maxScore: number;
  weight?: number;
  description?: string;
  instructions?: string;
  attachmentUrl?: string;
  isPublished: boolean;
  publishedAt?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface Grade {
  id: string;
  studentId: string;
  assessmentId: string;
  classSubjectId: string;
  score: number;
  gradedById?: string;
  gradedAt?: string;
  feedback?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeeStructure {
  id: string;
  name: string;
  description?: string;
  amount: number;
  frequency: FeeFrequency;
  gradeLevelId?: string;
  academicYearId: string;
  schoolId: string;
  dueDay: number;
  isActive: boolean;
  isOptional: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  studentId: string;
  parentId?: string;
  feeStructureId: string;
  academicYearId: string;
  amount: number;
  discount: number;
  tax: number;
  totalAmount: number;
  dueDate: string;
  status: InvoiceStatus;
  description?: string;
  generatedAt: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  transactionId?: string;
  reference?: string;
  paidAt: string;
  recordedById: string;
  notes?: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimetableEntry {
  id: string;
  classId: string;
  subjectId: string;
  teacherId?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  subject?: string;
  body: string;
  isRead: boolean;
  readAt?: string;
  parentId?: string;
  attachments?: any[];
  createdAt: string;
  updatedAt: string;
  sender?: User;
  recipient?: User;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  authorId: string;
  author?: User;
  targetRoles: UserRole[];
  targetClassId?: string;
  targetGradeLevelId?: string;
  isPublished: boolean;
  publishedAt?: string;
  expiresAt?: string;
  attachments?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: any;
  channels: NotificationChannel[];
  isRead: boolean;
  readAt?: string;
  sentAt?: string;
  createdAt: string;
}

// Auth types
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  schoolId?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Query params
export interface QueryParams {
  skip?: number;
  take?: number;
  search?: string;
  [key: string]: any;
}

// Dashboard types
export interface DashboardOverview {
  counts?: {
    students?: number;
    teachers?: number;
    classes?: number;
    schools?: number;
    revenue?: number;
  };
  attendance?: {
    rate?: number;
    records?: number;
  };
  finance?: {
    totalRevenue?: number;
    pendingAmount?: number;
    overdueAmount?: number;
  };
  recentEnrollments?: any[];
  unreadNotifications?: number;
}

export interface TeacherDashboard {
  counts?: {
    students?: number;
    classes?: number;
  };
  attendance?: {
    rate?: number;
    records?: number;
  };
  recentEnrollments?: any[];
  unreadNotifications?: number;
}

export interface StudentDashboard {
  attendance?: {
    rate?: number;
    records?: number;
  };
  grades?: {
    overall?: number;
    subjects?: number;
  };
  fees?: {
    pendingInvoices?: number;
  };
  notifications?: number;
}

export interface ParentDashboard {
  children?: Array<{
    student: Student;
    attendance: { rate: number; records: number };
    grades: { overall: number; subjects: number };
    fees: { pendingInvoices: number };
  }>;
  notifications?: number;
}

// Report types
export interface AttendanceSummary {
  totalRecords: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: number;
}

export interface StudentAttendanceReport {
  summary: AttendanceSummary;
  records: Attendance[];
}

export interface ClassAttendanceReport {
  class: Class;
  studentSummaries: Array<{
    student: Student;
    present: number;
    absent: number;
    late: number;
    excused: number;
    total: number;
    attendanceRate: number;
  }>;
  overallStats: AttendanceSummary;
}

export interface AttendanceTrends {
  labels: string[];
  data: Array<{
    date: string;
    present: number;
    absent: number;
    late: number;
    excused: number;
    rate: number;
  }>;
}

export interface GradeSummary {
  totalAssessments: number;
  totalGrades: number;
  averageScore: number;
  passRate: number;
  bySubject: Array<{
    subject: Subject;
    average: number;
    count: number;
  }>;
}

export interface StudentGradeReport {
  overall: {
    average: number;
    totalAssessments: number;
    totalScore: number;
    maxPossibleScore: number;
  };
  subjectReports: Array<{
    subject: Subject;
    assessments: Array<{
      assessment: Assessment;
      grade: Grade | null;
      percentage: number;
    }>;
    average: number;
  }>;
}

export interface ClassGradeReport {
  class: Class;
  studentReports: Array<{
    student: Student;
    gradeCount: number;
    average: number;
  }>;
  subjectAverages: Array<{
    subject: Subject;
    average: number;
  }>;
}

export interface FinanceDashboard {
  totalRevenue: number;
  pendingAmount: number;
  overdueAmount: number;
  collectedAmount: number;
  byFeeStructure: Array<{
    feeStructure: FeeStructure;
    total: number;
    collected: number;
    pending: number;
    overdue: number;
  }>;
  recentPayments: Payment[];
}

export interface FeeCollectionReport {
  invoices: Array<{
    invoice: Invoice;
    student: Student;
    parent?: Parent;
    feeStructure: FeeStructure;
    amount: number;
    paidAmount: number;
    outstanding: number;
    lastPaymentDate?: string;
  }>;
  summary: {
    totalInvoices: number;
    totalAmount: number;
    collectedAmount: number;
    outstandingAmount: number;
    overdueAmount: number;
  };
}

export interface EnrollmentReport {
  totalStudents: number;
  byClass: Array<{
    class: Class;
    count: number;
    capacity: number;
    utilization: number;
  }>;
  byGradeLevel: Array<{
    gradeLevel: GradeLevel;
    count: number;
  }>;
}

export interface TeacherWorkloadReport {
  teachers: Array<{
    teacher: Teacher;
    classesCount: number;
    subjectsCount: number;
    studentsCount: number;
  }>;
}