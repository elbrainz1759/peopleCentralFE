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

export default function ProgramsPage() {
    const [programs, setPrograms] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const [newProgName, setNewProgName] = useState("");
    const [newFundCode, setNewFundCode] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedCountry, setSelectedCountry] = useState("");
    const [isSubmittingNew, setIsSubmittingNew] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | number | null>(null);

    useEffect(() => {
        fetchPrograms();
    }, []);

    const fetchPrograms = async () => {
        setIsLoading(true);
        try {
            const response: any = await userService.getAllPrograms();
            // Handle the new structure: { data: [...], meta: {...} }
            const programsData = response?.data || (Array.isArray(response) ? response : []);
            setPrograms(programsData);
        } catch (error) {
            console.error("Fetch programs error:", error);
            // Fallback
            try {
                const response = await userService.getAllEmployees();
                const empData = response.data || [];
                const uniquePrograms = Array.from(new Set(empData.map((emp: any) => emp.program_name || emp.program))).filter(Boolean);
                setPrograms(uniquePrograms.map((name: any, index: number) => ({
                    id: index + 1,
                    name: name,
                    count: empData.filter((e: any) => (e.program_name || e.program) === name).length
                })));
            } catch (e) {
                toast.error("Failed to load programs");
                setPrograms([]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("handleCreate triggered. Values:", { newProgName, newFundCode, startDate, endDate, selectedCountry });

        if (!newProgName.trim() || !newFundCode || !startDate || !endDate || !selectedCountry) {
            console.log("Validation failed");
            toast.error("Please fill all required fields");
            return;
        }

        setIsSubmittingNew(true);
        try {
            const payload = {
                name: newProgName,
                fundCode: parseInt(newFundCode, 10),
                startDate: new Date(startDate).toISOString(),
                endDate: new Date(endDate).toISOString(),
                country: selectedCountry,
            };

            console.log("Submitting program payload:", payload);

            await userService.createProgram(payload);

            toast.success("Program created successfully!");
            setIsAddOpen(false);
            setNewProgName("");
            setNewFundCode("");
            setStartDate("");
            setEndDate("");
            setSelectedCountry("");
            fetchPrograms();
        } catch (error: any) {
            console.error("Create Program Error:", error);
            toast.error(error.message || "Failed to create program");
        } finally {
            setIsSubmittingNew(false);
        }
    };

    const filtered = programs.filter(p =>
        (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.unique_id || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Programs
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Monitor and manage active humanitarian and development programs.
                    </p>
                </div>

                <button
                    onClick={() => setIsAddOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                    <PlusIcon className="h-5 w-5" />
                    Add Program
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
                            placeholder="Search programs..."
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
                                    Program Name
                                </TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Fund Code
                                </TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Start Date
                                </TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    End Date
                                </TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Country
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
                                        No programs found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((prog, index) => (
                                    <TableRow key={prog.id || prog.unique_id}>
                                        <TableCell className="py-3 text-theme-sm text-gray-500">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell className="py-3 font-medium text-gray-800 dark:text-white/90">
                                            {prog.name}
                                        </TableCell>
                                        <TableCell className="py-3 text-theme-sm text-gray-500">
                                            {prog.fund_code || "N/A"}
                                        </TableCell>
                                        <TableCell className="py-3 text-theme-sm text-gray-500">
                                            {prog.start_date ? new Date(prog.start_date).toLocaleDateString() : "N/A"}
                                        </TableCell>
                                        <TableCell className="py-3 text-theme-sm text-gray-500">
                                            {prog.end_date ? new Date(prog.end_date).toLocaleDateString() : "N/A"}
                                        </TableCell>
                                        <TableCell className="py-3 text-theme-sm text-gray-500">
                                            {prog.country || "N/A"}
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-600 rounded-full dark:bg-blue-500/10 dark:text-blue-400">
                                                Active
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-3 relative">
                                            <button
                                                className="dropdown-toggle flex items-center justify-center h-8 w-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                onClick={() => {
                                                    const id = prog.id || prog.unique_id;
                                                    setActiveDropdown(activeDropdown === id ? null : id);
                                                }}
                                            >
                                                <HorizontaLDots className="h-4 w-4 text-gray-500" />
                                            </button>

                                            <Dropdown
                                                isOpen={activeDropdown === (prog.id || prog.unique_id)}
                                                onClose={() => setActiveDropdown(null)}
                                                className="absolute right-0 top-10 pointer-events-auto"
                                            >
                                                <div className="w-48 py-2">
                                                    <DropdownItem onClick={() => { toast.success(`Edit ${prog.name}`); setActiveDropdown(null); }}>
                                                        <div className="flex items-center gap-2">
                                                            <PencilIcon className="w-4 h-4 text-gray-400" />
                                                            <span>Edit Program</span>
                                                        </div>
                                                    </DropdownItem>
                                                    <DropdownItem
                                                        onClick={() => { toast.error(`Delete ${prog.name}`); setActiveDropdown(null); }}
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <TrashBinIcon className="w-4 h-4" />
                                                            <span>Delete Program</span>
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
                title="Create New Program"
            >
                <form onSubmit={handleCreate} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Program Name/Title</label>
                        <input
                            type="text"
                            value={newProgName}
                            onChange={(e) => setNewProgName(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300"
                            placeholder="e.g. Resilience Program"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fund Code (Integer)</label>
                        <input
                            type="number"
                            value={newFundCode}
                            onChange={(e) => setNewFundCode(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300"
                            placeholder="e.g. 5001"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Country</label>
                        <select
                            value={selectedCountry}
                            onChange={(e) => setSelectedCountry(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300"
                            required
                        >
                            <option value="">Choose Country</option>
                            <option value="Nigeria">Nigeria</option>
                            <option value="Liberia">Liberia</option>
                        </select>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                        <button
                            type="submit"
                            disabled={isSubmittingNew}
                            className="w-full py-4 bg-brand-500 text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-all flex items-center justify-center gap-2"
                        >
                            {isSubmittingNew ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div> : <PlusIcon className="w-5 h-5" />}
                            {isSubmittingNew ? "Registering Program..." : "Add Program to System"}
                        </button>
                    </div>
                </form>
            </Drawer>
        </div>
    );
}
