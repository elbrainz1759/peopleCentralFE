"use client";
import React, { useState, useEffect } from "react";
import { leaveService } from "@/services/leave.service";
import { toast } from "react-hot-toast";
import CustomSelect from "@/components/form/CustomSelect";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { EyeIcon, CheckCircleIcon, CloseIcon, MoreDotIcon } from "@/icons";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Drawer } from "../ui/drawer/Drawer";

interface LeaveRequest {
    id: number;
    employeeName: string;
    role: string;
    department: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    duration: string;
    reason: string;
    status: "Approved" | "Pending" | "Reviewed" | "Rejected";
    appliedOn: string;
    dateCreated: string;
}



type CommentAction = { type: "review" | "reject" | "cancel"; id: number } | null;

export default function LeaveApprovalsTable() {
    const [tableData, setTableData] = useState<LeaveRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [filterStatus, setFilterStatus] = useState("All");
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const [commentAction, setCommentAction] = useState<CommentAction>(null);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorModal, setErrorModal] = useState<string | null>(null);

    const toggleDropdown = (id: number) => {
        setOpenDropdownId(openDropdownId === id ? null : id);
    };

    const closeDropdown = () => {
        setOpenDropdownId(null);
    };

    const handleView = (request: LeaveRequest) => {
        setSelectedRequest(request);
        setIsDrawerOpen(true);
    };

    const openCommentModal = (type: "review" | "reject", id: number) => {
        closeDropdown();
        setComment("");
        setCommentAction({ type, id });
    };

    const closeCommentModal = () => {
        setCommentAction(null);
        setComment("");
    };

    const fetchLeaves = async (signal?: AbortSignal) => {
        setIsLoading(true);
        try {
            const response = await leaveService.getInstance().getAllLeaves(1, 100, filterStatus, undefined, signal);
            if (signal?.aborted) return;
            const mappedData = response.data.map((item: any) => ({
                id: item.id,
                employeeName: item.employee_name ?? item.staff?.employee_name ?? "—",
                role: item.employee_designation ?? item.staff?.employment_detail?.job_title ?? "Staff",
                department: item.department_name ?? item.staff?.employment_detail?.department?.name ?? "Unit",
                leaveType: item.leave_type_name ?? item.leaveType?.name ?? "Other",
                startDate: item.start_date ? new Date(item.start_date).toLocaleDateString() : new Date(item.created_at).toLocaleDateString(),
                endDate: item.end_date ? new Date(item.end_date).toLocaleDateString() : "-",
                duration: item.total_hours ? `${item.total_hours} hrs` : "-",
                reason: item.reason,
                status: item.status,
                appliedOn: new Date(item.created_at).toLocaleDateString(),
                dateCreated: new Date(item.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
            }));
            setTableData(mappedData);
        } catch (error: any) {
            if (error?.name === "AbortError" || signal?.aborted) return;
            console.error("Failed to fetch leave approvals:", error);
            toast.error("Could not load leave approvals");
        } finally {
            if (!signal?.aborted) setIsLoading(false);
        }
    };

    useEffect(() => {
        const ctrl = new AbortController();
        const timeoutId = setTimeout(() => ctrl.abort(), 20000);
        fetchLeaves(ctrl.signal).finally(() => clearTimeout(timeoutId));
        return () => {
            clearTimeout(timeoutId);
            ctrl.abort();
        };
    }, [filterStatus]);

    const getApiErrorMessage = (error: any): string => {
        return error?.response?.data?.message
            ?? error?.data?.message
            ?? error?.message
            ?? "Something went wrong. Please try again.";
    };

    const submitComment = async () => {
        if (!commentAction) return;
        setIsSubmitting(true);
        try {
            if (commentAction.type === "review") {
                await leaveService.getInstance().reviewLeave(commentAction.id, comment);
                toast.success("Leave request reviewed by HR");
            } else if (commentAction.type === "reject") {
                await leaveService.getInstance().rejectLeave(commentAction.id, comment);
                toast.success("Leave request rejected");
            } else {
                await leaveService.getInstance().cancelLeave(commentAction.id, comment);
                toast.success("Leave request cancelled");
            }
            closeCommentModal();
            setIsDrawerOpen(false);
            fetchLeaves();
        } catch (error: any) {
            console.error("Action error:", error);
            closeCommentModal();
            setErrorModal(getApiErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleApprove = async (id: number) => {
        try {
            await leaveService.getInstance().approveLeave(id);
            toast.success("Leave request approved");
            fetchLeaves();
            setIsDrawerOpen(false);
        } catch (error: any) {
            console.error("Approval error:", error);
            setErrorModal(getApiErrorMessage(error));
        }
    };

    const filteredData =
        filterStatus === "All"
            ? tableData
            : tableData.filter((record) => record.status === filterStatus);

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    Leave Approvals
                </h3>

                <div className="flex flex-wrap items-center gap-3">
                    <CustomSelect
                        value={filterStatus}
                        onChange={(v) => setFilterStatus(v)}
                        options={[
                            { value: "All", label: "All Status" },
                            { value: "Pending", label: "Pending" },
                            { value: "Reviewed", label: "Reviewed" },
                            { value: "Approved", label: "Approved" },
                            { value: "Rejected", label: "Rejected" },
                        ]}
                        placeholder="All Status"
                    />
                </div>
            </div>

            {/* Mobile card grid */}
            <div className="block md:hidden min-h-[400px]">
                {isLoading ? (
                    <p className="py-10 text-center text-gray-400">Loading leave approvals...</p>
                ) : filteredData.length === 0 ? (
                    <p className="py-10 text-center text-gray-400">No leave requests found.</p>
                ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {filteredData.map((record) => (
                            <div key={record.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-white/90 text-sm">{record.employeeName}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{record.role}</p>
                                    </div>
                                    <Badge size="sm" color={record.status === "Approved" ? "success" : record.status === "Pending" ? "warning" : record.status === "Reviewed" ? "info" : record.status === "Rejected" ? "error" : "light"}>
                                        {record.status}
                                    </Badge>
                                </div>
                                <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
                                    <div className="flex justify-between">
                                        <span className="font-medium text-gray-600 dark:text-gray-300">Leave Type</span>
                                        <span>{record.leaveType}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium text-gray-600 dark:text-gray-300">Duration</span>
                                        <span>{record.duration}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium text-gray-600 dark:text-gray-300">Date Applied</span>
                                        <span>{record.dateCreated}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    <button
                                        onClick={() => handleView(record)}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                                    >
                                        <EyeIcon className="w-3.5 h-3.5" /> View
                                    </button>
                                    {record.status === "Pending" && (
                                        <>
                                            <button
                                                onClick={() => openCommentModal("review", record.id)}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-blue-200 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:border-blue-900/30"
                                            >
                                                <EyeIcon className="w-3.5 h-3.5" /> HR Review
                                            </button>
                                            <button
                                                onClick={() => openCommentModal("reject", record.id)}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-red-100 text-xs font-medium text-red-500 hover:bg-red-50 dark:border-red-900/30"
                                            >
                                                <CloseIcon className="w-3.5 h-3.5" /> Reject
                                            </button>
                                            <button
                                                onClick={() => openCommentModal("cancel", record.id)}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                                            >
                                                <CloseIcon className="w-3.5 h-3.5" /> Cancel
                                            </button>
                                        </>
                                    )}
                                    {record.status === "Reviewed" && (
                                        <>
                                            <button
                                                onClick={() => handleApprove(record.id)}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-green-200 text-xs font-medium text-green-600 hover:bg-green-50 dark:border-green-900/30"
                                            >
                                                <CheckCircleIcon className="w-3.5 h-3.5" /> Approve
                                            </button>
                                            <button
                                                onClick={() => openCommentModal("reject", record.id)}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-red-100 text-xs font-medium text-red-500 hover:bg-red-50 dark:border-red-900/30"
                                            >
                                                <CloseIcon className="w-3.5 h-3.5" /> Reject
                                            </button>
                                            <button
                                                onClick={() => openCommentModal("cancel", record.id)}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                                            >
                                                <CloseIcon className="w-3.5 h-3.5" /> Cancel
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block max-w-full overflow-x-auto min-h-[400px]">
                <Table>
                    <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                        <TableRow>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                S/N
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Employee
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Leave Type
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Duration
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Date Applied
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Status
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Action
                            </TableCell>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="py-10 text-center text-gray-400">
                                    Loading leave approvals...
                                </TableCell>
                            </TableRow>
                        ) : filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="py-10 text-center text-gray-400">
                                    No leave requests found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((record, index) => (
                                <TableRow key={record.id} className="">
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">
                                        {index + 1}
                                    </TableCell>
                                    <TableCell className="py-3">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                {record.employeeName}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {record.role}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">
                                        {record.leaveType}
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">
                                        {record.duration}
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">
                                        {record.dateCreated}
                                    </TableCell>
                                    <TableCell className="py-3 text-theme-sm">
                                        <Badge
                                            size="sm"
                                            color={
                                                record.status === "Approved"
                                                    ? "success"
                                                    : record.status === "Pending"
                                                        ? "warning"
                                                        : record.status === "Reviewed"
                                                            ? "info"
                                                            : record.status === "Rejected"
                                                                ? "error"
                                                                : "light"
                                            }
                                        >
                                            {record.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">
                                        <div className="relative">
                                            <button
                                                onClick={() => toggleDropdown(record.id)}
                                                className="dropdown-toggle text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                                style={{ transform: 'rotate(90deg)' }}
                                            >
                                                <MoreDotIcon className="w-5 h-5" />
                                            </button>
                                            <Dropdown
                                                isOpen={openDropdownId === record.id}
                                                onClose={closeDropdown}
                                                className="w-40 right-0 mt-2 top-full"
                                            >
                                                <DropdownItem
                                                    onItemClick={() => {
                                                        closeDropdown();
                                                        handleView(record);
                                                    }}
                                                    className="flex gap-2 items-center"
                                                >
                                                    <EyeIcon className="w-4 h-4" />
                                                    View Details
                                                </DropdownItem>
                                                {record.status === "Pending" && (
                                                    <>
                                                        <DropdownItem
                                                            onItemClick={() => openCommentModal("review", record.id)}
                                                            className="flex gap-2 items-center text-blue-600 hover:text-blue-700"
                                                        >
                                                            <EyeIcon className="w-4 h-4" />
                                                            HR Review
                                                        </DropdownItem>
                                                        <DropdownItem
                                                            onItemClick={() => openCommentModal("reject", record.id)}
                                                            className="flex gap-2 items-center text-red-500 hover:text-red-700"
                                                        >
                                                            <CloseIcon className="w-4 h-4" />
                                                            Reject
                                                        </DropdownItem>
                                                        <DropdownItem
                                                            onItemClick={() => openCommentModal("cancel", record.id)}
                                                            className="flex gap-2 items-center text-gray-500 hover:text-gray-700"
                                                        >
                                                            <CloseIcon className="w-4 h-4" />
                                                            Cancel Leave
                                                        </DropdownItem>
                                                    </>
                                                )}
                                                {record.status === "Reviewed" && (
                                                    <>
                                                        <DropdownItem
                                                            onItemClick={() => handleApprove(record.id)}
                                                            className="flex gap-2 items-center text-green-600 hover:text-green-700"
                                                        >
                                                            <CheckCircleIcon className="w-4 h-4" />
                                                            Approve
                                                        </DropdownItem>
                                                        <DropdownItem
                                                            onItemClick={() => openCommentModal("reject", record.id)}
                                                            className="flex gap-2 items-center text-red-500 hover:text-red-700"
                                                        >
                                                            <CloseIcon className="w-4 h-4" />
                                                            Reject
                                                        </DropdownItem>
                                                        <DropdownItem
                                                            onItemClick={() => openCommentModal("cancel", record.id)}
                                                            className="flex gap-2 items-center text-gray-500 hover:text-gray-700"
                                                        >
                                                            <CloseIcon className="w-4 h-4" />
                                                            Cancel Leave
                                                        </DropdownItem>
                                                    </>
                                                )}
                                            </Dropdown>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Comment Modal */}
            {commentAction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 shadow-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {commentAction.type === "review" ? "HR Review" : commentAction.type === "reject" ? "Reject Request" : "Cancel Leave"}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            {commentAction.type === "review"
                                ? "Add your review comments before marking this leave as reviewed."
                                : commentAction.type === "reject"
                                ? "Provide a reason for rejecting this leave request."
                                : "Provide a reason for cancelling this leave request."}
                        </p>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            placeholder={
                                commentAction.type === "review"
                                    ? "Enter review comments (optional)..."
                                    : commentAction.type === "reject"
                                    ? "Enter rejection reason (optional)..."
                                    : "Enter cancellation reason (optional)..."
                            }
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 resize-none"
                        />
                        <div className="flex gap-3 mt-5">
                            <button
                                onClick={closeCommentModal}
                                disabled={isSubmitting}
                                className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={submitComment}
                                disabled={isSubmitting}
                                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-60 ${
                                    commentAction.type === "review"
                                        ? "bg-blue-600 hover:bg-blue-700"
                                        : commentAction.type === "reject"
                                        ? "bg-red-500 hover:bg-red-600"
                                        : "bg-gray-600 hover:bg-gray-700"
                                }`}
                            >
                                {isSubmitting ? "Saving..." : commentAction.type === "review" ? "Submit Review" : commentAction.type === "reject" ? "Reject" : "Cancel Leave"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Modal */}
            {errorModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 shadow-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10">
                                <CloseIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Action Failed</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">{errorModal}</p>
                        <button
                            onClick={() => setErrorModal(null)}
                            className="w-full rounded-xl bg-red-500 hover:bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}

            {/* Review Drawer */}
            <Drawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title="Review Leave Request"
            >
                {selectedRequest && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="h-12 w-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-xl">
                                {selectedRequest.employeeName.charAt(0)}
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {selectedRequest.employeeName}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {selectedRequest.role} - {selectedRequest.department}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Leave Type</label>
                                <p className="text-gray-900 dark:text-white font-medium">{selectedRequest.leaveType}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Duration</label>
                                <p className="text-gray-900 dark:text-white">{selectedRequest.duration}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Start Date</label>
                                <p className="text-gray-900 dark:text-white">{selectedRequest.startDate}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">End Date</label>
                                <p className="text-gray-900 dark:text-white">{selectedRequest.endDate}</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Reason</label>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                                {selectedRequest.reason}
                            </div>
                        </div>

                        {selectedRequest.status === "Pending" ? (
                            <div className="flex flex-col gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    onClick={() => openCommentModal("review", selectedRequest.id)}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <EyeIcon className="w-5 h-5" />
                                    HR Review
                                </button>
                                <button
                                    onClick={() => openCommentModal("reject", selectedRequest.id)}
                                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 rounded-lg font-medium transition-colors border border-red-200 flex items-center justify-center gap-2"
                                >
                                    <CloseIcon className="w-5 h-5" />
                                    Reject Request
                                </button>
                            </div>
                        ) : selectedRequest.status === "Reviewed" ? (
                            <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    onClick={() => handleApprove(selectedRequest.id)}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <CheckCircleIcon className="w-5 h-5" />
                                    Approve
                                </button>
                                <button
                                    onClick={() => openCommentModal("reject", selectedRequest.id)}
                                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 rounded-lg font-medium transition-colors border border-red-200 flex items-center justify-center gap-2"
                                >
                                    <CloseIcon className="w-5 h-5" />
                                    Reject Request
                                </button>
                            </div>
                        ) : (
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                <div className={`p-3 rounded-lg text-center font-medium ${selectedRequest.status === 'Approved'
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                                    }`}>
                                    This request has been {selectedRequest.status.toLowerCase()}.
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Drawer>
        </div>
    );
}
