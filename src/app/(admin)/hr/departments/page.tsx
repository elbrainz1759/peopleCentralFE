"use client";
import React, { useState, useEffect } from "react";
import { userService } from "@/services/user.service";
import { authService } from "@/services/auth.service";
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

export default function DepartmentsPage() {
    const [departments, setDepartments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const [newDeptName, setNewDeptName] = useState("");
    const [isSubmittingNew, setIsSubmittingNew] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        setIsLoading(true);
        try {
            const response: any = await userService.getAllDepartments();
            // Handle the new structure: { data: [...], meta: {...} }
            const departmentsData = response?.data || (Array.isArray(response) ? response : []);
            setDepartments(departmentsData);
        } catch (error) {
            // Fallback if data not found, try to extract from employees
            try {
                const response = await userService.getAllEmployees();
                const empData = response.data || [];
                const uniqueDepts = Array.from(new Set(empData.map((emp: any) => emp.department_name || emp.department))).filter(Boolean);
                setDepartments(uniqueDepts.map((name: any, index: number) => ({
                    id: index + 1,
                    name: name,
                    count: empData.filter((e: any) => (e.department_name || e.department) === name).length
                })));
            } catch (e) {
                toast.error("Failed to load departments");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDeptName.trim()) return;

        setIsSubmittingNew(true);
        try {
            await userService.createDepartment({
                name: newDeptName,
            });
            toast.success("Department created successfully!");
            setIsAddOpen(false);
            setNewDeptName("");
            fetchDepartments();
        } catch (error: any) {
            toast.error(error.message || "Failed to create department");
        } finally {
            setIsSubmittingNew(false);
        }
    };

    const filtered = departments.filter(d =>
        (d.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Departments
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Manage organizational departments and structures.
                    </p>
                </div>

                <button
                    onClick={() => setIsAddOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                    <PlusIcon className="h-5 w-5" />
                    Add Department
                </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                            <SearchIcon className="w-4 h-4" />
                        </span>
                        <input
                            type="text"
                            placeholder="Search departments..."
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
                                    Department Name
                                </TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Created By
                                </TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Registration Date
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
                                    <TableCell colSpan={6} className="py-10 text-center text-gray-500">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-10 text-center text-gray-500">
                                        No departments found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((dept, index) => (
                                    <TableRow key={dept.id}>
                                        <TableCell className="py-3 text-theme-sm text-gray-500">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell className="py-3 font-medium text-gray-800 dark:text-white/90">
                                            {dept.name}
                                        </TableCell>
                                        <TableCell className="py-3 text-theme-sm text-gray-500">
                                            {dept.created_by || "System"}
                                        </TableCell>
                                        <TableCell className="py-3 text-theme-sm text-gray-500">
                                            {dept.created_at ? new Date(dept.created_at).toLocaleDateString() : "Internal"}
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-600 rounded-full dark:bg-green-500/10 dark:text-green-400">
                                                Active
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-3 relative">
                                            <button
                                                className="dropdown-toggle flex items-center justify-center h-8 w-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                onClick={() => setActiveDropdown(activeDropdown === dept.id ? null : dept.id)}
                                            >
                                                <HorizontaLDots className="h-4 w-4 text-gray-500" />
                                            </button>

                                            <Dropdown
                                                isOpen={activeDropdown === dept.id}
                                                onClose={() => setActiveDropdown(null)}
                                                className="absolute right-0 top-10 pointer-events-auto"
                                            >
                                                <div className="w-48 py-2">
                                                    <DropdownItem onClick={() => { toast.success(`Edit ${dept.name}`); setActiveDropdown(null); }}>
                                                        <div className="flex items-center gap-2">
                                                            <PencilIcon className="w-4 h-4 text-gray-400" />
                                                            <span>Edit Details</span>
                                                        </div>
                                                    </DropdownItem>
                                                    <DropdownItem
                                                        onClick={() => { toast.error(`Delete ${dept.name}`); setActiveDropdown(null); }}
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
            </div>

            <Drawer
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                title="Add New Department"
            >
                <form onSubmit={handleCreate} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department Name</label>
                        <input
                            type="text"
                            value={newDeptName}
                            onChange={(e) => setNewDeptName(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-brand-500 outline-none dark:bg-gray-900 dark:border-gray-800"
                            placeholder="e.g. Finance"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmittingNew}
                        className="w-full py-4 bg-brand-500 text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-all flex items-center justify-center gap-2"
                    >
                        {isSubmittingNew ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div> : null}
                        {isSubmittingNew ? "Processing..." : "Create Department"}
                    </button>
                </form>
            </Drawer>
        </div>
    );
}
