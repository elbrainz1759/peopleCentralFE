"use client";
import React, { useState } from "react";
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
import { Drawer } from "../ui/drawer/Drawer";
import EmployeeProfile from "./EmployeeProfile";

// Interface for Employee
interface Employee {
    id: string;
    name: string;
    designation: string;
    department: string;
    status: "Active" | "On-boarding" | "Suspended" | "Exited";
    joinedDate: string;
    contractStart: string;
    contractEnd: string;
    email: string;
}

// Mock Data
const employeeData: Employee[] = [
    {
        id: "EMP1001",
        name: "Amara Okoro",
        designation: "Software Engineer",
        department: "Engineering",
        status: "Active",
        joinedDate: "2024-03-01",
        contractStart: "2024-03-01",
        contractEnd: "2026-03-01",
        email: "amara.o@company.com",
    },
    {
        id: "EMP1002",
        name: "Kwame Asante",
        designation: "HR Manager",
        department: "HR",
        status: "Active",
        joinedDate: "2023-11-15",
        contractStart: "2023-11-15",
        contractEnd: "2026-04-15",
        email: "kwame.a@company.com",
    },
    {
        id: "EMP1003",
        name: "Fatima Zahra",
        designation: "Product Designer",
        department: "Product",
        status: "Active",
        joinedDate: "2024-01-10",
        contractStart: "2024-01-10",
        contractEnd: "2025-05-10",
        email: "fatima.z@company.com",
    },
    {
        id: "EMP1004",
        name: "Siddharth Nair",
        designation: "Financial Analyst",
        department: "Finance",
        status: "Active",
        joinedDate: "2024-02-20",
        contractStart: "2024-02-20",
        contractEnd: "2026-02-20",
        email: "siddharth.n@company.com",
    },
    {
        id: "EMP1005",
        name: "Carlos Mendez",
        designation: "Junior Dev",
        department: "Engineering",
        status: "On-boarding",
        joinedDate: "2025-02-01",
        contractStart: "2025-02-01",
        contractEnd: "2026-02-01",
        email: "carlos.m@company.com",
    },
    {
        id: "EMP1006",
        name: "Yuki Tanaka",
        designation: "Marketing Specialist",
        department: "Marketing",
        status: "Suspended",
        joinedDate: "2023-05-12",
        contractStart: "2023-05-12",
        contractEnd: "2025-04-12",
        email: "yuki.t@company.com",
    }
];

export default function EmployeeTable() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDepartment, setFilterDepartment] = useState("All");
    const [filterStatus, setFilterStatus] = useState("All");
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);

    const toggleDropdown = (id: string) => {
        setOpenDropdownId(openDropdownId === id ? null : id);
    };

    const closeDropdown = () => setOpenDropdownId(null);

    const handleView = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsViewOpen(true);
    };

    const filteredEmployees = employeeData.filter((emp) => {
        const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = filterDepartment === "All" || emp.department === filterDepartment;
        const matchesStatus = filterStatus === "All" || emp.status === filterStatus;
        return matchesSearch && matchesDept && matchesStatus;
    });

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">

            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap items-center gap-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Staff Directory
                    </h3>
                    <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-500 rounded-full dark:bg-gray-800 dark:text-gray-400">
                        {filteredEmployees.length} Total
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by ID or Name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-60 rounded-lg border border-gray-300 bg-white px-4 py-2 text-theme-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:focus:border-brand-500"
                        />
                    </div>

                    {/* Department */}
                    <select
                        value={filterDepartment}
                        onChange={(e) => setFilterDepartment(e.target.value)}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-theme-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                    >
                        <option value="All">All Departments</option>
                        <option value="Engineering">Engineering</option>
                        <option value="HR">HR</option>
                        <option value="Product">Product</option>
                        <option value="Finance">Finance</option>
                        <option value="Marketing">Marketing</option>
                    </select>

                    {/* Status */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-theme-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                    >
                        <option value="All">All Status</option>
                        <option value="Active">Active</option>
                        <option value="On-boarding">On-boarding</option>
                        <option value="Suspended">Suspended</option>
                        <option value="Exited">Exited</option>
                    </select>
                </div>
            </div>

            <div className="max-w-full overflow-x-auto min-h-[400px]">
                <Table>
                    <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                        <TableRow>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Employee
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Designation
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Department
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Joined Date
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Contract Period
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
                        {filteredEmployees.map((emp) => (
                            <TableRow key={emp.id}>
                                <TableCell className="py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 flex items-center justify-center rounded-full shrink-0 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold text-xs uppercase">
                                            {emp.name.split(" ").map(n => n[0]).join("")}
                                        </div>
                                        <div>
                                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                {emp.name}
                                            </span>
                                            <span className="block text-xs text-gray-500 dark:text-gray-400 italic">
                                                {emp.id}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {emp.designation}
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {emp.department}
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {emp.joinedDate}
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs">{emp.contractStart} to</span>
                                        <span className="text-xs font-semibold">{emp.contractEnd}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-3">
                                    <Badge
                                        size="sm"
                                        color={
                                            emp.status === "Active"
                                                ? "success"
                                                : emp.status === "On-boarding"
                                                    ? "info"
                                                    : emp.status === "Suspended"
                                                        ? "error"
                                                        : "warning"
                                        }
                                    >
                                        {emp.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    <div className="relative">
                                        <button
                                            onClick={() => toggleDropdown(emp.id)}
                                            className="dropdown-toggle text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                            style={{ transform: 'rotate(90deg)' }}
                                        >
                                            <MoreDotIcon className="w-5 h-5" />
                                        </button>
                                        <Dropdown
                                            isOpen={openDropdownId === emp.id}
                                            onClose={closeDropdown}
                                            className="w-40 right-0 mt-2 top-full"
                                        >
                                            <DropdownItem
                                                onItemClick={() => {
                                                    closeDropdown();
                                                    handleView(emp);
                                                }}
                                                className="flex gap-2 items-center"
                                            >
                                                <EyeIcon className="w-4 h-4" />
                                                View Profile
                                            </DropdownItem>
                                            <DropdownItem
                                                onItemClick={() => {
                                                    closeDropdown();
                                                    alert("Editing " + emp.name);
                                                }}
                                                className="flex gap-2 items-center"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                                Edit Record
                                            </DropdownItem>
                                            <DropdownItem
                                                onItemClick={() => {
                                                    closeDropdown();
                                                    alert("Deleting " + emp.name);
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
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Drawer
                isOpen={isViewOpen}
                onClose={() => setIsViewOpen(false)}
                title="Employee Profile"
            >
                <div className="p-6">
                    {selectedEmployee && <EmployeeProfile employee={selectedEmployee} />}
                </div>
            </Drawer>
        </div>
    );
}
