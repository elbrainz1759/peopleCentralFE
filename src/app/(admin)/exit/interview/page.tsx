"use client";
import ExitRequestForm from "@/components/exit/ExitRequestForm";
import React from "react";

export default function ExitInterviewPage() {
    const handleClose = () => {
        // Handle close logic - maybe redirect to dashboard
        window.location.href = '/';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Exit Interview
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Submit your resignation and complete the exit interview process.
                </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-default dark:border-gray-800 dark:bg-boxdark">
                <ExitRequestForm onClose={handleClose} />
            </div>
        </div>
    );
}
