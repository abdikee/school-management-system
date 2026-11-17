import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, GraduationCap, Loader2, Lock, Mail, Phone, User } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const registrationSchema = z.object({
  firstName: z.string().trim().min(2, "First name is required"),
  lastName: z.string().trim().min(2, "Last name is required"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().trim().optional(),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegistrationForm = z.infer<typeof registrationSchema>;

export function StudentRegistrationPage() {
  const [submittedStudentId, setSubmittedStudentId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { gender: "OTHER" },
  });

  const onSubmit = async (data: RegistrationForm) => {
    try {
      const response = await authApi.registerStudent({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || undefined,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        password: data.password,
      });
      setSubmittedStudentId(response.studentId);
      toast.success("Registration submitted");
    } catch (error: any) {
      toast.error("Registration failed", {
        description: error.response?.data?.message || "Please check your details and try again.",
      });
    }
  };

  if (submittedStudentId) {
    return (
      <div className="min-h-screen bg-emerald-950 px-4 py-12">
        <div className="mx-auto flex min-h-[80vh] max-w-lg items-center">
          <Card className="w-full shadow-2xl">
            <CardContent className="p-8 text-center sm:p-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h1 className="mt-6 text-2xl font-bold text-slate-950">Application submitted</h1>
              <p className="mt-3 text-slate-600">
                Your application is waiting for school approval. Keep your student ID for reference.
              </p>
              <div className="mt-6 rounded-xl bg-emerald-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Student ID</p>
                <p className="mt-1 text-xl font-bold tracking-wider text-emerald-950">{submittedStudentId}</p>
              </div>
              <p className="mt-5 text-sm text-slate-500">You will be able to sign in after an administrator activates your account.</p>
              <Button asChild className="mt-7 w-full"><Link to="/login">Return to sign in</Link></Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-950 px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center text-white">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-300 text-emerald-950">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-tight">Student registration portal</h1>
          <p className="mt-2 text-emerald-100/75">Apply for a student account at Greenfield School.</p>
        </div>

        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle>Start your application</CardTitle>
            <CardDescription>Complete your details. The school office will review and activate your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <div className="relative"><User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input id="firstName" className="pl-10" {...register("firstName")} /></div>
                  {errors.firstName && <p className="text-sm text-rose-600">{errors.firstName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <div className="relative"><User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input id="lastName" className="pl-10" {...register("lastName")} /></div>
                  {errors.lastName && <p className="text-sm text-rose-600">{errors.lastName.message}</p>}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input id="email" type="email" className="pl-10" {...register("email")} /></div>
                  {errors.email && <p className="text-sm text-rose-600">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone number <span className="font-normal text-slate-500">(optional)</span></Label>
                  <div className="relative"><Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input id="phone" className="pl-10" {...register("phone")} /></div>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of birth</Label>
                  <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
                  {errors.dateOfBirth && <p className="text-sm text-rose-600">{errors.dateOfBirth.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <select id="gender" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...register("gender")}>
                    <option value="OTHER">Prefer not to say</option>
                    <option value="FEMALE">Female</option>
                    <option value="MALE">Male</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password">Create password</Label>
                  <div className="relative"><Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input id="password" type={showPassword ? "text" : "password"} className="pl-10" {...register("password")} /></div>
                  {errors.password && <p className="text-sm text-rose-600">{errors.password.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input id="confirmPassword" type={showPassword ? "text" : "password"} {...register("confirmPassword")} />
                  {errors.confirmPassword && <p className="text-sm text-rose-600">{errors.confirmPassword.message}</p>}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={showPassword} onChange={(event) => setShowPassword(event.target.checked)} className="accent-emerald-600" />
                Show passwords
              </label>
              <Button type="submit" className="w-full" loading={isSubmitting}>
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting application...</> : "Submit student application"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center text-sm text-slate-600">
            Already have an account? <Link to="/login" className="ml-1 font-semibold text-emerald-700 hover:underline">Sign in</Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
