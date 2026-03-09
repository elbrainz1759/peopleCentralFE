"use client";
import React, { useState, useEffect } from "react";
import { leaveService } from "@/services/leave.service";
import { toast } from "react-hot-toast";
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
    status: "Approved" | "Pending" | "Rejected";
    appliedOn: string;
}

const tableData: LeaveRequest[] = [
    {
        id: 1,
        employeeName: "Amara Okoro",
        role: "Software Engineer",
        department: "Engineering",
        leaveType: "Annual Leave",
        startDate: "2025-03-10",
        endDate: "2025-03-15",
        duration: "5 Days",
        reason: "Personal vacation",
        status: "Pending",
        appliedOn: "2025-03-01",
    },
    {
        id: 2,
        employeeName: "Kwame Asante",
        role: "Product Manager",
        department: "Product",
        leaveType: "Sick Leave",
        startDate: "2025-02-12",
        endDate: "2025-02-14",
        duration: "3 Days",
        reason: "Personal illness",
        status: "Approved",
        appliedOn: "2025-02-11",
    },
    {
        id: 3,
        employeeName: "Fatima Zahra",
        role: "HR Specialist",
        department: "Human Resources",
        leaveType: "Casual Leave",
        startDate: "2025-02-28",
        endDate: "2025-02-28",
        duration: "1 Day",
        reason: "Family emergency",
        status: "Rejected",
        appliedOn: "2025-02-25",
    },
    {
        id: 4,
        employeeName: "Yuki Tanaka",
        role: "Marketing Lead",
        department: "Marketing",
        leaveType: "Annual Leave",
        startDate: "2025-04-01",
        endDate: "2025-04-10",
        duration: "10 Days",
        reason: "Spring break",
        status: "Pending",
        appliedOn: "2025-03-05",
    },
    {
        id: 5,
        employeeName: "Carlos Mendez",
        role: "Frontend Developer",
        department: "Engineering",
        leaveType: "Paternity Leave",
        startDate: "2025-05-15",
        endDate: "2025-05-30",
        duration: "15 Days",
        reason: "Family event",
        status: "Pending",
        appliedOn: "2025-05-01",
    },
];

export default function LeaveApprovalsTable() {
    const [tableData, setTableData] = useState<LeaveRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [filterStatus, setFilterStatus] = useState("All");
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

    const fetchLeaves = async () => {
        setIsLoading(true);
        try {
            const response = await leaveService.getInstance().getAllLeaves(1, 100, filterStatus);
            // Map API data to LeaveRequest format
            const mappedData = response.data.map((item: any) => ({
                id: item.id,
                employeeName: item.staff?.first_name ? `${item.staff.first_name} ${item.staff.last_name || ""}` : "Unknown Employee",
                role: item.staff?.employment_detail?.job_title || "Staff",
                department: item.staff?.employment_detail?.department?.name || "Unit",
                leaveType: item.leaveType?.name || "Other",
                startDate: item.leaveDuration?.[0]?.startDate || "-",
                endDate: item.leaveDuration?.[0]?.endDate || "-",
                duration: `${item.leaveDuration?.length || 0} Periods`,
                reason: item.reason,
                status: item.status,
                appliedOn: new Date(item.created_at).toLocaleDateString(),
            }));
            setTableData(mappedData);
        } catch (error) {
            console.error("Failed to fetch leave approvals:", error);
            toast.error("Could not load leave approvals");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, [filterStatus]);

    const handleReview = async (id: number) => {
        const comments = prompt("Please enter review comments (optional):") || "";
        try {
            await leaveService.getInstance().reviewLeave(id, comments);
            toast.success("Leave request reviewed by HR");
            fetchLeaves();
            setIsDrawerOpen(false);
        } catch (error) {
            console.error("Review error:", error);
            toast.error("Failed to review leave request");
        }
    };

    const handleApprove = async (id: number) => {
        try {
            await leaveService.getInstance().approveLeave(id);
            toast.success("Leave request approved by supervisor");
            fetchLeaves();
            setIsDrawerOpen(false);
        } catch (error) {
            console.error("Approval error:", error);
            toast.error("Failed to approve leave request");
        }
    };

    const handleReject = async (id: number) => {
        const comments = prompt("Please enter a reason for rejection (optional):") || "";
        try {
            await leaveService.getInstance().rejectLeave(id, comments);
            toast.success("Leave request rejected");
            fetchLeaves();
            setIsDrawerOpen(false);
        } catch (error) {
            console.error("Rejection error:", error);
            toast.error("Failed to reject leave request");
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

                <div className="flex items-center gap-3">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:focus:border-brand-500"
                    >
                        <option value="All">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
            </div>

            <div className="max-w-full overflow-x-auto min-h-[400px]">
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
                                Dates
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
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
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
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {record.leaveType}
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        <div className="flex flex-col">
                                            <span>{record.startDate}</span>
                                            <span className="text-xs text-gray-400">to {record.endDate}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {record.duration}
                                    </TableCell>
                                    <TableCell className="py-3 text-theme-sm">
                                        <Badge
                                            size="sm"
                                            color={
                                                record.status === "Approved"
                                                    ? "success"
                                                    : record.status === "Pending"
                                                        ? "warning"
                                                        : record.status === "Rejected"
                                                            ? "error"
                                                            : "light"
                                            }
                                        >
                                            {record.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
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
                                                            onItemClick={() => handleReview(record.id)}
                                                            className="flex gap-2 items-center text-blue-600 hover:text-blue-700"
                                                        >
                                                            <EyeIcon className="w-4 h-4" />
                                                            HR Review
                                                        </DropdownItem>
                                                        <DropdownItem
                                                            onItemClick={() => handleApprove(record.id)}
                                                            className="flex gap-2 items-center text-green-600 hover:text-green-700"
                                                        >
                                                            <CheckCircleIcon className="w-4 h-4" />
                                                            Supervisor Approve
                                                        </DropdownItem>
                                                        <DropdownItem
                                                            onItemClick={() => handleReject(record.id)}
                                                            className="flex gap-2 items-center text-red-500 hover:text-red-700"
                                                        >
                                                            <CloseIcon className="w-4 h-4" />
                                                            Reject
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
                                    onClick={() => handleReview(selectedRequest.id)}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <EyeIcon className="w-5 h-5" />
                                    HR Review
                                </button>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleApprove(selectedRequest.id)}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        <CheckCircleIcon className="w-5 h-5" />
                                        Supervisor Approve
                                    </button>
                                    <button
                                        onClick={() => handleReject(selectedRequest.id)}
                                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 rounded-lg font-medium transition-colors border border-red-200 flex items-center justify-center gap-2"
                                    >
                                        <CloseIcon className="w-5 h-5" />
                                        Reject Request
                                    </button>
                                </div>
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
