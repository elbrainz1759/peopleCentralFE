"use client";
import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { PlusIcon, SearchIcon, HorizontaLDots, PencilIcon, TrashBinIcon } from "@/icons";
import { Drawer } from "@/components/ui/drawer/Drawer";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { userService } from "@/services/user.service";

const PAGE_LIMIT = 10;

// DTO Structure matching the backend
interface LeaveTypeConfigDto {
    leaveTypeId: string | number;
    country: string;
    annualHours: number;
    monthlyAccrualHours?: number | null;
    leavePolicyId: string; // Required - id of a leave type
}

interface LeaveType {
    id: number | string;
    unique_id?: string;
    name: string;
    description: string;
    country: string;
    hours?: number;
}

interface LeaveTypeConfig extends LeaveType {
    // Additional fields for configuration display
    leavePolicyId?: string;
    annualHours?: number;
    monthlyAccrualHours?: number;
    approvalWorkflow?: string;
    effectiveDate?: string;
    createdAt?: string;
    updatedAt?: string;
}

export default function LeaveTypeConfigsPage() {
    const [configs, setConfigs] = useState<LeaveTypeConfig[]>([]);
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeDropdown, setActiveDropdown] = useState<number | string | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    // Countries for dropdown
    const [countries, setCountries] = useState<any[]>([]);

    // Form state
    const [form, setForm] = useState<LeaveTypeConfigDto>({
        leaveTypeId: 0,
        country: "",
        annualHours: 0,
        monthlyAccrualHours: null,
        leavePolicyId: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const normalizeConfig = (item: any): LeaveTypeConfig => ({
        id: item.id,
        unique_id: item.unique_id,
        name: item.leave_type_name ?? item.name ?? "—",
        description: item.description ?? "",
        country: item.country,
        leavePolicyId: item.leave_type_id != null ? String(item.leave_type_id) : item.unique_id,
        annualHours: item.annual_hours != null ? Number(item.annual_hours) : item.annualHours,
        monthlyAccrualHours:
            item.monthly_accrual_hours != null
                ? Number(item.monthly_accrual_hours)
                : item.monthlyAccrualHours,
        approvalWorkflow: item.approval_workflow ?? item.approvalWorkflow,
        createdAt: item.created_at ?? item.createdAt,
        updatedAt: item.updated_at ?? item.updatedAt,
    });

    const fetchConfigs = useCallback(async (page = 1) => {
        setIsLoading(true);
        try {
            const response: any = await userService.getAllLeaveTypeConfigs(page, PAGE_LIMIT);
            const rawList = Array.isArray(response)
                ? response
                : Array.isArray(response?.data)
                    ? response.data
                    : [];
            setConfigs(rawList.map(normalizeConfig));
            const meta = response?.meta;
            setTotalRecords(meta?.total ?? rawList.length);
            setTotalPages(meta?.last_page ?? meta?.totalPages ?? 1);
            setCurrentPage(page);
        } catch (error: any) {
            console.error('Failed to fetch configurations:', error);
            toast.error(error.message || "Failed to load leave type configurations");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchLeaveTypes = async () => {
        try {
            // Fetch leave types from API
            const response = await userService.getAllLeaveTypes();
            const data = response?.data || (Array.isArray(response) ? response : []);
            setLeaveTypes(data);
        } catch (error) {
            console.error("Failed to fetch leave types:", error);
            toast.error("Failed to load leave types");
        }
    };

    const fetchCountries = async () => {
        try {
            // Fetch countries from API
            const response = await userService.getAllCountries();
            const data = (response as any)?.data || (Array.isArray(response) ? response : []);
            setCountries(data);
        } catch (error) {
            console.error("Failed to fetch countries:", error);
            toast.error("Could not load countries");
        }
    };

    useEffect(() => {
        fetchConfigs(1);
        fetchLeaveTypes();
        fetchCountries();
    }, [fetchConfigs]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.leavePolicyId || !form.country.trim() || !form.annualHours) return;

        setIsSubmitting(true);
        try {
            const selectedType = leaveTypes.find(
                (lt) => String(lt.unique_id ?? lt.id) === String(form.leavePolicyId)
            );
            const leaveTypeUniqueId = selectedType?.unique_id ?? form.leavePolicyId;

            const response = await userService.createLeaveTypeConfig({
                leaveTypeId: leaveTypeUniqueId,
                country: form.country,
                annualHours: form.annualHours,
                ...(form.monthlyAccrualHours ? { monthlyAccrualHours: form.monthlyAccrualHours } : {}),
            });

            console.log('Configuration created:', response);
            toast.success("Leave type configuration created successfully!");
            setIsAddOpen(false);
            setForm({
                leaveTypeId: 0,
                country: "",
                annualHours: 0,
                monthlyAccrualHours: null,
                leavePolicyId: "",
            });
            fetchConfigs(1);
        } catch (error: any) {
            console.error('Failed to create configuration:', error);
            toast.error(error.message || "Failed to create leave type configuration");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filtered = configs.filter((config) =>
        (config.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (config.country || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * PAGE_LIMIT + 1;
    const endRecord = Math.min(currentPage * PAGE_LIMIT, totalRecords);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Leave Type Configurations
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Configure leave types with country-specific hours and accrual rates.
                    </p>
                </div>

                <button
                    onClick={() => setIsAddOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                    <PlusIcon className="h-5 w-5" />
                    Add Configuration
                </button>
            </div>

            {/* Table Card */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                            <SearchIcon className="w-4 h-4" />
                        </span>
                        <input
                            type="text"
                            placeholder="Search configurations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-64 rounded-lg border border-gray-300 bg-white px-4 py-2 text-theme-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:focus:border-brand-500"
                        />
                    </div>
                </div>

                <div className="max-w-full overflow-x-auto min-h-[400px]">
                    <Table>
                        <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                            <TableRow>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    S/N
                                </TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Leave Type
                                </TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Country
                                </TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Policy ID
                                </TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Annual Hours
                                </TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Monthly Accrual
                                </TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Approval Workflow
                                </TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Created
                                </TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="py-10 text-center text-gray-500">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="py-10 text-center text-gray-500">
                                        No leave type configurations found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((config, index) => {
                                    const matchedType = leaveTypes.find(
                                        (lt) => String(lt.id) === String(config.leavePolicyId)
                                    );
                                    const displayName =
                                        config.name && config.name !== "—"
                                            ? config.name
                                            : matchedType?.name ?? "—";
                                    return (
                                    <TableRow key={config.id}>
                                        <TableCell className="py-3 text-theme-sm text-gray-500">
                                            {startRecord + index}
                                        </TableCell>
                                        <TableCell className="py-3 font-medium text-gray-800 dark:text-white/90">
                                            {displayName}
                                        </TableCell>
                                        <TableCell className="py-3 text-theme-sm text-gray-500">
                                            {config.country}
                                        </TableCell>
                                        <TableCell className="py-3 text-theme-sm text-gray-500">
                                            {config.leavePolicyId}
                                        </TableCell>
                                        <TableCell className="py-3 text-theme-sm text-gray-500">
                                            {config.annualHours}
                                        </TableCell>
                                        <TableCell className="py-3 text-theme-sm text-gray-500">
                                            {config.monthlyAccrualHours || "—"}
                                        </TableCell>
                                        <TableCell className="py-3 text-theme-sm text-gray-500">
                                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                                                {config.approvalWorkflow || "—"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-3 text-theme-sm text-gray-500">
                                            {config.createdAt
                                                ? new Date(config.createdAt).toLocaleDateString()
                                                : "—"}
                                        </TableCell>
                                        <TableCell className="py-3 relative">
                                            <button
                                                className="dropdown-toggle flex items-center justify-center h-8 w-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                onClick={() =>
                                                    setActiveDropdown(activeDropdown === config.id ? null : config.id)
                                                }
                                            >
                                                <HorizontaLDots className="h-4 w-4 text-gray-500" />
                                            </button>

                                            <Dropdown
                                                isOpen={activeDropdown === config.id}
                                                onClose={() => setActiveDropdown(null)}
                                                className="absolute right-0 top-10 pointer-events-auto"
                                            >
                                                <div className="w-48 py-2">
                                                    <DropdownItem
                                                        onClick={() => {
                                                            toast.success(`Edit configuration for ${config.name}`);
                                                            setActiveDropdown(null);
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <PencilIcon className="w-4 h-4 text-gray-400" />
                                                            <span>Edit Details</span>
                                                        </div>
                                                    </DropdownItem>
                                                    <DropdownItem
                                                        onClick={() => {
                                                            toast.error(`Delete configuration for ${config.name}`);
                                                            setActiveDropdown(null);
                                                        }}
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <TrashBinIcon className="w-4 h-4" />
                                                            <span>Remove Record</span>
                                                        </div>
                                                    </DropdownItem>
                                                </div>
                                            </Dropdown>
                                        </TableCell>
                                    </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Footer */}
                {!isLoading && totalRecords > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 mt-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Showing <span className="font-medium text-gray-700 dark:text-gray-300">{startRecord}–{endRecord}</span> of{" "}
                            <span className="font-medium text-gray-700 dark:text-gray-300">{totalRecords}</span> records
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => fetchConfigs(currentPage - 1)}
                                disabled={currentPage <= 1}
                                className="flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:hover:bg-gray-800 transition-colors text-sm"
                            >
                                ‹
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => fetchConfigs(page)}
                                    className={`flex items-center justify-center h-8 w-8 rounded-lg text-sm font-medium transition-colors ${page === currentPage
                                            ? "bg-brand-500 text-white"
                                            : "border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => fetchConfigs(currentPage + 1)}
                                disabled={currentPage >= totalPages}
                                className="flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:hover:bg-gray-800 transition-colors text-sm"
                            >
                                ›
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Configuration Drawer */}
            <Drawer
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                title="Add Leave Type Configuration"
            >
                <form onSubmit={handleCreate} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Leave Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={form.leavePolicyId}
                            onChange={(e) => setForm({ ...form, leavePolicyId: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-brand-500 outline-none dark:bg-gray-900 dark:border-gray-800 dark:text-white"
                            required
                        >
                            <option value="">Select a leave type</option>
                            {leaveTypes.map((lt) => (
                                <option key={lt.id} value={lt.unique_id ?? lt.id}>
                                    {lt.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Country <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={form.country}
                            onChange={(e) => setForm({ ...form, country: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-brand-500 outline-none dark:bg-gray-900 dark:border-gray-800 dark:text-white"
                            required
                        >
                            <option value="">Select a country</option>
                            {countries.map((c: any) => (
                                <option key={c.id} value={c.name}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Annual Hours <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={form.annualHours}
                            onChange={(e) => setForm({ ...form, annualHours: Number(e.target.value) })}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-brand-500 outline-none dark:bg-gray-900 dark:border-gray-800 dark:text-white"
                            placeholder="e.g. 160"
                            min={0}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Monthly Accrual Hours <span className="text-gray-400">(optional)</span>
                        </label>
                        <input
                            type="number"
                            value={form.monthlyAccrualHours || ""}
                            onChange={(e) => setForm({ ...form, monthlyAccrualHours: e.target.value ? Number(e.target.value) : null })}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-brand-500 outline-none dark:bg-gray-900 dark:border-gray-800 dark:text-white"
                            placeholder="e.g. 13.33"
                            min={0}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            If not provided, will be calculated automatically from annual hours
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-brand-500 text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-all flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        ) : null}
                        {isSubmitting ? "Processing..." : "Create Configuration"}
                    </button>
                </form>
            </Drawer>
        </div>
    );
}
