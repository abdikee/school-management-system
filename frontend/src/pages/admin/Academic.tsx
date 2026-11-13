"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { academicApi } from "@/services/api";
import { useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Building2,
  Calendar,
  GraduationCap,
  BookOpen,
  Users,
  Clock,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Loader2,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { School, AcademicYear, GradeLevel, Subject, Class, TimetableEntry } from "@/types/api";

const academicTabs = [
  { id: "schools", label: "Schools", icon: Building2 },
  { id: "academic-years", label: "Academic Years", icon: Calendar },
  { id: "grade-levels", label: "Grade Levels", icon: GraduationCap },
  { id: "subjects", label: "Subjects", icon: BookOpen },
  { id: "classes", label: "Classes", icon: Users },
  { id: "timetable", label: "Timetable", icon: Clock },
] as const;

type AcademicTab = (typeof academicTabs)[number]["id"];

export function AdminAcademic() {
  const [activeTab, setActiveTab] = useState<AcademicTab>("schools");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [selectedGradeLevelId, setSelectedGradeLevelId] = useState("");
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: string } | null>(null);

  const queryClient = useQueryClient();

  // ============================================
  // SCHOOLS
  // ============================================
  const { data: schoolsData, isLoading: schoolsLoading } = useQuery({
    queryKey: ["schools", search, page, pageSize],
    queryFn: () => academicApi.getSchools({ skip: (page - 1) * pageSize, take: pageSize, search: search || undefined }),
  });

  const createSchoolMutation = useMutation({
    mutationFn: (data: any) => academicApi.createSchool(data),
    onSuccess: () => {
      toast.success("School created");
      queryClient.invalidateQueries({ queryKey: ["schools"] });
      setCreateDialogOpen(false);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to create school"),
  });

  const updateSchoolMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => academicApi.updateSchool(id, data),
    onSuccess: () => {
      toast.success("School updated");
      queryClient.invalidateQueries({ queryKey: ["schools"] });
      setEditDialogOpen(false);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to update school"),
  });

  const deleteSchoolMutation = useMutation({
    mutationFn: (id: string) => academicApi.deleteSchool(id),
    onSuccess: () => {
      toast.success("School deleted");
      queryClient.invalidateQueries({ queryKey: ["schools"] });
      setDeleteConfirmOpen(false);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to delete school"),
  });

  // ============================================
  // ACADEMIC YEARS
  // ============================================
  const { data: academicYearsData, isLoading: academicYearsLoading } = useQuery({
    queryKey: ["academic-years", selectedSchoolId, search, page, pageSize],
    queryFn: () => academicApi.getAcademicYears(selectedSchoolId, { skip: (page - 1) * pageSize, take: pageSize, search: search || undefined }),
    enabled: !!selectedSchoolId,
  });

  const createAcademicYearMutation = useMutation({
    mutationFn: (data: any) => academicApi.createAcademicYear(selectedSchoolId, data),
    onSuccess: () => {
      toast.success("Academic year created");
      queryClient.invalidateQueries({ queryKey: ["academic-years", selectedSchoolId] });
      setCreateDialogOpen(false);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to create academic year"),
  });

  const updateAcademicYearMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => academicApi.updateAcademicYear(id, data),
    onSuccess: () => {
      toast.success("Academic year updated");
      queryClient.invalidateQueries({ queryKey: ["academic-years", selectedSchoolId] });
      setEditDialogOpen(false);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to update academic year"),
  });

  const deleteAcademicYearMutation = useMutation({
    mutationFn: (id: string) => academicApi.deleteAcademicYear(id),
    onSuccess: () => {
      toast.success("Academic year deleted");
      queryClient.invalidateQueries({ queryKey: ["academic-years", selectedSchoolId] });
      setDeleteConfirmOpen(false);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to delete academic year"),
  });

  // ============================================
  // GRADE LEVELS
  // ============================================
  const { data: gradeLevelsData, isLoading: gradeLevelsLoading } = useQuery({
    queryKey: ["grade-levels", selectedSchoolId, search, page, pageSize],
    queryFn: () => academicApi.getGradeLevels(selectedSchoolId, { skip: (page - 1) * pageSize, take: pageSize, search: search || undefined }),
    enabled: !!selectedSchoolId,
  });

  const createGradeLevelMutation = useMutation({
    mutationFn: (data: any) => academicApi.createGradeLevel(selectedSchoolId, data),
    onSuccess: () => {
      toast.success("Grade level created");
      queryClient.invalidateQueries({ queryKey: ["grade-levels", selectedSchoolId] });
      setCreateDialogOpen(false);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to create grade level"),
  });

  const updateGradeLevelMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => academicApi.updateGradeLevel(id, data),
    onSuccess: () => {
      toast.success("Grade level updated");
      queryClient.invalidateQueries({ queryKey: ["grade-levels", selectedSchoolId] });
      setEditDialogOpen(false);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to update grade level"),
  });

  const deleteGradeLevelMutation = useMutation({
    mutationFn: (id: string) => academicApi.deleteGradeLevel(id),
    onSuccess: () => {
      toast.success("Grade level deleted");
      queryClient.invalidateQueries({ queryKey: ["grade-levels", selectedSchoolId] });
      setDeleteConfirmOpen(false);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to delete grade level"),
  });

  // ============================================
  // SUBJECTS
  // ============================================
  const { data: subjectsData, isLoading: subjectsLoading } = useQuery({
    queryKey: ["subjects", selectedGradeLevelId, search, page, pageSize],
    queryFn: () => academicApi.getSubjects(selectedGradeLevelId, { skip: (page - 1) * pageSize, take: pageSize, search: search || undefined }),
    enabled: !!selectedGradeLevelId,
  });

  const createSubjectMutation = useMutation({
    mutationFn: (data: any) => academicApi.createSubject(selectedGradeLevelId, data),
    onSuccess: () => {
      toast.success("Subject created");
      queryClient.invalidateQueries({ queryKey: ["subjects", selectedGradeLevelId] });
      setCreateDialogOpen(false);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to create subject"),
  });

  const updateSubjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => academicApi.updateSubject(id, data),
    onSuccess: () => {
      toast.success("Subject updated");
      queryClient.invalidateQueries({ queryKey: ["subjects", selectedGradeLevelId] });
      setEditDialogOpen(false);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to update subject"),
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: (id: string) => academicApi.deleteSubject(id),
    onSuccess: () => {
      toast.success("Subject deleted");
      queryClient.invalidateQueries({ queryKey: ["subjects", selectedGradeLevelId] });
      setDeleteConfirmOpen(false);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to delete subject"),
  });

  // ============================================
  // CLASSES
  // ============================================
  const { data: classesData, isLoading: classesLoading } = useQuery({
    queryKey: ["classes", selectedAcademicYearId, selectedGradeLevelId, search, page, pageSize],
    queryFn: () => academicApi.getClasses({
      skip: (page - 1) * pageSize,
      take: pageSize,
      search: search || undefined,
      academicYearId: selectedAcademicYearId || undefined,
      gradeLevelId: selectedGradeLevelId || undefined,
    }),
    enabled: !!selectedAcademicYearId,
  });

  const createClassMutation = useMutation({
    mutationFn: (data: any) => academicApi.createClass(data),
    onSuccess: () => {
      toast.success("Class created");
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      setCreateDialogOpen(false);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to create class"),
  });

  const updateClassMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => academicApi.updateClass(id, data),
    onSuccess: () => {
      toast.success("Class updated");
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      setEditDialogOpen(false);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to update class"),
  });

  const deleteClassMutation = useMutation({
    mutationFn: (id: string) => academicApi.deleteClass(id),
    onSuccess: () => {
      toast.success("Class deleted");
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      setDeleteConfirmOpen(false);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to delete class"),
  });

  // ============================================
  // TIMETABLE
  // ============================================
  const { data: timetableData, isLoading: timetableLoading } = useQuery({
    queryKey: ["timetable", selectedClassId],
    queryFn: () => academicApi.getTimetable(selectedClassId),
    enabled: !!selectedClassId,
  });

  const createTimetableEntryMutation = useMutation({
    mutationFn: (data: any) => academicApi.createTimetableEntry(selectedClassId, data),
    onSuccess: () => {
      toast.success("Timetable entry created");
      queryClient.invalidateQueries({ queryKey: ["timetable", selectedClassId] });
      setCreateDialogOpen(false);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to create timetable entry"),
  });

  const updateTimetableEntryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => academicApi.updateTimetableEntry(id, data),
    onSuccess: () => {
      toast.success("Timetable entry updated");
      queryClient.invalidateQueries({ queryKey: ["timetable", selectedClassId] });
      setEditDialogOpen(false);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to update timetable entry"),
  });

  const deleteTimetableEntryMutation = useMutation({
    mutationFn: (id: string) => academicApi.deleteTimetableEntry(id),
    onSuccess: () => {
      toast.success("Timetable entry deleted");
      queryClient.invalidateQueries({ queryKey: ["timetable", selectedClassId] });
      setDeleteConfirmOpen(false);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to delete timetable entry"),
  });

  const handleDelete = (id: string, type: string) => {
    setItemToDelete({ id, type });
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!itemToDelete) return;
    switch (itemToDelete.type) {
      case "school":
        deleteSchoolMutation.mutate(itemToDelete.id);
        break;
      case "academic-year":
        deleteAcademicYearMutation.mutate(itemToDelete.id);
        break;
      case "grade-level":
        deleteGradeLevelMutation.mutate(itemToDelete.id);
        break;
      case "subject":
        deleteSubjectMutation.mutate(itemToDelete.id);
        break;
      case "class":
        deleteClassMutation.mutate(itemToDelete.id);
        break;
      case "timetable":
        deleteTimetableEntryMutation.mutate(itemToDelete.id);
        break;
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case "schools":
        return schoolsData?.data || [];
      case "academic-years":
        return academicYearsData?.data || [];
      case "grade-levels":
        return gradeLevelsData?.data || [];
      case "subjects":
        return subjectsData?.data || [];
      case "classes":
        return classesData?.data || [];
      case "timetable":
        return timetableData || [];
    }
  };

  const getCurrentLoading = () => {
    switch (activeTab) {
      case "schools":
        return schoolsLoading;
      case "academic-years":
        return academicYearsLoading;
      case "grade-levels":
        return gradeLevelsLoading;
      case "subjects":
        return subjectsLoading;
      case "classes":
        return classesLoading;
      case "timetable":
        return timetableLoading;
    }
  };

  const getCurrentTotal = () => {
    switch (activeTab) {
      case "schools":
        return schoolsData?.meta?.total || 0;
      case "academic-years":
        return academicYearsData?.meta?.total || 0;
      case "grade-levels":
        return gradeLevelsData?.meta?.total || 0;
      case "subjects":
        return subjectsData?.meta?.total || 0;
      case "classes":
        return classesData?.meta?.total || 0;
      default:
        return 0;
    }
  };

  const renderTabContent = () => {
    const data = getCurrentData();
    const isLoading = getCurrentLoading();

    if (isLoading) {
      return (
        <div className="p-8 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      );
    }

    switch (activeTab) {
      case "schools":
        return renderSchoolsTable(data);
      case "academic-years":
        return renderAcademicYearsTable(data);
      case "grade-levels":
        return renderGradeLevelsTable(data);
      case "subjects":
        return renderSubjectsTable(data);
      case "classes":
        return renderClassesTable(data);
      case "timetable":
        return renderTimetableTable(data);
    }
  };

  const renderSchoolsTable = (schools: School[]) => (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search schools..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
            <Button onClick={() => { setSelectedItem(null); setCreateDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Add School
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Timezone</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Academic Year Range</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schools.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No schools found
                    </TableCell>
                  </TableRow>
                ) : (
                  schools.map((school) => (
                    <TableRow key={school.id}>
                      <TableCell className="font-medium">{school.name}</TableCell>
                      <TableCell>{school.address || "—"}</TableCell>
                      <TableCell>{school.phone || "—"}</TableCell>
                      <TableCell>{school.email || "—"}</TableCell>
                      <TableCell>{school.timezone}</TableCell>
                      <TableCell>{school.currency}</TableCell>
                      <TableCell>{school.academicYearStart} - {school.academicYearEnd}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedItem(school); setCreateDialogOpen(true); }}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(school.id, "school")}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );

  const renderAcademicYearsTable = (years: AcademicYear[]) => (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="w-full sm:w-48">
              <Label className="block text-sm font-medium mb-1">School</Label>
              <Select value={selectedSchoolId} onValueChange={(value) => { setSelectedSchoolId(value); setPage(1); }}>
                <SelectTrigger><SelectValue placeholder="Select school" /></SelectTrigger>
                <SelectContent>
                  {schoolsData?.data?.map((s: School) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search academic years..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
            {selectedSchoolId && (
              <Button onClick={() => { setSelectedItem(null); setCreateDialogOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Academic Year
              </Button>
            )}
          </div>
          {selectedSchoolId && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Current</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {years.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No academic years found
                      </TableCell>
                    </TableRow>
                  ) : (
                    years.map((year) => (
                      <TableRow key={year.id}>
                        <TableCell className="font-medium">{year.name}</TableCell>
                        <TableCell>{new Date(year.startDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(year.endDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {year.isCurrent ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Current
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => { setSelectedItem(year); setCreateDialogOpen(true); }}><Eye className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(year.id, "academic-year")}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody              </Table>
            </div>
          )}
          {!selectedSchoolId && (
            <div className="text-center py-8 text-muted-foreground">
              Please select a school to view academic years
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );

  const renderGradeLevelsTable = (levels: GradeLevel[]) => (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="w-full sm:w-48">
              <Label className="block text-sm font-medium mb-1">School</Label>
              <Select value={selectedSchoolId} onValueChange={(value) => { setSelectedSchoolId(value); setPage(1); }}>
                <SelectTrigger><SelectValue placeholder="Select school" /></SelectTrigger>
                <SelectContent>
                  {schoolsData?.data?.map((s: School) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search grade levels..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
            {selectedSchoolId && (
              <Button onClick={() => { setSelectedItem(null); setCreateDialogOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Grade Level
              </Button>
            )}
          </div>
          {selectedSchoolId && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {levels.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                        No grade levels found
                      </TableCell>
                    </TableRow>
                  ) : (
                    levels.map((level) => (
                      <TableRow key={level.id}>
                        <TableCell className="font-medium">{level.name}</TableCell>
                        <TableCell>{level.order}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => { setSelectedItem(level); setCreateDialogOpen(true); }}><Eye className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(level.id, "grade-level")}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          {!selectedSchoolId && (
            <div className="text-center py-8 text-muted-foreground">
              Please select a school to view grade levels
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );

  const renderSubjectsTable = (subjects: Subject[]) => (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="w-full sm:w-48">
              <Label className="block text-sm font-medium mb-1">School</Label>
              <Select value={selectedSchoolId} onValueChange={(value) => { setSelectedSchoolId(value); setSelectedGradeLevelId(""); setPage(1); }}>
                <SelectTrigger><SelectValue placeholder="Select school" /></SelectTrigger>
                <SelectContent>
                  {schoolsData?.data?.map((s: School) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Label className="block text-sm font-medium mb-1">Grade Level</Label>
              <Select value={selectedGradeLevelId} onValueChange={(value) => { setSelectedGradeLevelId(value); setPage(1); }}>
                <SelectTrigger><SelectValue placeholder="Select grade level" /></SelectTrigger>
                <SelectContent>
                  {gradeLevelsData?.data?.map((g: GradeLevel) => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search subjects..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
            {selectedGradeLevelId && (
              <Button onClick={() => { setSelectedItem(null); setCreateDialogOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Subject
              </Button>
            )}
          </div>
          {selectedGradeLevelId && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Core</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No subjects found
                      </TableCell>
                    </TableRow>
                  ) : (
                    subjects.map((subject) => (
                      <TableRow key={subject.id}>
                        <TableCell className="font-medium">{subject.name}</TableCell>
                        <TableCell>{subject.code}</TableCell>
                        <TableCell>
                          {subject.isCore ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Core
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Elective</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {subject.color ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded" style={{ backgroundColor: subject.color }} />
                              <span>{subject.color}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => { setSelectedItem(subject); setCreateDialogOpen(true); }}><Eye className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(subject.id, "subject")}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          {!selectedGradeLevelId && (
            <div className="text-center py-8 text-muted-foreground">
              Please select a school and grade level to view subjects
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );

  const renderClassesTable = (classes: Class[]) => (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="w-full sm:w-48">
              <Label className="block text-sm font-medium mb-1">Academic Year</Label>
              <Select value={selectedAcademicYearId} onValueChange={(value) => { setSelectedAcademicYearId(value); setSelectedGradeLevelId(""); setPage(1); }}>
                <SelectTrigger><SelectValue placeholder="Select academic year" /></SelectTrigger>
                <SelectContent>
                  {academicYearsData?.data?.map((a: AcademicYear) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Label className="block text-sm font-medium mb-1">Grade Level</Label>
              <Select value={selectedGradeLevelId} onValueChange={(value) => { setSelectedGradeLevelId(value); setPage(1); }}>
                <SelectTrigger><SelectValue placeholder="Select grade level" /></SelectTrigger>
                <SelectContent>
                  {gradeLevelsData?.data?.map((g: GradeLevel) => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search classes..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
            {selectedAcademicYearId && (
              <Button onClick={() => { setSelectedItem(null); setCreateDialogOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Class
              </Button>
            )}
          </div>
          {selectedAcademicYearId && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Grade Level</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No classes found
                      </TableCell>
                    </TableRow>
                  ) : (
                    classes.map((cls) => (
                      <TableRow key={cls.id}>
                        <TableCell className="font-medium">{cls.name}</TableCell>
                        <TableCell>{cls.gradeLevel?.name || "—"}</TableCell>
                        <TableCell>{cls.homeroomTeacher?.user?.firstName ? `${cls.homeroomTeacher.user.firstName} ${cls.homeroomTeacher.user.lastName}` : "Unassigned"}</TableCell>
                        <TableCell>{cls.capacity}</TableCell>
                        <TableCell>{cls.room || "—"}</TableCell>
                        <TableCell>{cls._count?.students || 0} / {cls.capacity}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => { setSelectedItem(cls); setCreateDialogOpen(true); }}><Eye className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(cls.id, "class")}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          {!selectedAcademicYearId && (
            <div className="text-center py-8 text-muted-foreground">
              Please select an academic year to view classes
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );

  const renderTimetableTable = (timetable: TimetableEntry[]) => (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="w-full sm:w-64">
              <Label className="block text-sm font-medium mb-1">Class</Label>
              <Select value={selectedClassId} onValueChange={(value) => { setSelectedClassId(value); }}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {classesData?.data?.map((c: Class) => (
                    <SelectItem key={c.id} value={c.id}>{c.name} ({c.gradeLevel?.name})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedClassId && (
              <Button onClick={() => { setSelectedItem(null); setCreateDialogOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Entry
              </Button>
            )}
          </div>
          {selectedClassId && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Day</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timetable.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No timetable entries found
                      </TableCell>
                    </TableRow>
                  ) : (
                    timetable.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][entry.dayOfWeek]}
                        </TableCell>
                        <TableCell>{entry.startTime} - {entry.endTime}</TableCell>
                        <TableCell>{entry.subject?.name || "—"}</TableCell>
                        <TableCell>{entry.teacher?.user?.firstName ? `${entry.teacher.user.firstName} ${entry.teacher.user.lastName}` : "Unassigned"}</TableCell>
                        <TableCell>{entry.room || "—"}</TableCell>
                        <TableCell>
                          {entry.isActive ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Inactive
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => { setSelectedItem(entry); setCreateDialogOpen(true); }}><Eye className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id, "timetable")}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          {!selectedClassId && (
            <div className="text-center py-8 text-muted-foreground">
              Please select a class to view timetable
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academic Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage schools, academic years, grade levels, subjects, classes, and timetables
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
          {academicTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center justify-center gap-2">
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {renderTabContent()}
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={createDialogOpen || editDialogOpen} onOpenChange={(open) => { if (!open) { setCreateDialogOpen(false); setEditDialogOpen(false); setSelectedItem(null); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedItem ? "Edit" : "Create"} {activeTab.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}</DialogTitle>
            <DialogDescription>
              {selectedItem ? "Update the details below." : "Fill in the details below to create a new record."}
            </DialogDescription>
          </DialogHeader>
          <AcademicForm
            tab={activeTab}
            item={selectedItem}
            schools={schoolsData?.data || []}
            academicYears={academicYearsData?.data || []}
            gradeLevels={gradeLevelsData?.data || []}
            classes={classesData?.data || []}
            subjects={subjectsData?.data || []}
            onSubmit={(data) => {
              // Handle submission based on tab
              switch (activeTab) {
                case "schools":
                  selectedItem ? updateSchoolMutation.mutate({ id: selectedItem.id, data }) : createSchoolMutation.mutate(data);
                  break;
                case "academic-years":
                  selectedItem ? updateAcademicYearMutation.mutate({ id: selectedItem.id, data }) : createAcademicYearMutation.mutate(data);
                  break;
                case "grade-levels":
                  selectedItem ? updateGradeLevelMutation.mutate({ id: selectedItem.id, data }) : createGradeLevelMutation.mutate(data);
                  break;
                case "subjects":
                  selectedItem ? updateSubjectMutation.mutate({ id: selectedItem.id, data }) : createSubjectMutation.mutate(data);
                  break;
                case "classes":
                  selectedItem ? updateClassMutation.mutate({ id: selectedItem.id, data }) : createClassMutation.mutate(data);
                  break;
                case "timetable":
                  selectedItem ? updateTimetableEntryMutation.mutate({ id: selectedItem.id, data }) : createTimetableEntryMutation.mutate(data);
                  break;
              }
            }}
            isLoading={
              createSchoolMutation.isPending ||
              updateSchoolMutation.isPending ||
              createAcademicYearMutation.isPending ||
              updateAcademicYearMutation.isPending ||
              createGradeLevelMutation.isPending ||
              updateGradeLevelMutation.isPending ||
              createSubjectMutation.isPending ||
              updateSubjectMutation.isPending ||
              createClassMutation.isPending ||
              updateClassMutation.isPending ||
              createTimetableEntryMutation.isPending ||
              updateTimetableEntryMutation.isPending
            }
            onClose={() => { setCreateDialogOpen(false); setEditDialogOpen(false); setSelectedItem(null); }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleteSchoolMutation.isPending || deleteAcademicYearMutation.isPending || deleteGradeLevelMutation.isPending || deleteSubjectMutation.isPending || deleteClassMutation.isPending || deleteTimetableEntryMutation.isPending}>
              {deleteSchoolMutation.isPending || deleteAcademicYearMutation.isPending || deleteGradeLevelMutation.isPending || deleteSubjectMutation.isPending || deleteClassMutation.isPending || deleteTimetableEntryMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Academic Form Component
function AcademicForm({
  tab,
  item,
  schools,
  academicYears,
  gradeLevels,
  classes,
  subjects,
  onSubmit,
  isLoading,
  onClose,
}: {
  tab: AcademicTab;
  item: any;
  schools: School[];
  academicYears: AcademicYear[];
  gradeLevels: GradeLevel[];
  classes: Class[];
  subjects: Subject[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
  onClose: () => void;
}) {
  const form = useForm({
    resolver: zodResolver(
      z.object({}).passthrough()
    ),
    defaultValues: getDefaultValues(tab, item, schools, academicYears, gradeLevels, classes),
  });

  const renderFields = () => {
    switch (tab) {
      case "schools":
        return (
          <div className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="website" render={({ field }) => (
              <FormItem><FormLabel>Website</FormLabel><FormControl><Input type="url" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid gap-4 md:grid-cols-2">
              <FormField control={form.control} name="academicYearStart" render={({ field }) => (
                <FormItem><FormLabel>Academic Year Start *</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="academicYearEnd" render={({ field }) => (
                <FormItem><FormLabel>Academic Year End *</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField control={form.control} name="timezone" render={({ field }) => (
                <FormItem><FormLabel>Timezone *</FormLabel><FormControl><Input {...field} defaultValue="UTC" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="currency" render={({ field }) => (
                <FormItem><FormLabel>Currency *</FormLabel><FormControl><Input {...field} defaultValue="USD" /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
          </div>
        );
      case "academic-years":
        return (
          <div className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Name *</FormLabel><FormControl><Input placeholder="e.g., 2024-2025" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid gap-4 md:grid-cols-2">
              <FormField control={form.control} name="startDate" render={({ field }) => (
                <FormItem><FormLabel>Start Date *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="endDate" render={({ field }) => (
                <FormItem><FormLabel>End Date *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="isCurrent" render={({ field }) => (
              <FormItem>
                <FormControl>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" {...field} /> <FormLabel>Set as current academic year</FormLabel>
                  </label>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        );
      case "grade-levels":
        return (
          <div className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Name *</FormLabel><FormControl><Input placeholder="e.g., Grade 1" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="order" render={({ field }) => (
              <FormItem><FormLabel>Order *</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
        );
      case "subjects":
        return (
          <div className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Name *</FormLabel><FormControl><Input placeholder="e.g., Mathematics" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="code" render={({ field }) => (
              <FormItem><FormLabel>Code *</FormLabel><FormControl><Input placeholder="e.g., MATH" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid gap-4 md:grid-cols-2">
              <FormField control={form.control} name="isCore" render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" {...field} /> <FormLabel>Core Subject</FormLabel>
                    </label>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="color" render={({ field }) => (
                <FormItem><FormLabel>Color</FormLabel><FormControl><Input type="color" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
          </div>
        );
      case "classes":
        return (
          <div className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Name *</FormLabel><FormControl><Input placeholder="e.g., Grade 10A" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid gap-4 md:grid-cols-2">
              <FormField control={form.control} name="gradeLevelId" render={({ field }) => (
                <FormItem><FormLabel>Grade Level *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select grade level" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {gradeLevels.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                <FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="academicYearId" render={({ field }) => (
                <FormItem><FormLabel>Academic Year *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select academic year" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {academicYears.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                <FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField control={form.control} name="homeroomTeacherId" render={({ field }) => (
                <FormItem><FormLabel>Homeroom Teacher</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                    </SelectContent>
                  </Select>
                <FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="capacity" render={({ field }) => (
                <FormItem><FormLabel>Capacity *</FormLabel><FormControl><Input type="number" {...field} defaultValue={30} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="room" render={({ field }) => (
              <FormItem><FormLabel>Room</FormLabel><FormControl><Input placeholder="e.g., Room 201" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
        );
      case "timetable":
        return (
          <div className="space-y-4">
            <FormField control={form.control} name="subjectId" render={({ field }) => (
              <FormItem><FormLabel>Subject *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>)}
                  </SelectContent>
                </Select>
              <FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="teacherId" render={({ field }) => (
              <FormItem><FormLabel>Teacher</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select teacher (optional)" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                  </SelectContent>
                </Select>
              <FormMessage /></FormItem>
            )} />
            <div className="grid gap-4 md:grid-cols-3">
              <FormField control={form.control} name="dayOfWeek" render={({ field }) => (
                <FormItem><FormLabel>Day *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select day" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day, i) => (
                        <SelectItem key={i} value={i}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                <FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="startTime" render={({ field }) => (
                <FormItem><FormLabel>Start Time *</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="endTime" render={({ field }) => (
                <FormItem><FormLabel>End Time *</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="room" render={({ field }) => (
              <FormItem><FormLabel>Room</FormLabel><FormControl><Input placeholder="e.g., Room 201" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="isActive" render={({ field }) => (
              <FormItem>
                <FormControl>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" {...field} defaultChecked /> <FormLabel>Active</FormLabel>
                  </label>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {renderFields()}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : (item ? "Update" : "Create")}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

function getDefaultValues(tab: AcademicTab, item: any, schools: School[], academicYears: AcademicYear[], gradeLevels: GradeLevel[], classes: Class[]) {
  if (item) {
    return item;
  }
  switch (tab) {
    case "schools":
      return { name: "", address: "", phone: "", email: "", website: "", academicYearStart: new Date().getFullYear(), academicYearEnd: new Date().getFullYear() + 1, timezone: "UTC", currency: "USD" };
    case "academic-years":
      return { name: "", startDate: "", endDate: "", isCurrent: false };
    case "grade-levels":
      return { name: "", order: gradeLevels.length + 1 };
    case "subjects":
      return { name: "", code: "", description: "", isCore: false, color: "#3b82f6" };
    case "classes":
      return { name: "", gradeLevelId: gradeLevels[0]?.id || "", academicYearId: academicYears[0]?.id || "", homeroomTeacherId: "", capacity: 30, room: "" };
    case "timetable":
      return { subjectId: subjects[0]?.id || "", teacherId: "", dayOfWeek: 1, startTime: "08:00", endTime: "09:00", room: "", isActive: true };
    default:
      return {};
  }
}