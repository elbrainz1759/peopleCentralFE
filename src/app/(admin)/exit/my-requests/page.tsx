"use client";
import React, { useEffect, useState } from "react";
import { exitServiceInstance } from "@/services/exit.service";
import { authService } from "@/services/auth.service";
import Badge from "@/components/ui/badge/Badge";
import {
    Table, TableBody, TableCell, TableHeader, TableRow,
} from "@/components/ui/table";

interface MyExitRequest {
    id: number;
    uniqueId: string;
    stage: string;
    status: string;
    resignationDate: string;
    reasonForLeaving: string;
    createdAt: string;
}

const STAGE_COLOR: Record<string, "info" | "warning" | "success" | "error" | "light"> = {
    Employee: "info",
    Supervisor: "warning",
    Operations: "warning",
    Finance: "warning",
    HR: "warning",
    Completed: "success",
};

const STATUS_COLOR: Record<string, "info" | "warning" | "success" | "error" | "light"> = {
    Pending: "warning",
    Approved: "success",
    Rejected: "error",
    Completed: "success",
};

export default function MyExitRequestsPage() {
    const [requests, setRequests] = useState<MyExitRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMyRequests = async () => {
            try {
                const currentUser = authService.getCurrentUser();
                const staffId = currentUser?.staff_id || currentUser?.staffId || currentUser?.id;

                const response = await exitServiceInstance.getAllExitInterviews(1, 1000);
                const all: any[] = response?.data ?? (Array.isArray(response) ? response : []);

                const mine = all.filter((r: any) => {
                    const rStaffId = r.staff_id ?? r.staffId;
                    return String(rStaffId) === String(staffId);
                });

                setRequests(mine.map((r: any) => ({
                    id: r.id,
                    uniqueId: r.unique_id ?? r.uniqueId ?? r.id,
                    stage: r.stage ?? "—",
                    status: r.status ?? "—",
                    resignationDate: r.resignation_date ?? r.resignationDate
                        ? new Date(r.resignation_date ?? r.resignationDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                        : "—",
                    reasonForLeaving: r.reason_for_leaving ?? r.reasonForLeaving ?? "—",
                    createdAt: r.created_at ?? r.createdAt
                        ? new Date(r.created_at ?? r.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                        : "—",
                })));
            } catch (error) {
                console.error("Failed to fetch exit requests:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMyRequests();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Exit Requests</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track the status of your submitted exit requests.</p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
                {/* Mobile cards */}
                <div className="block md:hidden min-h-[300px]">
                    {isLoading ? (
                        <p className="py-10 text-center text-gray-400">Loading your exit requests...</p>
                    ) : requests.length === 0 ? (
                        <div className="py-12 text-center">
                            <p className="text-gray-500 dark:text-gray-400 font-medium">No exit requests found.</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                Submit an exit request from <a href="/exit" className="text-brand-500 hover:underline">Exit Request</a>.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {requests.map((r) => (
                                <div key={r.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                                    <div className="flex items-start justify-between mb-2">
                                        <p className="font-medium text-gray-800 dark:text-white/90 text-sm">Exit Request #{r.id}</p>
                                        <Badge size="sm" color={STATUS_COLOR[r.status] ?? "light"}>{r.status}</Badge>
                                    </div>
                                    <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                                        <div className="flex justify-between">
                                            <span className="font-medium text-gray-600 dark:text-gray-300">Stage</span>
                                            <Badge size="sm" color={STAGE_COLOR[r.stage] ?? "light"}>{r.stage}</Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium text-gray-600 dark:text-gray-300">Resignation Date</span>
                                            <span>{r.resignationDate}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium text-gray-600 dark:text-gray-300">Reason</span>
                                            <span className="max-w-[160px] truncate text-right">{r.reasonForLeaving}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium text-gray-600 dark:text-gray-300">Submitted</span>
                                            <span>{r.createdAt}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Desktop table */}
                <div className="hidden md:block max-w-full overflow-x-auto min-h-[300px]">
                    <Table>
                        <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                            <TableRow>
                                {["S/N", "Resignation Date", "Reason", "Stage", "Status", "Submitted On"].map((h) => (
                                    <TableCell key={h} isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">
                                        {h}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-10 text-center text-gray-400">
                                        Loading your exit requests...
                                    </TableCell>
                                </TableRow>
                            ) : requests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-10 text-center text-gray-400">
                                        No exit requests found. <a href="/exit" className="text-brand-500 hover:underline">Submit one here.</a>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                requests.map((r, index) => (
                                    <TableRow key={r.id}>
                                        <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">{index + 1}</TableCell>
                                        <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">{r.resignationDate}</TableCell>
                                        <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 max-w-[200px] truncate">{r.reasonForLeaving}</TableCell>
                                        <TableCell className="py-3">
                                            <Badge size="sm" color={STAGE_COLOR[r.stage] ?? "light"}>{r.stage}</Badge>
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <Badge size="sm" color={STATUS_COLOR[r.status] ?? "light"}>{r.status}</Badge>
                                        </TableCell>
                                        <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">{r.createdAt}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
