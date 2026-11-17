import { Outlet } from "react-router-dom";
import { ArrowUpRight, CheckCircle2, GraduationCap, Leaf, ShieldCheck } from "lucide-react";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#f5f8f6] lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-emerald-950 px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-40 right-0 h-[30rem] w-[30rem] rounded-full bg-lime-300/10 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400 text-emerald-950">
              <GraduationCap className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xl font-semibold">Greenfield</p>
              <p className="text-xs text-emerald-200/70">School management</p>
            </div>
          </div>
          <div className="mt-24 max-w-xl">
            <p className="flex items-center gap-2 text-sm font-medium text-emerald-300"><Leaf className="h-4 w-4" /> A calmer way to run school</p>
            <h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-tight xl:text-6xl">Everything your school needs, in one clear view.</h1>
            <p className="mt-7 max-w-lg text-base leading-7 text-emerald-100/70">
              Connect people, academics, attendance, grades, finance, and communication in one thoughtful workspace.
            </p>
          </div>
        </div>
        <div className="relative grid grid-cols-2 gap-3 text-sm text-emerald-100/80">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4"><CheckCircle2 className="mb-3 h-5 w-5 text-emerald-300" /><span>Connected to your school API</span></div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4"><ShieldCheck className="mb-3 h-5 w-5 text-emerald-300" /><span>Role-aware and secure access</span></div>
        </div>
      </section>
      <section className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white"><GraduationCap className="h-5 w-5" /></div>
              <span className="font-semibold text-slate-950">Greenfield</span>
            </div>
            <ArrowUpRight className="h-5 w-5 text-emerald-600" />
          </div>
          <Outlet />
        </div>
      </section>
    </div>
  );
}
