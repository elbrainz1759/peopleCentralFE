import type { Metadata } from "next";
import React from "react";
import DashboardActions from "@/components/hr/DashboardActions";
import { ExitInterviewDashboard } from "@/components/exit/ExitInterviewDashboard";
import { HRMetrics } from "@/components/hr/HRMetrics";
import LeaveTrendsChart from "@/components/hr/LeaveTrendsChart";
import RecentLeaveRequests from "@/components/hr/RecentLeaveRequests";

export const metadata: Metadata = {
  title: "HR Dashboard | Mercy Corps Nigeria & Liberia",
  description: "HR Management Dashboard",
};

export default function HRDashboard() {
  return (
    <div className="space-y-5">

      {/* Welcome banner */}
      <DashboardActions />

      {/* KPI metrics */}
      <HRMetrics />

      {/* Leave overview */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white">
            Leave Overview
          </h2>
        </div>
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12 lg:col-span-6 xl:col-span-7">
            <LeaveTrendsChart />
          </div>
          <div className="col-span-12 lg:col-span-6 xl:col-span-5">
            <RecentLeaveRequests />
          </div>
        </div>
      </div>

      {/* Exit interview overview */}
      <div>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white">
            Exit Interview Overview
          </h2>
        </div>
        <ExitInterviewDashboard />
      </div>

    </div>
  );
}
