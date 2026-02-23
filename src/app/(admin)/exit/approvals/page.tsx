import ExitApprovalsTable from "@/components/exit/ExitApprovalsTable";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Exit Approvals | HR Dashboard",
    description: "Review and manage employee exit clearance process",
};

export default function ExitApprovalsPage() {
    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Exit Approvals
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Review and approve exit clearance requests across all stages.
                </p>
            </div>

            <ExitApprovalsTable />
        </div>
    );
}
