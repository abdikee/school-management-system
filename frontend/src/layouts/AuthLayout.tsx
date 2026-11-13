import React from "react";
import { Outlet } from "react-router-dom";
import { School } from "lucide-react";
import { cn } from "@/lib/utils";

export function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <School className="h-12 w-12 text-primary-foreground" />
            <span className="text-3xl font-bold text-primary-foreground">SchoolMS</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
            School Management System
          </h1>
          <p className="text-lg text-primary-foreground/80">
            A comprehensive K-12 school management platform for administrators, teachers, students, and parents.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-4 text-center">
            <div className="bg-primary-foreground/10 rounded-lg p-4">
              <p className="text-2xl font-bold text-primary-foreground">50+</p>
              <p className="text-sm text-primary-foreground/70">Schools</p>
            </div>
            <div className="bg-primary-foreground/10 rounded-lg p-4">
              <p className="text-2xl font-bold text-primary-foreground">10K+</p>
              <p className="text-sm text-primary-foreground/70">Students</p>
            </div>
            <div className="bg-primary-foreground/10 rounded-lg p-4">
              <p className="text-2xl font-bold text-primary-foreground">99%</p>
              <p className="text-sm text-primary-foreground/70">Uptime</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}