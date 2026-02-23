import ExitChecklistForm from "@/components/exit/ExitChecklistForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Exit Checklist | HR Dashboard",
    description: "Complete your exit checklist and handover process",
};

export default function ExitChecklistPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Exit Checklist
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Please complete the checklist below to initiate your exit clearance process.
                </p>
            </div>

            <ExitChecklistForm />
        </div>
    );
}
