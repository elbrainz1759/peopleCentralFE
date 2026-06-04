"use client";
import EndOfServiceChecklist from "@/components/exit/EndOfServiceChecklist";

export default function EndOfServicePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">End of Service Checklist</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Complete and submit this form before your last working day. All sections must be signed off before your final paycheck is released.
                </p>
            </div>
            <EndOfServiceChecklist />
        </div>
    );
}
