import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useInitializeAuth } from "@/hooks/useAuth";
import { Login } from "@/pages/auth/Login";
import { MainLayout } from "@/layouts/MainLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { AdminDashboard } from "@/pages/admin/Dashboard";
import { TeacherDashboard } from "@/pages/teacher/Dashboard";
import { StudentDashboard } from "@/pages/student/Dashboard";
import { ParentDashboard } from "@/pages/parent/Dashboard";
import { AdminReports } from "@/pages/admin/Reports";
import { TeacherReports } from "@/pages/teacher/Reports";
import { StudentReports } from "@/pages/student/Reports";
import { ParentReports } from "@/pages/parent/Reports";
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

// Auth initialization component - wraps routes that need auth state initialized
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();
  const { isLoading: initLoading } = useInitializeAuth();

  if (isLoading || initLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}

// Protected route wrapper - checks authentication and renders MainLayout with Outlet
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

// Public route wrapper - redirects authenticated users, renders AuthLayout with Outlet
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

// Role-based route guard - checks if user has required roles, renders Outlet if authorized
function RoleGuard({ allowedRoles }: { allowedRoles?: string[] }) {
  const { user } = useAuth();

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

// Main app routes
function AppRoutes() {
  return (
    <Routes>
      {/* Public routes - using AuthLayout as layout */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Protected routes - using ProtectedRoute + MainLayout as layout */}
      <Route element={<ProtectedRoute />}>
        {/* Admin routes */}
        <Route element={<RoleGuard allowedRoles={["ADMIN"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<div className="p-4">Admin Users - Coming Soon</div>} />
          <Route path="/admin/academic" element={<div className="p-4">Admin Academic - Coming Soon</div>} />
          <Route path="/admin/attendance" element={<div className="p-4">Admin Attendance - Coming Soon</div>} />
          <Route path="/admin/grades" element={<div className="p-4">Admin Grades - Coming Soon</div>} />
          <Route path="/admin/finance" element={<div className="p-4">Admin Finance - Coming Soon</div>} />
          <Route path="/admin/communication" element={<div className="p-4">Admin Communication - Coming Soon</div>} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/settings" element={<div className="p-4">Admin Settings - Coming Soon</div>} />
        </Route>

        {/* Teacher routes */}
        <Route element={<RoleGuard allowedRoles={["TEACHER", "ADMIN"]} />}>
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/classes" element={<div className="p-4">Teacher Classes - Coming Soon</div>} />
          <Route path="/teacher/attendance" element={<div className="p-4">Teacher Attendance - Coming Soon</div>} />
          <Route path="/teacher/grades" element={<div className="p-4">Teacher Grades - Coming Soon</div>} />
          <Route path="/teacher/communication" element={<div className="p-4">Teacher Communication - Coming Soon</div>} />
          <Route path="/teacher/reports" element={<TeacherReports />} />
        </Route>

        {/* Student routes */}
        <Route element={<RoleGuard allowedRoles={["STUDENT", "ADMIN", "TEACHER"]} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/reports" element={<StudentReports />} />
          <Route path="/student/schedule" element={<div className="p-4">Student Schedule - Coming Soon</div>} />
          <Route path="/student/fees" element={<div className="p-4">Student Fees - Coming Soon</div>} />
        </Route>

        {/* Parent routes */}
        <Route element={<RoleGuard allowedRoles={["PARENT", "ADMIN"]} />}>
          <Route path="/parent/dashboard" element={<ParentDashboard />} />
          <Route path="/parent/children" element={<div className="p-4">Parent Children - Coming Soon</div>} />
          <Route path="/parent/reports" element={<ParentReports />} />
        </Route>

        {/* Default redirect based on role */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>

      {/* Unauthorized page */}
      <Route
        path="/unauthorized"
        element={
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-foreground">403</h1>
              <p className="mt-2 text-muted-foreground">You are not authorized to access this page</p>
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