import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  return (
    <div className="app-shell min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-72">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="relative mx-auto max-w-[1680px] px-4 py-6 sm:px-8 sm:py-8 lg:px-10">
          <div className="pointer-events-none absolute inset-x-10 top-0 -z-0 h-40 rounded-full bg-emerald-100/30 blur-3xl" />
          <div className="relative z-10"><Outlet /></div>
        </main>
      </div>
    </div>
  );
}