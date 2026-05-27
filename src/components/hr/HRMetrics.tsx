"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { GroupIcon, CalenderIcon, FileIcon, BoxIconLine } from "@/icons";
import { userService } from "@/services/user.service";
import { leaveServiceInstance } from "@/services/leave.service";
import { exitServiceInstance } from "@/services/exit.service";

interface MetricCardProps {
    title: string;
    value: string | number;
    change?: string;
    changeType?: "up" | "down" | "neutral";
    icon: React.ReactNode;
    iconBg: string;
    href?: string;
    footer?: string;
    loading?: boolean;
}

function MetricCard({ title, value, change, changeType = "neutral", icon, iconBg, href, footer, loading }: MetricCardProps) {
    const changeColor =
        changeType === "up" ? "text-success-600 bg-success-50 dark:bg-success-500/10 dark:text-success-400"
        : changeType === "down" ? "text-error-600 bg-error-50 dark:bg-error-500/10 dark:text-error-400"
        : "text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400";

    const content = (
        <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:border-gray-200 hover:shadow-md dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-gray-700 md:p-6">
            <div className="flex items-start justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}>
                    {icon}
                </div>
                {change && (
                    <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${changeColor}`}>
                        {changeType === "up" ? "↑" : changeType === "down" ? "↓" : ""}
                        {change}
                    </span>
                )}
            </div>
            <div className="mt-5">
                <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                {loading ? (
                    <div className="mt-1 h-9 w-24 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
                ) : (
                    <h3 className="mt-1 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{value}</h3>
                )}
                {footer && <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">{footer}</p>}
            </div>
            {href && (
                <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-brand-500 transition-all duration-300 group-hover:w-full" />
            )}
        </div>
    );

    return href ? <Link href={href}>{content}</Link> : content;
}

export const HRMetrics = () => {
    const [loading, setLoading] = useState(true);
    const [activeStaff, setActiveStaff] = useState(0);
    const [onLeave, setOnLeave] = useState(0);
    const [pendingLeaves, setPendingLeaves] = useState(0);
    const [exitRequests, setExitRequests] = useState(0);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const today = new Date();
                const currentMonth = today.getMonth();
                const currentYear = today.getFullYear();

                const [employeesRes, approvedLeavesRes, pendingLeavesRes, exitRes] = await Promise.allSettled([
                    userService.getAllEmployees(),
                    leaveServiceInstance.getAllLeaves(1, 1000, 'Approved'),
                    leaveServiceInstance.getAllLeaves(1, 1, 'Pending'),
                    exitServiceInstance.getAllExitInterviews(1, 1000),
                ]);

                if (employeesRes.status === 'fulfilled') {
                    const res = employeesRes.value as any;
                    setActiveStaff(res?.meta?.total ?? res?.data?.length ?? 0);
                }

                if (approvedLeavesRes.status === 'fulfilled') {
                    const res = approvedLeavesRes.value as any;
                    const leaves: any[] = res?.data ?? (Array.isArray(res) ? res : []);
                    const count = leaves.filter((leave: any) => {
                        const durations: any[] = leave.durations ?? [];
                        return durations.some((d: any) => {
                            const start = new Date(d.start_date);
                            const end = new Date(d.end_date);
                            return today >= start && today <= end;
                        });
                    }).length;
                    setOnLeave(count);
                }

                if (pendingLeavesRes.status === 'fulfilled') {
                    const res = pendingLeavesRes.value as any;
                    setPendingLeaves(res?.meta?.total ?? 0);
                }

                if (exitRes.status === 'fulfilled') {
                    const res = exitRes.value as any;
                    const records: any[] = res?.data ?? (Array.isArray(res) ? res : []);
                    const count = records.filter((r: any) => {
                        const created = new Date(r.created_at || r.createdAt);
                        return created.getMonth() === currentMonth && created.getFullYear() === currentYear;
                    }).length;
                    setExitRequests(count);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, []);

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-5">
            <MetricCard
                title="Active Staff"
                value={activeStaff.toLocaleString()}
                icon={<GroupIcon className="size-6 text-brand-500" />}
                iconBg="bg-brand-50 dark:bg-brand-500/10"
                href="/hr/employees"
                footer="total employees"
                loading={loading}
            />
            <MetricCard
                title="On Leave"
                value={onLeave}
                icon={<CalenderIcon className="size-6 text-blue-500" />}
                iconBg="bg-blue-50 dark:bg-blue-500/10"
                href="/leave/approvals"
                footer="currently away"
                loading={loading}
            />
            <MetricCard
                title="Pending Leaves"
                value={pendingLeaves}
                change={pendingLeaves > 0 ? "Needs action" : undefined}
                changeType={pendingLeaves > 0 ? "down" : "neutral"}
                icon={<FileIcon className="size-6 text-amber-500" />}
                iconBg="bg-amber-50 dark:bg-amber-500/10"
                href="/leave/approvals"
                footer="awaiting approval"
                loading={loading}
            />
            <MetricCard
                title="Exit Requests"
                value={exitRequests}
                icon={<BoxIconLine className="size-6 text-purple-500" />}
                iconBg="bg-purple-50 dark:bg-purple-500/10"
                href="/exit/approvals"
                footer="this month"
                loading={loading}
            />
        </div>
    );
};
