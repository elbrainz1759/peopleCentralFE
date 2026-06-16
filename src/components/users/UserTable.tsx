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
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { EyeIcon, PencilIcon, TrashBinIcon, MoreDotIcon } from "@/icons";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Modal } from "../ui/modal";
import CustomSelect from "../form/CustomSelect";

interface User {
    id: string;
    unique_id?: string;
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
    status?: string;
}

export default function UserTable() {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [selectedRole, setSelectedRole] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const data: any = await userService.getAllRoles();
            const list: any[] = data?.data ?? (Array.isArray(data) ? data : []);
            setRoles(list.map((r: any) => r.name));
        } catch {
            // fallback — leave roles empty; user can retry
        }
    };

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const data = await userService.getAll();
            setUsers(Array.isArray(data) ? data : []);
        } catch (error: any) {
            console.error("Error fetching users:", error);
            toast.error("Failed to load users");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleDropdown = (id: string) => {
        setOpenDropdownId(openDropdownId === id ? null : id);
    };

    const closeDropdown = () => setOpenDropdownId(null);

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setSelectedRole(user.role);
    };

    const handleSaveRole = async () => {
        if (!editingUser) return;
        setIsSaving(true);
        try {
            const id = editingUser.unique_id || editingUser.id;
            await userService.updateUserRole(id, selectedRole);
            toast.success("Role updated successfully");
            setEditingUser(null);
            fetchUsers();
        } catch (err: any) {
            toast.error(err.message || "Failed to update role");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingUser) return;
        setIsDeleting(true);
        try {
            const id = deletingUser.unique_id || deletingUser.id;
            await userService.deleteUser(id);
            toast.success("User deleted");
            setDeletingUser(null);
            fetchUsers();
        } catch (err: any) {
            toast.error(err.message || "Failed to delete user");
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredUsers = users.filter((user) => {
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
        return (
            fullName.includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.id || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    const roleBadgeColor = (role: string) =>
        role === "Superadmin" ? "error" : role === "Admin" ? "warning" : role === "HR" ? "info" : "light" as any;

    return (
        <>
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">System Users</h3>
                        <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-500 rounded-full dark:bg-gray-800 dark:text-gray-400">
                            {filteredUsers.length} Total
                        </span>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-60 rounded-lg border border-gray-300 bg-white px-4 py-2 text-theme-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:focus:border-brand-500"
                        />
                    </div>
                </div>

                {/* Desktop table */}
                <div className="max-w-full overflow-x-auto min-h-[400px]">
                    <Table>
                        <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                            <TableRow>
                                {["User", "Email", "Role", "Status", "Actions"].map((h) => (
                                    <TableCell key={h} isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                        {h}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-10 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
                                            <span>Loading users...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-10 text-center text-gray-500">No users found.</TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 flex items-center justify-center rounded-full shrink-0 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold text-xs uppercase">
                                                    {(user.firstName?.[0] || "") + (user.lastName?.[0] || user.email[0])}
                                                </div>
                                                <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                    {user.firstName ? `${user.firstName} ${user.lastName}` : "N/A"}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                            {user.email}
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <Badge size="sm" color={roleBadgeColor(user.role)}>{user.role}</Badge>
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <Badge size="sm" color={user.status === "Active" ? "success" : "warning"}>
                                                {user.status || "Active"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <div className="relative">
                                                <button
                                                    onClick={() => toggleDropdown(user.id)}
                                                    className="dropdown-toggle text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                                    style={{ transform: "rotate(90deg)" }}
                                                >
                                                    <MoreDotIcon className="w-5 h-5" />
                                                </button>
                                                <Dropdown
                                                    isOpen={openDropdownId === user.id}
                                                    onClose={closeDropdown}
                                                    className="w-40 right-0 mt-2 top-full"
                                                >
                                                    <DropdownItem
                                                        onItemClick={() => { closeDropdown(); openEditModal(user); }}
                                                        className="flex gap-2 items-center"
                                                    >
                                                        <PencilIcon className="w-4 h-4" />
                                                        Edit Role
                                                    </DropdownItem>
                                                    <DropdownItem
                                                        onItemClick={() => { closeDropdown(); setDeletingUser(user); }}
                                                        className="flex gap-2 items-center text-red-500"
                                                    >
                                                        <TrashBinIcon className="w-4 h-4" />
                                                        Delete
                                                    </DropdownItem>
                                                </Dropdown>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Edit Role Modal */}
            <Modal isOpen={!!editingUser} onClose={() => setEditingUser(null)} className="max-w-sm mx-4 p-6">
                <div className="pt-4 pb-2">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-1">Edit Role</h3>
                    <p className="text-sm text-gray-500 mb-5">{editingUser?.email}</p>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role</label>
                    <CustomSelect
                        value={selectedRole}
                        onChange={(v) => setSelectedRole(v)}
                        options={roles.map((r) => ({ value: r, label: r }))}
                        placeholder="Select role"
                    />
                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={() => setEditingUser(null)}
                            className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveRole}
                            disabled={isSaving}
                            className="flex-1 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
                        >
                            {isSaving ? "Saving..." : "Save"}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={!!deletingUser} onClose={() => setDeletingUser(null)} className="max-w-sm mx-4 p-6">
                <div className="flex flex-col items-center gap-4 pt-4 pb-2 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                        <TrashBinIcon className="w-7 h-7 text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-gray-800 dark:text-white">Delete User</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Are you sure you want to delete <span className="font-medium">{deletingUser?.email}</span>? This cannot be undone.
                        </p>
                    </div>
                    <div className="flex gap-3 w-full">
                        <button
                            onClick={() => setDeletingUser(null)}
                            className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
