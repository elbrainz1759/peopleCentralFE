import PendingExitApprovalsTable from "@/components/exit/PendingExitApprovalsTable";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pending Exit Approvals | People Central",
    description: "Exit requests waiting on your approval as a supervisor",
};

export default function PendingExitApprovalsPage() {
    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Pending Exit Approvals
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Exit requests from your direct reports waiting on your approval.
                </p>
            </div>

            <PendingExitApprovalsTable />
        </div>
    );
}
