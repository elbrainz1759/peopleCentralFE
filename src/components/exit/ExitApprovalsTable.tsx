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
import { EyeIcon, CheckCircleIcon, CloseIcon, MoreDotIcon } from "@/icons";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Drawer } from "../ui/drawer/Drawer";

// Interface for Exit Request
interface ExitRequest {
    id: string;
    employeeName: string;
    department: string;
    supervisor: string;
    stage: "Supervisor" | "Operations" | "Finance" | "HR" | "Completed";
    submittedOn: string;
    photo: string;
    handoverStatus: "Pending" | "Accepted";
    assetsStatus: "Pending" | "Cleared";
    financeStatus: "Pending" | "Cleared";
}

// Mock Data
const exitRequests: ExitRequest[] = [
    {
        id: "EXT-001",
        employeeName: "Chinelo Obi",
        department: "Engineering",
        supervisor: "Amara Okoro",
        stage: "Supervisor",
        submittedOn: "2025-02-10",
        photo: "",
        handoverStatus: "Pending",
        assetsStatus: "Pending",
        financeStatus: "Pending",
    },
    {
        id: "EXT-002",
        employeeName: "Elena Rodriguez",
        department: "Marketing",
        supervisor: "Kwame Asante",
        stage: "Operations",
        submittedOn: "2025-02-05",
        photo: "",
        handoverStatus: "Accepted",
        assetsStatus: "Pending",
        financeStatus: "Pending",
    },
    {
        id: "EXT-003",
        employeeName: "Siddharth Nair",
        department: "Finance",
        supervisor: "Fatima Zahra",
        stage: "Finance",
        submittedOn: "2025-01-28",
        photo: "",
        handoverStatus: "Accepted",
        assetsStatus: "Cleared",
        financeStatus: "Pending",
    },
    {
        id: "EXT-004",
        employeeName: "Amina Yusuf",
        department: "HR",
        supervisor: "Carlos Mendez",
        stage: "HR",
        submittedOn: "2025-02-01",
        photo: "",
        handoverStatus: "Accepted",
        assetsStatus: "Cleared",
        financeStatus: "Cleared",
    },
];

export default function ExitApprovalsTable() {
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<ExitRequest | null>(null);
    const [isReviewOpen, setIsReviewOpen] = useState(false);

    const toggleDropdown = (id: string) => {
        setOpenDropdownId(openDropdownId === id ? null : id);
    };

    const closeDropdown = () => setOpenDropdownId(null);

    const handleReview = (request: ExitRequest) => {
        setSelectedRequest(request);
        setIsReviewOpen(true);
    };

    const handleApprove = (id: string) => {
        alert("Request " + id + " Approved for current stage");
        closeDropdown();
    };

    const handleReject = (id: string) => {
        alert("Request " + id + " Rejected");
        closeDropdown();
    };

    const getStageColor = (stage: string) => {
        switch (stage) {
            case "Supervisor": return "warning";
            case "Operations": return "info";
            case "Finance": return "success";
            case "HR": return "error";
            default: return "light";
        }
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            <div className="flex flex-col gap-2 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    Exit Clearance Workflow
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Monitor and approve employee exit clearance across departments.
                </p>
            </div>

            <div className="max-w-full overflow-x-auto min-h-[400px]">
                <Table>
                    <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                        <TableRow>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Employee
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Supervisor
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Submitted On
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Current Stage
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {exitRequests.map((request) => (
                            <TableRow key={request.id}>
                                <TableCell className="py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 flex items-center justify-center rounded-full shrink-0 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-bold text-xs uppercase">
                                            {request.employeeName.split(" ").map(n => n[0]).join("")}
                                        </div>
                                        <div>
                                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                {request.employeeName}
                                            </span>
                                            <span className="block text-xs text-gray-500 dark:text-gray-400">
                                                {request.department}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {request.supervisor}
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {request.submittedOn}
                                </TableCell>
                                <TableCell className="py-3">
                                    <Badge size="sm" color={getStageColor(request.stage)}>
                                        {request.stage}
                                    </Badge>
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    <div className="relative">
                                        <button
                                            onClick={() => toggleDropdown(request.id)}
                                            className="dropdown-toggle text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                            style={{ transform: 'rotate(90deg)' }}
                                        >
                                            <MoreDotIcon className="w-5 h-5" />
                                        </button>
                                        <Dropdown
                                            isOpen={openDropdownId === request.id}
                                            onClose={closeDropdown}
                                            className="w-40 right-0 mt-2 top-full"
                                        >
                                            <DropdownItem
                                                onItemClick={() => {
                                                    closeDropdown();
                                                    handleReview(request);
                                                }}
                                                className="flex gap-2 items-center"
                                            >
                                                <EyeIcon className="w-4 h-4" />
                                                Review Details
                                            </DropdownItem>
                                            <DropdownItem
                                                onItemClick={() => handleApprove(request.id)}
                                                className="flex gap-2 items-center text-green-600"
                                            >
                                                <CheckCircleIcon className="w-4 h-4" />
                                                Approve Stage
                                            </DropdownItem>
                                            <DropdownItem
                                                onItemClick={() => handleReject(request.id)}
                                                className="flex gap-2 items-center text-red-500"
                                            >
                                                <CloseIcon className="w-4 h-4" />
                                                Reject
                                            </DropdownItem>
                                        </Dropdown>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Drawer
                isOpen={isReviewOpen}
                onClose={() => setIsReviewOpen(false)}
                title="Exit Clearance Review"
            >
                <div className="p-6">
                    {selectedRequest && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                <div className="h-16 w-16 flex items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-bold text-xl uppercase">
                                    {selectedRequest.employeeName.split(" ").map(n => n[0]).join("")}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">{selectedRequest.employeeName}</h4>
                                    <p className="text-sm text-gray-500">{selectedRequest.department} • {selectedRequest.id}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h5 className="font-semibold text-gray-800 dark:text-white/90 border-b pb-2 border-gray-100 dark:border-gray-800">Clearance Status</h5>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-800 rounded-lg">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-400">Supervisor (Handover)</span>
                                        <Badge color={selectedRequest.handoverStatus === "Accepted" ? "success" : "warning"}>{selectedRequest.handoverStatus}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-800 rounded-lg">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-400">Operations (Assets)</span>
                                        <Badge color={selectedRequest.assetsStatus === "Cleared" ? "success" : "warning"}>{selectedRequest.assetsStatus}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-800 rounded-lg">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-400">Finance (Outstanding)</span>
                                        <Badge color={selectedRequest.financeStatus === "Cleared" ? "success" : "warning"}>{selectedRequest.financeStatus}</Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 flex gap-3">
                                <button
                                    onClick={() => { setIsReviewOpen(false); handleReject(selectedRequest.id); }}
                                    className="w-full px-4 py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-medium transition-colors"
                                >
                                    Reject Clearance
                                </button>
                                <button
                                    onClick={() => { setIsReviewOpen(false); handleApprove(selectedRequest.id); }}
                                    className="w-full px-4 py-2.5 rounded-lg bg-brand-500 text-white hover:bg-brand-600 font-medium transition-colors shadow-sm"
                                >
                                    Approve Current Stage
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </Drawer>
        </div>
    );
}
