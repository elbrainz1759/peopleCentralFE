import ExitInterviewForm from "@/components/exit/ExitInterviewForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Exit Interview | HR Dashboard",
    description: "Complete your exit interview",
};

export default function ExitInterviewPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2 print:hidden">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Exit Interview
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Share your feedback and experience to help us improve.
                </p>
            </div>

            <ExitInterviewForm />
        </div>
    );
}
