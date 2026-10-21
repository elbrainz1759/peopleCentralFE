import PendingLeaveApprovalsTable from "@/components/hr/PendingLeaveApprovalsTable";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pending Approvals | People Central",
    description: "Leave requests waiting on your approval as a supervisor",
};

export default function PendingLeaveApprovalsPage() {
    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Pending Approvals
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Leave requests from your direct reports waiting on your approval.
                </p>
            </div>

            <PendingLeaveApprovalsTable />
        </div>
    );
}
