import type { Metadata } from "next";
import React from "react";
import DashboardActions from "@/components/hr/DashboardActions";
import { ExitInterviewDashboard } from "@/components/exit/ExitInterviewDashboard";

export const metadata: Metadata = {
  title:
    "HR Dashboard | Mercy Corps Nigeria & Liberia",
  description: "HR Management Dashboard",
};

export default function HRDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <DashboardActions />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <ExitInterviewDashboard />
        </div>
      </div>
    </div>
  );
}
