import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
  Activity,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckSquare2,
  CircleDollarSign,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  ReceiptText,
  Settings2,
  Users,
  X,
} from "lucide-react";
import type { UserRole } from "@/types/api";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  roles: UserRole[];
};

const navigation: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "TEACHER", "STUDENT", "PARENT"] },
  { label: "People", href: "/admin/users", icon: Users, roles: ["ADMIN"] },
  { label: "Permissions", href: "/admin/permissions", icon: Users, roles: ["ADMIN"] },
  { label: "Academics", href: "/admin/academic", icon: BookOpen, roles: ["ADMIN", "TEACHER"] },
  { label: "Classes", href: "/teacher/classes", icon: GraduationCap, roles: ["TEACHER"] },
  { label: "Attendance", href: "/teacher/attendance", icon: CheckSquare2, roles: ["TEACHER"] },
  { label: "Grades", href: "/teacher/grades", icon: GraduationCap, roles: ["TEACHER"] },
  { label: "Schedule", href: "/student/schedule", icon: CalendarDays, roles: ["STUDENT"] },
  { label: "My reports", href: "/student/reports", icon: BarChart3, roles: ["STUDENT"] },
  { label: "Fees", href: "/student/fees", icon: CircleDollarSign, roles: ["STUDENT"] },
  { label: "Messages", href: "/student/communication", icon: MessageSquare, roles: ["STUDENT"] },
  { label: "Children", href: "/parent/children", icon: Users, roles: ["PARENT"] },
  { label: "Attendance", href: "/parent/attendance", icon: CheckSquare2, roles: ["PARENT"] },
  { label: "Grades", href: "/parent/grades", icon: GraduationCap, roles: ["PARENT"] },
  { label: "Fees", href: "/parent/fees", icon: CircleDollarSign, roles: ["PARENT"] },
  { label: "Messages", href: "/parent/communication", icon: MessageSquare, roles: ["PARENT"] },
  { label: "Cashier desk", href: "/cashier/dashboard", icon: CircleDollarSign, roles: ["CASHIER"] },
  { label: "Payments", href: "/cashier/payments", icon: ReceiptText, roles: ["CASHIER"] },
  { label: "Attendance", href: "/admin/attendance", icon: CheckSquare2, roles: ["ADMIN"] },
  { label: "Grades", href: "/admin/grades", icon: GraduationCap, roles: ["ADMIN"] },
  { label: "Finance", href: "/admin/finance", icon: CircleDollarSign, roles: ["ADMIN"] },
  { label: "Messages", href: "/admin/communication", icon: MessageSquare, roles: ["ADMIN"] },
  { label: "Reports", href: "/admin/reports", icon: BarChart3, roles: ["ADMIN", "TEACHER"] },
  { label: "Principal view", href: "/admin/oversight", icon: Activity, roles: ["ADMIN"] },
  { label: "Settings", href: "/settings", icon: Settings2, roles: ["ADMIN", "TEACHER", "STUDENT", "PARENT", "CASHIER"] },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, hasRole } = useAuth();
  const items = navigation.filter((item) => item.roles.some((role) => hasRole(role)));

  return (
    <>
      {isOpen && <button className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" onClick={onClose} aria-label="Close menu" />}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-[#092f2b] text-white transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}>
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400 text-emerald-950 shadow-lg shadow-emerald-950/20">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight">Greenfield</p>
              <p className="text-xs text-emerald-200/70">School management</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-emerald-200 hover:bg-white/10 lg:hidden" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6" aria-label="Main navigation">
          <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300/60">Workspace</p>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) => cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition",
                  isActive ? "bg-emerald-300 text-[#092f2b] shadow-lg shadow-black/10" : "text-emerald-100/70 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-300 font-semibold text-emerald-950">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user?.firstName} {user?.lastName}</p>
              <p className="truncate text-xs capitalize text-emerald-200/70">{user?.role?.toLowerCase()}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
