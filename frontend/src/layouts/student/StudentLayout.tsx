"use client";

import { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Calendar, CheckCircle, Award, CreditCard, LogOut, Menu, X, School, Bell, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useLogout } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

const navigation = [
  { name: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { name: "My Schedule", href: "/student/schedule", icon: Calendar },
  { name: "Attendance", href: "/student/attendance", icon: CheckCircle },
  { name: "Grades", href: "/student/grades", icon: Award },
  { name: "Fees", href: "/student/fees", icon: CreditCard },
];

export function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-white border-r border-gray-200 transition-all duration-200 lg:translate-x-0",
          sidebarOpen ? "w-64" : "w-20",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          <div className={cn("flex h-16 items-center justify-between px-4 border-b border-gray-200", sidebarOpen ? "" : "justify-center")}>
            <NavLink to="/student/dashboard" className="flex items-center gap-2">
              <School className="h-8 w-8 text-primary" />
              {sidebarOpen && (
                <span className="text-xl font-bold text-gray-900">SchoolMS</span>
              )}
            </NavLink>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <Sidebar>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel className={cn("px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider", sidebarOpen ? "" : "hidden")}>
                  Main Menu
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navigation.map((item) => (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={item.href}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                              "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                              "data-[state=active]:bg-primary/10 data-[state=active]:text-primary",
                              location.pathname === item.href && "bg-primary/10 text-primary",
                              !sidebarOpen && "justify-center px-2"
                            )}
                            onClick={() => setMobileSidebarOpen(false)}
                          >
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                            {sidebarOpen && <span>{item.name}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          <SidebarFooter className={cn("p-4 border-t border-gray-200", !sidebarOpen && "hidden")}>
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.avatar || undefined} alt={user?.firstName + " " + user?.lastName} />
                <AvatarFallback>{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase()}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarFooter>
        </div>
      </aside>

      <div
        className={cn(
          "transition-all duration-200 lg:pl-64",
          sidebarOpen ? "lg:pl-64" : "lg:pl-20"
        )}
      >
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 shadow-sm lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div className="flex-1" />

          <div className="flex items-center gap-2 lg:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Bell className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuItem>No new notifications</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar || undefined} alt={user?.firstName + " " + user?.lastName} />
              <AvatarFallback>{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className={cn("fixed bottom-4 right-4 z-20 lg:hidden")}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <ChevronDown className="h-5 w-5 rotate-180" /> : <Menu className="h-5 w-5" />}
      </Button>
    </div>
  );
}