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
import { ConfirmDialog } from "@/components/ui/confirm-dialog/ConfirmDialog";
import CustomSelect from "@/components/form/CustomSelect";

export default function LocationsPage() {
    const [locations, setLocations] = useState<any[]>([]);
    const [countries, setCountries] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState<any | null>(null);
    const [pendingDelete, setPendingDelete] = useState<any | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
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

    const openEdit = (location: any) => {
        setEditingLocation(location);
        setNewLocationName(location.name ?? "");
        setNewCountryId(location.country?.unique_id ?? location.countryId ?? location.country_id ?? "");
        setIsEditOpen(true);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingLocation?.unique_id) return;
        if (!newLocationName.trim() || !newCountryId) return;

        setIsSubmittingNew(true);
        try {
            await userService.updateLocation(editingLocation.unique_id, {
                name: newLocationName,
                countryId: newCountryId,
            });
            toast.success("Location updated");
            setIsEditOpen(false);
            setEditingLocation(null);
            setNewLocationName("");
            setNewCountryId("");
            fetchLocations();
        } catch (error: any) {
            toast.error(error.message || "Failed to update location");
        } finally {
            setIsSubmittingNew(false);
        }
    };

    const handleDelete = (location: any) => {
        if (!location?.unique_id) {
            toast.error("Missing unique_id; cannot delete this record");
            return;
        }
        setPendingDelete(location);
    };

    const confirmDelete = async () => {
        if (!pendingDelete?.unique_id) return;
        const uniqueId = pendingDelete.unique_id;

        setIsDeleting(uniqueId);
        try {
            await userService.deleteLocation(uniqueId);
            toast.success("Location removed");
            setPendingDelete(null);
            fetchLocations();
        } catch (error: any) {
            toast.error(error.message || "Failed to remove location");
        } finally {
            setIsDeleting(null);
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

                {/* Mobile card grid */}
                <div className="block md:hidden min-h-[400px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center gap-2 py-10 text-gray-500">
                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
                            <span>Loading locations...</span>
                        </div>
                    ) : filtered.length === 0 ? (
                        <p className="py-10 text-center text-gray-500">No locations found.</p>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {filtered.map((location) => (
                                <div key={location.id || location.unique_id} className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                                    <div className="flex items-start justify-between mb-2">
                                        <p className="font-medium text-gray-800 dark:text-white/90 text-sm">{location.name}</p>
                                        <span className="px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-600 rounded-full dark:bg-green-500/10 dark:text-green-400">Active</span>
                                    </div>
                                    <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
                                        <div className="flex justify-between">
                                            <span className="font-medium text-gray-600 dark:text-gray-300">Country</span>
                                            <span>{location.country_name || getCountryName(location.countryId || location.country)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium text-gray-600 dark:text-gray-300">Created By</span>
                                            <span>{location.created_by || "System"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium text-gray-600 dark:text-gray-300">Created Date</span>
                                            <span>{location.created_at ? new Date(location.created_at).toLocaleDateString() : "N/A"}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => openEdit(location)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800">
                                            <PencilIcon className="w-3.5 h-3.5" /> Edit
                                        </button>
                                        <button onClick={() => handleDelete(location)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-red-100 text-xs font-medium text-red-500 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/10">
                                            <TrashBinIcon className="w-3.5 h-3.5" />
                                            {isDeleting === location.unique_id ? "Removing..." : "Remove"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Desktop table */}
                <div className="hidden md:block max-w-full overflow-x-auto min-h-[400px]">
                    <Table>
                        <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                            <TableRow>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">S/N</TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Location Name</TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Country</TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Created By</TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Created Date</TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
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
                                    <TableCell colSpan={7} className="py-10 text-center text-gray-500">No locations found.</TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((location, index) => (
                                    <TableRow key={location.id || location.unique_id}>
                                        <TableCell className="py-3 text-theme-sm text-gray-500">{index + 1}</TableCell>
                                        <TableCell className="py-3 font-medium text-gray-800 dark:text-white/90">{location.name}</TableCell>
                                        <TableCell className="py-3 text-theme-sm text-gray-500">{location.country_name || getCountryName(location.countryId || location.country)}</TableCell>
                                        <TableCell className="py-3 text-theme-sm text-gray-500">{location.created_by || "System"}</TableCell>
                                        <TableCell className="py-3 text-theme-sm text-gray-500">{location.created_at ? new Date(location.created_at).toLocaleDateString() : "N/A"}</TableCell>
                                        <TableCell className="py-3">
                                            <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-600 rounded-full dark:bg-green-500/10 dark:text-green-400">Active</span>
                                        </TableCell>
                                        <TableCell className="py-3 relative">
                                            <button
                                                className="dropdown-toggle flex items-center justify-center h-8 w-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                onClick={() => setActiveDropdown(activeDropdown === (location.id || location.unique_id) ? null : (location.id || location.unique_id))}
                                            >
                                                <HorizontaLDots className="h-4 w-4 text-gray-500" />
                                            </button>
                                            <Dropdown isOpen={activeDropdown === (location.id || location.unique_id)} onClose={() => setActiveDropdown(null)} className="absolute right-0 top-10 pointer-events-auto">
                                                <div className="w-48 py-2">
                                                    <DropdownItem onClick={() => { setActiveDropdown(null); openEdit(location); }}>
                                                        <div className="flex items-center gap-2"><PencilIcon className="w-4 h-4 text-gray-400" /><span>Edit Location</span></div>
                                                    </DropdownItem>
                                                    <DropdownItem onClick={() => { setActiveDropdown(null); handleDelete(location); }} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                                        <div className="flex items-center gap-2"><TrashBinIcon className="w-4 h-4" /><span>{isDeleting === location.unique_id ? "Removing..." : "Remove Location"}</span></div>
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
                isOpen={isAddOpen || isEditOpen}
                onClose={() => {
                    setIsAddOpen(false);
                    setIsEditOpen(false);
                    setEditingLocation(null);
                    setNewLocationName("");
                    setNewCountryId("");
                }}
                title={isEditOpen ? "Edit Location" : "Add New Location"}
            >
                <form onSubmit={isEditOpen ? handleUpdate : handleCreate} className="p-6 space-y-6">
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
                        <CustomSelect
                            value={newCountryId}
                            onChange={(v) => setNewCountryId(v)}
                            options={countries.map((c: any) => ({ value: c.unique_id, label: c.name }))}
                            placeholder="Select Country"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmittingNew}
                        className="w-full py-4 bg-brand-500 text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-all mt-4 flex items-center justify-center gap-2"
                    >
                        {isSubmittingNew ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div> : null}
                        {isSubmittingNew
                            ? "Processing..."
                            : isEditOpen
                                ? "Update Location"
                                : "Create Location"}
                    </button>
                </form>
            </Drawer>

            <ConfirmDialog
                isOpen={!!pendingDelete}
                title="Remove location"
                message={
                    pendingDelete
                        ? `Delete "${pendingDelete.name}"? This cannot be undone.`
                        : ""
                }
                confirmText="Remove"
                variant="danger"
                isLoading={!!isDeleting}
                onConfirm={confirmDelete}
                onCancel={() => setPendingDelete(null)}
            />
        </div>
    );
}
