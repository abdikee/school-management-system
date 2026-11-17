import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useInitializeAuth } from "@/hooks/useAuth";
import { Login } from "@/pages/auth/Login";
import { StudentRegistrationPage } from "@/pages/auth/StudentRegistrationPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";
import { MainLayout } from "@/layouts/MainLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { PortalDashboard } from "@/pages/PortalDashboard";
import { AdminUsers } from "@/pages/admin/Users";
import { AdminAcademic } from "@/pages/admin/Academic";
import { AdminAttendance } from "@/pages/admin/Attendance";
import { AdminGrades } from "@/pages/admin/Grades";
import { AdminFinance } from "@/pages/admin/Finance";
import { AdminCommunication } from "@/pages/admin/Communication";
import { AdminReports } from "@/pages/admin/Reports";
import { AdminSettings } from "@/pages/admin/Settings";
import { PrincipalOversight } from "@/pages/admin/PrincipalOversight";
import { AdminPermissions } from "@/pages/admin/Permissions";
import { Settings } from "@/pages/Settings";
import { Notifications } from "@/pages/Notifications";
import { Search } from "@/pages/Search";
import { TeacherClasses } from "@/pages/teacher/Classes";
import { TeacherAttendance } from "@/pages/teacher/Attendance";
import { TeacherGrades } from "@/pages/teacher/Grades";
import { TeacherCommunication } from "@/pages/teacher/Communication";
import { TeacherReports } from "@/pages/teacher/Reports";
import { StudentReports } from "@/pages/student/Reports";
import { StudentSchedule } from "@/pages/student/Schedule";
import { StudentFees } from "@/pages/student/Fees";
import { StudentCommunication } from "@/pages/student/Communication";
import { ParentChildren } from "@/pages/parent/Children";
import { ParentReports } from "@/pages/parent/Reports";
import { ParentAttendance } from "@/pages/parent/Attendance";
import { ParentGrades } from "@/pages/parent/Grades";
import { ParentFees } from "@/pages/parent/Fees";
import { ParentCommunication } from "@/pages/parent/Communication";
import { CashierPortal } from "@/pages/cashier/CashierPortal";
import "@/styles/globals.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Auth initialization component
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { isLoading, setAuth, clearAuth } = useAuth();
  const { data: initializedUser, isLoading: initLoading, isSuccess } = useInitializeAuth();

  // Handle store update when query completes
  useEffect(() => {
    if (isSuccess) {
      if (initializedUser) {
        // User data exists in localStorage, restore auth state
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
          setAuth(initializedUser, accessToken, "");
        } else {
          clearAuth();
        }
      } else {
        // No stored auth data, clear any stale state
        clearAuth();
      }
    }
  }, [isSuccess, initializedUser, setAuth, clearAuth]);

  // Show loading while query is loading or store is still loading
  if (isLoading || initLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}

// Protected route wrapper
function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <MainLayout />;
}

// Public route wrapper
function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <AuthLayout />;
}

// Role-based route guard
function RoleGuard({ allowedRoles }: { allowedRoles?: string[] }) {
  const { user } = useAuth();

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

// Role-based redirect
function RoleBasedRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case "ADMIN":
      return <Navigate to="/admin/dashboard" replace />;
    case "TEACHER":
      return <Navigate to="/teacher/dashboard" replace />;
    case "STUDENT":
      return <Navigate to="/student/dashboard" replace />;
    case "PARENT":
      return <Navigate to="/parent/dashboard" replace />;
    case "CASHIER":
      return <Navigate to="/cashier/dashboard" replace />;
    default:
      return <Navigate to="/unauthorized" replace />;
  }
}

// Main app routes
function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<StudentRegistrationPage />} />
        <Route path="/student/register" element={<StudentRegistrationPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        {/* Admin routes */}
        <Route element={<RoleGuard allowedRoles={["ADMIN"]} />}>
          <Route path="/admin/dashboard" element={<PortalDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/academic" element={<AdminAcademic />} />
          <Route path="/admin/attendance" element={<AdminAttendance />} />
          <Route path="/admin/grades" element={<AdminGrades />} />
          <Route path="/admin/finance" element={<AdminFinance />} />
          <Route path="/admin/communication" element={<AdminCommunication />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/oversight" element={<PrincipalOversight />} />
          <Route path="/admin/permissions" element={<AdminPermissions />} />
        </Route>

        {/* Teacher routes */}
        <Route element={<RoleGuard allowedRoles={["TEACHER", "ADMIN"]} />}>
          <Route path="/teacher/dashboard" element={<PortalDashboard />} />
          <Route path="/teacher/classes" element={<TeacherClasses />} />
          <Route path="/teacher/attendance" element={<TeacherAttendance />} />
          <Route path="/teacher/grades" element={<TeacherGrades />} />
          <Route path="/teacher/communication" element={<TeacherCommunication />} />
          <Route path="/teacher/reports" element={<TeacherReports />} />
        </Route>

        {/* Student routes */}
        <Route element={<RoleGuard allowedRoles={["STUDENT", "ADMIN", "TEACHER"]} />}>
          <Route path="/student/dashboard" element={<PortalDashboard />} />
          <Route path="/student/reports" element={<StudentReports />} />
          <Route path="/student/schedule" element={<StudentSchedule />} />
          <Route path="/student/fees" element={<StudentFees />} />
          <Route path="/student/communication" element={<StudentCommunication />} />
        </Route>

        {/* Parent routes */}
        <Route element={<RoleGuard allowedRoles={["PARENT", "ADMIN"]} />}>
          <Route path="/parent/dashboard" element={<PortalDashboard />} />
          <Route path="/parent/children" element={<ParentChildren />} />
          <Route path="/parent/reports" element={<ParentReports />} />
          <Route path="/parent/attendance" element={<ParentAttendance />} />
          <Route path="/parent/grades" element={<ParentGrades />} />
          <Route path="/parent/fees" element={<ParentFees />} />
          <Route path="/parent/communication" element={<ParentCommunication />} />
        </Route>

        {/* Cashier routes */}
        <Route element={<RoleGuard allowedRoles={["CASHIER", "ADMIN"]} />}>
          <Route path="/cashier/dashboard" element={<CashierPortal />} />
          <Route path="/cashier/payments" element={<CashierPortal initialTab="payments" />} />
        </Route>

        {/* Common routes */}
        <Route path="/profile" element={<Settings />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/search" element={<Search />} />

        {/* Generic dashboard route */}
        <Route path="/dashboard" element={<RoleBasedRedirect />} />

        {/* Default redirect based on role */}
        <Route path="/" element={<RoleBasedRedirect />} />
      </Route>

      {/* Unauthorized page */}
      <Route
        path="/unauthorized"
        element={
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-foreground">403</h1>
              <p className="mt-2 text-muted-foreground">You are not authorized to access this page</p>
            </div>
          </div>
        }
      />

      {/* 404 page */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-foreground">404</h1>
              <p className="mt-2 text-muted-foreground">Page not found</p>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthInitializer>
          <AppRoutes />
        </AuthInitializer>
        <Toaster position="top-right" />
        <ReactQueryDevtools initialIsOpen={false} />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
