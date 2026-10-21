"use client";
import React from "react";

export interface WorkflowStep {
    label: string;
    status: string;
    color: string; // tailwind bg-* class
}

export const LEAVE_WORKFLOW_STEPS: WorkflowStep[] = [
    { label: "Employee Submits", status: "Submitted", color: "bg-brand-500" },
    { label: "Line Manager Approves", status: "Awaiting HR", color: "bg-blue-500" },
    { label: "HR Finalises", status: "Approved", color: "bg-green-500" },
];

export const EXIT_WORKFLOW_STEPS: WorkflowStep[] = [
    { label: "Employee Submits", status: "Submitted", color: "bg-brand-500" },
    { label: "Supervisor Clears", status: "Handover", color: "bg-amber-500" },
    { label: "Operations Clears", status: "Assets", color: "bg-blue-500" },
    { label: "Finance Clears", status: "Obligations", color: "bg-blue-500" },
    { label: "HR Reviews", status: "Final Review", color: "bg-purple-500" },
    { label: "HR Lead Finalizes", status: "Closed", color: "bg-green-500" },
];

// Shared "where does this request stand" banner used across every leave and
// exit page (apply/history, pending approvals, final approvals, department
// approvals, all-requests) so the stage context is visible no matter which
// page a viewer lands on, not just the admin queue pages.
export default function WorkflowBanner({ steps }: { steps: WorkflowStep[] }) {
    return (
        <div className="mb-6 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-white/[0.02] p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Approval Workflow</p>
            <div className="flex flex-wrap items-center gap-y-3">
                {steps.map((step, idx, arr) => (
                    <React.Fragment key={step.label}>
                        <div className="flex items-center gap-2 pr-3">
                            <div className={`flex h-7 w-7 items-center justify-center rounded-full ${step.color} text-white text-xs font-bold flex-shrink-0`}>
                                {idx + 1}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-800 dark:text-white whitespace-nowrap">{step.label}</p>
                                <p className="text-xs text-gray-400 whitespace-nowrap">{step.status}</p>
                            </div>
                        </div>
                        {idx < arr.length - 1 && (
                            <div className="w-6 h-0.5 bg-gray-200 dark:bg-gray-700 flex-shrink-0 mr-3" />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}
