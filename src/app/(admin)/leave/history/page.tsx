import LeaveHistoryTable from "@/components/hr/LeaveHistoryTable";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "My Leave History | Mercy Corps HR",
    description: "View past and current leave requests",
};

export default function LeaveHistoryPage() {
    return (
        <div>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-title-md2 font-bold text-black dark:text-white">
                    My Leaves
                </h2>
                <div className="flex flex-wrap items-center gap-3">
                    <Link
                        href="/leave/my-balance"
                        className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        <svg className="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        My Leave Balance
                    </Link>
                    <Link
                        href="/leave/apply"
                        className="flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Apply for Leave
                    </Link>
                    <nav>
                        <ol className="flex items-center gap-2">
                            <li><a className="font-medium" href="/">Dashboard /</a></li>
                            <li className="font-medium text-brand-500">History</li>
                        </ol>
                    </nav>
                </div>
            </div>

            <LeaveHistoryTable />
        </div>
    );
}
