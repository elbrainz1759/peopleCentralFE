"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { leaveBalanceService } from "@/services/leave-balance.service";
import { authService } from "@/services/auth.service";

interface Balance {
    id: number;
    leave_type_name?: string;
    leave_type_id?: number;
    total_hours?: string;
    used_hours?: string;
    remaining_hours?: string;
}

interface Transaction {
    id: number;
    leave_type_name?: string;
    leave_type_id?: number;
    hours?: number | string;
    type?: string;
    transaction_type?: string;
    description?: string;
    note?: string;
    created_at?: string;
    balance_after?: number | string;
}

export default function MyLeaveBalancePage() {
    const [balances, setBalances] = useState<Balance[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [staffId, setStaffId] = useState<number>(0);

    // Transactions
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [txLoading, setTxLoading] = useState(false);
    const [txPage, setTxPage] = useState(1);
    const [txTotalPages, setTxTotalPages] = useState(1);
    const [txTotal, setTxTotal] = useState(0);

    useEffect(() => {
        const load = async () => {
            try {
                let sid = 0;
                const token = localStorage.getItem("auth_token");
                if (token) {
                    try {
                        const payload = JSON.parse(atob(token.split(".")[1]));
                        sid = Number(payload.staff_id || payload.staffId) || 0;
                    } catch { /* ignore */ }
                }
                if (!sid) {
                    const user = authService.getCurrentUser();
                    sid = Number(user?.staff_id || user?.staffId) || 0;
                }
                if (!sid) return;
                setStaffId(sid);

                const res = await leaveBalanceService.getLeaveBalanceByStaffId(sid);
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

    const loadTransactions = useCallback(async (page = 1) => {
        if (!staffId) return;
        setTxLoading(true);
        try {
            const res = await leaveBalanceService.getLeaveBalanceTransactionsByStaffId(staffId, page, 10);
            const data = res?.data ?? (Array.isArray(res) ? res : []);
            setTransactions(Array.isArray(data) ? data : []);
            const meta = res?.meta;
            setTxTotal(meta?.total ?? data.length);
            setTxTotalPages(meta?.last_page ?? meta?.totalPages ?? 1);
            setTxPage(page);
        } catch (err) {
            console.error("Failed to load transactions", err);
        } finally {
            setTxLoading(false);
        }
    }, [staffId]);

    useEffect(() => {
        if (staffId) loadTransactions(1);
    }, [staffId, loadTransactions]);

    const totalRemaining = balances.reduce((s, b) => s + parseFloat(b.remaining_hours || "0"), 0);
    const totalUsed = balances.reduce((s, b) => s + parseFloat(b.used_hours || "0"), 0);
    const totalAlloc = balances.reduce((s, b) => s + parseFloat(b.total_hours || "0"), 0);

    const txType = (tx: Transaction) => tx.type || tx.transaction_type || "";
    const isDebit = (tx: Transaction) => txType(tx).toLowerCase().includes("debit") || txType(tx).toLowerCase().includes("used") || txType(tx).toLowerCase().includes("deduct");

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

            {/* Breakdown by leave type */}
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

            {/* Transaction History */}
            <div className="rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-gray-800 dark:text-white">Transaction History</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">A log of all leave debits and accruals on your account</p>
                    </div>
                    {txTotal > 0 && (
                        <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-500 rounded-full dark:bg-gray-800 dark:text-gray-400">
                            {txTotal} records
                        </span>
                    )}
                </div>

                {txLoading ? (
                    <div className="flex flex-col items-center gap-2 py-10">
                        <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                        <p className="text-sm text-gray-500">Loading transactions...</p>
                    </div>
                ) : transactions.length === 0 ? (
                    <p className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">No transactions found.</p>
                ) : (
                    <>
                        {/* Mobile */}
                        <div className="block md:hidden divide-y divide-gray-100 dark:divide-gray-800">
                            {transactions.map((tx) => {
                                const debit = isDebit(tx);
                                const hrs = Number(tx.hours || 0);
                                return (
                                    <div key={tx.id} className="px-4 py-3 flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                                                {tx.leave_type_name || `Leave Type ${tx.leave_type_id}`}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">{tx.description || tx.note || txType(tx) || "—"}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {tx.created_at ? new Date(tx.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className={`text-sm font-semibold ${debit ? "text-red-500" : "text-green-600"}`}>
                                                {debit ? "−" : "+"}{hrs}h
                                            </p>
                                            {tx.balance_after !== undefined && (
                                                <p className="text-xs text-gray-400">Bal: {tx.balance_after}h</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Desktop table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-800">
                                        {["Date", "Leave Type", "Description", "Type", "Hours", "Balance After"].map((h) => (
                                            <th key={h} className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {transactions.map((tx) => {
                                        const debit = isDebit(tx);
                                        const hrs = Number(tx.hours || 0);
                                        return (
                                            <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                                                <td className="py-3 px-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                    {tx.created_at ? new Date(tx.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                                                </td>
                                                <td className="py-3 px-4 font-medium text-gray-800 dark:text-white/90">
                                                    {tx.leave_type_name || `Leave Type ${tx.leave_type_id}`}
                                                </td>
                                                <td className="py-3 px-4 text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                                    {tx.description || tx.note || "—"}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${debit ? "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400" : "bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400"}`}>
                                                        {txType(tx) || (debit ? "Debit" : "Credit")}
                                                    </span>
                                                </td>
                                                <td className={`py-3 px-4 font-semibold whitespace-nowrap ${debit ? "text-red-500" : "text-green-600"}`}>
                                                    {debit ? "−" : "+"}{hrs}h
                                                </td>
                                                <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                                                    {tx.balance_after !== undefined ? `${tx.balance_after}h` : "—"}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {txTotalPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 dark:border-gray-800">
                                <p className="text-sm text-gray-500">Page {txPage} of {txTotalPages}</p>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => loadTransactions(txPage - 1)} disabled={txPage <= 1}
                                        className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-sm dark:border-gray-700 dark:hover:bg-gray-800">‹</button>
                                    <button onClick={() => loadTransactions(txPage + 1)} disabled={txPage >= txTotalPages}
                                        className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-sm dark:border-gray-700 dark:hover:bg-gray-800">›</button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
