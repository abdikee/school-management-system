import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { academicApi } from "@/services/api";
import type { School, AcademicYear, GradeLevel, Subject, Class, TimetableEntry } from "@/types/api";

// Query keys
export const academicKeys = {
  all: ["academic"] as const,
  schools: () => [...academicKeys.all, "schools"] as const,
  school: (id: string) => [...academicKeys.schools(), id] as const,
  academicYears: (schoolId: string) => [...academicKeys.all, "academic-years", schoolId] as const,
  academicYear: (id: string) => [...academicKeys.all, "academic-year", id] as const,
  currentAcademicYear: (schoolId: string) => [...academicKeys.all, "current-academic-year", schoolId] as const,
  gradeLevels: (schoolId: string) => [...academicKeys.all, "grade-levels", schoolId] as const,
  gradeLevel: (id: string) => [...academicKeys.all, "grade-level", id] as const,
  subjects: (gradeLevelId: string) => [...academicKeys.all, "subjects", gradeLevelId] as const,
  subject: (id: string) => [...academicKeys.all, "subject", id] as const,
  classes: () => [...academicKeys.all, "classes"] as const,
  class: (id: string) => [...academicKeys.all, "class", id] as const,
  classSubjects: (classId: string) => [...academicKeys.all, "class-subjects", classId] as const,
  timetable: (classId: string) => [...academicKeys.all, "timetable", classId] as const,
  teacherTimetable: (teacherId: string) => [...academicKeys.all, "teacher-timetable", teacherId] as const,
};

// ============================================
// SCHOOL QUERIES & MUTATIONS
// ============================================

export const useSchools = (params?: { skip?: number; take?: number; search?: string }) => {
  return useQuery({
    queryKey: academicKeys.schools(),
    queryFn: () => academicApi.getSchools(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useSchool = (id: string) => {
  return useQuery({
    queryKey: academicKeys.school(id),
    queryFn: () => academicApi.getSchoolById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateSchool = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      address?: string;
      phone?: string;
      email?: string;
      website?: string;
      academicYearStart: number;
      academicYearEnd: number;
      timezone?: string;
      currency?: string;
    }) => academicApi.createSchool(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.schools() });
    },
  });
};

export const useUpdateSchool = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<School> }) => academicApi.updateSchool(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: academicKeys.school(id) });
      queryClient.invalidateQueries({ queryKey: academicKeys.schools() });
    },
  });
};

export const useDeleteSchool = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => academicApi.deleteSchool(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.schools() });
    },
  });
};

// ============================================
// ACADEMIC YEAR QUERIES & MUTATIONS
// ============================================

export const useAcademicYears = (schoolId: string, params?: { skip?: number; take?: number }) => {
  return useQuery({
    queryKey: academicKeys.academicYears(schoolId),
    queryFn: () => academicApi.getAcademicYears(schoolId, params),
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCurrentAcademicYear = (schoolId: string) => {
  return useQuery({
    queryKey: academicKeys.currentAcademicYear(schoolId),
    queryFn: () => academicApi.getCurrentAcademicYear(schoolId),
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAcademicYear = (id: string) => {
  return useQuery({
    queryKey: academicKeys.academicYear(id),
    queryFn: () => academicApi.getAcademicYearById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateAcademicYear = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ schoolId, data }: { schoolId: string; data: { name: string; startDate: string; endDate: string; isCurrent?: boolean } }) =>
      academicApi.createAcademicYear(schoolId, data),
    onSuccess: (_, { schoolId }) => {
      queryClient.invalidateQueries({ queryKey: academicKeys.academicYears(schoolId) });
    },
  });
};

export const useUpdateAcademicYear = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AcademicYear> }) => academicApi.updateAcademicYear(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: academicKeys.academicYear(id) });
    },
  });
};

export const useDeleteAcademicYear = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => academicApi.deleteAcademicYear(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.academicYears("") });
    },
  });
};

// ============================================
// GRADE LEVEL QUERIES & MUTATIONS
// ============================================

export const useGradeLevels = (schoolId: string, params?: { skip?: number; take?: number }) => {
  return useQuery({
    queryKey: academicKeys.gradeLevels(schoolId),
    queryFn: () => academicApi.getGradeLevels(schoolId, params),
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useGradeLevel = (id: string) => {
  return useQuery({
    queryKey: academicKeys.gradeLevel(id),
    queryFn: () => academicApi.getGradeLevelById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateGradeLevel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ schoolId, data }: { schoolId: string; data: { name: string; order: number } }) =>
      academicApi.createGradeLevel(schoolId, data),
    onSuccess: (_, { schoolId }) => {
      queryClient.invalidateQueries({ queryKey: academicKeys.gradeLevels(schoolId) });
    },
  });
};

export const useUpdateGradeLevel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<GradeLevel> }) => academicApi.updateGradeLevel(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: academicKeys.gradeLevel(id) });
    },
  });
};

export const useDeleteGradeLevel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => academicApi.deleteGradeLevel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.gradeLevels("") });
    },
  });
};

// ============================================
// SUBJECT QUERIES & MUTATIONS
// ============================================

export const useSubjects = (gradeLevelId: string, params?: { skip?: number; take?: number }) => {
  return useQuery({
    queryKey: academicKeys.subjects(gradeLevelId),
    queryFn: () => academicApi.getSubjects(gradeLevelId, params),
    enabled: !!gradeLevelId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useSubject = (id: string) => {
  return useQuery({
    queryKey: academicKeys.subject(id),
    queryFn: () => academicApi.getSubjectById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ gradeLevelId, data }: { gradeLevelId: string; data: { name: string; code: string; description?: string; isCore?: boolean; color?: string } }) =>
      academicApi.createSubject(gradeLevelId, data),
    onSuccess: (_, { gradeLevelId }) => {
      queryClient.invalidateQueries({ queryKey: academicKeys.subjects(gradeLevelId) });
    },
  });
};

export const useUpdateSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Subject> }) => academicApi.updateSubject(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: academicKeys.subject(id) });
    },
  });
};

export const useDeleteSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => academicApi.deleteSubject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.subjects("") });
    },
  });
};

// ============================================
// CLASS QUERIES & MUTATIONS
// ============================================

export const useClasses = (params?: { skip?: number; take?: number; gradeLevelId?: string; academicYearId?: string; search?: string }) => {
  return useQuery({
    queryKey: academicKeys.classes(),
    queryFn: () => academicApi.getClasses(params),
    staleTime: 2 * 60 * 1000,
  });
};

export const useClass = (id: string) => {
  return useQuery({
    queryKey: academicKeys.class(id),
    queryFn: () => academicApi.getClassById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreateClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      gradeLevelId: string;
      academicYearId: string;
      homeroomTeacherId?: string;
      capacity?: number;
      room?: string;
    }) => academicApi.createClass(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.classes() });
    },
  });
};

export const useUpdateClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Class> }) => academicApi.updateClass(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: academicKeys.class(id) });
      queryClient.invalidateQueries({ queryKey: academicKeys.classes() });
    },
  });
};

export const useDeleteClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => academicApi.deleteClass(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.classes() });
    },
  });
};

// ============================================
// CLASS SUBJECT QUERIES & MUTATIONS
// ============================================

export const useClassSubjects = (classId: string) => {
  return useQuery({
    queryKey: academicKeys.classSubjects(classId),
    queryFn: () => academicApi.getClassSubjects(classId),
    enabled: !!classId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useAssignSubjectToClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ classId, data }: { classId: string; data: { subjectId: string; teacherId?: string } }) =>
      academicApi.assignSubjectToClass(classId, data),
    onSuccess: (_, { classId }) => {
      queryClient.invalidateQueries({ queryKey: academicKeys.classSubjects(classId) });
      queryClient.invalidateQueries({ queryKey: academicKeys.class(classId) });
    },
  });
};

export const useUpdateClassSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => academicApi.updateClassSubject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.classSubjects("") });
    },
  });
};

export const useRemoveSubjectFromClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ classId, subjectId }: { classId: string; subjectId: string }) =>
      academicApi.removeSubjectFromClass(classId, subjectId),
    onSuccess: (_, { classId }) => {
      queryClient.invalidateQueries({ queryKey: academicKeys.classSubjects(classId) });
      queryClient.invalidateQueries({ queryKey: academicKeys.class(classId) });
    },
  });
};

// ============================================
// TIMETABLE QUERIES & MUTATIONS
// ============================================

export const useTimetable = (classId: string) => {
  return useQuery({
    queryKey: academicKeys.timetable(classId),
    queryFn: () => academicApi.getTimetable(classId),
    enabled: !!classId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useTeacherTimetable = (teacherId: string) => {
  return useQuery({
    queryKey: academicKeys.teacherTimetable(teacherId),
    queryFn: () => academicApi.getTeacherTimetable(teacherId),
    enabled: !!teacherId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreateTimetableEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ classId, data }: { classId: string; data: {
      subjectId: string;
      teacherId?: string;
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      room?: string;
    } }) => academicApi.createTimetableEntry(classId, data),
    onSuccess: (_, { classId }) => {
      queryClient.invalidateQueries({ queryKey: academicKeys.timetable(classId) });
    },
  });
};

export const useUpdateTimetableEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TimetableEntry> }) => academicApi.updateTimetableEntry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.timetable("") });
      queryClient.invalidateQueries({ queryKey: academicKeys.teacherTimetable("") });
    },
  });
};

export const useDeleteTimetableEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => academicApi.deleteTimetableEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.timetable("") });
      queryClient.invalidateQueries({ queryKey: academicKeys.teacherTimetable("") });
    },
  });
};

// ============================================
// BULK OPERATIONS
// ============================================

export const useBulkCreateClasses = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (classes: Array<{
      name: string;
      gradeLevelId: string;
      academicYearId: string;
      homeroomTeacherId?: string;
      capacity?: number;
      room?: string;
    }>) => academicApi.bulkCreateClasses(classes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.classes() });
    },
  });
};

export const usePromoteStudents = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { currentAcademicYearId: string; nextAcademicYearId: string }) =>
      academicApi.promoteStudents(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.classes() });
      queryClient.invalidateQueries({ queryKey: academicKeys.academicYears("") });
    },
  });
};