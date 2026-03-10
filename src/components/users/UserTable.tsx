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
import EditUserModal from "./EditUserModal";
import DeleteUserModal from "./DeleteUserModal";

export interface User {
    id: string | number;
    unique_id: string;
    email: string;
    role: string;
    first_name?: string;
    last_name?: string;
    status?: string;
}

export default function UserTable() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

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

    const filteredUsers = users.filter((user) => {
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
        const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.unique_id || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (user: User) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteSuccess = () => {
        setIsDeleteModalOpen(false);
        fetchUsers();
    };

    const handleEditSuccess = () => {
        setIsEditModalOpen(false);
        fetchUsers();
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap items-center gap-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        System Users
                    </h3>
                    <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-500 rounded-full dark:bg-gray-800 dark:text-gray-400">
                        {filteredUsers.length} Total
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
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
            </div>

            <div className="max-w-full overflow-x-auto min-h-[400px]">
                <Table>
                    <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                        <TableRow>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                User
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Email
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Role
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
                                <TableCell colSpan={5} className="py-10 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
                                        <span>Loading users...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="py-10 text-center text-gray-500">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.unique_id}>
                                    <TableCell className="py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 flex items-center justify-center rounded-full shrink-0 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold text-xs uppercase">
                                                {(user.first_name?.[0] || "") + (user.last_name?.[0] || user.email[0])}
                                            </div>
                                            <div>
                                                <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                    {user.first_name ? `${user.first_name} ${user.last_name}` : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {user.email}
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        <Badge
                                            size="sm"
                                            color={
                                                user.role === "Superadmin"
                                                    ? "error"
                                                    : user.role === "Admin"
                                                        ? "warning"
                                                        : "info"
                                            }
                                        >
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-3">
                                        <Badge
                                            size="sm"
                                            color="success"
                                        >
                                            Active
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        <div className="relative">
                                            <button
                                                onClick={() => toggleDropdown(user.unique_id)}
                                                className="dropdown-toggle text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                                style={{ transform: 'rotate(90deg)' }}
                                            >
                                                <MoreDotIcon className="w-5 h-5" />
                                            </button>
                                            <Dropdown
                                                isOpen={openDropdownId === user.unique_id}
                                                onClose={closeDropdown}
                                                className="w-40 right-0 mt-2 top-full"
                                            >
                                                <DropdownItem
                                                    onItemClick={() => {
                                                        closeDropdown();
                                                        toast.success("View details for " + user.email);
                                                    }}
                                                    className="flex gap-2 items-center"
                                                >
                                                    <EyeIcon className="w-4 h-4" />
                                                    View Details
                                                </DropdownItem>
                                                <DropdownItem
                                                    onItemClick={() => {
                                                        closeDropdown();
                                                        handleEdit(user);
                                                    }}
                                                    className="flex gap-2 items-center"
                                                >
                                                    <PencilIcon className="w-4 h-4" />
                                                    Edit Role
                                                </DropdownItem>
                                                <DropdownItem
                                                    onItemClick={() => {
                                                        closeDropdown();
                                                        handleDeleteClick(user);
                                                    }}
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

            <EditUserModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={selectedUser}
                onSuccess={handleEditSuccess}
            />

            <DeleteUserModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                user={selectedUser}
                onSuccess={handleDeleteSuccess}
            />
        </div>
    );
}
