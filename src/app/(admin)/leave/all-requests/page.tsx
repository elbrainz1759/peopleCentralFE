import AllLeavesTable from "@/components/hr/AllLeavesTable";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "All Leaves | People Central",
    description: "View-only status of every leave request",
};

export default function AllLeavesPage() {
    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    All Leaves
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    View the current status of every leave request company-wide. This page is view-only.
                </p>
            </div>

            <AllLeavesTable />
        </div>
    );
}
