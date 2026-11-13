import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/services/api";
import type { User, UserRole, UserStatus, Gender, Student, Teacher, Parent } from "@/types/api";

// Query keys
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  profile: () => [...userKeys.all, "profile"] as const,
  students: () => [...userKeys.all, "students"] as const,
  studentsList: (filters: Record<string, any>) => [...userKeys.students(), filters] as const,
  student: (id: string) => [...userKeys.students(), id] as const,
  teachers: () => [...userKeys.all, "teachers"] as const,
  teachersList: (filters: Record<string, any>) => [...userKeys.teachers(), filters] as const,
  teacher: (id: string) => [...userKeys.teachers(), id] as const,
  parents: () => [...userKeys.all, "parents"] as const,
  parentsList: (filters: Record<string, any>) => [...userKeys.parents(), filters] as const,
  parent: (id: string) => [...userKeys.parents(), id] as const,
};

// ============================================
// GENERAL USER QUERIES
// ============================================

export const useUsers = (params?: { skip?: number; take?: number; role?: UserRole; status?: UserStatus }) => {
  return useQuery({
    queryKey: userKeys.list(params || {}),
    queryFn: () => usersApi.getAll(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useUserProfile = () => {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: () => usersApi.getProfile(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersApi.getById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

// ============================================
// USER MUTATIONS
// ============================================

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<User>) => usersApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
    },
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) => usersApi.updateStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

// ============================================
// STUDENT QUERIES & MUTATIONS
// ============================================

export const useStudents = (params?: { skip?: number; take?: number; classId?: string; gradeLevelId?: string; search?: string }) => {
  return useQuery({
    queryKey: userKeys.studentsList(params || {}),
    queryFn: () => usersApi.getStudents(params),
    staleTime: 2 * 60 * 1000,
  });
};

export const useStudent = (id: string) => {
  return useQuery({
    queryKey: userKeys.student(id),
    queryFn: () => usersApi.getStudentById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone?: string;
      studentId: string;
      dateOfBirth: string;
      gender: Gender;
      address?: string;
      parentId?: string;
      classId?: string;
      gradeLevelId?: string;
      schoolId?: string;
    }) => usersApi.createStudent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.students() });
    },
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Student> }) => usersApi.updateStudent(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.student(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.students() });
    },
  });
};

export const useEnrollStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studentId, classId }: { studentId: string; classId: string }) => usersApi.enrollStudent(studentId, classId),
    onSuccess: (_, { studentId }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.student(studentId) });
      queryClient.invalidateQueries({ queryKey: userKeys.students() });
    },
  });
};

export const useTransferStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studentId, classId }: { studentId: string; classId: string }) => usersApi.transferStudent(studentId, classId),
    onSuccess: (_, { studentId }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.student(studentId) });
      queryClient.invalidateQueries({ queryKey: userKeys.students() });
    },
  });
};

// ============================================
// TEACHER QUERIES & MUTATIONS
// ============================================

export const useTeachers = (params?: { skip?: number; take?: number; search?: string }) => {
  return useQuery({
    queryKey: userKeys.teachersList(params || {}),
    queryFn: () => usersApi.getTeachers(params),
    staleTime: 2 * 60 * 1000,
  });
};

export const useTeacher = (id: string) => {
  return useQuery({
    queryKey: userKeys.teacher(id),
    queryFn: () => usersApi.getTeacherById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreateTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone?: string;
      employeeId: string;
      hireDate: string;
      qualification?: string;
      subjects?: string[];
      schoolId?: string;
    }) => usersApi.createTeacher(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.teachers() });
    },
  });
};

export const useUpdateTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Teacher> }) => usersApi.updateTeacher(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.teacher(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.teachers() });
    },
  });
};

// ============================================
// PARENT QUERIES & MUTATIONS
// ============================================

export const useParents = (params?: { skip?: number; take?: number; search?: string }) => {
  return useQuery({
    queryKey: userKeys.parentsList(params || {}),
    queryFn: () => usersApi.getParents(params),
    staleTime: 2 * 60 * 1000,
  });
};

export const useParent = (id: string) => {
  return useQuery({
    queryKey: userKeys.parent(id),
    queryFn: () => usersApi.getParentById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreateParent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone?: string;
      occupation?: string;
      address?: string;
      schoolId?: string;
    }) => usersApi.createParent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.parents() });
    },
  });
};

export const useUpdateParent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Parent> }) => usersApi.updateParent(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.parent(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.parents() });
    },
  });
};

export const useLinkParentToStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ parentId, data }: { parentId: string; data: { studentId: string; relationship: string; isPrimary?: boolean } }) =>
      usersApi.linkParentToStudent(parentId, data),
    onSuccess: (_, { parentId }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.parent(parentId) });
      queryClient.invalidateQueries({ queryKey: userKeys.parents() });
    },
  });
};

export const useUnlinkParentFromStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ parentId, studentId }: { parentId: string; studentId: string }) =>
      usersApi.unlinkParentFromStudent(parentId, studentId),
    onSuccess: (_, { parentId }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.parent(parentId) });
      queryClient.invalidateQueries({ queryKey: userKeys.parents() });
    },
  });
};

// ============================================
// BULK OPERATIONS
// ============================================

export const useBulkCreateUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (users: Array<{
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone?: string;
      role: UserRole;
      schoolId?: string;
    }>) => usersApi.bulkCreateUsers(users),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.students() });
      queryClient.invalidateQueries({ queryKey: userKeys.teachers() });
      queryClient.invalidateQueries({ queryKey: userKeys.parents() });
    },
  });
};