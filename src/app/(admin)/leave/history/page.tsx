import LeaveHistoryTable from "@/components/hr/LeaveHistoryTable";
import { Metadata } from "next";
import React from "react";

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
                <nav>
                    <ol className="flex items-center gap-2">
                        <li>
                            <a className="font-medium" href="/">
                                Dashboard /
                            </a>
                        </li>
                        <li className="font-medium text-brand-500">History</li>
                    </ol>
                </nav>
            </div>

            <LeaveHistoryTable />
        </div>
    );
}
