"use client";
import React, { useState } from "react";
import InputField from "../form/input/InputField";
import { userService } from "@/services/user.service";
import { Employee } from "@/types/service.types";
import { toast } from "react-hot-toast";

interface EditEmployeeFormProps {
    employee: Employee;
    onSuccess?: () => void;
}

export default function EditEmployeeForm({ employee, onSuccess }: EditEmployeeFormProps) {
    const [formData, setFormData] = useState({
        firstName: employee.first_name || "",
        lastName: employee.last_name || "",
        staffId: String(employee.staff_id || employee.id || ""),
        email: employee.email || "",
        designation: employee.designation || "",
        locationId: employee.location || "",
        supervisorId: employee.supervisor || "",
        programId: employee.program || "",
        departmentId: employee.department || "",
        countryId: employee.country || "",
    });

    const [departments, setDepartments] = useState<any[]>([]);
    const [programs, setPrograms] = useState<any[]>([]);
    const [countries, setCountries] = useState<any[]>([]);
    const [locations, setLocations] = useState<any[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isFetchingData, setIsFetchingData] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    React.useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [deptsRes, progsRes, countriesRes, locsRes, empsRes] = await Promise.all([
                    userService.getAllDepartments(),
                    userService.getAllPrograms(),
                    userService.getAllCountries(),
                    userService.getAllLocations().catch(() => []),
                    userService.getAllEmployees().catch(() => ({ data: [] })),
                ]);

                const depts = (deptsRes as any)?.data || (Array.isArray(deptsRes) ? deptsRes : []);
                const progs = (progsRes as any)?.data || (Array.isArray(progsRes) ? progsRes : []);
                const countrs = (countriesRes as any)?.data || (Array.isArray(countriesRes) ? countriesRes : []);
                const locs = (locsRes as any)?.data || (Array.isArray(locsRes) ? locsRes : []);
                const emps = (empsRes as any)?.data || [];

                setDepartments(depts);
                setPrograms(progs);
                setCountries(countrs);
                setLocations(locs);
                setEmployees(emps);

                // Re-map IDs once we have the lookup data
                const matchedDept = depts.find((d: any) => d.name === employee.department_name || d.name === employee.department || d.unique_id === employee.department);
                const matchedProg = progs.find((p: any) => p.name === employee.program_name || p.name === employee.program || p.unique_id === employee.program);
                const matchedCountry = countrs.find((c: any) => c.name === employee.country || c.unique_id === employee.country);
                const matchedLoc = locs.find((l: any) => l.name === employee.location_name || l.name === employee.location || l.unique_id === employee.location);
                const matchedSupervisor = emps.find((e: Employee) => {
                    const supName = employee.supervisor_name || employee.supervisor;
                    const empFullName = `${e.first_name} ${e.last_name}`;
                    return e.unique_id === employee.supervisor || empFullName === supName;
                });

                setFormData(prev => ({
                    ...prev,
                    departmentId: matchedDept?.unique_id || prev.departmentId,
                    programId: matchedProg?.unique_id || prev.programId,
                    countryId: matchedCountry?.unique_id || prev.countryId,
                    locationId: matchedLoc?.unique_id || prev.locationId,
                    supervisorId: matchedSupervisor?.unique_id || prev.supervisorId,
                }));
            } catch (err) {
                console.error("Failed to load setup data", err);
                toast.error("Error loading setup data");
            } finally {
                setIsFetchingData(false);
            }
        };

        loadInitialData();
    }, [employee]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const submissionData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                staffId: parseInt(formData.staffId, 10),
                email: formData.email,
                designation: formData.designation,
                locationId: formData.locationId,
                supervisorId: formData.supervisorId,
                programId: formData.programId,
                departmentId: formData.departmentId,
                countryId: formData.countryId,
            };

            console.log("Updating employee data:", submissionData);

            await userService.updateEmployee(employee.unique_id || String(employee.id), submissionData);
            toast.success("Employee updated successfully!");
            if (onSuccess) onSuccess();
        } catch (err: any) {
            const message = err.message || "Failed to update employee";
            setError(message);
            toast.error(message);
            console.error("Employee update error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isFetchingData) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/30">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500/20 border-t-brand-500 mb-4 mx-auto"></div>
                <p className="text-gray-500 font-medium">Loading employee data...</p>
            </div>
        );
    }

    return (
        <div className="p-1">
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Section 1: Staff Identification */}
                <div>
                    <h4 className="mb-5 text-sm font-bold text-gray-400 uppercase tracking-widest dark:text-gray-500">
                        Staff Identification
                    </h4>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <InputField
                            label="First Name"
                            name="firstName"
                            id="edit_firstName"
                            placeholder="e.g. John"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                        />
                        <InputField
                            label="Last Name"
                            name="lastName"
                            id="edit_lastName"
                            placeholder="e.g. Doe"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                        />
                        <InputField
                            label="Staff ID"
                            name="staffId"
                            id="edit_staffId"
                            type="number"
                            placeholder="e.g. 433434"
                            value={formData.staffId}
                            onChange={handleInputChange}
                            required
                        />
                        <InputField
                            label="Official Email"
                            name="email"
                            id="edit_email"
                            type="email"
                            placeholder="john.doe@mercycorps.org"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                        <div className="sm:col-span-2">
                            <InputField
                                label="Designation"
                                name="designation"
                                id="edit_designation"
                                placeholder="e.g. Program Manager"
                                value={formData.designation}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: Deployment & Reporting */}
                <div>
                    <h4 className="mb-5 text-sm font-bold text-gray-400 uppercase tracking-widest dark:text-gray-500">
                        Deployment & Reporting
                    </h4>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Work Location</label>
                            {locations.length > 0 ? (
                                <select
                                    name="locationId"
                                    id="edit_locationId"
                                    value={formData.locationId}
                                    onChange={handleInputChange}
                                    className="w-full h-11 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300"
                                >
                                    <option value="">Select Location</option>
                                    {locations.map((l: any) => (
                                        <option key={l.unique_id || l.id} value={l.unique_id}>{l.name}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    name="locationId"
                                    id="edit_locationId"
                                    type="text"
                                    placeholder="e.g. Location ID"
                                    value={formData.locationId}
                                    onChange={handleInputChange}
                                    className="w-full h-11 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300"
                                />
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Supervisor</label>
                            {employees.length > 0 ? (
                                <select
                                    name="supervisorId"
                                    id="edit_supervisorId"
                                    value={formData.supervisorId}
                                    onChange={handleInputChange}
                                    className="w-full h-11 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300"
                                >
                                    <option value="">Select Supervisor</option>
                                    {employees
                                        .filter(e => e.unique_id !== employee.unique_id)
                                        .map((e: Employee) => (
                                            <option key={e.unique_id || e.id} value={e.unique_id}>
                                                {e.first_name} {e.last_name} ({e.staff_id})
                                            </option>
                                        ))}
                                </select>
                            ) : (
                                <input
                                    name="supervisorId"
                                    id="edit_supervisorId"
                                    type="text"
                                    placeholder="e.g. Supervisor ID"
                                    value={formData.supervisorId}
                                    onChange={handleInputChange}
                                    className="w-full h-11 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300"
                                />
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Country</label>
                            <select
                                name="countryId"
                                id="edit_countryId"
                                value={formData.countryId}
                                onChange={handleInputChange}
                                className="w-full h-11 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300"
                            >
                                <option value="">Choose Country</option>
                                {countries.map((c: any) => (
                                    <option key={c.unique_id || c.id} value={c.unique_id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Department</label>
                            <select
                                name="departmentId"
                                id="edit_departmentId"
                                value={formData.departmentId}
                                onChange={handleInputChange}
                                className="w-full h-11 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300"
                            >
                                <option value="">Choose Department</option>
                                {departments.map((d: any) => (
                                    <option key={d.unique_id || d.id} value={d.unique_id}>{d.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Program</label>
                            <select
                                name="programId"
                                id="edit_programId"
                                value={formData.programId}
                                onChange={handleInputChange}
                                className="w-full h-11 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300"
                            >
                                <option value="">Select a Program</option>
                                {programs.map((p: any) => (
                                    <option key={p.unique_id || p.id} value={p.unique_id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                        {error}
                    </div>
                )}

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-6 sticky bottom-0 bg-white dark:bg-gray-900 pb-4 border-t border-gray-100 dark:border-gray-800 mt-6 lg:-mx-6 lg:px-6">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`flex-1 sm:flex-none justify-center rounded-xl bg-brand-500 px-10 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-600 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:hover:scale-100 ${isSubmitting ? 'cursor-not-allowed' : ''
                            }`}
                    >
                        {isSubmitting ? "Updating Employee..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}
