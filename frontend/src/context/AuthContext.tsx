import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, UserRole } from "@/types/api";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (user: Partial<User>) => void;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false, // Changed from true to false

      setAuth: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        }),

      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),

      hasRole: (roles) => {
        const user = get().user;
        if (!user) return false;
        const roleArray = Array.isArray(roles) ? roles : [roles];
        return roleArray.includes(user.role);
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Set isLoading to false after rehydration
        if (state) {
          state.isLoading = false;
        }
      },
    }
  )
);

// Hook for easy access
export const useAuth = () => {
  const {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    isLoading,
    hasRole,
    setAuth,
    clearAuth,
    setLoading,
    updateUser,
  } = useAuthStore();

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    isLoading,
    hasRole,
    setAuth,
    clearAuth,
    setLoading,
    updateUser,
  };
};

// Role-specific hooks
export const useIsAdmin = () => useAuthStore((state) => state.hasRole("ADMIN"));
export const useIsTeacher = () => useAuthStore((state) => state.hasRole("TEACHER"));
export const useIsStudent = () => useAuthStore((state) => state.hasRole("STUDENT"));
export const useIsParent = () => useAuthStore((state) => state.hasRole("PARENT"));
export const useIsCashier = () => useAuthStore((state) => state.hasRole("CASHIER"));
export const useIsStaff = () => useAuthStore((state) => state.hasRole(["ADMIN", "TEACHER", "CASHIER"]));