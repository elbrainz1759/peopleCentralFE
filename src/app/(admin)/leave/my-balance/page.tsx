"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { leaveServiceInstance } from "@/services/leave.service";
import { authService } from "@/services/auth.service";

interface Balance {
    id: number;
    leave_type_name?: string;
    leave_type_id?: number;
    total_hours?: string;
    used_hours?: string;
    remaining_hours?: string;
}

export default function MyLeaveBalancePage() {
    const [balances, setBalances] = useState<Balance[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                let staffId = 0;
                const token = localStorage.getItem("auth_token");
                if (token) {
                    try {
                        const payload = JSON.parse(atob(token.split(".")[1]));
                        staffId = Number(payload.staff_id || payload.staffId) || 0;
                    } catch { /* ignore */ }
                }
                if (!staffId) {
                    const user = authService.getCurrentUser();
                    staffId = Number(user?.staff_id || user?.staffId) || 0;
                }
                if (!staffId) return;
                const res = await leaveServiceInstance.getLeaveBalances(staffId);
                const data = res?.data ?? (Array.isArray(res) ? res : []);
                setBalances(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to load balance", err);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    const totalRemaining = balances.reduce((s, b) => s + parseFloat(b.remaining_hours || "0"), 0);
    const totalUsed = balances.reduce((s, b) => s + parseFloat(b.used_hours || "0"), 0);
    const totalAlloc = balances.reduce((s, b) => s + parseFloat(b.total_hours || "0"), 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Leave Balance</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your current leave entitlements</p>
                </div>
                <Link
                    href="/leave/history"
                    className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                    ← Back to My Leaves
                </Link>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "Total Allocated", value: `${totalAlloc}h`, color: "text-gray-800 dark:text-white", bg: "bg-gray-50 dark:bg-white/[0.03]" },
                    { label: "Used", value: `${totalUsed}h`, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-500/10" },
                    { label: "Remaining", value: `${totalRemaining}h`, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-500/10" },
                ].map((s) => (
                    <div key={s.label} className={`rounded-2xl border border-gray-100 dark:border-gray-800 ${s.bg} p-5 text-center`}>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{s.label}</p>
                        <p className={`mt-2 text-3xl font-bold ${s.color}`}>{isLoading ? "—" : s.value}</p>
                    </div>
                ))}
            </div>

            {/* Per leave type breakdown */}
            <div className="rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-base font-semibold text-gray-800 dark:text-white">Breakdown by Leave Type</h2>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center gap-2 py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                        <p className="text-sm text-gray-500">Loading balances...</p>
                    </div>
                ) : balances.length === 0 ? (
                    <p className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">No leave balances found for your account.</p>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {balances.map((b) => {
                            const total = parseFloat(b.total_hours || "0");
                            const used = parseFloat(b.used_hours || "0");
                            const remaining = parseFloat(b.remaining_hours || "0");
                            const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0;
                            const barColor = pct >= 80 ? "bg-red-500" : pct >= 60 ? "bg-orange-400" : "bg-green-500";

                            return (
                                <div key={b.id} className="px-6 py-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-800 dark:text-white">
                                            {b.leave_type_name || `Leave Type ${b.leave_type_id}`}
                                        </span>
                                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                            {remaining}h remaining
                                        </span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                                        <div className={`h-2 rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
                                    </div>
                                    <div className="flex justify-between mt-1.5 text-xs text-gray-400">
                                        <span>{used}h used</span>
                                        <span>{total}h total</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
