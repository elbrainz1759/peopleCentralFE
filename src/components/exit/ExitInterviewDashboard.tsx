"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { exitServiceInstance } from "@/services/exit.service";
import Badge from "../ui/badge/Badge";
import { GroupIcon, DocsIcon, AlertIcon, CheckCircleIcon } from "@/icons";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface DashboardStats {
  total: number;
  by_stage: Array<{ stage: string; count: number }>;
  by_status: Array<{ status: string; count: number }>;
  by_department: Array<{ department: string; count: number }>;
  by_location: Array<{ location: string; count: number }>;
  by_country: Array<{ country: string; count: number }>;
  would_recommend: Array<{ would_recommend: string; count: number }>;
  monthly_trend: Array<{ month: string; count: number }>;
  yearly_trend: Array<{ year: number; count: number }>;
}

const DEPARTMENT_COLORS = ["#3B82F6","#8B5CF6","#06B6D4","#F59E0B","#10B981","#EF4444","#F97316","#EC4899"];

const STATUS_COLORS: Record<string, string> = {
  Completed: "#10B981",
  Approved: "#3B82F6",
  Rejected: "#EF4444",
  Pending: "#F59E0B",
};

const RECOMMEND_COLORS: Record<string, string> = {
  Yes: "#10B981",
  No: "#EF4444",
  Maybe: "#F59E0B",
};

function DonutCard({
  title,
  labels,
  series,
  colors,
}: {
  title: string;
  labels: string[];
  series: number[];
  colors: string[];
}) {
  const options: ApexCharts.ApexOptions = {
    chart: { type: "donut", toolbar: { show: false }, sparkline: { enabled: false } },
    labels,
    colors,
    legend: { position: "bottom", fontSize: "13px" },
    dataLabels: { enabled: true, formatter: (val: number) => `${Math.round(val)}%` },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              fontSize: "13px",
              color: "#6B7280",
              formatter: (w) => w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0),
            },
          },
        },
      },
    },
    tooltip: { y: { formatter: (val: number) => `${val}` } },
    stroke: { width: 2 },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{title}</h4>
      <ReactApexChart type="donut" options={options} series={series} height={260} />
    </div>
  );
}

export const ExitInterviewDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    by_stage: [],
    by_status: [],
    by_department: [],
    by_location: [],
    by_country: [],
    would_recommend: [],
    monthly_trend: [],
    yearly_trend: [],
  });

  const getPendingCount = () => stats.by_status.find((i) => i.status === "Pending")?.count || 0;
  const getCompletedCount = () => stats.by_status.find((i) => i.status === "Completed")?.count || 0;
  const getThisMonthCount = () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    return stats.monthly_trend.find((i) => i.month === currentMonth)?.count || 0;
  };

  const pendingCount = getPendingCount();
  const completedCount = getCompletedCount();
  const thisMonthCount = getThisMonthCount();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await exitServiceInstance.getDashboard();
        setStats(response.data || response);
      } catch (error) {
        console.error("Failed to fetch exit interview dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-2xl dark:bg-gray-800"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Summary stat cards */}
      <div className="grid grid-cols-2 divide-x divide-y divide-gray-100 dark:divide-gray-800 md:grid-cols-4 md:divide-y-0">
        <div className="flex flex-col gap-3 p-5 md:p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
            <GroupIcon className="text-blue-500 size-5" />
          </div>
          <div>
            <span className="text-xs text-gray-400 dark:text-gray-500">Total Exit Interviews</span>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{stats.total || 0}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 p-5 md:p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10">
            <AlertIcon className="text-amber-500 size-5" />
          </div>
          <div>
            <span className="text-xs text-gray-400 dark:text-gray-500">Pending Interviews</span>
            <div className="mt-1 flex items-end gap-2">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingCount}</p>
              {pendingCount > 0 && <Badge color="warning">{pendingCount}</Badge>}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 p-5 md:p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 dark:bg-green-500/10">
            <CheckCircleIcon className="text-green-500 size-5" />
          </div>
          <div>
            <span className="text-xs text-gray-400 dark:text-gray-500">Completed Interviews</span>
            <div className="mt-1 flex items-end gap-2">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedCount}</p>
              {completedCount > 0 && <Badge color="success">{completedCount}</Badge>}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 p-5 md:p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-500/10">
            <DocsIcon className="text-purple-500 size-5" />
          </div>
          <div>
            <span className="text-xs text-gray-400 dark:text-gray-500">This Month</span>
            <div className="mt-1 flex items-end gap-2">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{thisMonthCount}</p>
              {thisMonthCount > 0 && <Badge color="info">New</Badge>}
            </div>
          </div>
        </div>
      </div>

      {/* Chart cards */}
      {(stats.by_department.length > 0 || stats.by_status.length > 0 || stats.would_recommend.length > 0) && (
        <div className="grid grid-cols-1 gap-0 border-t border-gray-100 dark:border-gray-800 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-gray-800">
          {stats.by_department.length > 0 && (
            <div className="p-5 md:p-6">
              <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">By Department</h4>
              <ReactApexChart
                type="donut"
                options={{
                  chart: { type: "donut", toolbar: { show: false } },
                  labels: stats.by_department.map((d) => d.department),
                  colors: stats.by_department.map((_, i) => DEPARTMENT_COLORS[i % DEPARTMENT_COLORS.length]),
                  legend: { position: "bottom", fontSize: "12px" },
                  dataLabels: { enabled: true, formatter: (val: number) => `${Math.round(val)}%` },
                  plotOptions: { pie: { donut: { size: "65%", labels: { show: true, total: { show: true, label: "Total", fontSize: "12px", color: "#6B7280", formatter: (w) => w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0) } } } } },
                  stroke: { width: 2 },
                }}
                series={stats.by_department.map((d) => d.count)}
                height={240}
              />
            </div>
          )}
          {stats.by_status.length > 0 && (
            <div className="p-5 md:p-6">
              <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">By Status</h4>
              <ReactApexChart
                type="donut"
                options={{
                  chart: { type: "donut", toolbar: { show: false } },
                  labels: stats.by_status.map((s) => s.status),
                  colors: stats.by_status.map((s) => STATUS_COLORS[s.status] || "#6B7280"),
                  legend: { position: "bottom", fontSize: "12px" },
                  dataLabels: { enabled: true, formatter: (val: number) => `${Math.round(val)}%` },
                  plotOptions: { pie: { donut: { size: "65%", labels: { show: true, total: { show: true, label: "Total", fontSize: "12px", color: "#6B7280", formatter: (w) => w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0) } } } } },
                  stroke: { width: 2 },
                }}
                series={stats.by_status.map((s) => s.count)}
                height={240}
              />
            </div>
          )}
          {stats.would_recommend.length > 0 && (
            <div className="p-5 md:p-6">
              <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Would Recommend Company</h4>
              <ReactApexChart
                type="donut"
                options={{
                  chart: { type: "donut", toolbar: { show: false } },
                  labels: stats.would_recommend.map((r) => r.would_recommend),
                  colors: stats.would_recommend.map((r) => RECOMMEND_COLORS[r.would_recommend] || "#6B7280"),
                  legend: { position: "bottom", fontSize: "12px" },
                  dataLabels: { enabled: true, formatter: (val: number) => `${Math.round(val)}%` },
                  plotOptions: { pie: { donut: { size: "65%", labels: { show: true, total: { show: true, label: "Total", fontSize: "12px", color: "#6B7280", formatter: (w) => w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0) } } } } },
                  stroke: { width: 2 },
                }}
                series={stats.would_recommend.map((r) => r.count)}
                height={240}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
