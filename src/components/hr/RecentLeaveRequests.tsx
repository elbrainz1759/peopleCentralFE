import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";

// Define the TypeScript interface for the table rows
interface LeaveRequest {
    id: number;
    name: string;
    role: string;
    leaveType: string;
    duration: string;
    status: "Approved" | "Pending" | "Rejected";
}

// Define the table data using the interface
const tableData: LeaveRequest[] = [
    {
        id: 1,
        name: "Amara Okoro",
        role: "Software Engineer",
        leaveType: "Annual Leave",
        duration: "5 Days",
        status: "Approved",
    },
    {
        id: 2,
        name: "Kwame Asante",
        role: "Product Manager",
        leaveType: "Sick Leave",
        duration: "2 Days",
        status: "Pending",
    },
    {
        id: 3,
        name: "Fatima Zahra",
        role: "HR Specialist",
        leaveType: "Study Leave",
        duration: "10 Days",
        status: "Approved",
    },
    {
        id: 4,
        name: "Yuki Tanaka",
        role: "Finance Officer",
        leaveType: "Casual Leave",
        duration: "1 Day",
        status: "Rejected",
    },
    {
        id: 5,
        name: "Carlos Mendez",
        role: "Operations Manager",
        leaveType: "Annual Leave",
        duration: "15 Days",
        status: "Pending",
    },
];

export default function RecentLeaveRequests() {
    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Recent Leave Requests
                    </h3>
                </div>

                <div className="flex items-center gap-3">
                    <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
                        Filter
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
                        See all
                    </button>
                </div>
            </div>
            <div className="max-w-full overflow-x-auto">
                <Table>
                    {/* Table Header */}
                    <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                        <TableRow>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                S/N
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Employee
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Leave Type
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Duration
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Status
                            </TableCell>
                        </TableRow>
                    </TableHeader>

                    {/* Table Body */}

                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {tableData.map((request, index) => (
                            <TableRow key={request.id} className="">
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {index + 1}
                                </TableCell>
                                <TableCell className="py-3">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                {request.name}
                                            </p>
                                            <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                                                {request.role}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {request.leaveType}
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {request.duration}
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    <Badge
                                        size="sm"
                                        color={
                                            request.status === "Approved"
                                                ? "success"
                                                : request.status === "Pending"
                                                    ? "warning"
                                                    : "error"
                                        }
                                    >
                                        {request.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
