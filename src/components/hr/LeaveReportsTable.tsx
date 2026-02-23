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
import {
    CalenderIcon,
    ArrowRightIcon,
    ChevronLeftIcon,
    FileIcon
} from "@/icons";

// Interface for Leave Report Record
interface LeaveReportRecord {
    id: number;
    employeeName: string;
    department: string;
    leaveType: string;
    appliedOn: string;
    startDate: string;
    endDate: string;
    days: number;
    status: "Approved" | "Pending" | "Rejected";
}

// Mock Data
const reportData: LeaveReportRecord[] = [
    {
        id: 1,
        employeeName: "Amara Okoro",
        department: "Engineering",
        leaveType: "Annual Leave",
        appliedOn: "2025-01-02",
        startDate: "2025-01-10",
        endDate: "2025-01-15",
        days: 5,
        status: "Approved",
    },
    {
        id: 2,
        employeeName: "Kwame Asante",
        department: "Product",
        leaveType: "Sick Leave",
        appliedOn: "2025-02-11",
        startDate: "2025-02-12",
        endDate: "2025-02-14",
        days: 3,
        status: "Approved",
    },
    {
        id: 3,
        employeeName: "Fatima Zahra",
        department: "HR",
        leaveType: "Casual Leave",
        appliedOn: "2025-02-25",
        startDate: "2025-02-28",
        endDate: "2025-02-28",
        days: 1,
        status: "Rejected",
    },
    {
        id: 4,
        employeeName: "Yuki Tanaka",
        department: "Marketing",
        leaveType: "Annual Leave",
        appliedOn: "2025-03-05",
        startDate: "2025-04-01",
        endDate: "2025-04-10",
        days: 10,
        status: "Pending",
    },
    {
        id: 5,
        employeeName: "Carlos Mendez",
        department: "Engineering",
        leaveType: "Paternity Leave",
        appliedOn: "2025-05-01",
        startDate: "2025-05-15",
        endDate: "2025-05-30",
        days: 15,
        status: "Pending",
    },
    {
        id: 6,
        employeeName: "Siddharth Nair",
        department: "Finance",
        leaveType: "Maternity Leave",
        appliedOn: "2024-12-01",
        startDate: "2025-01-01",
        endDate: "2025-03-31",
        days: 90,
        status: "Approved",
    }
];

export default function LeaveReportsTable() {
    const [filterDepartment, setFilterDepartment] = useState("All");
    const [filterStatus, setFilterStatus] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const filteredData = reportData.filter((record) => {
        const matchesDepartment =
            filterDepartment === "All" || record.department === filterDepartment;
        const matchesStatus =
            filterStatus === "All" || record.status === filterStatus;
        const matchesSearch =
            record.employeeName.toLowerCase().includes(searchTerm.toLowerCase());

        // Simple date filtering (if dates are set)
        let matchesDate = true;
        if (startDate && endDate) {
            const recordStart = new Date(record.startDate);
            const filterStart = new Date(startDate);
            const filterEnd = new Date(endDate);
            matchesDate = recordStart >= filterStart && recordStart <= filterEnd;
        }

        return matchesDepartment && matchesStatus && matchesSearch && matchesDate;
    });

    const handleExport = () => {
        alert("Export functionality would generate a CSV/PDF here.");
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">

            {/* Filters Header */}
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Reports & Analytics
                    </h3>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        <FileIcon className="w-4 h-4" />
                        Export Report
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Search Employee..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:focus:border-brand-500"
                    />

                    {/* Department Filter */}
                    <select
                        value={filterDepartment}
                        onChange={(e) => setFilterDepartment(e.target.value)}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:focus:border-brand-500"
                    >
                        <option value="All">All Departments</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Product">Product</option>
                        <option value="HR">HR</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Finance">Finance</option>
                    </select>

                    {/* Status Filter */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:focus:border-brand-500"
                    >
                        <option value="All">All Status</option>
                        <option value="Approved">Approved</option>
                        <option value="Pending">Pending</option>
                        <option value="Rejected">Rejected</option>
                    </select>

                    {/* Date Filter (Simplified) */}
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="max-w-full overflow-x-auto min-h-[400px]">
                <Table>
                    <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                        <TableRow>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Employee
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Department
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Leave Type
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Applied On
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Duration
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Days
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Status
                            </TableCell>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {filteredData.length > 0 ? (
                            filteredData.map((record) => (
                                <TableRow key={record.id} className="">
                                    <TableCell className="py-3">
                                        <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                            {record.employeeName}
                                        </span>
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {record.department}
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {record.leaveType}
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {record.appliedOn}
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        <div className="flex flex-col">
                                            <span>{record.startDate}</span>
                                            <span className="text-xs text-gray-400">to {record.endDate}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {record.days}
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
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell className="py-8 text-center text-gray-500">
                                    No records found matching your filters.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
