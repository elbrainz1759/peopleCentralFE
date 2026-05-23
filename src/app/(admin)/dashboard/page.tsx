import type { Metadata } from "next";
import React from "react";
import DashboardActions from "@/components/hr/DashboardActions";
import { ExitInterviewDashboard } from "@/components/exit/ExitInterviewDashboard";
import { HRMetrics } from "@/components/hr/HRMetrics";
import LeaveTrendsChart from "@/components/hr/LeaveTrendsChart";
import RecentLeaveRequests from "@/components/hr/RecentLeaveRequests";

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

      {/* HR Metrics */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <HRMetrics />
        </div>
      </div>

      {/* Leave Overview */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Leave Overview
          </h2>
        </div>
        <div className="col-span-12 lg:col-span-5">
          <LeaveTrendsChart />
        </div>
        <div className="col-span-12 lg:col-span-7">
          <RecentLeaveRequests />
        </div>
      </div>

      {/* Exit Interview Overview */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <ExitInterviewDashboard />
        </div>
      </div>
    </div>
  );
}
