"use client";

import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  ClipboardCheck,
  DollarSign,
  MessageSquare,
  Bell,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronRight,
  School,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types/api";

interface SidebarProps {
  isOpen: boolean;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "TEACHER", "STUDENT", "PARENT"] as UserRole[] },
  { name: "Users", href: "/users", icon: Users, roles: ["ADMIN"] as UserRole[] },
  { name: "Academics", href: "/academics", icon: GraduationCap, roles: ["ADMIN", "TEACHER"] as UserRole[] },
  { name: "Classes", href: "/classes", icon: BookOpen, roles: ["ADMIN", "TEACHER"] as UserRole[] },
  { name: "Timetable", href: "/timetable", icon: Calendar, roles: ["ADMIN", "TEACHER", "STUDENT", "PARENT"] as UserRole[] },
  { name: "Attendance", href: "/attendance", icon: ClipboardCheck, roles: ["ADMIN", "TEACHER"] as UserRole[] },
  { name: "Grades", href: "/grades", icon: Award, roles: ["ADMIN", "TEACHER", "STUDENT", "PARENT"] as UserRole[] },
  { name: "Finance", href: "/finance", icon: DollarSign, roles: ["ADMIN"] as UserRole[] },
  { name: "Communication", href: "/communication", icon: MessageSquare, roles: ["ADMIN", "TEACHER", "STUDENT", "PARENT"] as UserRole[] },
  { name: "Notifications", href: "/notifications", icon: Bell, roles: ["ADMIN", "TEACHER", "STUDENT", "PARENT"] as UserRole[] },
  { name: "Reports", href: "/reports", icon: BarChart3, roles: ["ADMIN", "TEACHER"] as UserRole[] },
  { name: "Settings", href: "/settings", icon: Settings, roles: ["ADMIN"] as UserRole[] },
];

export function Sidebar({ isOpen }: SidebarProps) {
  const location = useLocation();
  const { user, hasRole } = useAuth();

  const filteredNavigation = navigation.filter((item) =>
    item.roles.some((role) => hasRole(role))
  );

  return (
    <>
      {/* Mobile close button */}
      <Button
        className={cn("fixed top-4 left-4 z-50 lg:hidden", isOpen ? "left-64" : "")}
        variant="ghost"
        size="icon"
        onClick={() => window.history.back()}
        aria-label="Close sidebar"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 transform bg-card border-r border-border transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Sidebar navigation"
      >
        <div className="flex h-full flex-col">
          {/* Logo/Brand */}
          <div className="flex h-16 shrink-0 items-center px-6 border-b border-border">
            <div className="flex items-center gap-2">
              <School className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">SchoolMS</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4 overflow-y-auto" aria-label="Main navigation">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href ||
                (item.href !== "/dashboard" && location.pathname.startsWith(item.href));

              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )
                  }
                  aria-current={isActive ? "page" : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  <span>{item.name}</span>
                  {isActive && <ChevronRight className="ml-auto h-4 w-4" aria-hidden="true" />}
                </NavLink>
              );
            })}
          </nav>

          {/* User info at bottom */}
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="h-10 w-10 rounded-full" />
                ) : (
                  <span className="text-primary font-medium">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role?.toLowerCase()}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}