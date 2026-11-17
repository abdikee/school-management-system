import { FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, ChevronDown, LogOut, Menu, Search, UserRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/useAuth";

interface HeaderProps {
  onMenuClick: () => void;
}

const titles: Record<string, string> = {
  "/dashboard": "Overview",
  "/admin/dashboard": "Overview",
  "/admin/users": "People",
  "/admin/academic": "Academics",
  "/admin/attendance": "Attendance",
  "/admin/grades": "Grades",
  "/admin/finance": "Finance",
  "/admin/communication": "Messages",
  "/admin/reports": "Reports",
  "/admin/oversight": "Principal view",
  "/teacher/classes": "Classes",
  "/student/schedule": "Schedule",
  "/student/communication": "Messages",
  "/settings": "Settings",
  "/profile": "Profile",
  "/notifications": "Notifications",
  "/search": "Search",
  "/cashier/dashboard": "Cashier desk",
  "/cashier/payments": "Payments",
};

export function Header({ onMenuClick }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { mutate: logout, isPending } = useLogout();
  const [search, setSearch] = useState("");
  const title = titles[location.pathname] || "Workspace";

  useEffect(() => {
    setSearch(new URLSearchParams(location.search).get("q") ?? "");
  }, [location.search]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = search.trim();
    if (query.length >= 2) navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-[#f8faf9]/90 backdrop-blur-xl">
      <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-8 lg:px-10">
        <div className="flex min-w-0 items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-xl text-slate-600 lg:hidden" onClick={onMenuClick} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
              <span className="hidden sm:inline">Greenfield School</span>
              <span className="hidden text-slate-300 sm:inline">/</span>
              <span>Workspace</span>
            </div>
            <h1 className="mt-1 truncate text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">{title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <form onSubmit={submitSearch} className="hidden items-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-3.5 py-2.5 text-sm text-slate-400 shadow-sm md:flex">
            <Search className="h-4 w-4" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-36 bg-transparent outline-none placeholder:text-slate-400"
              placeholder="Search workspace"
              aria-label="Search workspace"
            />
            <kbd className="ml-4 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-400">⌘ K</kbd>
          </form>
          <button className="relative rounded-2xl p-2.5 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-700" onClick={() => navigate("/notifications")} aria-label="Notifications">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-[#f8faf9] bg-amber-500" />
          </button>
          <div className="hidden h-8 w-px bg-slate-200 sm:block" />
          <button className="flex items-center gap-3 rounded-2xl p-1.5 text-left transition hover:bg-white" onClick={() => navigate("/profile")} aria-label="Open profile">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 font-semibold text-emerald-800 ring-4 ring-white">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="hidden min-w-0 sm:block">
              <p className="max-w-28 truncate text-sm font-semibold text-slate-800">{user?.firstName} {user?.lastName}</p>
              <p className="flex items-center gap-1 text-xs capitalize text-slate-500"><UserRound className="h-3 w-3" />{user?.role?.toLowerCase()}<ChevronDown className="ml-1 h-3 w-3" /></p>
            </div>
          </button>
          <Button variant="ghost" size="icon" className="rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600" onClick={() => logout()} disabled={isPending} aria-label="Log out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
