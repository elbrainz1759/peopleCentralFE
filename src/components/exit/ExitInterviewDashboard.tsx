"use client";
import React, { useEffect, useState } from "react";
import { exitServiceInstance } from "@/services/exit.service";
import Badge from "../ui/badge/Badge";
import { GroupIcon, DocsIcon, AlertIcon, CheckCircleIcon } from "@/icons";

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
    yearly_trend: []
  });
  // Helper functions to extract specific values
  const getPendingCount = () => {
    const pending = stats.by_status.find(item => item.status === 'Pending');
    return pending?.count || 0;
  };

  const getCompletedCount = () => {
    const completed = stats.by_status.find(item => item.status === 'Completed');
    return completed?.count || 0;
  };

  const getThisMonthCount = () => {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const thisMonth = stats.monthly_trend.find(item => item.month === currentMonth);
    return thisMonth?.count || 0;
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
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-6">
        {/* Total Exit Interviews */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl dark:bg-blue-900/20">
            <GroupIcon className="text-blue-600 size-6 dark:text-blue-400" />
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Total Exit Interviews
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {stats.total || 0}
              </h4>
            </div>
          </div>
        </div>

        {/* Pending Interviews */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl dark:bg-orange-900/20">
            <AlertIcon className="text-orange-600 size-6 dark:text-orange-400" />
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Pending Interviews
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {pendingCount || 0}
              </h4>
            </div>
            {pendingCount > 0 && (
              <Badge color="warning">
                {pendingCount}
              </Badge>
            )}
          </div>
        </div>

        {/* Completed Interviews */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl dark:bg-green-900/20">
            <CheckCircleIcon className="text-green-600 size-6 dark:text-green-400" />
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Completed Interviews
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {completedCount || 0}
              </h4>
            </div>
            {completedCount > 0 && (
              <Badge color="success">
                {completedCount}
              </Badge>
            )}
          </div>
        </div>

        {/* This Month */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl dark:bg-purple-900/20">
            <DocsIcon className="text-purple-600 size-6 dark:text-purple-400" />
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                This Month
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {thisMonthCount || 0}
              </h4>
            </div>
            {thisMonthCount > 0 && (
              <Badge color="info">
                New
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* By Department */}
        {stats.by_department.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              By Department
            </h4>
            <div className="space-y-2">
              {stats.by_department.slice(0, 3).map((dept, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{dept.department}</span>
                  <Badge color="info">{dept.count}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* By Status */}
        {stats.by_status.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              By Status
            </h4>
            <div className="space-y-2">
              {stats.by_status.map((status, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{status.status}</span>
                  <Badge 
                    color={
                      status.status === 'Completed' ? 'success' :
                      status.status === 'Approved' ? 'info' :
                      status.status === 'Rejected' ? 'error' : 'warning'
                    }
                  >
                    {status.count}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Would Recommend */}
        {stats.would_recommend.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Would Recommend Company
            </h4>
            <div className="space-y-2">
              {stats.would_recommend.map((recommend, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{recommend.would_recommend}</span>
                  <Badge 
                    color={
                      recommend.would_recommend === 'Yes' ? 'success' :
                      recommend.would_recommend === 'No' ? 'error' : 'warning'
                    }
                  >
                    {recommend.count}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
