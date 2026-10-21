import AllExitsTable from "@/components/exit/AllExitsTable";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "All Exits | People Central",
    description: "View-only status of every exit request",
};

export default function AllExitsPage() {
    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    All Exits
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    View the current stage of every exit request company-wide. This page is view-only.
                </p>
            </div>

            <AllExitsTable />
        </div>
    );
}
