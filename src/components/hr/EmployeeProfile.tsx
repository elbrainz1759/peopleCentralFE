"use client";
import React from "react";
import Badge from "../ui/badge/Badge";

import { Employee } from "@/types/service.types";

export default function EmployeeProfile({ employee }: { employee: Employee }) {
    return (
        <div className="space-y-8">
            {/* Profile Header */}
            <div className="flex flex-col items-center p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="h-24 w-24 flex items-center justify-center rounded-full border-4 border-white dark:border-gray-800 shadow-lg mb-4 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-bold text-3xl uppercase">
                    {(employee.first_name?.[0] || "") + (employee.last_name?.[0] || "")}
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{employee.first_name} {employee.last_name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{employee.designation || 'N/A'}</p>
                <div className="mt-3">
                    <Badge
                        size="md"
                        color={
                            employee.status === "Active"
                                ? "success"
                                : employee.status === "On-boarding"
                                    ? "info"
                                    : employee.status === "Suspended"
                                        ? "error"
                                        : "warning"
                        }
                    >
                        {employee.status || "N/A"}
                    </Badge>
                </div>
            </div>

            {/* Details Sections */}
            <div className="grid grid-cols-1 gap-6">
                {/* Professional Info */}
                <div className="border border-gray-100 dark:border-gray-800 p-5 rounded-2xl">
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Professional Information</h4>
                    <div className="grid grid-cols-2 gap-y-4 text-sm">
                        <div className="text-gray-500">Staff ID</div>
                        <div className="font-medium text-gray-800 dark:text-gray-200">{String(employee.staff_id || employee.id)}</div>
                        <div className="text-gray-500">Department</div>
                        <div className="font-medium text-gray-800 dark:text-gray-200">{employee.department_name || employee.department}</div>
                        <div className="text-gray-500">Program</div>
                        <div className="font-medium text-gray-800 dark:text-gray-200">{employee.program_name || employee.program}</div>
                        <div className="text-gray-500">Joined Date</div>
                        <div className="font-medium text-gray-800 dark:text-gray-200">{employee.created_at ? new Date(employee.created_at).toLocaleDateString() : (employee.joinedDate || "N/A")}</div>
                        <div className="text-gray-500">Supervisor</div>
                        <div className="font-medium text-gray-800 dark:text-gray-200">{employee.supervisor_name || employee.supervisor || "N/A"}</div>
                    </div>
                </div>

                {/* Contract Info */}
                <div className="border border-gray-100 dark:border-gray-800 p-5 rounded-2xl">
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Contract Information</h4>
                    <div className="grid grid-cols-2 gap-y-4 text-sm">
                        <div className="text-gray-500">Start Date</div>
                        <div className="font-medium text-gray-800 dark:text-gray-200">{employee.contractStart}</div>
                        <div className="text-gray-500">End Date</div>
                        <div className="font-medium text-gray-800 dark:text-gray-200">{employee.contractEnd}</div>
                    </div>
                </div>

                {/* Contact info */}
                <div className="border border-gray-100 dark:border-gray-800 p-5 rounded-2xl">
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Contact Information</h4>
                    <div className="space-y-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-gray-500">Email Address</span>
                            <a href={`mailto:${employee.email}`} className="text-sm font-medium text-brand-500 hover:underline">{employee.email}</a>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-gray-500">Phone Number</span>
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">N/A</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* About */}
            <div className="border border-gray-100 dark:border-gray-800 p-5 rounded-2xl">
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">About</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed italic">
                    No additional information available for this employee profile.
                </p>
            </div>
        </div>
    );
}
