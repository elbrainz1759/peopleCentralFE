"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { leaveService } from "@/services/leave.service";
import { ExitService } from "@/services/exit.service";
import { api } from "@/lib/api";
import { DownloadIcon } from "@/icons";
import Badge from "@/components/ui/badge/Badge";
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { addPdfLogo } from "@/utils/pdfLogo";

const exitServiceInstance = ExitService.getInstance();
const leaveServiceInstance = leaveService.getInstance();

// ── Types ────────────────────────────────────────────────────────────────────

interface LeaveRow {
    id: number;
    employeeName: string;
    staffId: string | number;
    department: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    duration: string;
    status: string;
    appliedOn: string;
    raw: any;
}

interface ExitRow {
    id: number;
    uniqueId: string;
    employeeName: string;
    staffId: string | number;
    department: string;
    program: string;
    location: string;
    stage: string;
    status: string;
    exitDate: string;
    submittedOn: string;
    raw: any;
}

interface FilterState {
    dateFrom: string;
    dateTo: string;
    programId: string;
    locationId: string;
    departmentId: string;
    status: string;
    employeeSearch: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function leaveStatusColor(status: string): "success" | "warning" | "info" | "error" | "light" {
    if (status === "Approved") return "success";
    if (status === "Pending") return "warning";
    if (status === "Reviewed") return "info";
    if (status === "Rejected") return "error";
    return "light";
}

function exitStageColor(stage: string): "success" | "warning" | "info" | "error" | "light" {
    if (stage === "Completed") return "success";
    if (stage === "HR") return "info";
    if (stage === "Employee") return "warning";
    return "light";
}

function exportCSV(headers: string[], rows: (string | number)[][], filename: string) {
    const lines = [
        headers.join(","),
        ...rows.map(r => r.map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className={`rounded-xl border p-4 bg-white dark:bg-gray-900 ${color}`}>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState<"leave" | "exit">("leave");

    const [leaveRows, setLeaveRows] = useState<LeaveRow[]>([]);
    const [exitRows, setExitRows] = useState<ExitRow[]>([]);

    const [programs, setPrograms] = useState<any[]>([]);
    const [locations, setLocations] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const [filters, setFilters] = useState<FilterState>({
        dateFrom: "",
        dateTo: "",
        programId: "",
        locationId: "",
        departmentId: "",
        status: "",
        employeeSearch: "",
    });

    const setFilter = (key: keyof FilterState, value: string) =>
        setFilters(prev => ({ ...prev, [key]: value }));

    // ── Fetch reference data ─────────────────────────────────────────────────
    useEffect(() => {
        Promise.all([
            api.get<any>("/programs").catch(() => ({ data: [] })),
            api.get<any>("/locations").catch(() => ({ data: [] })),
            api.get<any>("/departments").catch(() => ({ data: [] })),
        ]).then(([p, l, d]) => {
            setPrograms(p?.data || p || []);
            setLocations(l?.data || l || []);
            setDepartments(d?.data || d || []);
        });
    }, []);

    // ── Fetch report data ────────────────────────────────────────────────────
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            if (activeTab === "leave") {
                const res = await leaveServiceInstance.getAllLeaves(1, 500);
                const rows: LeaveRow[] = (res?.data || []).map((item: any) => ({
                    id: item.id,
                    employeeName: item.employee_name ?? item.staff?.employee_name ?? "—",
                    staffId: item.staff_id ?? item.staffId ?? "—",
                    department: item.department_name ?? item.staff?.employment_detail?.department?.name ?? "—",
                    leaveType: item.leave_type_name ?? item.leaveType?.name ?? "—",
                    startDate: item.start_date ? new Date(item.start_date).toLocaleDateString() : "—",
                    endDate: item.end_date ? new Date(item.end_date).toLocaleDateString() : "—",
                    duration: item.total_hours ? `${item.total_hours} hrs` : "—",
                    status: item.status ?? "Pending",
                    appliedOn: item.created_at ? new Date(item.created_at).toLocaleDateString() : "—",
                    raw: item,
                }));
                setLeaveRows(rows);
            } else {
                const res = await exitServiceInstance.getAllExitInterviews(1, 500);
                const list: any[] = res?.data || res?.interviews || res || [];
                const rows: ExitRow[] = list.map((item: any) => ({
                    id: item.id,
                    uniqueId: item.unique_id ?? item.uniqueId ?? item.id,
                    employeeName: item.employee_name ?? item.staff?.employee_name ?? "—",
                    staffId: item.staff_id ?? item.staffId ?? "—",
                    department: item.department_name ?? item.department ?? "—",
                    program: item.program_name ?? item.program ?? "—",
                    location: item.location_name ?? item.location ?? "—",
                    stage: item.stage ?? "Employee",
                    status: item.status ?? "Pending",
                    exitDate: item.resignation_date ?? item.resignationDate
                        ? new Date(item.resignation_date ?? item.resignationDate).toLocaleDateString()
                        : "—",
                    submittedOn: item.created_at ? new Date(item.created_at).toLocaleDateString() : "—",
                    raw: item,
                }));
                setExitRows(rows);
            }
        } catch {
            toast.error("Failed to load report data.");
        } finally {
            setIsLoading(false);
        }
    }, [activeTab]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ── Client-side filtering ─────────────────────────────────────────────────
    const filteredLeave = useMemo(() => {
        return leaveRows.filter(r => {
            if (filters.employeeSearch && !r.employeeName.toLowerCase().includes(filters.employeeSearch.toLowerCase())) return false;
            if (filters.status && r.status !== filters.status) return false;
            if (filters.departmentId) {
                const deptName = departments.find(d => String(d.unique_id || d.id) === filters.departmentId)?.name ?? "";
                if (deptName && !r.department.toLowerCase().includes(deptName.toLowerCase())) return false;
            }
            if (filters.dateFrom && r.raw.created_at && new Date(r.raw.created_at) < new Date(filters.dateFrom)) return false;
            if (filters.dateTo && r.raw.created_at && new Date(r.raw.created_at) > new Date(filters.dateTo + "T23:59:59")) return false;
            return true;
        });
    }, [leaveRows, filters, departments]);

    const filteredExit = useMemo(() => {
        return exitRows.filter(r => {
            if (filters.employeeSearch && !r.employeeName.toLowerCase().includes(filters.employeeSearch.toLowerCase())) return false;
            if (filters.status && r.status !== filters.status) return false;
            if (filters.programId) {
                const progName = programs.find(p => String(p.unique_id || p.id) === filters.programId)?.name ?? "";
                if (progName && !r.program.toLowerCase().includes(progName.toLowerCase())) return false;
            }
            if (filters.locationId) {
                const locName = locations.find(l => String(l.unique_id || l.id) === filters.locationId)?.name ?? "";
                if (locName && !r.location.toLowerCase().includes(locName.toLowerCase())) return false;
            }
            if (filters.departmentId) {
                const deptName = departments.find(d => String(d.unique_id || d.id) === filters.departmentId)?.name ?? "";
                if (deptName && !r.department.toLowerCase().includes(deptName.toLowerCase())) return false;
            }
            if (filters.dateFrom && r.raw.created_at && new Date(r.raw.created_at) < new Date(filters.dateFrom)) return false;
            if (filters.dateTo && r.raw.created_at && new Date(r.raw.created_at) > new Date(filters.dateTo + "T23:59:59")) return false;
            return true;
        });
    }, [exitRows, filters, programs, locations, departments]);

    // ── Summary stats ─────────────────────────────────────────────────────────
    const leaveStats = useMemo(() => ({
        total: filteredLeave.length,
        approved: filteredLeave.filter(r => r.status === "Approved").length,
        pending: filteredLeave.filter(r => r.status === "Pending" || r.status === "Reviewed").length,
        rejected: filteredLeave.filter(r => r.status === "Rejected").length,
    }), [filteredLeave]);

    const exitStats = useMemo(() => ({
        total: filteredExit.length,
        completed: filteredExit.filter(r => r.stage === "Completed").length,
        pending: filteredExit.filter(r => r.stage !== "Completed").length,
        hr: filteredExit.filter(r => r.stage === "HR").length,
    }), [filteredExit]);

    // ── Export CSV ────────────────────────────────────────────────────────────
    const handleExportCSV = () => {
        if (activeTab === "leave") {
            exportCSV(
                ["Employee", "Staff ID", "Department", "Leave Type", "Start Date", "End Date", "Duration", "Status", "Applied On"],
                filteredLeave.map(r => [r.employeeName, r.staffId, r.department, r.leaveType, r.startDate, r.endDate, r.duration, r.status, r.appliedOn]),
                `Leave_Report_${new Date().toISOString().slice(0, 10)}.csv`
            );
        } else {
            exportCSV(
                ["Employee", "Staff ID", "Department", "Program", "Location", "Stage", "Status", "Exit Date", "Submitted On"],
                filteredExit.map(r => [r.employeeName, r.staffId, r.department, r.program, r.location, r.stage, r.status, r.exitDate, r.submittedOn]),
                `Exit_Report_${new Date().toISOString().slice(0, 10)}.csv`
            );
        }
    };

    // ── Export PDF ────────────────────────────────────────────────────────────
    const handleExportPDF = () => {
        setIsExporting(true);
        try {
            const doc = new jsPDF({ orientation: "landscape" });
            addPdfLogo(doc);
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text(`${activeTab === "leave" ? "Leave" : "Exit"} Report — Mercy Corps`, 148, 16, { align: "center" });
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.text(`Generated: ${new Date().toLocaleString()}`, 148, 22, { align: "center" });

            if (activeTab === "leave") {
                autoTable(doc, {
                    startY: 28,
                    head: [["Employee", "Staff ID", "Department", "Leave Type", "Start", "End", "Duration", "Status", "Applied"]],
                    body: filteredLeave.map(r => [r.employeeName, r.staffId, r.department, r.leaveType, r.startDate, r.endDate, r.duration, r.status, r.appliedOn]),
                    theme: "grid",
                    headStyles: { fillColor: [220, 53, 69], textColor: 255, fontStyle: "bold", fontSize: 8 },
                    styles: { fontSize: 7.5, cellPadding: 2 },
                });
            } else {
                autoTable(doc, {
                    startY: 28,
                    head: [["Employee", "Staff ID", "Department", "Program", "Location", "Stage", "Status", "Exit Date", "Submitted"]],
                    body: filteredExit.map(r => [r.employeeName, r.staffId, r.department, r.program, r.location, r.stage, r.status, r.exitDate, r.submittedOn]),
                    theme: "grid",
                    headStyles: { fillColor: [88, 28, 135], textColor: 255, fontStyle: "bold", fontSize: 8 },
                    styles: { fontSize: 7.5, cellPadding: 2 },
                });
            }

            const ph = doc.internal.pageSize.height;
            doc.setFontSize(7);
            doc.setTextColor(150);
            doc.text("Mercy Corps — People Central | Confidential", 148, ph - 8, { align: "center" });
            doc.save(`${activeTab === "leave" ? "Leave" : "Exit"}_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
            toast.success("PDF downloaded.");
        } catch {
            toast.error("PDF generation failed.");
        } finally {
            setIsExporting(false);
        }
    };

    const resetFilters = () => setFilters({ dateFrom: "", dateTo: "", programId: "", locationId: "", departmentId: "", status: "", employeeSearch: "" });

    const selectClass = "w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500";
    const inputClass = "w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500";

    const leaveStatusOptions = ["Pending", "Reviewed", "Approved", "Rejected"];
    const exitStatusOptions = ["Pending", "Approved", "Rejected", "Completed"];

    return (
        <div className="space-y-6">
            {/* ── Tabs ── */}
            <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800">
                {(["leave", "exit"] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); resetFilters(); }}
                        className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                            activeTab === tab
                                ? "border-brand-500 text-brand-600 dark:text-brand-400"
                                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        }`}
                    >
                        {tab === "leave" ? "Leave Reports" : "Exit Reports"}
                    </button>
                ))}
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {activeTab === "leave" ? (
                    <>
                        <StatCard label="Total Requests" value={leaveStats.total} color="border-gray-200 dark:border-gray-700" />
                        <StatCard label="Approved" value={leaveStats.approved} color="border-green-200 dark:border-green-900" />
                        <StatCard label="Pending / In Review" value={leaveStats.pending} color="border-yellow-200 dark:border-yellow-900" />
                        <StatCard label="Rejected" value={leaveStats.rejected} color="border-red-200 dark:border-red-900" />
                    </>
                ) : (
                    <>
                        <StatCard label="Total Exits" value={exitStats.total} color="border-gray-200 dark:border-gray-700" />
                        <StatCard label="Completed" value={exitStats.completed} color="border-green-200 dark:border-green-900" />
                        <StatCard label="In Progress" value={exitStats.pending} color="border-yellow-200 dark:border-yellow-900" />
                        <StatCard label="At HR Stage" value={exitStats.hr} color="border-purple-200 dark:border-purple-900" />
                    </>
                )}
            </div>

            {/* ── Filters ── */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 space-y-3">
                <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Filters</p>
                    <button onClick={resetFilters} className="text-xs text-brand-500 hover:underline">Clear all</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
                    {/* Employee search */}
                    <input
                        className={inputClass}
                        placeholder="Search employee..."
                        value={filters.employeeSearch}
                        onChange={e => setFilter("employeeSearch", e.target.value)}
                    />

                    {/* Date From */}
                    <input
                        type="date"
                        className={inputClass}
                        value={filters.dateFrom}
                        onChange={e => setFilter("dateFrom", e.target.value)}
                        title="Date from"
                    />

                    {/* Date To */}
                    <input
                        type="date"
                        className={inputClass}
                        value={filters.dateTo}
                        onChange={e => setFilter("dateTo", e.target.value)}
                        title="Date to"
                    />

                    {/* Program (exit only) */}
                    {activeTab === "exit" && (
                        <select className={selectClass} value={filters.programId} onChange={e => setFilter("programId", e.target.value)}>
                            <option value="">All Programs</option>
                            {programs.map(p => <option key={p.unique_id || p.id} value={p.unique_id || p.id}>{p.name}</option>)}
                        </select>
                    )}

                    {/* Location / Office */}
                    {activeTab === "exit" && (
                        <select className={selectClass} value={filters.locationId} onChange={e => setFilter("locationId", e.target.value)}>
                            <option value="">All Offices</option>
                            {locations.map(l => <option key={l.unique_id || l.id} value={l.unique_id || l.id}>{l.name}</option>)}
                        </select>
                    )}

                    {/* Department */}
                    <select className={selectClass} value={filters.departmentId} onChange={e => setFilter("departmentId", e.target.value)}>
                        <option value="">All Departments</option>
                        {departments.map(d => <option key={d.unique_id || d.id} value={d.unique_id || d.id}>{d.name}</option>)}
                    </select>

                    {/* Status */}
                    <select className={selectClass} value={filters.status} onChange={e => setFilter("status", e.target.value)}>
                        <option value="">All Statuses</option>
                        {(activeTab === "leave" ? leaveStatusOptions : exitStatusOptions).map(s => (
                            <option key={s} value={s}>{s === "Reviewed" ? "Awaiting HR" : s}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* ── Table ── */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {activeTab === "leave" ? filteredLeave.length : filteredExit.length} record{(activeTab === "leave" ? filteredLeave.length : filteredExit.length) !== 1 ? "s" : ""}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <DownloadIcon className="w-3.5 h-3.5" />
                            CSV
                        </button>
                        <button
                            onClick={handleExportPDF}
                            disabled={isExporting}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                            <DownloadIcon className="w-3.5 h-3.5" />
                            {isExporting ? "Generating..." : "PDF"}
                        </button>
                        <button
                            onClick={fetchData}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-16 text-gray-400 text-sm">Loading report data...</div>
                ) : activeTab === "leave" ? (
                    <div className="overflow-x-auto">
                        {filteredLeave.length === 0 ? (
                            <div className="py-16 text-center text-sm text-gray-400">No records match the selected filters.</div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                    <tr>
                                        {["Employee", "Staff ID", "Department", "Leave Type", "Start Date", "End Date", "Duration", "Status", "Applied On"].map(h => (
                                            <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {filteredLeave.map(row => (
                                        <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                            <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">{row.employeeName}</td>
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{row.staffId}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.department}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.leaveType}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{row.startDate}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{row.endDate}</td>
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{row.duration}</td>
                                            <td className="px-4 py-3">
                                                <Badge color={leaveStatusColor(row.status)} size="sm">
                                                    {row.status === "Reviewed" ? "Awaiting HR" : row.status}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{row.appliedOn}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        {filteredExit.length === 0 ? (
                            <div className="py-16 text-center text-sm text-gray-400">No records match the selected filters.</div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                    <tr>
                                        {["Employee", "Staff ID", "Department", "Program", "Office", "Stage", "Status", "Exit Date", "Submitted"].map(h => (
                                            <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {filteredExit.map(row => (
                                        <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                            <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">{row.employeeName}</td>
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{row.staffId}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.department}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.program}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.location}</td>
                                            <td className="px-4 py-3">
                                                <Badge color={exitStageColor(row.stage)} size="sm">{row.stage}</Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge color={row.status === "Completed" || row.status === "Approved" ? "success" : row.status === "Rejected" ? "error" : "warning"} size="sm">
                                                    {row.status}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{row.exitDate}</td>
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{row.submittedOn}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
