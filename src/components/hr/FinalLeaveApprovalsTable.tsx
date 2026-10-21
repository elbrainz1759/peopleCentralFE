"use client";
import React, { useState, useEffect } from "react";
import { leaveService } from "@/services/leave.service";
import { toast } from "react-hot-toast";
import {
    Table, TableBody, TableCell, TableHeader, TableRow,
} from "../ui/table";
import { CheckCircleIcon, CloseIcon } from "@/icons";
import { getAuthUser, hasRole } from "@/utils/authUser";
import WorkflowBanner, { LEAVE_WORKFLOW_STEPS } from "@/components/shared/WorkflowBanner";

interface ReviewedLeave {
    id: number;
    employeeName: string;
    department: string;
    leaveType: string;
    duration: string;
    dateCreated: string;
}

type Action = { type: "approve" | "reject"; id: number } | null;

// HR's final sign-off queue (status=Reviewed), split out from the old
// combined Leave Approvals table. Company-wide for HR/HR Lead/Superadmin —
// the backend's own @Roles gate on /leaves/:id/approve is the real
// enforcement; the sidebar just keeps this page out of everyone else's way.
export default function FinalLeaveApprovalsTable() {
    const [items, setItems] = useState<ReviewedLeave[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [action, setAction] = useState<Action>(null);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorModal, setErrorModal] = useState<string | null>(null);
    const [authUser, setAuthUser] = useState<any>(null);

    useEffect(() => { setAuthUser(getAuthUser()); }, []);
    const isAuthorized = hasRole(authUser, ["HR", "HR Lead", "Superadmin"]);

    const fetchItems = async () => {
        setIsLoading(true);
        try {
            const response = await leaveService.getInstance().getAllLeaves(1, 100, "Reviewed");
            const mapped = (response.data ?? []).map((item: any) => ({
                id: item.id,
                employeeName: item.employee_name ?? "—",
                department: item.department_name ?? "Unit",
                leaveType: [...new Set((item.durations ?? []).map((d: any) => d.leave_type_name).filter(Boolean))].join(", ")
                    || item.leave_type_name || "Other",
                duration: item.total_hours ? `${item.total_hours} hrs` : "-",
                dateCreated: new Date(item.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
            }));
            setItems(mapped);
        } catch {
            toast.error("Could not load final approvals");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchItems(); }, []);

    const getApiErrorMessage = (error: any): string =>
        error?.response?.data?.message ?? error?.data?.message ?? error?.message ?? "Something went wrong. Please try again.";

    const openAction = (type: "approve" | "reject", id: number) => {
        setComment("");
        setAction({ type, id });
    };
    const closeAction = () => { setAction(null); setComment(""); };

    const submitAction = async () => {
        if (!action) return;
        if (action.type === "reject" && !comment.trim()) {
            toast.error("Please provide a reason for rejecting this leave.");
            return;
        }
        setIsSubmitting(true);
        try {
            if (action.type === "approve") {
                await leaveService.getInstance().approveLeave(action.id, comment);
                toast.success("Leave finalised — employee has been notified.");
            } else {
                await leaveService.getInstance().rejectLeave(action.id, comment);
                toast.success("Leave request rejected.");
            }
            closeAction();
            fetchItems();
        } catch (error: any) {
            closeAction();
            setErrorModal(getApiErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authUser && !isAuthorized) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center dark:border-gray-800 dark:bg-white/[0.03]">
                <p className="text-lg font-semibold text-gray-800 dark:text-white/90">Access Restricted</p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Final Approvals is only available to HR, HR Lead and Superadmin.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            <WorkflowBanner steps={LEAVE_WORKFLOW_STEPS} />
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Final Approvals</h3>
                {items.length > 0 && (
                    <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full dark:bg-blue-500/10 dark:text-blue-400">
                        {items.length} awaiting final sign-off
                    </span>
                )}
            </div>

            {/* Mobile cards */}
            <div className="block md:hidden min-h-[200px]">
                {isLoading ? (
                    <p className="py-10 text-center text-gray-400">Loading...</p>
                ) : items.length === 0 ? (
                    <p className="py-10 text-center text-gray-400">No leave requests are awaiting final approval.</p>
                ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {items.map((record) => (
                            <div key={record.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                                <p className="font-medium text-gray-800 dark:text-white/90 text-sm">{record.employeeName}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{record.department}</p>
                                <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
                                    <div className="flex justify-between"><span className="font-medium text-gray-600 dark:text-gray-300">Leave Type</span><span>{record.leaveType}</span></div>
                                    <div className="flex justify-between"><span className="font-medium text-gray-600 dark:text-gray-300">Duration</span><span>{record.duration}</span></div>
                                    <div className="flex justify-between"><span className="font-medium text-gray-600 dark:text-gray-300">Date Applied</span><span>{record.dateCreated}</span></div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openAction("approve", record.id)}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-green-200 text-xs font-medium text-green-600 hover:bg-green-50 dark:border-green-900/30">
                                        <CheckCircleIcon className="w-3.5 h-3.5" /> Approve
                                    </button>
                                    <button onClick={() => openAction("reject", record.id)}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-red-100 text-xs font-medium text-red-500 hover:bg-red-50 dark:border-red-900/30">
                                        <CloseIcon className="w-3.5 h-3.5" /> Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block max-w-full overflow-x-auto min-h-[200px]">
                <Table>
                    <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                        <TableRow>
                            {["Employee", "Leave Type", "Duration", "Date Applied", "Action"].map(h => (
                                <TableCell key={h} isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">{h}</TableCell>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {isLoading ? (
                            <TableRow><TableCell colSpan={5} className="py-10 text-center text-gray-400">Loading...</TableCell></TableRow>
                        ) : items.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="py-10 text-center text-gray-400">No leave requests are awaiting final approval.</TableCell></TableRow>
                        ) : items.map((record) => (
                            <TableRow key={record.id}>
                                <TableCell className="py-3">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{record.employeeName}</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">{record.department}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">{record.leaveType}</TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">{record.duration}</TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">{record.dateCreated}</TableCell>
                                <TableCell className="py-3">
                                    <div className="flex gap-2">
                                        <button onClick={() => openAction("approve", record.id)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-200 text-xs font-medium text-green-600 hover:bg-green-50 dark:border-green-900/30">
                                            <CheckCircleIcon className="w-3.5 h-3.5" /> Approve
                                        </button>
                                        <button onClick={() => openAction("reject", record.id)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-100 text-xs font-medium text-red-500 hover:bg-red-50 dark:border-red-900/30">
                                            <CloseIcon className="w-3.5 h-3.5" /> Reject
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Action modal */}
            {action && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 shadow-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {action.type === "approve" ? "HR Final Approval" : "Reject Leave Request"}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            {action.type === "approve"
                                ? "The employee will be notified once approved."
                                : "Provide a reason for rejecting this leave request."}
                        </p>
                        <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4}
                            placeholder={action.type === "approve" ? "Enter approval comments (optional)..." : "Enter rejection reason..."}
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 resize-none mb-5" />
                        <div className="flex gap-3">
                            <button onClick={closeAction} disabled={isSubmitting}
                                className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors">
                                Close
                            </button>
                            <button onClick={submitAction} disabled={isSubmitting}
                                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-60 ${action.type === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"}`}>
                                {isSubmitting ? "Saving..." : action.type === "approve" ? "Confirm Final Approval" : "Reject"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Error modal */}
            {errorModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 shadow-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Action Failed</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">{errorModal}</p>
                        <button onClick={() => setErrorModal(null)}
                            className="w-full rounded-xl bg-red-500 hover:bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors">
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
