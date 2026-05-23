import Link from "next/link";
import Badge from "../ui/badge/Badge";

interface LeaveRequest {
    id: number;
    name: string;
    role: string;
    leaveType: string;
    duration: string;
    status: "Approved" | "Pending" | "Rejected";
    initials: string;
    avatarColor: string;
}

const tableData: LeaveRequest[] = [
    { id: 1, name: "Amara Okoro", role: "Software Engineer", leaveType: "Annual Leave", duration: "5 Days", status: "Approved", initials: "AO", avatarColor: "bg-brand-100 text-brand-600" },
    { id: 2, name: "Kwame Asante", role: "Product Manager", leaveType: "Sick Leave", duration: "2 Days", status: "Pending", initials: "KA", avatarColor: "bg-blue-100 text-blue-600" },
    { id: 3, name: "Fatima Zahra", role: "HR Specialist", leaveType: "Study Leave", duration: "10 Days", status: "Approved", initials: "FZ", avatarColor: "bg-purple-100 text-purple-600" },
    { id: 4, name: "Yuki Tanaka", role: "Finance Officer", leaveType: "Casual Leave", duration: "1 Day", status: "Rejected", initials: "YT", avatarColor: "bg-amber-100 text-amber-600" },
    { id: 5, name: "Carlos Mendez", role: "Operations Manager", leaveType: "Annual Leave", duration: "15 Days", status: "Pending", initials: "CM", avatarColor: "bg-teal-100 text-teal-600" },
];

export default function RecentLeaveRequests() {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between px-5 pt-5 pb-4 sm:px-6">
                <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Recent Leave Requests</h3>
                    <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">Latest 5 submissions</p>
                </div>
                <Link
                    href="/leave/approvals"
                    className="rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                    View all →
                </Link>
            </div>

            <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {tableData.map((request) => (
                    <div key={request.id} className="flex items-center justify-between px-5 py-3.5 transition hover:bg-gray-50/50 dark:hover:bg-white/[0.02] sm:px-6">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${request.avatarColor}`}>
                                {request.initials}
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{request.name}</p>
                                <p className="truncate text-xs text-gray-400 dark:text-gray-500">{request.leaveType} · {request.duration}</p>
                            </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                            <Badge
                                size="sm"
                                color={
                                    request.status === "Approved" ? "success"
                                    : request.status === "Pending" ? "warning"
                                    : "error"
                                }
                            >
                                {request.status}
                            </Badge>
                        </div>
                    </div>
                ))}
            </div>

            <div className="border-t border-gray-50 px-5 py-3 dark:border-gray-800 sm:px-6">
                <p className="text-center text-xs text-gray-400 dark:text-gray-500">
                    Showing 5 of 18 pending requests
                </p>
            </div>
        </div>
    );
}
