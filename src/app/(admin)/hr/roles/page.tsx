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

export default function RolesPage() {
    const [roles, setRoles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<any | null>(null);
    const [pendingDelete, setPendingDelete] = useState<any | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<number | string | null>(null);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        setIsLoading(true);
        try {
            const response: any = await userService.getAllRoles();
            const rolesData = response?.data || (Array.isArray(response) ? response : []);
            setRoles(rolesData);
        } catch (error: any) {
            toast.error(error?.message || "Failed to load roles");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setName("");
        setDescription("");
        setEditingRole(null);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsSubmitting(true);
        try {
            await userService.createRole({ name: name.trim(), description: description.trim() || undefined });
            toast.success("Role created successfully!");
            setIsAddOpen(false);
            resetForm();
            fetchRoles();
        } catch (error: any) {
            toast.error(error.message || "Failed to create role");
        } finally {
            setIsSubmitting(false);
        }
    };

    const openEdit = (role: any) => {
        setEditingRole(role);
        setName(role.name ?? "");
        setDescription(role.description ?? "");
        setIsEditOpen(true);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRole?.unique_id) return;
        if (!name.trim()) return;

        setIsSubmitting(true);
        try {
            await userService.updateRole(editingRole.unique_id, {
                name: name.trim(),
                description: description.trim() || undefined,
            });
            toast.success("Role updated");
            setIsEditOpen(false);
            resetForm();
            fetchRoles();
        } catch (error: any) {
            toast.error(error.message || "Failed to update role");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (role: any) => {
        if (!role?.unique_id) {
            toast.error("Missing unique_id; cannot delete this record");
            return;
        }
        setPendingDelete(role);
    };

    const confirmDelete = async () => {
        if (!pendingDelete?.unique_id) return;
        const uniqueId = pendingDelete.unique_id;

        setIsDeleting(uniqueId);
        try {
            await userService.deleteRole(uniqueId);
            toast.success("Role removed");
            setPendingDelete(null);
            fetchRoles();
        } catch (error: any) {
            toast.error(error.message || "Failed to remove role");
        } finally {
            setIsDeleting(null);
        }
    };

    const filtered = roles.filter(r =>
        (r.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.description || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Roles
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Manage organizational roles and their descriptions.
                    </p>
                </div>

                <button
                    onClick={() => { resetForm(); setIsAddOpen(true); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                    <PlusIcon className="h-5 w-5" />
                    Add Role
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
                            placeholder="Search roles..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-64 rounded-lg border border-gray-300 bg-white px-4 py-2 text-theme-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:focus:border-brand-500"
                        />
                    </div>
                </div>

                {/* Mobile card grid */}
                <div className="block md:hidden min-h-[400px]">
                    {isLoading ? (
                        <p className="py-10 text-center text-gray-500">Loading...</p>
                    ) : filtered.length === 0 ? (
                        <p className="py-10 text-center text-gray-500">No roles found.</p>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {filtered.map((role) => (
                                <div key={role.id ?? role.unique_id} className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                                    <p className="font-medium text-gray-800 dark:text-white/90 text-sm mb-1">{role.name}</p>
                                    {role.description && <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">{role.description}</p>}
                                    <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
                                        <div className="flex justify-between">
                                            <span className="font-medium text-gray-600 dark:text-gray-300">Created By</span>
                                            <span>{role.created_by || "System"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium text-gray-600 dark:text-gray-300">Registration Date</span>
                                            <span>{role.created_at ? new Date(role.created_at).toLocaleDateString() : "—"}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => openEdit(role)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800">
                                            <PencilIcon className="w-3.5 h-3.5" /> Edit
                                        </button>
                                        <button onClick={() => handleDelete(role)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-red-100 text-xs font-medium text-red-500 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/10">
                                            <TrashBinIcon className="w-3.5 h-3.5" />
                                            {isDeleting === role.unique_id ? "Removing..." : "Remove"}
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
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Role Name</TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Description</TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Created By</TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Registration Date</TableCell>
                                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-10 text-center text-gray-500">Loading...</TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-10 text-center text-gray-500">No roles found.</TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((role, index) => (
                                    <TableRow key={role.id ?? role.unique_id ?? index}>
                                        <TableCell className="py-3 text-theme-sm text-gray-500">{index + 1}</TableCell>
                                        <TableCell className="py-3 font-medium text-gray-800 dark:text-white/90">{role.name}</TableCell>
                                        <TableCell className="py-3 text-theme-sm text-gray-500 max-w-md"><span className="line-clamp-2">{role.description || "—"}</span></TableCell>
                                        <TableCell className="py-3 text-theme-sm text-gray-500">{role.created_by || "System"}</TableCell>
                                        <TableCell className="py-3 text-theme-sm text-gray-500">{role.created_at ? new Date(role.created_at).toLocaleDateString() : "—"}</TableCell>
                                        <TableCell className="py-3 relative">
                                            <button className="dropdown-toggle flex items-center justify-center h-8 w-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={() => setActiveDropdown(activeDropdown === (role.id ?? role.unique_id) ? null : (role.id ?? role.unique_id))}>
                                                <HorizontaLDots className="h-4 w-4 text-gray-500" />
                                            </button>
                                            <Dropdown isOpen={activeDropdown === (role.id ?? role.unique_id)} onClose={() => setActiveDropdown(null)} className="absolute right-0 top-10 pointer-events-auto">
                                                <div className="w-48 py-2">
                                                    <DropdownItem onClick={() => { setActiveDropdown(null); openEdit(role); }}>
                                                        <div className="flex items-center gap-2"><PencilIcon className="w-4 h-4 text-gray-400" /><span>Edit Details</span></div>
                                                    </DropdownItem>
                                                    <DropdownItem onClick={() => { setActiveDropdown(null); handleDelete(role); }} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                                        <div className="flex items-center gap-2"><TrashBinIcon className="w-4 h-4" /><span>{isDeleting === role.unique_id ? "Removing..." : "Remove Record"}</span></div>
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
                    resetForm();
                }}
                title={isEditOpen ? "Edit Role" : "Add New Role"}
            >
                <form onSubmit={isEditOpen ? handleUpdate : handleCreate} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-brand-500 outline-none dark:bg-gray-900 dark:border-gray-800"
                            placeholder="e.g. Supervisor"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-brand-500 outline-none dark:bg-gray-900 dark:border-gray-800 resize-none"
                            placeholder="Briefly describe what this role is responsible for"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-brand-500 text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-all flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div> : null}
                        {isSubmitting
                            ? "Processing..."
                            : isEditOpen
                                ? "Update Role"
                                : "Create Role"}
                    </button>
                </form>
            </Drawer>

            <ConfirmDialog
                isOpen={!!pendingDelete}
                title="Remove role"
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
