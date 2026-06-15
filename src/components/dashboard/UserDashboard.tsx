"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CalenderIcon, FileIcon, PieChartIcon } from "@/icons";
import { leaveServiceInstance } from "@/services/leave.service";
import { exitServiceInstance } from "@/services/exit.service";
import { authService } from "@/services/auth.service";
import Badge from "@/components/ui/badge/Badge";
import DashboardActions from "@/components/hr/DashboardActions";

interface StatCardProps {
    title: string;
    value: string | number;
    footer: string;
    icon: React.ReactNode;
    iconBg: string;
    href?: string;
    loading?: boolean;
}

function StatCard({ title, value, footer, icon, iconBg, href, loading }: StatCardProps) {
    const content = (
        <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:border-gray-200 hover:shadow-md dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}>
                {icon}
            </div>
            <div className="mt-5">
                <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                {loading ? (
                    <div className="mt-1 h-9 w-24 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
                ) : (
                    <h3 className="mt-1 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{value}</h3>
                )}
                <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">{footer}</p>
            </div>
            {href && <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-brand-500 transition-all duration-300 group-hover:w-full" />}
        </div>
    );
    return href ? <Link href={href}>{content}</Link> : content;
}

const STATUS_COLOR: Record<string, "info" | "warning" | "success" | "error" | "light"> = {
    Pending: "warning",
    Approved: "success",
    Rejected: "error",
    Reviewed: "success",
    Cancelled: "light",
};

export default function UserDashboard() {
    const [loading, setLoading] = useState(true);
    const [myLeaves, setMyLeaves] = useState<any[]>([]);
    const [myExits, setMyExits] = useState<any[]>([]);
    const [leaveBalance, setLeaveBalance] = useState<any[]>([]);

    useEffect(() => {
        const load = async () => {
            try {
                let staffId = 0;
                let userId = 0;
                let uniqueId = "";
                const token = localStorage.getItem("auth_token");
                if (token) {
                    try {
                        const payload = JSON.parse(atob(token.split(".")[1]));
                        staffId = Number(payload.staff_id || payload.staffId) || 0;
                        userId = Number(payload.id) || 0;
                        uniqueId = payload.unique_id || payload.uniqueId || "";
                    } catch { /* ignore */ }
                }
                if (!staffId) {
                    const user = authService.getCurrentUser();
                    staffId = Number(user?.staff_id || user?.staffId) || 0;
                    if (!userId) userId = Number(user?.id) || 0;
                    if (!uniqueId) uniqueId = user?.unique_id || user?.uniqueId || "";
                }

                const [leavesRes, exitRes, balRes] = await Promise.allSettled([
                    leaveServiceInstance.getAllLeaves(1, 100, undefined, staffId),
                    exitServiceInstance.getAllExitInterviews(1, 1000, undefined, staffId || undefined),
                    leaveServiceInstance.getLeaveBalances(staffId),
                ]);

                if (leavesRes.status === "fulfilled") {
                    const data = leavesRes.value;
                    const list = data?.data ?? (Array.isArray(data) ? data : []);
                    setMyLeaves(list);
                }
                if (exitRes.status === "fulfilled") {
                    const data = exitRes.value;
                    const all: any[] = data?.data ?? (Array.isArray(data) ? data : []);
                    const mine = all.filter((r: any) => {
                        const rStaff = String(r.staff_id ?? r.staffId ?? "");
                        const rUser = String(r.user_id ?? r.userId ?? "");
                        const rUnique = String(r.unique_id ?? r.uniqueId ?? r.employee_unique_id ?? "");
                        return (staffId && rStaff === String(staffId))
                            || (userId && rUser === String(userId))
                            || (uniqueId && rUnique === uniqueId);
                    });
                    setMyExits(mine);
                }
                if (balRes.status === "fulfilled") {
                    const data = balRes.value;
                    const list = data?.data ?? (Array.isArray(data) ? data : []);
                    setLeaveBalance(Array.isArray(list) ? list : []);
                }
            } catch (err) {
                console.error("UserDashboard load error:", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const pending = myLeaves.filter((l) => l.status === "Pending").length;
    const approved = myLeaves.filter((l) => l.status === "Approved").length;
    const exitCount = myExits.length;
    const totalBalance = leaveBalance.reduce((sum, b) => sum + Number(b.balance ?? b.remaining_balance ?? 0), 0);

    const recentLeaves = [...myLeaves]
        .sort((a, b) => new Date(b.created_at ?? b.createdAt ?? 0).getTime() - new Date(a.created_at ?? a.createdAt ?? 0).getTime())
        .slice(0, 5);

    return (
        <div className="space-y-6">
            {/* Welcome banner */}
            <DashboardActions />

            {/* Personal stats */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard
                    title="Leave Balance"
                    value={`${totalBalance} hrs`}
                    footer="available hours"
                    icon={<PieChartIcon className="text-brand-500" />}
                    iconBg="bg-brand-50 dark:bg-brand-500/10"
                    href="/leave/balances"
                    loading={loading}
                />
                <StatCard
                    title="Pending Leaves"
                    value={pending}
                    footer="awaiting approval"
                    icon={<CalenderIcon className="text-warning-500" />}
                    iconBg="bg-warning-50 dark:bg-warning-500/10"
                    href="/leave/history"
                    loading={loading}
                />
                <StatCard
                    title="Approved Leaves"
                    value={approved}
                    footer="this year"
                    icon={<CalenderIcon className="text-success-500" />}
                    iconBg="bg-success-50 dark:bg-success-500/10"
                    href="/leave/history"
                    loading={loading}
                />
                <StatCard
                    title="Exit Requests"
                    value={exitCount}
                    footer="submitted"
                    icon={<FileIcon className="text-purple-500" />}
                    iconBg="bg-purple-50 dark:bg-purple-500/10"
                    href="/exit/my-requests"
                    loading={loading}
                />
            </div>

            {/* Recent leave requests */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-semibold text-gray-800 dark:text-white">My Recent Leaves</h2>
                    <Link href="/leave/history" className="text-sm font-medium text-brand-500 hover:text-brand-600">
                        View all →
                    </Link>
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
                        ))}
                    </div>
                ) : recentLeaves.length === 0 ? (
                    <div className="py-10 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">No leave requests yet.</p>
                        <Link href="/leave/apply" className="mt-2 inline-block text-sm font-medium text-brand-500 hover:underline">
                            Apply for leave
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {recentLeaves.map((leave, i) => {
                            const date = leave.created_at ?? leave.createdAt;
                            const formatted = date ? new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
                            const leaveType = leave.leave_type?.name ?? leave.leaveType?.name ?? leave.leave_type_id ?? "Leave";
                            return (
                                <div key={leave.id ?? i} className="flex items-center justify-between py-3">
                                    <div>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white">{leaveType}</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500">{formatted}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">{leave.total_hours ?? "—"} hrs</span>
                                        <Badge size="sm" color={STATUS_COLOR[leave.status] ?? "light"}>{leave.status}</Badge>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Exit requests (if any) */}
            {(exitCount > 0 || loading) && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-base font-semibold text-gray-800 dark:text-white">My Exit Requests</h2>
                        <Link href="/exit/my-requests" className="text-sm font-medium text-brand-500 hover:text-brand-600">View all →</Link>
                    </div>
                    {loading ? (
                        <div className="h-12 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {myExits.slice(0, 3).map((ex, i) => {
                                const date = ex.created_at ?? ex.createdAt;
                                const formatted = date ? new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
                                return (
                                    <div key={ex.id ?? i} className="flex items-center justify-between py-3">
                                        <div>
                                            <p className="text-sm font-medium text-gray-800 dark:text-white">Exit Request #{ex.id}</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500">{formatted}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge size="sm" color="info">{ex.stage ?? "—"}</Badge>
                                            <Badge size="sm" color={STATUS_COLOR[ex.status] ?? "light"}>{ex.status ?? "—"}</Badge>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
