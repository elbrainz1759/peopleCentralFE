"use client";
import React, { useEffect, useState } from "react";
import { exitServiceInstance } from "@/services/exit.service";
import { authService } from "@/services/auth.service";
import Badge from "@/components/ui/badge/Badge";
import {
    Table, TableBody, TableCell, TableHeader, TableRow,
} from "@/components/ui/table";
import { DownloadIcon } from "@/icons";
import { generateInterviewPDF, generateClearancePDF } from "@/utils/exitPdf";
import { toast } from "react-hot-toast";

interface MyExitRequest {
    id: number;
    uniqueId: string;
    stage: string;
    status: string;
    resignationDate: string;
    reasonForLeaving: string;
    createdAt: string;
    employeeName: string;
    staffId: string | number;
    department: string;
    location: string;
    program: string;
}

const STAGE_COLOR: Record<string, "info" | "warning" | "success" | "error" | "light"> = {
    Employee: "info",
    Supervisor: "warning",
    Operations: "warning",
    Finance: "warning",
    HR: "warning",
    HR_Final: "success",
    HR_Director: "success",
    Completed: "success",
};

// Friendly stage labels — keep the internal keys but show readable text.
const STAGE_LABEL: Record<string, string> = {
    HR_Director: "Snr HR Manager",
    HR_Final: "HR Final",
};
const stageLabel = (stage: string) => STAGE_LABEL[stage] ?? stage;

const STATUS_COLOR: Record<string, "info" | "warning" | "success" | "error" | "light"> = {
    Pending: "warning",
    Approved: "success",
    Rejected: "error",
    Completed: "success",
};

export default function MyExitRequestsPage() {
    const [requests, setRequests] = useState<MyExitRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState<number | null>(null);

    useEffect(() => {
        const fetchMyRequests = async () => {
            try {
                const currentUser = authService.getCurrentUser();
                const staffId = currentUser?.staff_id || currentUser?.staffId || currentUser?.id;
                const employeeName = `${currentUser?.first_name ?? ""} ${currentUser?.last_name ?? ""}`.trim()
                    || currentUser?.employee_name || currentUser?.name || "Employee";

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
                    employeeName,
                    staffId: staffId ?? r.staff_id ?? r.staffId ?? "",
                    department: r.department_name ?? r.department ?? currentUser?.department_name ?? "",
                    location: r.location_name ?? r.location ?? currentUser?.location_name ?? "",
                    program: r.program_name ?? r.program ?? currentUser?.program_name ?? "",
                })));
            } catch (error) {
                console.error("Failed to fetch exit requests:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMyRequests();
    }, []);

    const handleDownload = async (r: MyExitRequest, type: 'interview' | 'clearance') => {
        setDownloadingId(r.id);
        try {
            const res = await exitServiceInstance.getExitInterviewById(r.uniqueId as any);
            const details = res?.data || res || {};
            const checklist = type === 'clearance'
                ? (await exitServiceInstance.getAllChecklistItems())?.data ?? []
                : [];

            const emp = {
                employeeName: r.employeeName,
                staffId: r.staffId,
                department: r.department,
                location: r.location,
                program: r.program,
                resignationDate: r.resignationDate,
                submittedOn: r.createdAt,
                stage: r.stage,
            };

            if (type === 'interview') {
                generateInterviewPDF(emp, details);
                toast.success("Exit Interview PDF downloaded.");
            } else {
                generateClearancePDF(emp, details, checklist);
                toast.success("Exit Clearance PDF downloaded.");
            }
        } catch {
            toast.error("Failed to generate PDF.");
        } finally {
            setDownloadingId(null);
        }
    };

    const Spinner = () => (
        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Exit Requests</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track the status of your submitted exit requests.</p>
                </div>
                <a
                    href="/exit"
                    className="flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600 transition-all hover:scale-[1.02] active:scale-[0.98] self-start sm:self-auto"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Submit Exit Request
                </a>
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
                                            <Badge size="sm" color={STAGE_COLOR[r.stage] ?? "light"}>{stageLabel(r.stage)}</Badge>
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
                                    {r.stage === "Completed" || r.status === "Completed" || r.status === "Approved" && (
                                        <div className="flex gap-2 mt-3">
                                            <button
                                                onClick={() => handleDownload(r, 'interview')}
                                                disabled={downloadingId === r.id}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 text-xs font-medium hover:bg-blue-50 transition-colors disabled:opacity-50"
                                            >
                                                {downloadingId === r.id ? <Spinner /> : <DownloadIcon className="w-3.5 h-3.5" />}
                                                Interview
                                            </button>
                                            <button
                                                onClick={() => handleDownload(r, 'clearance')}
                                                disabled={downloadingId === r.id}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-200 text-green-600 text-xs font-medium hover:bg-green-50 transition-colors disabled:opacity-50"
                                            >
                                                {downloadingId === r.id ? <Spinner /> : <DownloadIcon className="w-3.5 h-3.5" />}
                                                Clearance
                                            </button>
                                        </div>
                                    )}
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
                                {["S/N", "Resignation Date", "Reason", "Stage", "Status", "Submitted On", "Download"].map((h) => (
                                    <TableCell key={h} isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">
                                        {h}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-10 text-center text-gray-400">
                                        Loading your exit requests...
                                    </TableCell>
                                </TableRow>
                            ) : requests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-10 text-center text-gray-400">
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
                                            <Badge size="sm" color={STAGE_COLOR[r.stage] ?? "light"}>{stageLabel(r.stage)}</Badge>
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <Badge size="sm" color={STATUS_COLOR[r.status] ?? "light"}>{r.status}</Badge>
                                        </TableCell>
                                        <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">{r.createdAt}</TableCell>
                                        <TableCell className="py-3">
                                            {r.stage === "Completed" || r.status === "Completed" || r.status === "Approved" ? (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleDownload(r, 'interview')}
                                                        disabled={downloadingId === r.id}
                                                        title="Download Exit Interview PDF"
                                                        className="p-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
                                                    >
                                                        {downloadingId === r.id ? <Spinner /> : <DownloadIcon className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownload(r, 'clearance')}
                                                        disabled={downloadingId === r.id}
                                                        title="Download Exit Clearance PDF"
                                                        className="p-1.5 rounded-lg border border-green-200 text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
                                                    >
                                                        {downloadingId === r.id ? <Spinner /> : <DownloadIcon className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">—</span>
                                            )}
                                        </TableCell>
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
