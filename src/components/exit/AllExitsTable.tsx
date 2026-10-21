"use client";
import React, { useState, useEffect } from "react";
import { ExitService } from "@/services/exit.service";
import { toast } from "react-hot-toast";
import {
    Table, TableBody, TableCell, TableHeader, TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { getAuthUser, hasRole } from "@/utils/authUser";
import WorkflowBanner, { EXIT_WORKFLOW_STEPS } from "@/components/shared/WorkflowBanner";

interface ExitStatusRecord {
    key: string;
    employeeName: string;
    department: string;
    stage: string;
    dateCreated: string;
    sortDate: number;
}

function exitStageLabel(stage: string) {
    if (stage === "HR_Director") return "HR Lead";
    if (stage === "HR_Final") return "HR Final";
    return stage;
}

function exitStageColor(stage: string): "success" | "warning" | "info" | "error" | "light" {
    if (stage === "Completed") return "success";
    if (stage === "Operations" || stage === "Finance") return "info";
    return "warning";
}

// Read-only status view across every exit request, for HR/Finance/
// Operations/Superadmin — "what stage is this exit on", no approve/reject
// actions here.
export default function AllExitsTable() {
    const [records, setRecords] = useState<ExitStatusRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [authUser, setAuthUser] = useState<any>(null);

    useEffect(() => { setAuthUser(getAuthUser()); }, []);
    const isAuthorized = hasRole(authUser, ["HR", "HR Lead", "Superadmin", "Operation", "Finance"]);

    const fetchAll = async () => {
        setIsLoading(true);
        try {
            const res = await ExitService.getInstance().getAllExitInterviews(1, 200);
            const data = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
            const mapped: ExitStatusRecord[] = data.map((item: any) => ({
                key: `exit-${item.id}`,
                employeeName: item.staff_name
                    || `${item.staff_first_name ?? ""} ${item.staff_last_name ?? ""}`.trim()
                    || `Staff #${item.staff_id}`,
                department: item.department_name ?? "Unit",
                stage: exitStageLabel(item.stage ?? "N/A"),
                dateCreated: item.created_at ? new Date(item.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "N/A",
                sortDate: item.created_at ? new Date(item.created_at).getTime() : 0,
            }));
            setRecords(mapped.sort((a, b) => b.sortDate - a.sortDate));
        } catch {
            toast.error("Could not load exit status.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const filtered = records.filter((r) => {
        const q = searchTerm.toLowerCase();
        return !q || r.employeeName.toLowerCase().includes(q) || r.department.toLowerCase().includes(q);
    });

    if (authUser && !isAuthorized) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center dark:border-gray-800 dark:bg-white/[0.03]">
                <p className="text-lg font-semibold text-gray-800 dark:text-white/90">Access Restricted</p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    All Exits is only available to HR, HR Lead, Operations, Finance and Superadmin.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            <WorkflowBanner steps={EXIT_WORKFLOW_STEPS} />
            <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">All Exits</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">View-only — current stage of every exit request.</p>
                </div>
                <input
                    type="text"
                    placeholder="Search employee or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-56 rounded-lg border border-gray-300 bg-white px-4 py-2 text-theme-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:focus:border-brand-500"
                />
            </div>

            <div className="max-w-full overflow-x-auto min-h-[300px]">
                <Table>
                    <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                        <TableRow>
                            {["Employee", "Department", "Date", "Stage"].map(h => (
                                <TableCell key={h} isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">{h}</TableCell>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {isLoading ? (
                            <TableRow><TableCell colSpan={4} className="py-10 text-center text-gray-400">Loading...</TableCell></TableRow>
                        ) : filtered.length === 0 ? (
                            <TableRow><TableCell colSpan={4} className="py-10 text-center text-gray-400">No exit requests found.</TableCell></TableRow>
                        ) : filtered.map((r) => (
                            <TableRow key={r.key}>
                                <TableCell className="py-3">
                                    <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{r.employeeName}</span>
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">{r.department}</TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">{r.dateCreated}</TableCell>
                                <TableCell className="py-3">
                                    <Badge size="sm" color={exitStageColor(r.stage)}>{r.stage}</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
