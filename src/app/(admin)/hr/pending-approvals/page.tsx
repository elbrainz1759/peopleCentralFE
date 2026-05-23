"use client";
import React, { useState, useEffect, useCallback } from "react";
import { userService } from "@/services/user.service";
import { Employee } from "@/types/service.types";
import { toast } from "react-hot-toast";
import { Drawer } from "@/components/ui/drawer/Drawer";
import ApproveEmployee from "@/components/hr/ApproveEmployee";
import Badge from "@/components/ui/badge/Badge";
import { CheckCircleIcon } from "@/icons";

export default function PendingApprovalsPage() {
    const [pendingEmployees, setPendingEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [isApproveOpen, setIsApproveOpen] = useState(false);

    const fetchPending = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await userService.getAllEmployees();
            const all = response.data || [];
            const pending = all.filter(
                (emp) => emp.status === "On-boarding" || emp.status === "Pending" || emp.status === "pending"
            );
            setPendingEmployees(pending);
        } catch {
            toast.error("Failed to load pending approvals");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPending();
    }, [fetchPending]);

    const handleApprove = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsApproveOpen(true);
    };

    const handleApproveSuccess = () => {
        setIsApproveOpen(false);
        setSelectedEmployee(null);
        fetchPending();
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Pending Approvals
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Review and approve employee accounts awaiting HR sign-off.
                </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-800 dark:text-white">
                            Awaiting Approval
                        </span>
                        {!isLoading && (
                            <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                                {pendingEmployees.length} pending
                            </span>
                        )}
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                        <span className="text-sm text-gray-400">Loading...</span>
                    </div>
                ) : pendingEmployees.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
                        <CheckCircleIcon className="w-10 h-10 text-green-400" />
                        <p className="text-sm font-medium">All caught up — no pending approvals.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-800">
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Employee</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Department</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Location</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Registered</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                {pendingEmployees.map((emp) => (
                                    <tr key={emp.unique_id || String(emp.id)} className="hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 flex-shrink-0 flex items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 font-bold text-xs uppercase">
                                                    {(emp.first_name?.[0] || "") + (emp.last_name?.[0] || "")}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                                                        {emp.first_name} {emp.last_name}
                                                    </p>
                                                    <p className="text-xs text-gray-400">{emp.designation || "—"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            {emp.email}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            {emp.department_name || emp.department || "—"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            {emp.location_name || emp.location || "—"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge color="warning" size="sm">{emp.status}</Badge>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            {emp.created_at ? new Date(emp.created_at).toLocaleDateString() : "—"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleApprove(emp)}
                                                className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-600"
                                            >
                                                <CheckCircleIcon className="w-3.5 h-3.5" />
                                                Approve
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Drawer
                isOpen={isApproveOpen}
                onClose={() => setIsApproveOpen(false)}
                title="Approve Employee"
            >
                <div className="p-6">
                    {selectedEmployee && (
                        <ApproveEmployee
                            employee={selectedEmployee}
                            onSuccess={handleApproveSuccess}
                        />
                    )}
                </div>
            </Drawer>
        </div>
    );
}
