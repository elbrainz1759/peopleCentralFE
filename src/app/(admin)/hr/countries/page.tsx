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

export default function CountriesPage() {
    const [countries, setCountries] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const [newCountryName, setNewCountryName] = useState("");
    const [newCountryCode, setNewCountryCode] = useState("");
    const [isSubmittingNew, setIsSubmittingNew] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<number | string | null>(null);

    useEffect(() => {
        fetchCountries();
    }, []);

    const fetchCountries = async () => {
        setIsLoading(true);
        try {
            const response: any = await userService.getAllCountries();
            const countriesData = response?.data || (Array.isArray(response) ? response : []);
            setCountries(countriesData);
        } catch (error) {
            // Mock data for now, similar to how we handled departments
            const mockCountries = [
                { id: 1, name: "Nigeria", code: "NG", staffCount: 45, status: "Active" },
                { id: 2, name: "Kenya", code: "KE", staffCount: 12, status: "Active" },
                { id: 3, name: "Uganda", code: "UG", staffCount: 8, status: "Active" },
                { id: 4, name: "Ethiopia", code: "ET", staffCount: 20, status: "Active" },
            ];
            setCountries(mockCountries);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCountryName.trim() || !newCountryCode.trim()) return;

        setIsSubmittingNew(true);
        try {
            await userService.createCountry({
                name: newCountryName,
            });
            toast.success("Country registered successfully!");
            setIsAddOpen(false);
            setNewCountryName("");
            setNewCountryCode("");
            fetchCountries();
        } catch (error: any) {
            toast.error(error.message || "Failed to register country");
        } finally {
            setIsSubmittingNew(false);
        }
    };

    const filtered = countries.filter(c =>
        (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.code || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Country Management
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Configure and manage operational country offices.
                    </p>
                </div>

                <button
                    onClick={() => setIsAddOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                    <PlusIcon className="h-5 w-5" />
                    Add Country
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
                            placeholder="Search countries..."
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
                                    Country Name
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
                                        No countries found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((country, index) => (
                                    <TableRow key={country.id}>
                                        <TableCell className="py-3 text-theme-sm text-gray-500">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell className="py-3 font-medium text-gray-800 dark:text-white/90">
                                            {country.name}
                                        </TableCell>
                                        <TableCell className="py-3 text-theme-sm text-gray-500">
                                            {country.created_by || "System"}
                                        </TableCell>
                                        <TableCell className="py-3 text-theme-sm text-gray-500">
                                            {country.created_at ? new Date(country.created_at).toLocaleDateString() : "N/A"}
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-600 rounded-full dark:bg-green-500/10 dark:text-green-400">
                                                Active
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-3 relative">
                                            <button
                                                className="dropdown-toggle flex items-center justify-center h-8 w-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                onClick={() => setActiveDropdown(activeDropdown === country.id ? null : country.id)}
                                            >
                                                <HorizontaLDots className="h-4 w-4 text-gray-500" />
                                            </button>

                                            <Dropdown
                                                isOpen={activeDropdown === country.id}
                                                onClose={() => setActiveDropdown(null)}
                                                className="absolute right-0 top-10 pointer-events-auto"
                                            >
                                                <div className="w-48 py-2">
                                                    <DropdownItem onClick={() => { toast.success(`Edit ${country.name}`); setActiveDropdown(null); }}>
                                                        <div className="flex items-center gap-2">
                                                            <PencilIcon className="w-4 h-4 text-gray-400" />
                                                            <span>Edit Country</span>
                                                        </div>
                                                    </DropdownItem>
                                                    <DropdownItem
                                                        onClick={() => { toast.error(`Delete ${country.name}`); setActiveDropdown(null); }}
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <TrashBinIcon className="w-4 h-4" />
                                                            <span>Remove Country</span>
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
                title="Register New Country"
            >
                <form onSubmit={handleCreate} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Country</label>
                        <select
                            value={newCountryName}
                            onChange={(e) => {
                                const val = e.target.value;
                                setNewCountryName(val);
                                // Auto-fill ISO code for user convenience
                                if (val === "Nigeria") setNewCountryCode("NG");
                                else if (val === "Liberia") setNewCountryCode("LR");
                                else setNewCountryCode("");
                            }}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-brand-500 outline-none dark:bg-gray-900 dark:border-gray-800"
                            required
                        >
                            <option value="">Choose Country</option>
                            <option value="Nigeria">Nigeria</option>
                            <option value="Liberia">Liberia</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country ISO Code (2-letter)</label>
                        <input
                            type="text"
                            value={newCountryCode}
                            onChange={(e) => setNewCountryCode(e.target.value.toUpperCase())}
                            maxLength={2}
                            readOnly
                            className="w-full rounded-lg border border-gray-100 bg-gray-50 px-4 py-2.5 outline-none dark:bg-gray-800/50 dark:border-gray-800 font-mono text-gray-500 cursor-not-allowed"
                            placeholder="e.g. NG"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmittingNew}
                        className="w-full py-4 bg-brand-500 text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-all mt-4 flex items-center justify-center gap-2"
                    >
                        {isSubmittingNew ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div> : null}
                        {isSubmittingNew ? "Processing..." : "Finish Registration"}
                    </button>
                </form>
            </Drawer>
        </div>
    );
}
