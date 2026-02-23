import LeaveReportsTable from "@/components/hr/LeaveReportsTable";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Leave Reports | HR Dashboard",
    description: "View and export detailed leave reports",
};

export default function LeaveReportsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Leave Reports
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Analyze leave trends and export detailed reports.
                </p>
            </div>

            {/* Metrics removed */}

            <LeaveReportsTable />
        </div>
    );
}
