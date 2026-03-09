"use client";
import React, { useState, useEffect, useCallback } from "react";
import { userService } from "@/services/user.service";
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
import { LeaveType } from "@/types/service.types";

const PAGE_LIMIT = 10;

export default function LeaveTypesPage() {
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
    const [form, setForm] = useState({ name: "", description: "", country: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchLeaveTypes = useCallback(async (page = 1) => {
        setIsLoading(true);
        try {
            const response = await userService.getAllLeaveTypes(page, PAGE_LIMIT);
            setLeaveTypes(response.data || []);
            const meta = response.meta;
            setTotalRecords(meta?.total ?? 0);
            setTotalPages(meta?.last_page ?? meta?.totalPages ?? 1);
            setCurrentPage(page);
        } catch (error) {
            toast.error("Failed to load leave types");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchCountries = async () => {
        try {
            const response: any = await userService.getAllCountries();
            const data = response?.data || (Array.isArray(response) ? response : []);
            setCountries(data);
        } catch {
            // fail silently
        }
    };

    useEffect(() => {
        fetchLeaveTypes(1);
        fetchCountries();
    }, [fetchLeaveTypes]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim() || !form.description.trim() || !form.country.trim()) return;

        setIsSubmitting(true);
        try {
            await userService.createLeaveType({
                name: form.name,
                description: form.description,
                country: form.country,
            });
            toast.success("Leave type created successfully!");
            setIsAddOpen(false);
            setForm({ name: "", description: "", country: "" });
            fetchLeaveTypes(1);
        } catch (error: any) {
            toast.error(error.message || "Failed to create leave type");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filtered = leaveTypes.filter((lt) =>
        (lt.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lt.country || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * PAGE_LIMIT + 1;
    const endRecord = Math.min(currentPage * PAGE_LIMIT, totalRecords);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Leave Types
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Manage leave type definitions and their applicability by country.
                    </p>
                </div>

                <button
                    onClick={() => setIsAddOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                    <PlusIcon className="h-5 w-5" />
                    Add Leave Type
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
                            placeholder="Search leave types..."
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
                                    Name
                                </TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Description
                                </TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Country
                                </TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Created By
                                </TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Date Added
                                </TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Status
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
                                        No leave types found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((lt, index) => (
                                    <TableRow key={lt.id}>
                                        <TableCell className="py-3 text-theme-sm text-gray-500">
                                            {startRecord + index}
                                        </TableCell>
                                        <TableCell className="py-3 font-medium text-gray-800 dark:text-white/90">
                                            {lt.name}
                                        </TableCell>
                                        <TableCell className="py-3 text-theme-sm text-gray-500 max-w-xs truncate">
                                            {lt.description}
                                        </TableCell>
                                        <TableCell className="py-3 text-theme-sm text-gray-500">
                                            {lt.country}
                                        </TableCell>
                                        <TableCell className="py-3 text-theme-sm text-gray-500">
                                            {lt.created_by || "System"}
                                        </TableCell>
                                        <TableCell className="py-3 text-theme-sm text-gray-500">
                                            {lt.created_at
                                                ? new Date(lt.created_at).toLocaleDateString()
                                                : "—"}
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-600 rounded-full dark:bg-green-500/10 dark:text-green-400">
                                                Active
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-3 relative">
                                            <button
                                                className="dropdown-toggle flex items-center justify-center h-8 w-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                onClick={() =>
                                                    setActiveDropdown(activeDropdown === lt.id ? null : lt.id)
                                                }
                                            >
                                                <HorizontaLDots className="h-4 w-4 text-gray-500" />
                                            </button>

                                            <Dropdown
                                                isOpen={activeDropdown === lt.id}
                                                onClose={() => setActiveDropdown(null)}
                                                className="absolute right-0 top-10 pointer-events-auto"
                                            >
                                                <div className="w-48 py-2">
                                                    <DropdownItem
                                                        onClick={() => {
                                                            toast.success(`Edit ${lt.name}`);
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
                                                            toast.error(`Delete ${lt.name}`);
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
                                ))
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
                                onClick={() => fetchLeaveTypes(currentPage - 1)}
                                disabled={currentPage <= 1}
                                className="flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:hover:bg-gray-800 transition-colors text-sm"
                            >
                                ‹
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => fetchLeaveTypes(page)}
                                    className={`flex items-center justify-center h-8 w-8 rounded-lg text-sm font-medium transition-colors ${page === currentPage
                                            ? "bg-brand-500 text-white"
                                            : "border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => fetchLeaveTypes(currentPage + 1)}
                                disabled={currentPage >= totalPages}
                                className="flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:hover:bg-gray-800 transition-colors text-sm"
                            >
                                ›
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Leave Type Drawer */}
            <Drawer
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                title="Add New Leave Type"
            >
                <form onSubmit={handleCreate} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Leave Type Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-brand-500 outline-none dark:bg-gray-900 dark:border-gray-800 dark:text-white"
                            placeholder="e.g. Annual Leave"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            rows={3}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-brand-500 outline-none resize-none dark:bg-gray-900 dark:border-gray-800 dark:text-white"
                            placeholder="Describe this leave type..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Country <span className="text-red-500">*</span>
                        </label>
                        {countries.length > 0 ? (
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
                        ) : (
                            <input
                                type="text"
                                value={form.country}
                                onChange={(e) => setForm({ ...form, country: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-brand-500 outline-none dark:bg-gray-900 dark:border-gray-800 dark:text-white"
                                placeholder="e.g. Nigeria"
                                required
                            />
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-brand-500 text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-all flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        ) : null}
                        {isSubmitting ? "Processing..." : "Create Leave Type"}
                    </button>
                </form>
            </Drawer>
        </div>
    );
}
