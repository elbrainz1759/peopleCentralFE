"use client";
import React, { useEffect, useState } from "react";
import DashboardActions from "@/components/hr/DashboardActions";
import { ExitInterviewDashboard } from "@/components/exit/ExitInterviewDashboard";
import { HRMetrics } from "@/components/hr/HRMetrics";
import LeaveTrendsChart from "@/components/hr/LeaveTrendsChart";
import RecentLeaveRequests from "@/components/hr/RecentLeaveRequests";
import UserDashboard from "@/components/dashboard/UserDashboard";

export default function HRDashboard() {
  const [isRegularUser, setIsRegularUser] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem("auth_token");
      let role = "";
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        role = (payload.role || "").toLowerCase();
      }
      if (!role) {
        const raw = localStorage.getItem("auth_user");
        if (raw) role = (JSON.parse(raw)?.role || "").toLowerCase();
      }
      setIsRegularUser(role !== "superadmin");
    } catch { /* ignore */ }
    setReady(true);
  }, []);

  if (!ready) return null;

  if (isRegularUser) return <UserDashboard />;

  return (
    <div className="space-y-5">
      <DashboardActions />
      <HRMetrics />
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white">Leave Overview</h2>
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
      <div>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white">Exit Interview Overview</h2>
        </div>
        <ExitInterviewDashboard />
      </div>
    </div>
  );
}
