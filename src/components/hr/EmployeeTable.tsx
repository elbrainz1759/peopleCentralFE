"use client";
import React, { useState, useEffect } from "react";
import { userService } from "@/services/user.service";
import { Employee } from "@/types/service.types";
import { toast } from "react-hot-toast";
import CustomSelect from "@/components/form/CustomSelect";
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
import EditEmployeeForm from "./EditEmployeeForm";
import ApproveEmployee from "./ApproveEmployee";



export default function EmployeeTable() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDepartment, setFilterDepartment] = useState("All");
    const [filterLocation, setFilterLocation] = useState("All");
    const [departments, setDepartments] = useState<any[]>([]);
    const [locations, setLocations] = useState<any[]>([]);
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const [isApproveOpen, setIsApproveOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);

    const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    useEffect(() => {
        fetchEmployees();
        userService.getAllDepartments().then((data) => setDepartments(Array.isArray(data) ? data : (data as any)?.data || [])).catch(() => {});
        userService.getAllLocations().then((data) => setLocations(Array.isArray(data) ? data : (data as any)?.data || [])).catch(() => {});
    }, []);

    const fetchEmployees = async () => {
        setIsLoading(true);
        try {
            const response = await userService.getAllEmployees();
            setEmployees(response.data || []);
            console.log("Fetched employees:", response.data);
        } catch (error: any) {
            console.error("Error fetching employees:", error);
            toast.error("Failed to load employees");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleDropdown = (id: string) => {
        setOpenDropdownId(openDropdownId === id ? null : id);
    };

    const closeDropdown = () => setOpenDropdownId(null);

    const handleView = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsViewOpen(true);
    };

    const handleEdit = (employee: Employee) => {
        setEditEmployee(employee);
        setIsEditOpen(true);
    };

const PENDING_STATUSES = ["On-boarding", "Pending", "pending"];

    const filteredEmployees = employees.filter((emp) => {
        if (PENDING_STATUSES.includes(emp.status)) return false;
        const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.toLowerCase();
        const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
            String(emp.staff_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(emp.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(emp.designation || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = filterDepartment === "All" || emp.department === filterDepartment || emp.department_name === filterDepartment;
        const matchesLocation = filterLocation === "All" || emp.location === filterLocation || emp.location_name === filterLocation;
        return matchesSearch && matchesDept && matchesLocation;
    });

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">

            {/* Filters */}
            <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Staff Directory
                    </h3>
                    <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-500 rounded-full dark:bg-gray-800 dark:text-gray-400">
                        {filteredEmployees.length} Total
                    </span>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                    <input
                        type="text"
                        placeholder="Search by ID or Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-52 rounded-lg border border-gray-300 bg-white px-4 py-2 text-theme-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:focus:border-brand-500"
                    />
                    <div className="flex gap-2">
                        <CustomSelect
                            value={filterDepartment}
                            onChange={(v) => setFilterDepartment(v)}
                            options={[
                                { value: "All", label: "All Departments" },
                                ...departments.map((d) => ({ value: d.name, label: d.name })),
                            ]}
                            placeholder="All Departments"
                            className="flex-1 sm:flex-none sm:w-44"
                        />
                        <CustomSelect
                            value={filterLocation}
                            onChange={(v) => setFilterLocation(v)}
                            options={[
                                { value: "All", label: "All Locations" },
                                ...locations.map((l) => ({ value: l.name, label: l.name })),
                            ]}
                            placeholder="All Locations"
                            className="flex-1 sm:flex-none sm:w-36"
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-full overflow-x-auto min-h-[400px]">
                <Table>
                    <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                        <TableRow>
                            <TableCell isHeader className="sticky left-0 z-10 bg-white dark:bg-gray-900 py-3 px-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 min-w-[180px]">
                                Employee
                            </TableCell>
                            <TableCell isHeader className="hidden sm:table-cell py-3 px-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 min-w-[90px]">
                                Staff ID
                            </TableCell>
                            <TableCell isHeader className="hidden lg:table-cell py-3 px-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 min-w-[200px]">
                                Email
                            </TableCell>
                            <TableCell isHeader className="hidden md:table-cell py-3 px-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 min-w-[160px]">
                                Designation
                            </TableCell>
                            <TableCell isHeader className="hidden sm:table-cell py-3 px-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 min-w-[100px]">
                                Location
                            </TableCell>
                            <TableCell isHeader className="hidden lg:table-cell py-3 px-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 min-w-[140px]">
                                Program
                            </TableCell>
                            <TableCell isHeader className="py-3 px-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 min-w-[120px]">
                                Department
                            </TableCell>
                            <TableCell isHeader className="hidden md:table-cell py-3 px-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 min-w-[140px]">
                                Supervisor
                            </TableCell>
                            <TableCell isHeader className="hidden lg:table-cell py-3 px-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 min-w-[110px]">
                                Created At
                            </TableCell>
                            <TableCell isHeader className="py-3 px-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 min-w-[70px]">
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={10} className="py-10 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
                                        <span>Loading employees...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredEmployees.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={10} className="py-10 text-center text-gray-500">
                                    No employees found matching your criteria.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredEmployees.map((emp) => (
                                <TableRow key={emp.unique_id || String(emp.id)}>
                                    <TableCell className="sticky left-0 z-10 bg-white dark:bg-gray-900 py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 flex items-center justify-center rounded-full shrink-0 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold text-xs uppercase">
                                                {(emp.first_name?.[0] || "") + (emp.last_name?.[0] || "")}
                                            </div>
                                            <div>
                                                <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90 whitespace-nowrap">
                                                    {emp.first_name} {emp.last_name}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell py-3 px-4 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">
                                        {String(emp.staff_id || emp.id)}
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell py-3 px-4 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">
                                        {emp.email}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell py-3 px-4 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">
                                        {emp.designation || 'N/A'}
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell py-3 px-4 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">
                                        {emp.location_name || emp.location || 'N/A'}
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell py-3 px-4 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">
                                        {emp.program_name || emp.program || 'N/A'}
                                    </TableCell>
                                    <TableCell className="py-3 px-4 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">
                                        {emp.department_name || emp.department || 'N/A'}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell py-3 px-4 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">
                                        {emp.supervisor_name || emp.supervisor || 'N/A'}
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell py-3 px-4 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">
                                        {emp.created_at ? new Date(emp.created_at).toLocaleDateString() : "N/A"}
                                    </TableCell>
                                    <TableCell className="py-3 px-4 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">
                                        <div className="relative">
                                            <button
                                                onClick={() => toggleDropdown(String(emp.id || emp.staff_id))}
                                                className="dropdown-toggle text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                                style={{ transform: 'rotate(90deg)' }}
                                            >
                                                <MoreDotIcon className="w-5 h-5" />
                                            </button>
                                            <Dropdown
                                                isOpen={openDropdownId === String(emp.id || emp.staff_id)}
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
                                                        handleEdit(emp);
                                                    }}
                                                    className="flex gap-2 items-center"
                                                >
                                                    <PencilIcon className="w-4 h-4" />
                                                    Edit Record
                                                </DropdownItem>
<DropdownItem
                                                    onItemClick={() => {
                                                        closeDropdown();
                                                        alert("Deleting " + emp.first_name);
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

            <Drawer
                isOpen={isViewOpen}
                onClose={() => setIsViewOpen(false)}
                title="Employee Profile"
            >
                <div className="p-6">
                    {selectedEmployee && <EmployeeProfile employee={selectedEmployee} />}
                </div>
            </Drawer>


            <Drawer
                isOpen={isApproveOpen}
                onClose={() => setIsApproveOpen(false)}
                title="Approve Employee"
            >
                    <div className= "p-6">
                        {selectedEmployee && <ApproveEmployee employee={selectedEmployee} onSuccess= {()=>{}} />}
                </div>
                </Drawer>
            <Drawer
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                title="Edit Employee"
            >
                <div className="p-6">
                    {editEmployee && (
                        <EditEmployeeForm
                            employee={editEmployee}
                            onSuccess={() => {
                                setIsEditOpen(false);
                                fetchEmployees();
                            }}
                        />
                    )}
                </div>
            </Drawer>
        </div>
    );
}
