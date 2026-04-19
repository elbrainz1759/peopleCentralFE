import ChecklistItemsManager from "@/components/exit/ChecklistItemsManager";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Exit Checklist | HR Dashboard",
    description: "Manage department-specific exit checklist items",
};

export default function ExitChecklistPage() {
    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Exit Checklist Management
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Add and manage checklist items per department. These items will appear during exit clearance approvals.
                </p>
            </div>

            <ChecklistItemsManager />
        </div>
    );
}
