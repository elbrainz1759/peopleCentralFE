"use client";
import React, { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { EyeIcon, TrashBinIcon, PencilIcon, MoreDotIcon } from "@/icons";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Drawer } from "../ui/drawer/Drawer";
import MultiStepLeaveForm from "./MultiStepLeaveForm";

interface LeaveRecord {
    id: number;
    leaveType: string;
    startDate: string;
    endDate: string;
    duration: string;
    reason: string;
    status: "Approved" | "Pending" | "Rejected";
    appliedOn: string;
    handoverNotes?: string;
    supervisor?: string;
}

const tableData: LeaveRecord[] = [
    {
        id: 1,
        leaveType: "Annual Leave",
        startDate: "2025-01-10",
        endDate: "2025-01-15",
        duration: "5 Days",
        reason: "Family vacation to Lagos",
        status: "Approved",
        appliedOn: "2025-01-02",
    },
    {
        id: 2,
        leaveType: "Sick Leave",
        startDate: "2025-02-12",
        endDate: "2025-02-14",
        duration: "3 Days",
        reason: "Flu and fever",
        status: "Pending",
        appliedOn: "2025-02-11",
    },
    {
        id: 3,
        leaveType: "Study Leave",
        startDate: "2024-11-05",
        endDate: "2024-11-15",
        duration: "10 Days",
        reason: "Professional certification exams",
        status: "Approved",
        appliedOn: "2024-10-20",
    },
    {
        id: 4,
        leaveType: "Casual Leave",
        startDate: "2025-03-01",
        endDate: "2025-03-01",
        duration: "1 Day",
        reason: "Personal errands",
        status: "Rejected",
        appliedOn: "2025-02-28",
    },
    {
        id: 5,
        leaveType: "Annual Leave",
        startDate: "2024-12-20",
        endDate: "2025-01-05",
        duration: "15 Days",
        reason: "Christmas and New Year break",
        status: "Approved",
        appliedOn: "2024-12-01",
    },
];

export default function LeaveHistoryTable() {
    const [filterStatus, setFilterStatus] = useState("All");
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const [selectedLeave, setSelectedLeave] = useState<LeaveRecord | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const toggleDropdown = (id: number) => {
        setOpenDropdownId(openDropdownId === id ? null : id);
    };

    const closeDropdown = () => {
        setOpenDropdownId(null);
    };

    const handleView = (record: LeaveRecord) => {
        setSelectedLeave(record);
        setIsViewOpen(true);
    };

    const handleEdit = (record: LeaveRecord) => {
        setSelectedLeave(record);
        setIsEditOpen(true);
    };

    const filteredData =
        filterStatus === "All"
            ? tableData
            : tableData.filter((record) => record.status === filterStatus);

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    My Leave History
                </h3>

                <div className="flex items-center gap-3">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:focus:border-brand-500"
                    >
                        <option value="All">All Status</option>
                        <option value="Approved">Approved</option>
                        <option value="Pending">Pending</option>
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
                                Applied On
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
                        {filteredData.map((record, index) => (
                            <TableRow key={record.id} className="">
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {index + 1}
                                </TableCell>
                                <TableCell className="py-3">
                                    <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                        {record.leaveType}
                                    </span>
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
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {record.appliedOn}
                                </TableCell>
                                <TableCell className="py-3 text-theme-sm">
                                    <Badge
                                        size="sm"
                                        color={
                                            record.status === "Approved"
                                                ? "success"
                                                : record.status === "Pending"
                                                    ? "warning"
                                                    : "error"
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
                                                        onItemClick={() => {
                                                            closeDropdown();
                                                            handleEdit(record);
                                                        }}
                                                        className="flex gap-2 items-center"
                                                    >
                                                        <PencilIcon className="w-4 h-4" />
                                                        Edit
                                                    </DropdownItem>
                                                    <DropdownItem onItemClick={closeDropdown} className="flex gap-2 items-center text-red-500 hover:text-red-700">
                                                        <TrashBinIcon className="w-4 h-4" />
                                                        Cancel
                                                    </DropdownItem>
                                                </>
                                            )}
                                        </Dropdown>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* View Details Drawer */}
            <Drawer
                isOpen={isViewOpen}
                onClose={() => setIsViewOpen(false)}
                title="Leave Details"
            >
                {selectedLeave && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Leave Type</label>
                                <p className="text-gray-900 dark:text-white font-medium">{selectedLeave.leaveType}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Status</label>
                                <Badge
                                    size="sm"
                                    color={
                                        selectedLeave.status === "Approved"
                                            ? "success"
                                            : selectedLeave.status === "Pending"
                                                ? "warning"
                                                : "error"
                                    }
                                >
                                    {selectedLeave.status}
                                </Badge>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Start Date</label>
                                <p className="text-gray-900 dark:text-white">{selectedLeave.startDate}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">End Date</label>
                                <p className="text-gray-900 dark:text-white">{selectedLeave.endDate}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Duration</label>
                                <p className="text-gray-900 dark:text-white">{selectedLeave.duration}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Applied On</label>
                                <p className="text-gray-900 dark:text-white">{selectedLeave.appliedOn}</p>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Reason</label>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                                {selectedLeave.reason}
                            </div>
                        </div>
                    </div>
                )}
            </Drawer>

            {/* Edit Drawer */}
            <Drawer
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                title="Edit Leave Request"
            >
                {selectedLeave && (
                    <MultiStepLeaveForm
                        onClose={() => setIsEditOpen(false)}
                        initialData={selectedLeave}
                    />
                )}
            </Drawer>
        </div>
    );
}
