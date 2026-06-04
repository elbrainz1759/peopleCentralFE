"use client";
import ExitInterviewForm from "@/components/exit/ExitInterviewForm";

export default function ExitInterviewPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Exit Interview</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Please complete this form honestly. Your feedback is confidential and helps us improve.
                </p>
            </div>
            <ExitInterviewForm />
        </div>
    );
}
