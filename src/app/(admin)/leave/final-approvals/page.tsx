import FinalLeaveApprovalsTable from "@/components/hr/FinalLeaveApprovalsTable";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Final Approvals | People Central",
    description: "Leave requests awaiting HR final sign-off",
};

export default function FinalLeaveApprovalsPage() {
    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Final Approvals
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Leave requests cleared by the line manager, awaiting HR&apos;s final sign-off.
                </p>
            </div>

            <FinalLeaveApprovalsTable />
        </div>
    );
}
