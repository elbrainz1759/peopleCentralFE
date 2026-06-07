"use client";
import React, { useState, useEffect } from "react";
import { leaveService } from "@/services/leave.service";
import { toast } from "react-hot-toast";
import CustomSelect from "@/components/form/CustomSelect";
import {
    Table, TableBody, TableCell, TableHeader, TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { EyeIcon, CheckCircleIcon, CloseIcon, MoreDotIcon, PencilIcon, DownloadIcon } from "@/icons";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Drawer } from "../ui/drawer/Drawer";
import { Modal } from "../ui/modal";
import MultiStepLeaveForm from "./MultiStepLeaveForm";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

type CommentAction = { type: "line-manager-approve" | "hr-finalize" | "reject" | "cancel"; id: number } | null;

function statusLabel(status: string) {
    if (status === "Reviewed") return "Awaiting HR";
    return status;
}

function statusColor(status: string): "success" | "warning" | "info" | "error" | "light" {
    if (status === "Approved") return "success";
    if (status === "Pending") return "warning";
    if (status === "Reviewed") return "info";
    if (status === "Rejected") return "error";
    return "light";
}

export default function LeaveApprovalsTable() {
    const [tableData, setTableData] = useState<LeaveRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("All");
    const [activeTab, setActiveTab] = useState<"all" | "my-queue">("all");
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [commentAction, setCommentAction] = useState<CommentAction>(null);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorModal, setErrorModal] = useState<string | null>(null);
    const [currentUserRole, setCurrentUserRole] = useState("");
    const [isProxyDrawerOpen, setIsProxyDrawerOpen] = useState(false);
    const [isHREditOpen, setIsHREditOpen] = useState(false);
    const [hrEditRecord, setHrEditRecord] = useState<{ id: number; reason: string; handoverNote: string } | null>(null);
    const [isSavingHREdit, setIsSavingHREdit] = useState(false);

    // ── Role detection ────────────────────────────────────────────
    useEffect(() => {
        try {
            const authUserJson = localStorage.getItem('auth_user');
            const authToken = localStorage.getItem('auth_token');
            let user: any = authUserJson ? JSON.parse(authUserJson) : {};
            if (authToken) {
                const payload = JSON.parse(atob(authToken.split('.')[1]));
                user = { ...user, ...payload };
            }
            setCurrentUserRole((user?.role || user?.designation || "").toLowerCase());
        } catch { /* ignore */ }
    }, []);

    const isHR = currentUserRole.includes('hr') || currentUserRole.includes('admin') || currentUserRole.includes('superadmin');
    const isLineManager = currentUserRole.includes('manager') || currentUserRole.includes('supervisor') || currentUserRole.includes('lead');
    // Graceful: if role is undetected show all actions
    const canDoLineManagerActions = isLineManager || (!isHR && !isLineManager);
    const canDoHRActions = isHR || (!isHR && !isLineManager);

    const toggleDropdown = (id: number) => setOpenDropdownId(openDropdownId === id ? null : id);
    const closeDropdown = () => setOpenDropdownId(null);

    const handleView = (request: LeaveRequest) => {
        setSelectedRequest(request);
        setIsDrawerOpen(true);
    };

    const openCommentModal = (type: NonNullable<CommentAction>["type"], id: number) => {
        closeDropdown();
        setComment("");
        setCommentAction({ type, id });
    };

    const closeCommentModal = () => { setCommentAction(null); setComment(""); };

    const openHREdit = (record: LeaveRequest) => {
        closeDropdown();
        setHrEditRecord({ id: record.id, reason: record.reason || "", handoverNote: "" });
        setIsHREditOpen(true);
    };

    const saveHREdit = async () => {
        if (!hrEditRecord) return;
        setIsSavingHREdit(true);
        try {
            await leaveService.getInstance().updateLeave(hrEditRecord.id, {
                reason: hrEditRecord.reason,
                handoverNote: hrEditRecord.handoverNote,
            });
            toast.success("Leave record updated.");
            setIsHREditOpen(false);
            setHrEditRecord(null);
            fetchLeaves();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to update leave record.");
        } finally {
            setIsSavingHREdit(false);
        }
    };

    const downloadApprovalPDF = (record: LeaveRequest) => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text("LEAVE APPROVAL NOTICE", 105, 20, { align: "center" });
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Mercy Corps — People Central", 105, 27, { align: "center" });
        doc.setDrawColor(200);
        doc.line(14, 31, 196, 31);

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Leave Details", 14, 42);
        autoTable(doc, {
            startY: 46,
            head: [["Field", "Details"]],
            body: [
                ["Employee Name", record.employeeName],
                ["Department", record.department],
                ["Role", record.role],
                ["Leave Type", record.leaveType],
                ["Start Date", record.startDate],
                ["End Date", record.endDate],
                ["Duration", record.duration],
                ["Reason", record.reason || "N/A"],
                ["Applied On", record.appliedOn],
                ["Status", statusLabel(record.status)],
            ],
            theme: "grid",
            headStyles: { fillColor: [220, 53, 69], textColor: 255, fontStyle: "bold" },
            styles: { fontSize: 10 },
            columnStyles: { 0: { fontStyle: "bold", cellWidth: 55 } },
        });

        const y1 = (doc as any).lastAutoTable?.finalY || 110;
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Approval Trail", 14, y1 + 12);
        autoTable(doc, {
            startY: y1 + 16,
            head: [["Stage", "Status", "Notes"]],
            body: [
                ["Employee Submission", "Submitted", record.reason || "—"],
                ["Line Manager Review", record.status === "Pending" ? "Pending" : "Approved", "—"],
                ["HR Final Approval", record.status === "Approved" ? "Approved" : record.status === "Rejected" ? "Rejected" : "Pending", "—"],
            ],
            theme: "grid",
            headStyles: { fillColor: [34, 197, 94], textColor: 255, fontStyle: "bold" },
            styles: { fontSize: 10 },
        });

        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Generated on ${new Date().toLocaleString()} — Mercy Corps People Central`, 105, pageHeight - 10, { align: "center" });
        doc.setTextColor(0);

        doc.save(`Leave_Approval_${record.employeeName.replace(/\s+/g, '_')}_${record.leaveType.replace(/\s+/g, '_')}.pdf`);
        toast.success("Leave PDF downloaded.");
    };

    const fetchLeaves = async (signal?: AbortSignal) => {
        setIsLoading(true);
        try {
            const response = await leaveService.getInstance().getAllLeaves(1, 100, filterStatus === "Awaiting HR" ? "Reviewed" : filterStatus, undefined, signal);
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
            toast.error("Could not load leave approvals");
        } finally {
            if (!signal?.aborted) setIsLoading(false);
        }
    };

    useEffect(() => {
        const ctrl = new AbortController();
        const timeoutId = setTimeout(() => ctrl.abort(), 20000);
        fetchLeaves(ctrl.signal).finally(() => clearTimeout(timeoutId));
        return () => { clearTimeout(timeoutId); ctrl.abort(); };
    }, [filterStatus]);

    const getApiErrorMessage = (error: any): string =>
        error?.response?.data?.message ?? error?.data?.message ?? error?.message ?? "Something went wrong. Please try again.";

    const submitComment = async () => {
        if (!commentAction) return;
        setIsSubmitting(true);
        try {
            if (commentAction.type === "line-manager-approve") {
                await leaveService.getInstance().reviewLeave(commentAction.id, comment);
                toast.success("Leave approved by Line Manager — forwarded to HR for final approval.");
            } else if (commentAction.type === "hr-finalize") {
                await leaveService.getInstance().approveLeave(commentAction.id);
                toast.success("Leave finalised by HR — employee has been notified.");
            } else if (commentAction.type === "reject") {
                await leaveService.getInstance().rejectLeave(commentAction.id, comment);
                toast.success("Leave request rejected.");
            } else {
                await leaveService.getInstance().cancelLeave(commentAction.id, comment);
                toast.success("Leave request cancelled.");
            }
            closeCommentModal();
            setIsDrawerOpen(false);
            fetchLeaves();
        } catch (error: any) {
            closeCommentModal();
            setErrorModal(getApiErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Filtering ─────────────────────────────────────────────────
    const baseData = filterStatus === "All" ? tableData : tableData.filter(r => r.status === (filterStatus === "Awaiting HR" ? "Reviewed" : filterStatus));
    const filteredData = activeTab === "my-queue"
        ? baseData.filter(r => (canDoLineManagerActions && r.status === "Pending") || (canDoHRActions && r.status === "Reviewed"))
        : baseData;

    const myQueueCount = tableData.filter(r =>
        (canDoLineManagerActions && r.status === "Pending") ||
        (canDoHRActions && r.status === "Reviewed")
    ).length;

    // ── Reusable action buttons ────────────────────────────────────
    const renderCardActions = (record: LeaveRequest) => (
        <div className="flex gap-2 flex-wrap">
            <button onClick={() => handleView(record)}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800">
                <EyeIcon className="w-3.5 h-3.5" /> View
            </button>
            {record.status === "Pending" && canDoLineManagerActions && (
                <>
                    <button onClick={() => openCommentModal("line-manager-approve", record.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-blue-200 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:border-blue-900/30">
                        <CheckCircleIcon className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button onClick={() => openCommentModal("reject", record.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-red-100 text-xs font-medium text-red-500 hover:bg-red-50 dark:border-red-900/30">
                        <CloseIcon className="w-3.5 h-3.5" /> Reject
                    </button>
                    <button onClick={() => openCommentModal("cancel", record.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800">
                        <CloseIcon className="w-3.5 h-3.5" /> Cancel
                    </button>
                </>
            )}
            {record.status === "Reviewed" && canDoHRActions && (
                <>
                    <button onClick={() => openCommentModal("hr-finalize", record.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-green-200 text-xs font-medium text-green-600 hover:bg-green-50 dark:border-green-900/30">
                        <CheckCircleIcon className="w-3.5 h-3.5" /> HR Approve
                    </button>
                    <button onClick={() => openCommentModal("reject", record.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-red-100 text-xs font-medium text-red-500 hover:bg-red-50 dark:border-red-900/30">
                        <CloseIcon className="w-3.5 h-3.5" /> Reject
                    </button>
                    <button onClick={() => openCommentModal("cancel", record.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800">
                        <CloseIcon className="w-3.5 h-3.5" /> Cancel
                    </button>
                </>
            )}
        </div>
    );

    const renderDropdownActions = (record: LeaveRequest) => (
        <>
            <DropdownItem onItemClick={() => { closeDropdown(); handleView(record); }} className="flex gap-2 items-center">
                <EyeIcon className="w-4 h-4" /> View Details
            </DropdownItem>
            {record.status === "Approved" && (
                <DropdownItem onItemClick={() => { closeDropdown(); downloadApprovalPDF(record); }} className="flex gap-2 items-center text-green-600 hover:text-green-700">
                    <DownloadIcon className="w-4 h-4" /> Download PDF
                </DropdownItem>
            )}
            {canDoHRActions && (
                <DropdownItem onItemClick={() => openHREdit(record)} className="flex gap-2 items-center text-amber-600 hover:text-amber-700">
                    <PencilIcon className="w-4 h-4" /> Edit Record (HR)
                </DropdownItem>
            )}
            {record.status === "Pending" && canDoLineManagerActions && (
                <>
                    <DropdownItem onItemClick={() => openCommentModal("line-manager-approve", record.id)} className="flex gap-2 items-center text-blue-600 hover:text-blue-700">
                        <CheckCircleIcon className="w-4 h-4" /> Line Manager Approve
                    </DropdownItem>
                    <DropdownItem onItemClick={() => openCommentModal("reject", record.id)} className="flex gap-2 items-center text-red-500 hover:text-red-700">
                        <CloseIcon className="w-4 h-4" /> Reject
                    </DropdownItem>
                    <DropdownItem onItemClick={() => openCommentModal("cancel", record.id)} className="flex gap-2 items-center text-gray-500 hover:text-gray-700">
                        <CloseIcon className="w-4 h-4" /> Cancel Leave
                    </DropdownItem>
                </>
            )}
            {record.status === "Reviewed" && canDoHRActions && (
                <>
                    <DropdownItem onItemClick={() => openCommentModal("hr-finalize", record.id)} className="flex gap-2 items-center text-green-600 hover:text-green-700">
                        <CheckCircleIcon className="w-4 h-4" /> HR Final Approval
                    </DropdownItem>
                    <DropdownItem onItemClick={() => openCommentModal("reject", record.id)} className="flex gap-2 items-center text-red-500 hover:text-red-700">
                        <CloseIcon className="w-4 h-4" /> Reject
                    </DropdownItem>
                    <DropdownItem onItemClick={() => openCommentModal("cancel", record.id)} className="flex gap-2 items-center text-gray-500 hover:text-gray-700">
                        <CloseIcon className="w-4 h-4" /> Cancel Leave
                    </DropdownItem>
                </>
            )}
        </>
    );

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">

            {/* Workflow Banner */}
            <div className="mb-6 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-white/[0.02] p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Approval Workflow</p>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 flex-1">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-white text-xs font-bold flex-shrink-0">1</div>
                        <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-white">Employee Submits</p>
                            <p className="text-xs text-gray-400">Status: <span className="text-amber-500 font-medium">Pending</span></p>
                        </div>
                    </div>
                    <div className="w-6 h-0.5 bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                    <div className="flex items-center gap-2 flex-1">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-white text-xs font-bold flex-shrink-0">2</div>
                        <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-white">Line Manager Approves</p>
                            <p className="text-xs text-gray-400">Status: <span className="text-blue-500 font-medium">Awaiting HR</span></p>
                        </div>
                    </div>
                    <div className="w-6 h-0.5 bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                    <div className="flex items-center gap-2 flex-1">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-white text-xs font-bold flex-shrink-0">3</div>
                        <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-white">HR Finalises</p>
                            <p className="text-xs text-gray-400">Status: <span className="text-green-500 font-medium">Approved</span></p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-1 rounded-lg border border-gray-200 dark:border-gray-700 p-1 w-fit">
                    <button onClick={() => setActiveTab("all")}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === "all" ? "bg-brand-500 text-white" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}>
                        All Requests
                    </button>
                    <button onClick={() => setActiveTab("my-queue")}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${activeTab === "my-queue" ? "bg-brand-500 text-white" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}>
                        My Queue
                        {myQueueCount > 0 && (
                            <span className={`text-xs rounded-full px-1.5 py-0.5 font-semibold ${activeTab === "my-queue" ? "bg-white text-brand-500" : "bg-brand-500 text-white"}`}>
                                {myQueueCount}
                            </span>
                        )}
                    </button>
                </div>
                <div className="flex items-center gap-3">
                {isHR && (
                    <button
                        onClick={() => setIsProxyDrawerOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm whitespace-nowrap"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Apply on Behalf
                    </button>
                )}
                <CustomSelect
                    value={filterStatus}
                    onChange={(v) => setFilterStatus(v)}
                    options={[
                        { value: "All", label: "All Status" },
                        { value: "Pending", label: "Pending (Awaiting Line Manager)" },
                        { value: "Awaiting HR", label: "Awaiting HR" },
                        { value: "Approved", label: "Approved" },
                        { value: "Rejected", label: "Rejected" },
                    ]}
                    placeholder="All Status"
                />
                </div>
            </div>

            {/* Mobile cards */}
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
                                    <Badge size="sm" color={statusColor(record.status)}>{statusLabel(record.status)}</Badge>
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
                                {renderCardActions(record)}
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
                            {["S/N", "Employee", "Leave Type", "Duration", "Date Applied", "Status", "Action"].map(h => (
                                <TableCell key={h} isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">{h}</TableCell>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {isLoading ? (
                            <TableRow><TableCell colSpan={7} className="py-10 text-center text-gray-400">Loading leave approvals...</TableCell></TableRow>
                        ) : filteredData.length === 0 ? (
                            <TableRow><TableCell colSpan={7} className="py-10 text-center text-gray-400">No leave requests found.</TableCell></TableRow>
                        ) : (
                            filteredData.map((record, index) => (
                                <TableRow key={record.id}>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">{index + 1}</TableCell>
                                    <TableCell className="py-3">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{record.employeeName}</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{record.role}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">{record.leaveType}</TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">{record.duration}</TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">{record.dateCreated}</TableCell>
                                    <TableCell className="py-3 text-theme-sm">
                                        <Badge size="sm" color={statusColor(record.status)}>{statusLabel(record.status)}</Badge>
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">
                                        <div className="relative">
                                            <button onClick={() => toggleDropdown(record.id)}
                                                className="dropdown-toggle text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                                style={{ transform: 'rotate(90deg)' }}>
                                                <MoreDotIcon className="w-5 h-5" />
                                            </button>
                                            <Dropdown isOpen={openDropdownId === record.id} onClose={closeDropdown} className="w-48 right-0 mt-2 top-full">
                                                {renderDropdownActions(record)}
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
                            {commentAction.type === "line-manager-approve" ? "Line Manager Approval"
                                : commentAction.type === "hr-finalize" ? "HR Final Approval"
                                : commentAction.type === "reject" ? "Reject Request"
                                : "Cancel Leave"}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            {commentAction.type === "line-manager-approve"
                                ? "Add comments before approving. This will forward the request to HR for final approval."
                                : commentAction.type === "hr-finalize"
                                ? "Confirm HR final approval. The employee will be notified once approved."
                                : commentAction.type === "reject"
                                ? "Provide a reason for rejecting this leave request."
                                : "Provide a reason for cancelling this leave request."}
                        </p>
                        {commentAction.type !== "hr-finalize" && (
                            <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4}
                                placeholder={
                                    commentAction.type === "line-manager-approve" ? "Enter approval comments (optional)..."
                                    : commentAction.type === "reject" ? "Enter rejection reason (optional)..."
                                    : "Enter cancellation reason (optional)..."
                                }
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 resize-none mb-5" />
                        )}
                        {commentAction.type === "hr-finalize" && <div className="mb-5" />}
                        <div className="flex gap-3">
                            <button onClick={closeCommentModal} disabled={isSubmitting}
                                className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors">
                                Close
                            </button>
                            <button onClick={submitComment} disabled={isSubmitting}
                                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-60 ${
                                    commentAction.type === "line-manager-approve" ? "bg-blue-600 hover:bg-blue-700"
                                    : commentAction.type === "hr-finalize" ? "bg-green-600 hover:bg-green-700"
                                    : commentAction.type === "reject" ? "bg-red-500 hover:bg-red-600"
                                    : "bg-gray-600 hover:bg-gray-700"
                                }`}>
                                {isSubmitting ? "Saving..."
                                    : commentAction.type === "line-manager-approve" ? "Approve & Forward to HR"
                                    : commentAction.type === "hr-finalize" ? "Confirm Final Approval"
                                    : commentAction.type === "reject" ? "Reject"
                                    : "Cancel Leave"}
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
                        <button onClick={() => setErrorModal(null)}
                            className="w-full rounded-xl bg-red-500 hover:bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors">
                            OK
                        </button>
                    </div>
                </div>
            )}

            {/* Proxy Leave Application Drawer */}
            <Drawer
                isOpen={isProxyDrawerOpen}
                onClose={() => setIsProxyDrawerOpen(false)}
                title="Apply on Behalf of Employee"
                width="w-full md:w-[600px]"
            >
                <MultiStepLeaveForm
                    onClose={() => { setIsProxyDrawerOpen(false); fetchLeaves(); }}
                    compact
                    proxyMode
                />
            </Drawer>

            {/* View Details Drawer */}
            <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Leave Request Details">
                {selectedRequest && (
                    <div className="space-y-6">
                        {/* Workflow progress in drawer */}
                        <div className="flex items-center gap-1 text-xs">
                            <span className={`px-2 py-1 rounded-full font-medium ${selectedRequest.status !== "Pending" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                                {selectedRequest.status === "Pending" ? "⏳ Pending Line Manager" : "✓ Line Manager Approved"}
                            </span>
                            <span className="text-gray-300">→</span>
                            <span className={`px-2 py-1 rounded-full font-medium ${selectedRequest.status === "Approved" ? "bg-green-100 text-green-700" : selectedRequest.status === "Reviewed" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-400"}`}>
                                {selectedRequest.status === "Approved" ? "✓ HR Approved" : selectedRequest.status === "Reviewed" ? "⏳ Awaiting HR" : "HR Approval"}
                            </span>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="h-12 w-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-xl">
                                {selectedRequest.employeeName.charAt(0)}
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedRequest.employeeName}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedRequest.role} · {selectedRequest.department}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium text-gray-500">Leave Type</label><p className="text-gray-900 dark:text-white font-medium">{selectedRequest.leaveType}</p></div>
                            <div><label className="block text-sm font-medium text-gray-500">Duration</label><p className="text-gray-900 dark:text-white">{selectedRequest.duration}</p></div>
                            <div><label className="block text-sm font-medium text-gray-500">Start Date</label><p className="text-gray-900 dark:text-white">{selectedRequest.startDate}</p></div>
                            <div><label className="block text-sm font-medium text-gray-500">End Date</label><p className="text-gray-900 dark:text-white">{selectedRequest.endDate}</p></div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Reason</label>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300">{selectedRequest.reason}</div>
                        </div>

                        {selectedRequest.status === "Pending" && canDoLineManagerActions && (
                            <div className="flex flex-col gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <button onClick={() => openCommentModal("line-manager-approve", selectedRequest.id)}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                                    <CheckCircleIcon className="w-5 h-5" /> Line Manager Approve
                                </button>
                                <button onClick={() => openCommentModal("reject", selectedRequest.id)}
                                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 rounded-lg font-medium transition-colors border border-red-200 flex items-center justify-center gap-2">
                                    <CloseIcon className="w-5 h-5" /> Reject Request
                                </button>
                            </div>
                        )}
                        {selectedRequest.status === "Reviewed" && canDoHRActions && (
                            <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <button onClick={() => openCommentModal("hr-finalize", selectedRequest.id)}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                                    <CheckCircleIcon className="w-5 h-5" /> HR Final Approval
                                </button>
                                <button onClick={() => openCommentModal("reject", selectedRequest.id)}
                                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 rounded-lg font-medium transition-colors border border-red-200 flex items-center justify-center gap-2">
                                    <CloseIcon className="w-5 h-5" /> Reject
                                </button>
                            </div>
                        )}
                        {(selectedRequest.status === "Approved" || selectedRequest.status === "Rejected") && (
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                                <div className={`p-3 rounded-lg text-center font-medium ${selectedRequest.status === "Approved" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                                    This request has been {selectedRequest.status.toLowerCase()}.
                                </div>
                                {selectedRequest.status === "Approved" && (
                                    <button
                                        onClick={() => downloadApprovalPDF(selectedRequest)}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors"
                                    >
                                        <DownloadIcon className="w-4 h-4" /> Download Approval PDF
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </Drawer>

            {/* HR Edit Record Modal */}
            {isHREditOpen && hrEditRecord && (
                <Modal isOpen={isHREditOpen} onClose={() => { setIsHREditOpen(false); setHrEditRecord(null); }} className="max-w-lg w-full m-4">
                    <div className="p-6 space-y-5">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit Leave Record (HR)</h3>
                            <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Audit trail maintained</span>
                        </div>
                        <p className="text-xs text-gray-500">Adjustments made here are logged with your HR credentials. Only use for corrections or administrative updates.</p>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason / Comments</label>
                            <textarea
                                rows={3}
                                value={hrEditRecord.reason}
                                onChange={e => setHrEditRecord(prev => prev ? { ...prev, reason: e.target.value } : null)}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-brand-500 resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Handover Note (if applicable)</label>
                            <textarea
                                rows={2}
                                value={hrEditRecord.handoverNote}
                                onChange={e => setHrEditRecord(prev => prev ? { ...prev, handoverNote: e.target.value } : null)}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-brand-500 resize-none"
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => { setIsHREditOpen(false); setHrEditRecord(null); }} className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors">
                                Cancel
                            </button>
                            <button onClick={saveHREdit} disabled={isSavingHREdit} className="flex-1 px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors disabled:opacity-50">
                                {isSavingHREdit ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
