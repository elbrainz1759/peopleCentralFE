"use client";
import React from "react";
import Link from "next/link";
import { GroupIcon, CalenderIcon, FileIcon, BoxIconLine } from "@/icons";

interface MetricCardProps {
    title: string;
    value: string | number;
    change?: string;
    changeType?: "up" | "down" | "neutral";
    icon: React.ReactNode;
    iconBg: string;
    href?: string;
    footer?: string;
}

function MetricCard({ title, value, change, changeType = "neutral", icon, iconBg, href, footer }: MetricCardProps) {
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
                <h3 className="mt-1 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{value}</h3>
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
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-5">
            <MetricCard
                title="Active Staff"
                value="1,245"
                change="2.5%"
                changeType="up"
                icon={<GroupIcon className="size-6 text-brand-500" />}
                iconBg="bg-brand-50 dark:bg-brand-500/10"
                href="/hr/employees"
                footer="vs last month"
            />
            <MetricCard
                title="On Leave"
                value="42"
                change="12 new"
                changeType="neutral"
                icon={<CalenderIcon className="size-6 text-blue-500" />}
                iconBg="bg-blue-50 dark:bg-blue-500/10"
                href="/leave/approvals"
                footer="currently away"
            />
            <MetricCard
                title="Pending Leaves"
                value="18"
                change="Needs action"
                changeType="down"
                icon={<FileIcon className="size-6 text-amber-500" />}
                iconBg="bg-amber-50 dark:bg-amber-500/10"
                href="/leave/approvals"
                footer="awaiting approval"
            />
            <MetricCard
                title="Exit Requests"
                value="5"
                change="2 new"
                changeType="down"
                icon={<BoxIconLine className="size-6 text-purple-500" />}
                iconBg="bg-purple-50 dark:bg-purple-500/10"
                href="/exit/approvals"
                footer="this month"
            />
        </div>
    );
};
