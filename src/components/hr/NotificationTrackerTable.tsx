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
import Button from "../ui/button/Button";
import { SearchIcon, MoreDotIcon as MoreIcon } from "@/icons";

interface ContractRecord {
    id: string;
    staffId: string;
    staffName: string;
    position: string;
    contractStart: string;
    contractEnd: string;
}

const mockContracts: ContractRecord[] = [
    {
        id: "1",
        staffId: "EMP1001",
        staffName: "Amara Okoro",
        position: "Software Engineer",
        contractStart: "2024-03-01",
        contractEnd: "2026-03-01",
    },
    {
        id: "2",
        staffId: "EMP1002",
        staffName: "Kwame Asante",
        position: "HR Manager",
        contractStart: "2023-11-15",
        contractEnd: "2026-04-15",
    },
    {
        id: "3",
        staffId: "EMP1003",
        staffName: "Fatima Zahra",
        position: "Product Designer",
        contractStart: "2024-01-10",
        contractEnd: "2025-05-10", // Fast approaching
    },
    {
        id: "4",
        staffId: "EMP1004",
        staffName: "Siddharth Nair",
        position: "Financial Analyst",
        contractStart: "2024-02-20",
        contractEnd: "2026-02-20",
    },
    {
        id: "5",
        staffId: "EMP1005",
        staffName: "Carlos Mendez",
        position: "Junior Dev",
        contractStart: "2025-02-01",
        contractEnd: "2026-02-01",
    },
    {
        id: "6",
        staffId: "EMP1006",
        staffName: "Yuki Tanaka",
        position: "Marketing Specialist",
        contractStart: "2023-05-12",
        contractEnd: "2025-04-12", // Very close!
    }
];

export default function NotificationTrackerTable() {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredContracts = mockContracts.filter(record =>
        record.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.staffId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getDaysRemaining = (endDate: string) => {
        const today = new Date();
        const end = new Date(endDate);
        const diffTime = end.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const getStatus = (days: number) => {
        if (days < 0) return { label: "Expired", color: "error" as const };
        if (days <= 60) return { label: "Expiring Soon", color: "warning" as const };
        return { label: "Active", color: "success" as const };
    };

    const handleSendPrompt = (name: string) => {
        alert(`Prompt sent to ${name}'s supervisor and HR regarding contract renewal.`);
    };

    return (
        <div className="rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-sm overflow-hidden">
            {/* Table Header/Filter */}
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 dark:border-gray-800">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Employment Contracts</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Track and manage employee contract renewals</p>
                </div>
                <div className="relative w-full sm:w-72">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <SearchIcon size={18} />
                    </span>
                    <input
                        type="text"
                        placeholder="Search Staff ID or Name..."
                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="max-w-full overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50 dark:bg-gray-800/50">
                            <TableCell isHeader className="py-4 px-5 text-xs font-semibold uppercase tracking-wider text-gray-500">Staff ID</TableCell>
                            <TableCell isHeader className="py-4 px-5 text-xs font-semibold uppercase tracking-wider text-gray-500">Employee</TableCell>
                            <TableCell isHeader className="py-4 px-5 text-xs font-semibold uppercase tracking-wider text-gray-500">Position</TableCell>
                            <TableCell isHeader className="py-4 px-5 text-xs font-semibold uppercase tracking-wider text-gray-500">Contract Period</TableCell>
                            <TableCell isHeader className="py-4 px-5 text-xs font-semibold uppercase tracking-wider text-gray-500">Status</TableCell>
                            <TableCell isHeader className="py-4 px-5 text-xs font-semibold uppercase tracking-wider text-gray-500 text-right">Action</TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredContracts.map((record) => {
                            const days = getDaysRemaining(record.contractEnd);
                            const status = getStatus(days);
                            const isUrgent = days <= 60;

                            return (
                                <TableRow key={record.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors ${isUrgent ? 'bg-orange-50/30 dark:bg-orange-900/5' : ''}`}>
                                    <TableCell className="py-4 px-5">
                                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{record.staffId}</span>
                                    </TableCell>
                                    <TableCell className="py-4 px-5">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 flex items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-bold text-xs">
                                                {record.staffName.split(" ").map(n => n[0]).join("")}
                                            </div>
                                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{record.staffName}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 px-5 text-sm text-gray-600 dark:text-gray-400">{record.position}</TableCell>
                                    <TableCell className="py-4 px-5 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex flex-col gap-0.5">
                                            <span>{record.contractStart} to {record.contractEnd}</span>
                                            <span className={`text-[11px] font-medium ${isUrgent ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500'}`}>
                                                {days < 0 ? 'Expired' : `${days} days remaining`}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 px-5">
                                        <Badge size="sm" color={status.color}>
                                            {status.label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-4 px-5 text-right">
                                        <Button
                                            size="sm"
                                            variant={isUrgent ? "primary" : "outline"}
                                            onClick={() => handleSendPrompt(record.staffName)}
                                            className="text-xs"
                                        >
                                            Send Prompt
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
