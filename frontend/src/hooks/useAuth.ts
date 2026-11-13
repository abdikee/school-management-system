import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/services/api";
import type { LoginDto, RegisterDto, ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto, User, AuthTokens } from "@/types/api";
import { useAuthStore } from "@/context/AuthContext";

// Query keys
export const authKeys = {
  all: ["auth"] as const,
  profile: () => [...authKeys.all, "profile"] as const,
};

// Login mutation
export const useLogin = () => {
  const queryClient = useQueryClient();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (data: LoginDto) => authApi.login(data),
    onSuccess: (data: AuthTokens) => {
      // Store tokens
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Set auth in store
      setAuth(data.user, data.accessToken, data.refreshToken);

      // Invalidate profile query
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
    },
  });
};

// Register mutation
export const useRegister = () => {
  const queryClient = useQueryClient();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (data: RegisterDto) => authApi.register(data),
    onSuccess: (data: AuthTokens) => {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      setAuth(data.user, data.accessToken, data.refreshToken);
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
    },
  });
};

// Logout mutation
export const useLogout = () => {
  const queryClient = useQueryClient();
  const { clearAuth } = useAuthStore();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      clearAuth();
      queryClient.clear();
    },
    onError: () => {
      // Even if logout fails, clear local state
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      clearAuth();
      queryClient.clear();
    },
  });
};

// Get profile query
export const useProfile = () => {
  const { user, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: () => authApi.getProfile(),
    enabled: isAuthenticated && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Change password mutation
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordDto) => authApi.changePassword(data),
  });
};

// Forgot password mutation
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: ForgotPasswordDto) => authApi.forgotPassword(data),
  });
};

// Reset password mutation
export const useResetPassword = () => {
  return useMutation({
    mutationFn: (data: ResetPasswordDto) => authApi.resetPassword(data),
  });
};

// Verify email mutation
export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmail(token),
  });
};

// Initialize auth from localStorage
export const useInitializeAuth = () => {
  const { setAuth, clearAuth } = useAuthStore();

  return useQuery({
    queryKey: ["auth", "initialize"],
    queryFn: () => {
      const userStr = localStorage.getItem("user");
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (userStr && accessToken && refreshToken) {
        try {
          const user = JSON.parse(userStr) as User;
          setAuth(user, accessToken, refreshToken);
          return user;
        } catch {
          clearAuth();
          return null;
        }
      }
      return null;
    },
    staleTime: Infinity,
    retry: false,
  });
};