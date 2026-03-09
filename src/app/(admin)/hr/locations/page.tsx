"use client";
import React, { useState, useEffect } from "react";
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

export default function LocationsPage() {
    const [locations, setLocations] = useState<any[]>([]);
    const [countries, setCountries] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const [newLocationName, setNewLocationName] = useState("");
    const [newCountryId, setNewCountryId] = useState("");
    const [isSubmittingNew, setIsSubmittingNew] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<number | string | null>(null);

    useEffect(() => {
        fetchLocations();
        fetchCountries();
    }, []);

    const fetchLocations = async () => {
        setIsLoading(true);
        try {
            const response: any = await userService.getAllLocations();
            const locationsData = response?.data || (Array.isArray(response) ? response : []);
            setLocations(locationsData);
        } catch (error) {
            console.error("Failed to load locations:", error);
            toast.error("Failed to load locations");
            setLocations([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCountries = async () => {
        try {
            const response: any = await userService.getAllCountries();
            const countriesData = response?.data || (Array.isArray(response) ? response : []);
            setCountries(countriesData);
        } catch (error) {
            console.error("Failed to load countries:", error);
        }
    };

    const getCountryName = (countryId: string) => {
        const country = countries.find((c: any) => c.unique_id === countryId || String(c.id) === countryId);
        return country?.name || countryId || "N/A";
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newLocationName.trim() || !newCountryId) return;

        setIsSubmittingNew(true);
        try {
            await userService.createLocation({
                name: newLocationName,
                countryId: newCountryId,
            });
            toast.success("Location created successfully!");
            setIsAddOpen(false);
            setNewLocationName("");
            setNewCountryId("");
            fetchLocations();
        } catch (error: any) {
            toast.error(error.message || "Failed to create location");
        } finally {
            setIsSubmittingNew(false);
        }
    };

    const filtered = locations.filter(l =>
        (l.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Locations
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Manage office locations across country operations.
                    </p>
                </div>

                <button
                    onClick={() => setIsAddOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                    <PlusIcon className="h-5 w-5" />
                    Add Location
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
                            placeholder="Search locations..."
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
                                    Location Name
                                </TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Country
                                </TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Created By
                                </TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Created Date
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
                                    <TableCell colSpan={7} className="py-10 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
                                            <span>Loading locations...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-10 text-center text-gray-500">
                                        No locations found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((location, index) => (
                                    <TableRow key={location.id || location.unique_id}>
                                        <TableCell className="py-3 text-theme-sm text-gray-500">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell className="py-3 font-medium text-gray-800 dark:text-white/90">
                                            {location.name}
                                        </TableCell>
                                        <TableCell className="py-3 text-theme-sm text-gray-500">
                                            {location.country_name || getCountryName(location.countryId || location.country)}
                                        </TableCell>
                                        <TableCell className="py-3 text-theme-sm text-gray-500">
                                            {location.created_by || "System"}
                                        </TableCell>
                                        <TableCell className="py-3 text-theme-sm text-gray-500">
                                            {location.created_at ? new Date(location.created_at).toLocaleDateString() : "N/A"}
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-600 rounded-full dark:bg-green-500/10 dark:text-green-400">
                                                Active
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-3 relative">
                                            <button
                                                className="dropdown-toggle flex items-center justify-center h-8 w-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                onClick={() => setActiveDropdown(activeDropdown === (location.id || location.unique_id) ? null : (location.id || location.unique_id))}
                                            >
                                                <HorizontaLDots className="h-4 w-4 text-gray-500" />
                                            </button>

                                            <Dropdown
                                                isOpen={activeDropdown === (location.id || location.unique_id)}
                                                onClose={() => setActiveDropdown(null)}
                                                className="absolute right-0 top-10 pointer-events-auto"
                                            >
                                                <div className="w-48 py-2">
                                                    <DropdownItem onClick={() => { toast.success(`Edit ${location.name}`); setActiveDropdown(null); }}>
                                                        <div className="flex items-center gap-2">
                                                            <PencilIcon className="w-4 h-4 text-gray-400" />
                                                            <span>Edit Location</span>
                                                        </div>
                                                    </DropdownItem>
                                                    <DropdownItem
                                                        onClick={() => { toast.error(`Delete ${location.name}`); setActiveDropdown(null); }}
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <TrashBinIcon className="w-4 h-4" />
                                                            <span>Remove Location</span>
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
                title="Add New Location"
            >
                <form onSubmit={handleCreate} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location Name</label>
                        <input
                            type="text"
                            value={newLocationName}
                            onChange={(e) => setNewLocationName(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-brand-500 outline-none dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300"
                            placeholder="e.g. Abuja Office"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                        <select
                            value={newCountryId}
                            onChange={(e) => setNewCountryId(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-brand-500 outline-none dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300"
                            required
                        >
                            <option value="">Select Country</option>
                            {countries.map((c: any) => (
                                <option key={c.id} value={c.unique_id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmittingNew}
                        className="w-full py-4 bg-brand-500 text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-all mt-4 flex items-center justify-center gap-2"
                    >
                        {isSubmittingNew ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div> : null}
                        {isSubmittingNew ? "Creating..." : "Create Location"}
                    </button>
                </form>
            </Drawer>
        </div>
    );
}
