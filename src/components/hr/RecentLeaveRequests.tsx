"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import Badge from "../ui/badge/Badge";
import { leaveServiceInstance } from "@/services/leave.service";

const AVATAR_COLORS = [
    "bg-brand-100 text-brand-600",
    "bg-blue-100 text-blue-600",
    "bg-purple-100 text-purple-600",
    "bg-amber-100 text-amber-600",
    "bg-teal-100 text-teal-600",
    "bg-rose-100 text-rose-600",
    "bg-green-100 text-green-600",
];

function getInitials(name: string) {
    return name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

function getAvatarColor(id: number) {
    return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

interface RecentLeave {
    id: number;
    name: string;
    leaveType: string;
    duration: string;
    status: "Approved" | "Pending" | "Reviewed" | "Rejected";
}

export default function RecentLeaveRequests() {
    const [leaves, setLeaves] = useState<RecentLeave[]>([]);
    const [totalPending, setTotalPending] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [recentRes, pendingRes] = await Promise.allSettled([
                    leaveServiceInstance.getAllLeaves(1, 5),
                    leaveServiceInstance.getAllLeaves(1, 1, "Pending"),
                ]);

                if (recentRes.status === "fulfilled") {
                    const items: any[] = recentRes.value?.data ?? [];
                    setLeaves(
                        items.map((item: any) => ({
                            id: item.id,
                            name: item.employee_name ?? item.staff?.employee_name ?? "Unknown",
                            leaveType: item.leaveType?.name ?? item.leave_type?.name ?? "Leave",
                            duration: item.total_hours ? `${item.total_hours} hrs` : "—",
                            status: item.status,
                        }))
                    );
                }

                if (pendingRes.status === "fulfilled") {
                    setTotalPending(pendingRes.value?.meta?.total ?? 0);
                }
            } catch (error) {
                console.error("Failed to fetch recent leave requests:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between px-5 pt-5 pb-4 sm:px-6">
                <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Recent Leave Requests</h3>
                    <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">Latest 5 submissions</p>
                </div>
                <Link
                    href="/leave/approvals"
                    className="rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                    View all →
                </Link>
            </div>

            <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between px-5 py-3.5 sm:px-6">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 flex-shrink-0 animate-pulse rounded-full bg-gray-100 dark:bg-gray-800" />
                                <div className="space-y-1.5">
                                    <div className="h-3 w-28 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
                                    <div className="h-2.5 w-20 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
                                </div>
                            </div>
                            <div className="h-5 w-16 animate-pulse rounded-full bg-gray-100 dark:bg-gray-800" />
                        </div>
                    ))
                ) : leaves.length === 0 ? (
                    <div className="px-5 py-8 text-center text-sm text-gray-400 sm:px-6">
                        No leave requests found.
                    </div>
                ) : (
                    leaves.map((request) => (
                        <div key={request.id} className="flex items-center justify-between px-5 py-3.5 transition hover:bg-gray-50/50 dark:hover:bg-white/[0.02] sm:px-6">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${getAvatarColor(request.id)}`}>
                                    {getInitials(request.name)}
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{request.name}</p>
                                    <p className="truncate text-xs text-gray-400 dark:text-gray-500">{request.leaveType} · {request.duration}</p>
                                </div>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                                <Badge
                                    size="sm"
                                    color={
                                        request.status === "Approved" ? "success"
                                        : request.status === "Pending" || request.status === "Reviewed" ? "warning"
                                        : "error"
                                    }
                                >
                                    {request.status}
                                </Badge>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="border-t border-gray-50 px-5 py-3 dark:border-gray-800 sm:px-6">
                <p className="text-center text-xs text-gray-400 dark:text-gray-500">
                    {isLoading ? "Loading..." : totalPending > 0 ? `${totalPending} pending request${totalPending !== 1 ? "s" : ""} awaiting approval` : "No pending requests"}
                </p>
            </div>
        </div>
    );
}
