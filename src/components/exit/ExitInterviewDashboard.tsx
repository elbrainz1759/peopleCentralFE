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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Exit Interview Overview
        </h3>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl dark:bg-blue-900/20">
            <GroupIcon className="text-blue-600 size-6 dark:text-blue-400" />
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Total Exit Interviews</span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">{stats.total || 0}</h4>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl dark:bg-orange-900/20">
            <AlertIcon className="text-orange-600 size-6 dark:text-orange-400" />
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Pending Interviews</span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">{pendingCount}</h4>
            </div>
            {pendingCount > 0 && <Badge color="warning">{pendingCount}</Badge>}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl dark:bg-green-900/20">
            <CheckCircleIcon className="text-green-600 size-6 dark:text-green-400" />
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Completed Interviews</span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">{completedCount}</h4>
            </div>
            {completedCount > 0 && <Badge color="success">{completedCount}</Badge>}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl dark:bg-purple-900/20">
            <DocsIcon className="text-purple-600 size-6 dark:text-purple-400" />
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">This Month</span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">{thisMonthCount}</h4>
            </div>
            {thisMonthCount > 0 && <Badge color="info">New</Badge>}
          </div>
        </div>
      </div>

      {/* Chart cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.by_department.length > 0 && (
          <DonutCard
            title="By Department"
            labels={stats.by_department.map((d) => d.department)}
            series={stats.by_department.map((d) => d.count)}
            colors={stats.by_department.map((_, i) => DEPARTMENT_COLORS[i % DEPARTMENT_COLORS.length])}
          />
        )}

        {stats.by_status.length > 0 && (
          <DonutCard
            title="By Status"
            labels={stats.by_status.map((s) => s.status)}
            series={stats.by_status.map((s) => s.count)}
            colors={stats.by_status.map((s) => STATUS_COLORS[s.status] || "#6B7280")}
          />
        )}

        {stats.would_recommend.length > 0 && (
          <DonutCard
            title="Would Recommend Company"
            labels={stats.would_recommend.map((r) => r.would_recommend)}
            series={stats.would_recommend.map((r) => r.count)}
            colors={stats.would_recommend.map((r) => RECOMMEND_COLORS[r.would_recommend] || "#6B7280")}
          />
        )}
      </div>
    </div>
  );
};
