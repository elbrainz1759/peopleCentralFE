import ReportsPage from "@/components/reports/ReportsPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Reports | People Central",
    description: "Generate leave and exit reports by program, employee, date range, and office.",
};

export default function Reports() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Reports</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Generate and export leave and exit reports filtered by program, office, department, employee, and date range.
                </p>
            </div>
            <ReportsPage />
        </div>
    );
}
