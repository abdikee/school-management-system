import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { Bell, Check, ImagePlus, KeyRound, Mail, Save, Shield, UserRound } from "lucide-react";
import { toast } from "sonner";
import { authApi, usersApi } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { authKeys } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type NotificationPreferences = {
  email: boolean;
  inApp: boolean;
  sms: boolean;
};

const defaultPreferences: NotificationPreferences = {
  email: true,
  inApp: true,
  sms: false,
};

function getErrorMessage(error: unknown, fallback: string) {
  const response = (error as { response?: { data?: { message?: string } } })?.response;
  return response?.data?.message || fallback;
}

export function Settings() {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    phone: user?.phone ?? "",
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone ?? "",
      });
    }

    const storedPreferences = localStorage.getItem("notification-preferences");
    if (storedPreferences) {
      try {
        setPreferences({ ...defaultPreferences, ...JSON.parse(storedPreferences) });
      } catch {
        localStorage.removeItem("notification-preferences");
      }
    }
  }, [user]);

  const profileMutation = useMutation({
    mutationFn: () => usersApi.updateProfile(profile),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      localStorage.setItem("user", JSON.stringify({ ...user, ...updatedUser }));
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
      toast.success("Profile updated");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Unable to update profile")),
  });

  const passwordMutation = useMutation({
    mutationFn: () =>
      authApi.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      }),
    onSuccess: () => {
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password changed");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Unable to change password")),
  });

  const savePreferences = (nextPreferences: NotificationPreferences) => {
    setPreferences(nextPreferences);
    localStorage.setItem("notification-preferences", JSON.stringify(nextPreferences));
    toast.success("Notification preferences saved");
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Profile photos must be 2 MB or smaller");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const avatar = typeof reader.result === "string" ? reader.result : "";
      if (!avatar) {
        toast.error("Unable to read that image");
        return;
      }
      usersApi.updateProfile({ avatar }).then((updatedUser) => {
        updateUser(updatedUser);
        localStorage.setItem("user", JSON.stringify({ ...user, ...updatedUser }));
        queryClient.invalidateQueries({ queryKey: authKeys.profile() });
        toast.success("Profile photo updated");
      }).catch((error) => toast.error(getErrorMessage(error, "Unable to update profile photo")));
    };
    reader.onerror = () => toast.error("Unable to read that image");
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const submitPassword = () => {
    if (passwords.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    passwordMutation.mutate();
  };

  if (!user) return null;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Account</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Settings</h1>
        <p className="mt-2 text-slate-500">Manage your profile, security, and dashboard preferences.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card className="glass portal-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl"><UserRound className="h-5 w-5 text-emerald-700" /> Profile information</CardTitle>
            <CardDescription>Update the details used across your school account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-emerald-700 text-2xl font-semibold text-white shadow-lg shadow-emerald-900/10">
                {user.avatar ? <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} className="h-full w-full object-cover" /> : `${user.firstName[0]}${user.lastName[0]}`}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900">Profile photo</p>
                <p className="mt-1 text-xs text-slate-500">Use a clear JPG, PNG, or WebP image up to 2 MB.</p>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => fileInputRef.current?.click()}>
                  <ImagePlus className="mr-2 h-4 w-4" /> Upload photo
                </Button>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" value={profile.firstName} onChange={(event) => setProfile({ ...profile, firstName: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" value={profile.lastName} onChange={(event) => setProfile({ ...profile, lastName: event.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" value={user.email} disabled />
              <p className="text-xs text-slate-500">Contact an administrator to change your email address.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input id="phone" value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} />
            </div>
            <Button onClick={() => profileMutation.mutate()} loading={profileMutation.isPending}>
              <Save className="mr-2 h-4 w-4" /> Save profile
            </Button>
          </CardContent>
        </Card>

        <Card className="glass portal-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl"><Shield className="h-5 w-5 text-emerald-700" /> Account overview</CardTitle>
            <CardDescription>Your access level and account status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Role</p>
              <p className="mt-1 text-lg font-semibold text-emerald-950">{user.role.toLowerCase()}</p>
            </div>
            <div className="flex items-center justify-between border-b pb-4">
              <span className="text-sm text-slate-500">Account status</span>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">{user.status}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Email verification</span>
              <span className="flex items-center gap-1 text-sm font-medium text-emerald-700">
                <Check className="h-4 w-4" /> {user.emailVerified ? "Verified" : "Pending"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="glass portal-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl"><KeyRound className="h-5 w-5 text-emerald-700" /> Change password</CardTitle>
            <CardDescription>Use a strong password with at least six characters.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input id="currentPassword" type="password" value={passwords.currentPassword} onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input id="newPassword" type="password" value={passwords.newPassword} onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input id="confirmPassword" type="password" value={passwords.confirmPassword} onChange={(event) => setPasswords({ ...passwords, confirmPassword: event.target.value })} />
            </div>
            <Button onClick={submitPassword} loading={passwordMutation.isPending}>
              <KeyRound className="mr-2 h-4 w-4" /> Change password
            </Button>
          </CardContent>
        </Card>

        <Card className="glass portal-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl"><Bell className="h-5 w-5 text-emerald-700" /> Notifications</CardTitle>
            <CardDescription>Choose how you receive school updates on this device.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {([
              ["email", "Email notifications", "Receive announcements and account updates by email.", Mail],
              ["inApp", "In-app notifications", "Show alerts and updates inside the dashboard.", Bell],
              ["sms", "SMS notifications", "Receive urgent school messages by text.", Bell],
            ] as const).map(([key, title, description, Icon]) => (
              <label key={key} className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition hover:border-emerald-300">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-emerald-600"
                  checked={preferences[key]}
                  onChange={(event) => savePreferences({ ...preferences, [key]: event.target.checked })}
                />
                <span>
                  <span className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Icon className="h-4 w-4 text-emerald-700" /> {title}</span>
                  <span className="mt-1 block text-xs text-slate-500">{description}</span>
                </span>
              </label>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
