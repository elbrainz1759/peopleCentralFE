"use client";
import React, { useState, useEffect, useCallback } from "react";
import { leaveBalanceService } from "@/services/leave-balance.service";
import { userService } from "@/services/user.service";
import { toast } from "react-hot-toast";
import LeaveBalanceBulkUpload from "@/components/leave/LeaveBalanceBulkUpload";
import { Drawer } from "@/components/ui/drawer/Drawer";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { TrashBinIcon, MoreDotIcon, SearchIcon } from "@/icons";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";

const PAGE_LIMIT = 10;
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

// Flattened row: API returns one staff per record with a nested balances[] array.
interface FlatLeaveBalance {
  id?: number;
  staff_id: string | number;
  full_name?: string;
  leave_type_id: string | number;
  leave_type_name?: string;
  total_hours: number;
  used_hours: number;
  remaining_hours: number;
}

interface AccrualEntry {
  id?: number;
  leave_type_id?: number;
  leave_type_name?: string;
  staff_id?: number;
  hours_accrued?: number | string;
  accrual_date?: string;
  run_date?: string;
  created_at?: string;
  year?: number;
  notes?: string;
}

export default function LeaveBalanceManagement() {
  // Balances state
  const [balances, setBalances] = useState<FlatLeaveBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [year, setYear] = useState<number>(CURRENT_YEAR);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Accrual log state
  const [accrualLog, setAccrualLog] = useState<AccrualEntry[]>([]);
  const [accrualLoading, setAccrualLoading] = useState(false);
  const [accrualYear, setAccrualYear] = useState<number>(CURRENT_YEAR);
  const [accrualLeaveTypeId, setAccrualLeaveTypeId] = useState<string>("");
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);

  // Active tab
  const [activeTab, setActiveTab] = useState<"balances" | "accrual">("balances");

  // ── Fetch leave types for accrual filter ───────────────────
  useEffect(() => {
    userService.getAllLeaveTypes(1, 100)
      .then((r) => setLeaveTypes(r?.data ?? []))
      .catch(() => {});
  }, []);

  // ── Balances ───────────────────────────────────────────────
  const fetchBalances = useCallback(async (page = 1, searchVal = search, yearVal = year) => {
    setIsLoading(true);
    try {
      const response = await leaveBalanceService.getAllLeaveBalances(page, PAGE_LIMIT, yearVal, searchVal || undefined);
      const raw = response?.data ?? (Array.isArray(response) ? response : []);
      // Each record is a staff member holding a nested balances[] array — flatten
      // into one row per (staff × leave type) for the table.
      const flat: FlatLeaveBalance[] = (Array.isArray(raw) ? raw : []).flatMap((staff: any) =>
        (Array.isArray(staff.balances) ? staff.balances : []).map((b: any) => ({
          id: b.id,
          staff_id: staff.staff_id,
          full_name: staff.full_name,
          leave_type_id: b.leave_type_id,
          leave_type_name: b.leave_type_name,
          total_hours: Number(b.total_hours) || 0,
          used_hours: Number(b.used_hours) || 0,
          remaining_hours: Number(b.remaining_hours) || 0,
        }))
      );
      setBalances(flat);
      const meta = response?.meta;
      setTotalRecords(meta?.total ?? raw.length);
      setTotalPages(meta?.last_page ?? meta?.totalPages ?? 1);
      setCurrentPage(page);
    } catch {
      toast.error("Failed to load leave balances");
    } finally {
      setIsLoading(false);
    }
  }, [search, year]);

  useEffect(() => { fetchBalances(1); }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchBalances(1, search, year), 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleYearChange = (y: number) => { setYear(y); fetchBalances(1, search, y); };

  // ── Accrual log ────────────────────────────────────────────
  const fetchAccrualLog = useCallback(async (ltId = accrualLeaveTypeId, yr = accrualYear) => {
    setAccrualLoading(true);
    try {
      const response = await leaveBalanceService.getAccrualLog(
        ltId ? Number(ltId) : undefined,
        yr
      );
      const raw = response?.data ?? (Array.isArray(response) ? response : []);
      setAccrualLog(Array.isArray(raw) ? raw : []);
    } catch {
      toast.error("Failed to load accrual log");
    } finally {
      setAccrualLoading(false);
    }
  }, [accrualLeaveTypeId, accrualYear]);

  useEffect(() => {
    if (activeTab === "accrual") fetchAccrualLog();
  }, [activeTab]);

  const handleAccrualYearChange = (y: number) => { setAccrualYear(y); fetchAccrualLog(accrualLeaveTypeId, y); };
  const handleAccrualTypeChange = (v: string) => { setAccrualLeaveTypeId(v); fetchAccrualLog(v, accrualYear); };

  // ── Helpers ────────────────────────────────────────────────
  const toggleDropdown = (id: string) => setOpenDropdownId(openDropdownId === id ? null : id);
  const closeDropdown = () => setOpenDropdownId(null);
  const handleDelete = (id: number) => { setDeleteId(id); setDeleteModalOpen(true); };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await leaveBalanceService.deleteLeaveBalance(deleteId);
      toast.success("Leave balance deleted successfully");
      fetchBalances(currentPage);
    } catch {
      toast.error("Failed to delete leave balance");
    } finally {
      setDeleteModalOpen(false);
      setDeleteId(null);
    }
  };

  const statusProps = (used: number, total: number) => {
    const pct = total > 0 ? (used / total) * 100 : 0;
    if (pct >= 80) return { color: "error" as const, label: "Low" };
    if (pct >= 60) return { color: "warning" as const, label: "Medium" };
    return { color: "success" as const, label: "Good" };
  };

  const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * PAGE_LIMIT + 1;
  const endRecord = Math.min(currentPage * PAGE_LIMIT, totalRecords);

  const fmtDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Leave Balance Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage employee leave balances and allocations</p>
        </div>
        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Bulk Upload
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        {(["balances", "accrual"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-brand-500 text-brand-600 dark:text-brand-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            {tab === "balances" ? "Leave Balances" : "Accrual Log"}
          </button>
        ))}
      </div>

      {/* ── TAB: Leave Balances ── */}
      {activeTab === "balances" && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <SearchIcon className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search staff ID or leave type..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-64 rounded-lg border border-gray-300 bg-white px-4 py-2 text-theme-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                />
              </div>
              <select
                value={year}
                onChange={(e) => handleYearChange(Number(e.target.value))}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
              >
                {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-500 rounded-full dark:bg-gray-800 dark:text-gray-400">
              {totalRecords} Total
            </span>
          </div>

          {/* Mobile cards */}
          <div className="block md:hidden min-h-[400px]">
            {isLoading ? (
              <p className="py-8 text-center text-gray-500">Loading...</p>
            ) : balances.length === 0 ? (
              <p className="py-8 text-center text-gray-500">No leave balances found.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {balances.map((balance) => {
                  const total = balance.total_hours;
                  const used = balance.used_hours;
                  const remaining = balance.remaining_hours;
                  const { color, label } = statusProps(used, total);
                  return (
                    <div key={`${balance.staff_id}-${balance.leave_type_id}`} className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white/90 text-sm">{balance.leave_type_name || `Leave Type ${balance.leave_type_id}`}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{balance.full_name || "—"} · Staff ID: {balance.staff_id}</p>
                        </div>
                        <Badge size="sm" color={color}>{label}</Badge>
                      </div>
                      <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <div className="flex justify-between"><span className="font-medium text-gray-600 dark:text-gray-300">Total</span><span>{total}h</span></div>
                        <div className="flex justify-between"><span className="font-medium text-gray-600 dark:text-gray-300">Used</span><span>{used}h</span></div>
                        <div className="flex justify-between"><span className="font-medium text-gray-600 dark:text-gray-300">Remaining</span>
                          <span className={remaining < 20 ? "text-red-500 font-medium" : "text-green-500 font-medium"}>{remaining}h</span>
                        </div>
                      </div>
                      {balance.id != null && (
                        <button onClick={() => handleDelete(balance.id!)} className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-red-100 text-xs font-medium text-red-500 hover:bg-red-50">
                          <TrashBinIcon className="w-3.5 h-3.5" /> Delete
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block max-w-full overflow-x-auto min-h-[400px]">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  {["S/N", "Staff ID", "Name", "Leave Type", "Total Hours", "Used Hours", "Remaining", "Status", "Actions"].map((h) => (
                    <TableCell key={h} isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">{h}</TableCell>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {isLoading ? (
                  <TableRow><TableCell colSpan={9} className="py-8 text-center text-gray-500">Loading leave balances...</TableCell></TableRow>
                ) : balances.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="py-8 text-center text-gray-500">No leave balances found.</TableCell></TableRow>
                ) : (
                  balances.map((balance, index) => {
                    const total = balance.total_hours;
                    const used = balance.used_hours;
                    const remaining = balance.remaining_hours;
                    const { color, label } = statusProps(used, total);
                    return (
                      <TableRow key={`${balance.staff_id}-${balance.leave_type_id}`}>
                        <TableCell className="py-3 text-gray-500 text-theme-sm">{index + 1}</TableCell>
                        <TableCell className="py-3 text-gray-500 text-theme-sm">{balance.staff_id}</TableCell>
                        <TableCell className="py-3 text-gray-800 dark:text-white/90 text-theme-sm">{balance.full_name || "—"}</TableCell>
                        <TableCell className="py-3 text-gray-800 dark:text-white/90 text-theme-sm font-medium">{balance.leave_type_name || `Type ${balance.leave_type_id}`}</TableCell>
                        <TableCell className="py-3 text-gray-500 text-theme-sm">{total}h</TableCell>
                        <TableCell className="py-3 text-gray-500 text-theme-sm">{used}h</TableCell>
                        <TableCell className="py-3 text-theme-sm">
                          <span className={`font-medium ${remaining < 20 ? "text-red-500" : "text-green-500"}`}>{remaining}h</span>
                        </TableCell>
                        <TableCell className="py-3"><Badge size="sm" color={color}>{label}</Badge></TableCell>
                        <TableCell className="py-3">
                          {balance.id != null && (
                            <div className="relative">
                              <button onClick={() => toggleDropdown(String(balance.id))}
                                className="dropdown-toggle text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                style={{ transform: "rotate(90deg)" }}>
                                <MoreDotIcon className="w-5 h-5" />
                              </button>
                              <Dropdown isOpen={openDropdownId === String(balance.id)} onClose={closeDropdown} className="w-40 right-0 mt-2 top-full">
                                <DropdownItem onItemClick={() => { closeDropdown(); handleDelete(balance.id!); }} className="flex gap-2 items-center text-red-500">
                                  <TrashBinIcon className="w-4 h-4" /> Delete
                                </DropdownItem>
                              </Dropdown>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!isLoading && totalRecords > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 mt-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing <span className="font-medium text-gray-700 dark:text-gray-300">{startRecord}–{endRecord}</span> of{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">{totalRecords}</span> records
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => fetchBalances(currentPage - 1)} disabled={currentPage <= 1}
                  className="flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:hover:bg-gray-800 text-sm">‹</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => fetchBalances(p)}
                    className={`flex items-center justify-center h-8 w-8 rounded-lg text-sm font-medium transition-colors ${p === currentPage ? "bg-brand-500 text-white" : "border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"}`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => fetchBalances(currentPage + 1)} disabled={currentPage >= totalPages}
                  className="flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:hover:bg-gray-800 text-sm">›</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Accrual Log ── */}
      {activeTab === "accrual" && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
          {/* Accrual filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              {/* Leave type filter */}
              <select
                value={accrualLeaveTypeId}
                onChange={(e) => handleAccrualTypeChange(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
              >
                <option value="">All Leave Types</option>
                {leaveTypes.map((lt: any) => (
                  <option key={lt.unique_id ?? lt.id} value={lt.unique_id ?? lt.id}>{lt.name}</option>
                ))}
              </select>
              {/* Year filter */}
              <select
                value={accrualYear}
                onChange={(e) => handleAccrualYearChange(Number(e.target.value))}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
              >
                {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <button
                onClick={() => fetchAccrualLog()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
            <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-500 rounded-full dark:bg-gray-800 dark:text-gray-400">
              {accrualLog.length} entries
            </span>
          </div>

          {/* Mobile cards */}
          <div className="block md:hidden min-h-[300px]">
            {accrualLoading ? (
              <p className="py-8 text-center text-gray-500">Loading accrual log...</p>
            ) : accrualLog.length === 0 ? (
              <p className="py-8 text-center text-gray-500">No accrual records found for the selected filters.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {accrualLog.map((entry, i) => (
                  <div key={entry.id ?? i} className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-medium text-gray-800 dark:text-white/90 text-sm">{entry.leave_type_name || `Leave Type ${entry.leave_type_id}`}</p>
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">+{Number(entry.hours_accrued || 0)}h</span>
                    </div>
                    <div className="space-y-0.5 text-xs text-gray-500">
                      {entry.staff_id && <p>Staff ID: {entry.staff_id}</p>}
                      <p>Run date: {fmtDate(entry.run_date || entry.accrual_date || entry.created_at)}</p>
                      {entry.notes && <p>{entry.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block max-w-full overflow-x-auto min-h-[300px]">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  {["S/N", "Leave Type", "Staff ID", "Hours Accrued", "Run Date", "Year", "Notes"].map((h) => (
                    <TableCell key={h} isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">{h}</TableCell>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {accrualLoading ? (
                  <TableRow><TableCell colSpan={7} className="py-8 text-center text-gray-500">Loading accrual log...</TableCell></TableRow>
                ) : accrualLog.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="py-8 text-center text-gray-500">No accrual records found for the selected filters.</TableCell></TableRow>
                ) : (
                  accrualLog.map((entry, index) => (
                    <TableRow key={entry.id ?? index}>
                      <TableCell className="py-3 text-gray-500 text-theme-sm">{index + 1}</TableCell>
                      <TableCell className="py-3 font-medium text-gray-800 dark:text-white/90 text-theme-sm">{entry.leave_type_name || `Type ${entry.leave_type_id}`}</TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm">{entry.staff_id ?? "—"}</TableCell>
                      <TableCell className="py-3 text-theme-sm">
                        <span className="font-semibold text-green-600 dark:text-green-400">+{Number(entry.hours_accrued || 0)}h</span>
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm whitespace-nowrap">
                        {fmtDate(entry.run_date || entry.accrual_date || entry.created_at)}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm">{entry.year ?? accrualYear}</TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm max-w-xs truncate">{entry.notes ?? "—"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Bulk Upload Drawer */}
      <Drawer isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} title="Bulk Upload Leave Balances">
        <div className="p-6">
          <LeaveBalanceBulkUpload onSuccess={() => { setIsUploadOpen(false); fetchBalances(1); }} />
        </div>
      </Drawer>

      {/* Delete Confirmation */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Confirm Delete</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Are you sure you want to delete this leave balance? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setDeleteModalOpen(false); setDeleteId(null); }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                Cancel
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
