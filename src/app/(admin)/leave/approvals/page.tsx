import LeaveApprovalsTable from "@/components/hr/LeaveApprovalsTable";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Leave Approvals | HR Dashboard",
    description: "Review and approve employee leave requests",
};

export default function LeaveApprovalsPage() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Leave Approvals
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Manage and review pending leave requests from employees.
                </p>
            </div>

            <LeaveApprovalsTable />
        </div>
    );
}
