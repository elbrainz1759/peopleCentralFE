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
import { PencilIcon, TrashBinIcon, MoreDotIcon } from "@/icons";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Modal } from "../ui/modal";
import CustomSelect from "../form/CustomSelect";
import { Drawer } from "../ui/drawer/Drawer";
import Input from "../form/input/InputField";
import Label from "../form/Label";

interface User {
    id: string;
    unique_id?: string;
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
    first_name?: string;
    last_name?: string;
    staffId?: string | number;
    staff_id?: string | number;
    designation?: string;
    locationId?: string;
    location_id?: string;
    programId?: string;
    program_id?: string;
    departmentId?: string;
    department_id?: string;
    countryId?: string;
    country_id?: string;
    status?: string;
}

export default function UserTable() {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<string[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [programs, setPrograms] = useState<any[]>([]);
    const [countries, setCountries] = useState<any[]>([]);
    const [locations, setLocations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editForm, setEditForm] = useState({
        firstName: "",
        lastName: "",
        staffId: "",
        email: "",
        designation: "",
        locationId: "",
        programId: "",
        departmentId: "",
        countryId: "",
        role: "",
    });
    const [isSaving, setIsSaving] = useState(false);

    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchUsers();
        fetchLookupData();
    }, []);

    const fetchLookupData = async () => {
        try {
            const [rolesRes, deptsRes, progsRes, countriesRes, locsRes] = await Promise.all([
                userService.getAllRoles().catch(() => []),
                userService.getAllDepartments().catch(() => []),
                userService.getAllPrograms().catch(() => []),
                userService.getAllCountries().catch(() => []),
                userService.getAllLocations().catch(() => []),
            ]);
            const toList = (r: any) => (r as any)?.data ?? (Array.isArray(r) ? r : []);
            setRoles(toList(rolesRes).map((r: any) => r.name));
            setDepartments(toList(deptsRes));
            setPrograms(toList(progsRes));
            setCountries(toList(countriesRes));
            setLocations(toList(locsRes));
        } catch { /* ignore */ }
    };

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const data = await userService.getAll();
            setUsers(Array.isArray(data) ? data : []);
        } catch (error: any) {
            toast.error("Failed to load users");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleDropdown = (id: string) => setOpenDropdownId(openDropdownId === id ? null : id);
    const closeDropdown = () => setOpenDropdownId(null);

    const openEditDrawer = (user: User) => {
        setEditingUser(user);
        setEditForm({
            firstName: user.firstName ?? user.first_name ?? "",
            lastName: user.lastName ?? user.last_name ?? "",
            staffId: String(user.staffId ?? user.staff_id ?? ""),
            email: user.email ?? "",
            designation: user.designation ?? "",
            locationId: user.locationId ?? user.location_id ?? "",
            programId: user.programId ?? user.program_id ?? "",
            departmentId: user.departmentId ?? user.department_id ?? "",
            countryId: user.countryId ?? user.country_id ?? "",
            role: user.role ?? "",
        });
    };

    const handleSaveUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        const id = editingUser.unique_id || editingUser.id;
        setIsSaving(true);
        try {
            await Promise.all([
                userService.updateEmployee(id, {
                    firstName: editForm.firstName,
                    lastName: editForm.lastName,
                    staffId: parseInt(editForm.staffId, 10) || 0,
                    email: editForm.email,
                    status: editingUser.status ?? "Active",
                    designation: editForm.designation,
                    locationId: editForm.locationId,
                    programId: editForm.programId,
                    departmentId: editForm.departmentId,
                    countryId: editForm.countryId,
                }),
                userService.updateUserRole(id, editForm.role),
            ]);
            toast.success("User updated successfully");
            setEditingUser(null);
            fetchUsers();
        } catch (err: any) {
            toast.error(err.message || "Failed to update user");
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
        const fullName = `${user.firstName ?? user.first_name ?? ""} ${user.lastName ?? user.last_name ?? ""}`.toLowerCase();
        return (
            fullName.includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.id || "").toLowerCase().includes(searchTerm.toLowerCase())
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
                                                    {((user.firstName ?? user.first_name ?? "")?.[0] ?? "") + ((user.lastName ?? user.last_name ?? "")?.[0] ?? user.email[0])}
                                                </div>
                                                <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                    {(user.firstName ?? user.first_name) ? `${user.firstName ?? user.first_name} ${user.lastName ?? user.last_name}` : "N/A"}
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
                                                        onItemClick={() => { closeDropdown(); openEditDrawer(user); }}
                                                        className="flex gap-2 items-center"
                                                    >
                                                        <PencilIcon className="w-4 h-4" />
                                                        Edit User
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

            {/* Edit User Drawer */}
            <Drawer
                isOpen={!!editingUser}
                onClose={() => setEditingUser(null)}
                title="Edit User"
            >
                <form onSubmit={handleSaveUser} className="p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>First Name</Label>
                            <Input type="text" placeholder="John"
                                value={editForm.firstName}
                                onChange={(e) => setEditForm(p => ({ ...p, firstName: e.target.value }))} />
                        </div>
                        <div>
                            <Label>Last Name</Label>
                            <Input type="text" placeholder="Doe"
                                value={editForm.lastName}
                                onChange={(e) => setEditForm(p => ({ ...p, lastName: e.target.value }))} />
                        </div>
                    </div>

                    <div>
                        <Label>Staff ID</Label>
                        <Input type="number" placeholder="e.g. 1042"
                            value={editForm.staffId}
                            onChange={(e) => setEditForm(p => ({ ...p, staffId: e.target.value }))} />
                    </div>

                    <div>
                        <Label>Email Address</Label>
                        <Input type="email" placeholder="you@mercycorps.org"
                            value={editForm.email}
                            onChange={(e) => setEditForm(p => ({ ...p, email: e.target.value }))} />
                    </div>

                    <div>
                        <Label>Designation</Label>
                        <Input type="text" placeholder="e.g. Software Engineer"
                            value={editForm.designation}
                            onChange={(e) => setEditForm(p => ({ ...p, designation: e.target.value }))} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Country</Label>
                            <CustomSelect
                                value={editForm.countryId}
                                onChange={(v) => setEditForm(p => ({ ...p, countryId: v }))}
                                options={countries.map((c: any) => ({ value: c.unique_id, label: c.name }))}
                                placeholder="Select Country"
                            />
                        </div>
                        <div>
                            <Label>Department</Label>
                            <CustomSelect
                                value={editForm.departmentId}
                                onChange={(v) => setEditForm(p => ({ ...p, departmentId: v }))}
                                options={departments.map((d: any) => ({ value: d.unique_id, label: d.name }))}
                                placeholder="Select Department"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Location</Label>
                            <CustomSelect
                                value={editForm.locationId}
                                onChange={(v) => setEditForm(p => ({ ...p, locationId: v }))}
                                options={locations.map((l: any) => ({ value: l.unique_id, label: l.name }))}
                                placeholder="Select Location"
                            />
                        </div>
                        <div>
                            <Label>Program</Label>
                            <CustomSelect
                                value={editForm.programId}
                                onChange={(v) => setEditForm(p => ({ ...p, programId: v }))}
                                options={programs.map((p: any) => ({ value: p.unique_id, label: p.name }))}
                                placeholder="Select Program"
                            />
                        </div>
                    </div>

                    <div>
                        <Label>Role</Label>
                        <CustomSelect
                            value={editForm.role}
                            onChange={(v) => setEditForm(p => ({ ...p, role: v }))}
                            options={roles.map((r) => ({ value: r, label: r }))}
                            placeholder="Select Role"
                        />
                    </div>

                    <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full py-4 bg-brand-500 text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSaving && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </Drawer>

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
