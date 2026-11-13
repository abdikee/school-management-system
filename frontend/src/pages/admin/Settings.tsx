"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { academicApi, usersApi } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Loader2,
  Save,
  Shield,
  Bell,
  Globe,
  CreditCard,
  Mail,
  Users,
  Building2,
  Key,
  Database,
  BarChart3,
  Settings as SettingsIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { School, User } from "@/types/api";

const settingsTabs = [
  { id: "general", label: "General", icon: SettingsIcon },
  { id: "school", label: "School Info", icon: Building2 },
  { id: "academic", label: "Academic", icon: GraduationCap },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "email", label: "Email", icon: Mail },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "security", label: "Security", icon: Shield },
  { id: "backup", label: "Backup", icon: Database },
] as const;

type SettingsTab = (typeof settingsTabs)[number]["id"];

export function AdminSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
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
  const [selectedSchoolId, setSelectedSchoolId] = useState("");

  const { data: academicYearsData, isLoading: academicYearsLoading } = useQuery({
    queryKey: ["academic-years", selectedSchoolId, page, pageSize],
    queryFn: () => academicApi.getAcademicYears(selectedSchoolId, { skip: (page - 1) * pageSize, take: pageSize }),
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
    queryKey: ["grade-levels", selectedSchoolId, page, pageSize],
    queryFn: () => academicApi.getGradeLevels(selectedSchoolId, { skip: (page - 1) * pageSize, take: pageSize }),
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
  // USERS (for admin user management)
  // ============================================
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["users", search, page, pageSize],
    queryFn: () => usersApi.getUsers({ skip: (page - 1) * pageSize, take: pageSize, search: search || undefined }),
  });

  const createUserMutation = useMutation({
    mutationFn: (data: any) => usersApi.createUser(data),
    onSuccess: () => {
      toast.success("User created");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setCreateDialogOpen(false);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to create user"),
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => usersApi.updateUser(id, data),
    onSuccess: () => {
      toast.success("User updated");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditDialogOpen(false);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to update user"),
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => usersApi.deleteUser(id),
    onSuccess: () => {
      toast.success("User deleted");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDeleteConfirmOpen(false);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to delete user"),
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
      case "user":
        deleteUserMutation.mutate(itemToDelete.id);
        break;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return renderGeneralSettings();
      case "school":
        return renderSchoolSettings();
      case "academic":
        return renderAcademicSettings();
      case "notifications":
        return renderNotificationSettings();
      case "email":
        return renderEmailSettings();
      case "payment":
        return renderPaymentSettings();
      case "security":
        return renderSecuritySettings();
      case "backup":
        return renderBackupSettings();
    }
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label className="block text-sm font-medium mb-2">System Name</Label>
              <Input defaultValue="School Management System" />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">System Email</Label>
              <Input type="email" defaultValue="admin@school.edu" />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Default Timezone</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select timezone" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  <SelectItem value="Europe/London">London</SelectItem>
                  <SelectItem value="Europe/Paris">Paris</SelectItem>
                  <SelectItem value="Asia/Dubai">Dubai</SelectItem>
                  <SelectItem value="Asia/Singapore">Singapore</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Default Currency</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="AED">AED (د.إ)</SelectItem>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Date Format</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select format" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Language</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">Arabic</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="pt-4 border-t">
            <Button><Save className="mr-2 h-4 w-4" /> Save General Settings</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label className="block text-sm font-medium mb-2">Theme</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select theme" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Primary Color</Label>
              <Input type="color" defaultValue="#3b82f6" className="h-10 w-20" />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Logo</Label>
              <Input type="file" accept="image/*" />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Favicon</Label>
              <Input type="file" accept="image/*" />
            </div>
          </div>
          <div className="pt-4 border-t">
            <Button variant="outline"><Save className="mr-2 h-4 w-4" /> Save Appearance</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSchoolSettings = () => (
    <div className="space-y-6">
      {/* School Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-64">
              <Label className="block text-sm font-medium mb-1">Select School</Label>
              <Select value={selectedSchoolId} onValueChange={setSelectedSchoolId}>
                <SelectTrigger><SelectValue placeholder="Select school" /></SelectTrigger>
                <SelectContent>
                  {schoolsData?.data?.map((s: School) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={() => { setSelectedItem(null); setCreateDialogOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                Add School
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schools Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Schools
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Name</th>
                  <th className="text-left p-4 font-medium">Address</th>
                  <th className="text-left p-4 font-medium">Phone</th>
                  <th className="text-left p-4 font-medium">Email</th>
                  <th className="text-left p-4 font-medium">Timezone</th>
                  <th className="text-left p-4 font-medium">Currency</th>
                  <th className="text-left p-4 font-medium">Academic Year</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {schoolsLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    </td>
                  </tr>
                ) : schoolsData?.data?.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-muted-foreground">No schools found</td>
                  </tr>
                ) : (
                  schoolsData?.data?.map((school: School) => (
                    <tr key={school.id} className="border-b">
                      <td className="p-4 font-medium">{school.name}</td>
                      <td className="p-4">{school.address || "—"}</td>
                      <td className="p-4">{school.phone || "—"}</td>
                      <td className="p-4">{school.email || "—"}</td>
                      <td className="p-4">{school.timezone}</td>
                      <td className="p-4">{school.currency}</td>
                      <td className="p-4">{school.academicYearStart} - {school.academicYearEnd}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedItem(school); setCreateDialogOpen(true); }}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(school.id, "school")} disabled={deleteSchoolMutation.isPending}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAcademicSettings = () => (
    <div className="space-y-6">
      {!selectedSchoolId ? (
        <Card>
          <CardContent className="pt-6 text-center py-8">
            <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Please select a school to manage academic settings</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Academic Years */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Academic Years
              </CardTitle>
              <Button onClick={() => { setSelectedItem(null); setCreateDialogOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Academic Year
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">Name</th>
                      <th className="text-left p-4 font-medium">Start Date</th>
                      <th className="text-left p-4 font-medium">End Date</th>
                      <th className="text-left p-4 font-medium">Current</th>
                      <th className="text-right p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {academicYearsLoading ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8">
                          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                        </td>
                      </tr>
                    ) : academicYearsData?.data?.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-muted-foreground">No academic years found</td>
                      </tr>
                    ) : (
                      academicYearsData?.data?.map((year: any) => (
                        <tr key={year.id} className="border-b">
                          <td className="p-4 font-medium">{year.name}</td>
                          <td className="p-4">{new Date(year.startDate).toLocaleDateString()}</td>
                          <td className="p-4">{new Date(year.endDate).toLocaleDateString()}</td>
                          <td className="p-4">
                            {year.isCurrent ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Current</span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => { setSelectedItem(year); setCreateDialogOpen(true); }}><Eye className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(year.id, "academic-year")} disabled={deleteAcademicYearMutation.isPending}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Grade Levels */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Grade Levels
              </CardTitle>
              <Button onClick={() => { setSelectedItem(null); setCreateDialogOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Grade Level
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">Name</th>
                      <th className="text-left p-4 font-medium">Order</th>
                      <th className="text-right p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gradeLevelsLoading ? (
                      <tr>
                        <td colSpan={3} className="text-center py-8">
                          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                        </td>
                      </tr>
                    ) : gradeLevelsData?.data?.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center py-8 text-muted-foreground">No grade levels found</td>
                      </tr>
                    ) : (
                      gradeLevelsData?.data?.map((level: any) => (
                        <tr key={level.id} className="border-b">
                          <td className="p-4 font-medium">{level.name}</td>
                          <td className="p-4">{level.order}</td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => { setSelectedItem(level); setCreateDialogOpen(true); }}><Eye className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(level.id, "grade-level")} disabled={deleteGradeLevelMutation.isPending}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { key: "attendance_alerts", label: "Attendance Alerts", desc: "Notify parents when student is absent" },
              { key: "grade_posted", label: "Grade Posted", desc: "Notify students/parents when grades are published" },
              { key: "fee_due", label: "Fee Due Reminders", desc: "Send reminders before fee due dates" },
              { key: "fee_overdue", label: "Fee Overdue Alerts", desc: "Notify when fees become overdue" },
              { key: "payment_received", label: "Payment Received", desc: "Confirm payment receipts" },
              { key: "announcements", label: "Announcements", desc: "Broadcast announcements to target groups" },
              { key: "messages", label: "Direct Messages", desc: "Notify on new private messages" },
              { key: "system", label: "System Notifications", desc: "System maintenance and updates" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
                <div className="flex gap-2">
                  <Select>
                    <SelectTrigger className="w-32"><SelectValue placeholder="In-App" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enabled">Enabled</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger className="w-32"><SelectValue placeholder="Email" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enabled">Enabled</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger className="w-32"><SelectValue placeholder="SMS" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enabled">Enabled</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger className="w-32"><SelectValue placeholder="Push" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enabled">Enabled</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t">
            <Button><Save className="mr-2 h-4 w-4" /> Save Notification Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label className="block text-sm font-medium mb-2">SMTP Host</Label>
              <Input placeholder="smtp.example.com" />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">SMTP Port</Label>
              <Input type="number" placeholder="587" />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">SMTP Username</Label>
              <Input placeholder="username@example.com" />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">SMTP Password</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">From Email</Label>
              <Input type="email" placeholder="noreply@school.edu" />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">From Name</Label>
              <Input placeholder="School Management System" />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Encryption</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select encryption" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tls">TLS</SelectItem>
                  <SelectItem value="ssl">SSL</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="pt-4 border-t flex gap-4">
            <Button onClick={() => toast.success("Test email sent!")} variant="outline">
              <Mail className="mr-2 h-4 w-4" /> Send Test Email
            </Button>
            <Button><Save className="mr-2 h-4 w-4" /> Save Email Settings</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Templates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            "Welcome Email",
            "Password Reset",
            "Attendance Alert",
            "Grade Published",
            "Fee Due Reminder",
            "Fee Overdue Notice",
            "Payment Receipt",
            "Announcement",
          ].map((template) => (
            <div key={template} className="flex items-center justify-between p-4 border rounded-lg">
              <span className="font-medium">{template}</span>
              <Button variant="outline" size="sm">Edit Template</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Gateway Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label className="block text-sm font-medium mb-2">Default Gateway</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select gateway" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="razorpay">Razorpay</SelectItem>
                  <SelectItem value="manual">Manual (Cash/Bank Transfer)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Enable Online Payments</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label className="block text-sm font-medium mb-2">Stripe Publishable Key</Label>
              <Input placeholder="pk_test_..." />
            </div>
            <div className="md:col-span-2">
              <Label className="block text-sm font-medium mb-2">Stripe Secret Key</Label>
              <Input type="password" placeholder="sk_test_..." />
            </div>
            <div className="md:col-span-2">
              <Label className="block text-sm font-medium mb-2">PayPal Client ID</Label>
              <Input placeholder="client_id" />
            </div>
            <div className="md:col-span-2">
              <Label className="block text-sm font-medium mb-2">PayPal Secret</Label>
              <Input type="password" placeholder="secret" />
            </div>
          </div>
          <div className="pt-4 border-t flex gap-4">
            <Button variant="outline" onClick={() => toast.success("Test transaction initiated!")}>
              <CreditCard className="mr-2 h-4 w-4" /> Test Payment
            </Button>
            <Button><Save className="mr-2 h-4 w-4" /> Save Payment Settings</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Fee Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <Label className="block text-sm font-medium mb-2">Late Fee Percentage</Label>
              <Input type="number" placeholder="5" defaultValue="5" />%
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Grace Period (days)</Label>
              <Input type="number" placeholder="7" defaultValue="7" />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Max Late Fee</Label>
              <Input type="number" placeholder="100" defaultValue="100" />
            </div>
          </div>
          <div className="pt-4 border-t">
            <Button><Save className="mr-2 h-4 w-4" /> Save Fee Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Authentication & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label className="block text-sm font-medium mb-2">Password Min Length</Label>
              <Input type="number" defaultValue="8" />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Require Uppercase</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Require Numbers</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Require Special Chars</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Session Timeout (minutes)</Label>
              <Input type="number" defaultValue="60" />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Max Login Attempts</Label>
              <Input type="number" defaultValue="5" />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Lockout Duration (minutes)</Label>
              <Input type="number" defaultValue="15" />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Two-Factor Auth</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="optional">Optional</SelectItem>
                  <SelectItem value="required">Required for Admins</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="pt-4 border-t">
            <Button><Save className="mr-2 h-4 w-4" /> Save Security Settings</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API & Integrations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label className="block text-sm font-medium mb-2">API Rate Limit (req/min)</Label>
              <Input type="number" defaultValue="100" />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Enable API Access</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label className="block text-sm font-medium mb-2">Allowed Origins (CORS)</Label>
              <Input placeholder="https://school.edu, https://app.school.edu" />
            </div>
          </div>
          <div className="pt-4 border-t">
            <Button variant="outline"><Key className="mr-2 h-4 w-4" /> Generate API Key</Button>
            <Button><Save className="mr-2 h-4 w-4" /> Save API Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderBackupSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Backup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label className="block text-sm font-medium mb-2">Auto Backup</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Backup Time</Label>
              <Input type="time" defaultValue="02:00" />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Retention (days)</Label>
              <Input type="number" defaultValue="30" />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Storage Location</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local Server</SelectItem>
                  <SelectItem value="s3">AWS S3</SelectItem>
                  <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                  <SelectItem value="azure">Azure Blob Storage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="pt-4 border-t flex gap-4">
            <Button variant="outline" onClick={() => toast.success("Backup started!")}>
              <Database className="mr-2 h-4 w-4" /> Create Backup Now
            </Button>
            <Button><Save className="mr-2 h-4 w-4" /> Save Backup Settings</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Recent Backups
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Filename</th>
                  <th className="text-left p-4 font-medium">Size</th>
                  <th className="text-left p-4 font-medium">Created</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td colSpan={5} className="text-center py-8 text-muted-foreground">No backups found. Create your first backup.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">
            Configure system settings, schools, and preferences
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 md:grid-cols-8">
          {settingsTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center justify-center gap-2">
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {renderTabContent()}
      </Tabs>

      {/* Create/Edit Dialogs */}
      <Dialog open={createDialogOpen || editDialogOpen} onOpenChange={(open) => { if (!open) { setCreateDialogOpen(false); setEditDialogOpen(false); setSelectedItem(null); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedItem ? "Edit" : "Create"} {activeTab === "school" ? "School" : activeTab === "academic" ? (selectedItem?.startDate ? "Academic Year" : "Grade Level") : "User"}</DialogTitle>
            <DialogDescription>
              {selectedItem ? "Update the details below." : "Fill in the details below to create a new record."}
            </DialogDescription>
          </DialogHeader>
          {activeTab === "school" && (
            <SchoolForm
              school={selectedItem}
              onSubmit={(data) => {
                if (selectedItem) {
                  updateSchoolMutation.mutate({ id: selectedItem.id, data });
                } else {
                  createSchoolMutation.mutate(data);
                }
              }}
              isLoading={createSchoolMutation.isPending || updateSchoolMutation.isPending}
              onClose={() => { setCreateDialogOpen(false); setEditDialogOpen(false); setSelectedItem(null); }}
            />
          )}
          {activeTab === "academic" && selectedItem?.startDate && (
            <AcademicYearForm
              academicYear={selectedItem}
              onSubmit={(data) => {
                if (selectedItem) {
                  updateAcademicYearMutation.mutate({ id: selectedItem.id, data });
                } else {
                  createAcademicYearMutation.mutate(data);
                }
              }}
              isLoading={createAcademicYearMutation.isPending || updateAcademicYearMutation.isPending}
              onClose={() => { setCreateDialogOpen(false); setEditDialogOpen(false); setSelectedItem(null); }}
            />
          )}
          {activeTab === "academic" && !selectedItem?.startDate && (
            <GradeLevelForm
              gradeLevel={selectedItem}
              onSubmit={(data) => {
                if (selectedItem) {
                  updateGradeLevelMutation.mutate({ id: selectedItem.id, data });
                } else {
                  createGradeLevelMutation.mutate(data);
                }
              }}
              isLoading={createGradeLevelMutation.isPending || updateGradeLevelMutation.isPending}
              onClose={() => { setCreateDialogOpen(false); setEditDialogOpen(false); setSelectedItem(null); }}
            />
          )}
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
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleteSchoolMutation.isPending || deleteAcademicYearMutation.isPending || deleteGradeLevelMutation.isPending || deleteUserMutation.isPending}>
              {deleteSchoolMutation.isPending || deleteAcademicYearMutation.isPending || deleteGradeLevelMutation.isPending || deleteUserMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// School Form
function SchoolForm({
  school,
  onSubmit,
  isLoading,
  onClose,
}: {
  school: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  onClose: () => void;
}) {
  const form = useForm({
    resolver: zodResolver(
      z.object({
        name: z.string().min(1, "Name is required"),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional().or(z.literal("")),
        website: z.string().url().optional().or(z.literal("")),
        academicYearStart: z.number().min(2000).max(2100),
        academicYearEnd: z.number().min(2000).max(2100),
        timezone: z.string().min(1, "Timezone is required"),
        currency: z.string().min(1, "Currency is required"),
      })
    ),
    defaultValues: school || {
      name: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      academicYearStart: new Date().getFullYear(),
      academicYearEnd: new Date().getFullYear() + 1,
      timezone: "UTC",
      currency: "USD",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : (school ? "Update" : "Create")}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

// Academic Year Form
function AcademicYearForm({
  academicYear,
  onSubmit,
  isLoading,
  onClose,
}: {
  academicYear: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  onClose: () => void;
}) {
  const form = useForm({
    resolver: zodResolver(
      z.object({
        name: z.string().min(1, "Name is required"),
        startDate: z.string().min(1, "Start date is required"),
        endDate: z.string().min(1, "End date is required"),
        isCurrent: z.boolean().default(false),
      })
    ),
    defaultValues: academicYear || {
      name: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          <FormItem className="flex items-center">
            <FormControl>
              <label className="flex items-center gap-2">
                <input type="checkbox" {...field} /> <FormLabel>Set as current academic year</FormLabel>
              </label>
            </FormControl>
          </FormItem>
        )} />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : (academicYear ? "Update" : "Create")}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

// Grade Level Form
function GradeLevelForm({
  gradeLevel,
  onSubmit,
  isLoading,
  onClose,
}: {
  gradeLevel: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  onClose: () => void;
}) {
  const form = useForm({
    resolver: zodResolver(
      z.object({
        name: z.string().min(1, "Name is required"),
        order: z.number().min(1, "Order must be at least 1"),
      })
    ),
    defaultValues: gradeLevel || {
      name: "",
      order: 1,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem><FormLabel>Name *</FormLabel><FormControl><Input placeholder="e.g., Grade 1" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="order" render={({ field }) => (
          <FormItem><FormLabel>Order *</FormLabel><FormControl><Input type="number" min="1" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : (gradeLevel ? "Update" : "Create")}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

// Import missing icons
import { Calendar, GraduationCap, DollarSign } from "lucide-react";
import { CheckCircle } from "lucide-react";