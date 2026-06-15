import LeaveHistoryTable from "@/components/hr/LeaveHistoryTable";
import { Metadata } from "next";
import React from "react";
import Link from "next/link";

export const metadata: Metadata = {
    title: "My Leave History | Mercy Corps HR",
    description: "View past and current leave requests",
};

export default function LeaveHistoryPage() {
    return (
        <div>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-title-md2 font-bold text-black dark:text-white">
                    My Leaves
                </h2>
                <div className="flex items-center gap-4">
                    <Link
                        href="/leave/apply"
                        className="flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Apply for Leave
                    </Link>
                    <nav>
                        <ol className="flex items-center gap-2">
                            <li><a className="font-medium" href="/">Dashboard /</a></li>
                            <li className="font-medium text-brand-500">History</li>
                        </ol>
                    </nav>
                </div>
            </div>

            <LeaveHistoryTable />
        </div>
    );
}
