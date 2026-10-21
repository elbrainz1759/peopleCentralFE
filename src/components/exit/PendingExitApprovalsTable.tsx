"use client";
import React, { useState, useEffect } from "react";
import { ExitService } from "@/services/exit.service";
import { toast } from "react-hot-toast";
import {
    Table, TableBody, TableCell, TableHeader, TableRow,
} from "../ui/table";
import { CheckCircleIcon, CloseIcon } from "@/icons";

interface PendingExit {
    uniqueId: string;
    employeeName: string;
    department: string;
    designation: string;
    submittedOn: string;
}

type Action = { type: "approve" | "reject"; uniqueId: string } | null;

// The single-purpose "is this exit at the Supervisor stage and am I the
// supervisor" queue — split out from the full Exit Management admin page,
// which is restricted to Operations/Finance/HR/HR Lead/Superadmin. Anyone
// can end up supervising someone, so this page is open to every role.
export default function PendingExitApprovalsTable() {
    const exitService = ExitService.getInstance();

    const [items, setItems] = useState<PendingExit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [action, setAction] = useState<Action>(null);
    const [comment, setComment] = useState("");
    const [rehireEligible, setRehireEligible] = useState<"" | "Yes" | "No">("");
    const [rehireReason, setRehireReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorModal, setErrorModal] = useState<string | null>(null);

    const fetchItems = async () => {
        setIsLoading(true);
        try {
            const res = await exitService.getAllExitInterviews(1, 200, undefined, undefined, "supervisor");
            const data = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
            const mapped = data
                .filter((item: any) => item.stage === "Supervisor")
                .map((item: any) => ({
                    uniqueId: item.unique_id || item.uniqueId || item.id,
                    employeeName: item.staff_name
                        || `${item.staff_first_name ?? ""} ${item.staff_last_name ?? ""}`.trim()
                        || `Staff #${item.staff_id}`,
                    department: item.department_name ?? "N/A",
                    designation: item.designation ?? "Not Specified",
                    submittedOn: item.created_at ? new Date(item.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "N/A",
                }));
            setItems(mapped);
        } catch {
            toast.error("Could not load pending exit approvals");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchItems(); }, []);

    const getApiErrorMessage = (error: any): string =>
        error?.response?.data?.message ?? error?.data?.message ?? error?.message ?? "Something went wrong. Please try again.";

    const openAction = (type: "approve" | "reject", uniqueId: string) => {
        setComment("");
        setRehireEligible("");
        setRehireReason("");
        setAction({ type, uniqueId });
    };
    const closeAction = () => { setAction(null); setComment(""); setRehireEligible(""); setRehireReason(""); };

    const submitAction = async () => {
        if (!action) return;

        if (action.type === "approve") {
            if (!rehireEligible) {
                toast.error("Please indicate rehire eligibility before approving.");
                return;
            }
            if (rehireEligible === "No" && !rehireReason.trim()) {
                toast.error("Please provide a reason for the rehire ineligibility.");
                return;
            }
        } else if (!comment.trim()) {
            toast.error("Please provide a reason for rejecting this exit.");
            return;
        }

        setIsSubmitting(true);
        try {
            if (action.type === "approve") {
                await exitService.clearExitInterviewItems(action.uniqueId, {
                    department: "Supervisor",
                    checkListItemIds: [],
                    notes: comment.trim() || undefined,
                    rehireEligible: rehireEligible || undefined,
                    rehireIneligibleReason: rehireEligible === "No" ? rehireReason.trim() : undefined,
                });
                toast.success("Supervisor stage cleared — forwarded to Operations.");
            } else {
                await exitService.rejectExitInterviewDepartment(action.uniqueId, {
                    department: "Supervisor",
                    reason: comment.trim(),
                });
                toast.success("Exit clearance rejected. HR has been notified.");
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

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Pending Exit Approvals</h3>
                {items.length > 0 && (
                    <span className="px-3 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full dark:bg-amber-500/10 dark:text-amber-400">
                        {items.length} awaiting your approval
                    </span>
                )}
            </div>

            {/* Mobile cards */}
            <div className="block md:hidden min-h-[200px]">
                {isLoading ? (
                    <p className="py-10 text-center text-gray-400">Loading...</p>
                ) : items.length === 0 ? (
                    <p className="py-10 text-center text-gray-400">No exit requests are waiting on your approval.</p>
                ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {items.map((record) => (
                            <div key={record.uniqueId} className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                                <p className="font-medium text-gray-800 dark:text-white/90 text-sm">{record.employeeName}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{record.department}</p>
                                <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
                                    <div className="flex justify-between"><span className="font-medium text-gray-600 dark:text-gray-300">Designation</span><span>{record.designation}</span></div>
                                    <div className="flex justify-between"><span className="font-medium text-gray-600 dark:text-gray-300">Submitted</span><span>{record.submittedOn}</span></div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openAction("approve", record.uniqueId)}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-blue-200 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:border-blue-900/30">
                                        <CheckCircleIcon className="w-3.5 h-3.5" /> Approve
                                    </button>
                                    <button onClick={() => openAction("reject", record.uniqueId)}
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
                            {["Employee", "Designation", "Submitted On", "Action"].map(h => (
                                <TableCell key={h} isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">{h}</TableCell>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {isLoading ? (
                            <TableRow><TableCell colSpan={4} className="py-10 text-center text-gray-400">Loading...</TableCell></TableRow>
                        ) : items.length === 0 ? (
                            <TableRow><TableCell colSpan={4} className="py-10 text-center text-gray-400">No exit requests are waiting on your approval.</TableCell></TableRow>
                        ) : items.map((record) => (
                            <TableRow key={record.uniqueId}>
                                <TableCell className="py-3">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{record.employeeName}</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">{record.department}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">{record.designation}</TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">{record.submittedOn}</TableCell>
                                <TableCell className="py-3">
                                    <div className="flex gap-2">
                                        <button onClick={() => openAction("approve", record.uniqueId)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:border-blue-900/30">
                                            <CheckCircleIcon className="w-3.5 h-3.5" /> Approve
                                        </button>
                                        <button onClick={() => openAction("reject", record.uniqueId)}
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
                            {action.type === "approve" ? "Clear Supervisor Stage" : "Reject Exit Clearance"}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            {action.type === "approve"
                                ? "This will forward the exit request to Operations for asset clearance."
                                : "Provide a reason for rejecting this exit clearance."}
                        </p>

                        {action.type === "approve" && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Eligible for rehire? <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-3">
                                    {(["Yes", "No"] as const).map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => setRehireEligible(opt)}
                                            className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                                                rehireEligible === opt
                                                    ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-500/10"
                                                    : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                            }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                                {rehireEligible === "No" && (
                                    <textarea
                                        value={rehireReason}
                                        onChange={(e) => setRehireReason(e.target.value)}
                                        rows={2}
                                        placeholder="Reason for rehire ineligibility..."
                                        className="mt-3 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 resize-none"
                                    />
                                )}
                            </div>
                        )}

                        <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3}
                            placeholder={action.type === "approve" ? "Handover notes (optional)..." : "Enter rejection reason..."}
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 resize-none mb-5" />

                        <div className="flex gap-3">
                            <button onClick={closeAction} disabled={isSubmitting}
                                className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors">
                                Close
                            </button>
                            <button onClick={submitAction} disabled={isSubmitting}
                                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-60 ${action.type === "approve" ? "bg-blue-600 hover:bg-blue-700" : "bg-red-500 hover:bg-red-600"}`}>
                                {isSubmitting ? "Saving..." : action.type === "approve" ? "Clear & Forward" : "Reject"}
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
