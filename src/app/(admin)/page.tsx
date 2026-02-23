import type { Metadata } from "next";
import { HRMetrics } from "@/components/hr/HRMetrics";
import React from "react";
import LeaveTrendsChart from "@/components/hr/LeaveTrendsChart";
import HRDemographics from "@/components/hr/HRDemographics";
import RecentLeaveRequests from "@/components/hr/RecentLeaveRequests";
import DashboardActions from "@/components/hr/DashboardActions";

export const metadata: Metadata = {
  title:
    "HR Dashboard | Mercy Corps Nigeria & Liberia",
  description: "HR Management Dashboard",
};

export default function HRDashboard() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <DashboardActions />
        <HRMetrics />
      </div>

      <div className="col-span-12 xl:col-span-7">
        <LeaveTrendsChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <HRDemographics />
      </div>

      <div className="col-span-12">
        <RecentLeaveRequests />
      </div>
    </div>
  );
}
