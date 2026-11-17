import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, LockKeyhole, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useLogin } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { LoginDto, UserRole } from "@/types/api";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { mutateAsync: login, isPending } = useLogin();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const auth = await login(data as LoginDto);
      toast.success("Welcome back");
      const roleRoutes: Record<UserRole, string> = {
        ADMIN: "/admin/dashboard",
        TEACHER: "/teacher/dashboard",
        STUDENT: "/student/dashboard",
        PARENT: "/parent/dashboard",
        CASHIER: "/cashier/dashboard",
      };
      navigate(roleRoutes[auth.user.role], { replace: true });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Unable to sign in. Check your credentials.");
    }
  };

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Welcome back</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Sign in to your workspace</h2>
      <p className="mt-3 text-sm leading-6 text-slate-500">Use your school account to continue.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-9 space-y-5">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">Email address</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input id="email" type="email" placeholder="you@school.edu" className="h-12 rounded-xl border-slate-200 bg-white pl-10" {...register("email")} disabled={isPending} />
          </div>
          {errors.email && <p className="mt-1.5 text-xs text-rose-600">{errors.email.message}</p>}
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
            <Link to="/forgot-password" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">Forgot password?</Link>
          </div>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" className="h-12 rounded-xl border-slate-200 bg-white pl-10 pr-11" {...register("password")} disabled={isPending} />
            <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700" aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1.5 text-xs text-rose-600">{errors.password.message}</p>}
        </div>
        <Button type="submit" className="h-12 w-full rounded-xl bg-emerald-600 font-semibold hover:bg-emerald-700" disabled={isPending}>
          {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</> : "Continue to workspace"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        Need access? <Link to="/register" className="font-semibold text-emerald-700 hover:text-emerald-800">Contact your administrator</Link>
      </p>
      <div className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-xs leading-5 text-emerald-900">
        Demo access: <strong>admin@school.com</strong> / <strong>password123</strong>
      </div>
    </div>
  );
}
