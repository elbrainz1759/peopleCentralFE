"use client";
import React, { useState, useEffect } from "react";
import { leaveService } from "@/services/leave.service";
import { toast } from "react-hot-toast";
import {
    Table, TableBody, TableCell, TableHeader, TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { getAuthUser, hasRole } from "@/utils/authUser";

interface LeaveStatusRecord {
    key: string;
    employeeName: string;
    department: string;
    leaveType: string;
    status: string;
    dateCreated: string;
    sortDate: number;
}

function leaveStatusLabel(status: string) {
    return status === "Reviewed" ? "Awaiting HR" : status;
}

function leaveStatusColor(status: string): "success" | "warning" | "info" | "error" | "light" {
    if (status === "Approved") return "success";
    if (status === "Pending") return "warning";
    if (status === "Reviewed") return "info";
    if (status === "Rejected") return "error";
    return "light";
}

// Read-only status view across every leave request, for HR/Finance/
// Operations/Superadmin — "what stage is this leave on", no approve/
// reject actions here.
export default function AllLeavesTable() {
    const [records, setRecords] = useState<LeaveStatusRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [authUser, setAuthUser] = useState<any>(null);

    useEffect(() => { setAuthUser(getAuthUser()); }, []);
    const isAuthorized = hasRole(authUser, ["HR", "HR Lead", "Superadmin", "Operation", "Finance"]);

    const fetchAll = async () => {
        setIsLoading(true);
        try {
            const res = await leaveService.getInstance().getAllLeaves(1, 200);
            const mapped: LeaveStatusRecord[] = (res.data ?? []).map((item: any) => ({
                key: `leave-${item.id}`,
                employeeName: item.employee_name ?? "—",
                department: item.department_name ?? "Unit",
                leaveType: [...new Set((item.durations ?? []).map((d: any) => d.leave_type_name).filter(Boolean))].join(", ")
                    || item.leave_type_name || "Other",
                status: leaveStatusLabel(item.status),
                dateCreated: new Date(item.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
                sortDate: new Date(item.created_at).getTime(),
            }));
            setRecords(mapped.sort((a, b) => b.sortDate - a.sortDate));
        } catch {
            toast.error("Could not load leave status.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const filtered = records.filter((r) => {
        const q = searchTerm.toLowerCase();
        return !q || r.employeeName.toLowerCase().includes(q) || r.department.toLowerCase().includes(q);
    });

    if (authUser && !isAuthorized) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center dark:border-gray-800 dark:bg-white/[0.03]">
                <p className="text-lg font-semibold text-gray-800 dark:text-white/90">Access Restricted</p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    All Leaves is only available to HR, HR Lead, Operations, Finance and Superadmin.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">All Leaves</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">View-only — current status of every leave request.</p>
                </div>
                <input
                    type="text"
                    placeholder="Search employee or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-56 rounded-lg border border-gray-300 bg-white px-4 py-2 text-theme-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:focus:border-brand-500"
                />
            </div>

            <div className="max-w-full overflow-x-auto min-h-[300px]">
                <Table>
                    <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                        <TableRow>
                            {["Employee", "Department", "Leave Type", "Date", "Status"].map(h => (
                                <TableCell key={h} isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">{h}</TableCell>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {isLoading ? (
                            <TableRow><TableCell colSpan={5} className="py-10 text-center text-gray-400">Loading...</TableCell></TableRow>
                        ) : filtered.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="py-10 text-center text-gray-400">No leave requests found.</TableCell></TableRow>
                        ) : filtered.map((r) => (
                            <TableRow key={r.key}>
                                <TableCell className="py-3">
                                    <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{r.employeeName}</span>
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">{r.department}</TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">{r.leaveType}</TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">{r.dateCreated}</TableCell>
                                <TableCell className="py-3">
                                    <Badge size="sm" color={leaveStatusColor(r.status === "Awaiting HR" ? "Reviewed" : r.status)}>{r.status}</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
