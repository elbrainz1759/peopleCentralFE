"use client";
import React, { useState } from "react";
import InputField from "../form/input/InputField";
import { userService } from "@/services/user.service";
import { Employee } from "@/types/service.types";
import { toast } from "react-hot-toast";
import CustomSelect from "@/components/form/CustomSelect";

export default function AddEmployeeForm({ onSuccess }: { onSuccess?: () => void }) {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        staffId: "",
        email: "",
        designation: "",
        locationId: "",
        supervisorId: "",
        programId: "",
        departmentId: "",
        countryId: "",
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
            } catch (err) {
                console.error("Failed to load setup data", err);
                toast.error("Error loading setup data");
            } finally {
                setIsFetchingData(false);
            }
        };

        loadInitialData();
    }, []);

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

            console.log("Submitting employee data:", submissionData);

            await userService.createEmployee(submissionData);
            toast.success("Employee profile created successfully!");
            if (onSuccess) onSuccess();
        } catch (err: any) {
            const message = err.message || "Failed to create employee";
            setError(message);
            toast.error(message);
            console.error("Employee creation error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            firstName: "",
            lastName: "",
            staffId: "",
            email: "",
            designation: "",
            locationId: "",
            supervisorId: "",
            programId: "",
            departmentId: "",
            countryId: "",
        });
        setError(null);
    };

    if (isFetchingData) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/30">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500/20 border-t-brand-500 mb-4 mx-auto"></div>
                <p className="text-gray-500 font-medium">Synchronizing organizational data...</p>
            </div>
        );
    }

    return (
        <div className="p-1">
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Section 1: Personal Identification */}
                <div>
                    <h4 className="mb-5 text-sm font-bold text-gray-400 uppercase tracking-widest dark:text-gray-500">
                        Staff Identification
                    </h4>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <InputField
                            label="First Name"
                            name="firstName"
                            id="firstName"
                            placeholder="e.g. John"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                        />
                        <InputField
                            label="Last Name"
                            name="lastName"
                            id="lastName"
                            placeholder="e.g. Doe"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                        />
                        <InputField
                            label="Staff ID"
                            name="staffId"
                            id="staffId"
                            type="number"
                            placeholder="e.g. 433434"
                            value={formData.staffId}
                            onChange={handleInputChange}
                            required
                        />
                        <InputField
                            label="Official Email"
                            name="email"
                            id="email"
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
                                id="designation"
                                placeholder="e.g. Program Manager"
                                value={formData.designation}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: Deployment Details */}
                <div>
                    <h4 className="mb-5 text-sm font-bold text-gray-400 uppercase tracking-widest dark:text-gray-500">
                        Deployment & Reporting
                    </h4>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Work Location</label>
                            {locations.length > 0 ? (
                                <CustomSelect
                                    value={formData.locationId}
                                    onChange={(v) => setFormData((prev) => ({ ...prev, locationId: v }))}
                                    options={locations.map((l: any) => ({ value: l.unique_id, label: l.name }))}
                                    placeholder="Select Location"
                                />
                            ) : (
                                <input
                                    name="locationId"
                                    id="locationId"
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
                                <CustomSelect
                                    value={formData.supervisorId}
                                    onChange={(v) => setFormData((prev) => ({ ...prev, supervisorId: v }))}
                                    options={employees.map((e: Employee) => ({
                                        value: e.unique_id,
                                        label: `${e.first_name} ${e.last_name} (${e.staff_id})`,
                                    }))}
                                    placeholder="Select Supervisor"
                                />
                            ) : (
                                <input
                                    name="supervisorId"
                                    id="supervisorId"
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
                            <CustomSelect
                                value={formData.countryId}
                                onChange={(v) => setFormData((prev) => ({ ...prev, countryId: v }))}
                                options={countries.map((c: any) => ({ value: c.unique_id, label: c.name }))}
                                placeholder="Choose Country"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Department</label>
                            <CustomSelect
                                value={formData.departmentId}
                                onChange={(v) => setFormData((prev) => ({ ...prev, departmentId: v }))}
                                options={departments.map((d: any) => ({ value: d.unique_id, label: d.name }))}
                                placeholder="Choose Department"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Program</label>
                            <CustomSelect
                                value={formData.programId}
                                onChange={(v) => setFormData((prev) => ({ ...prev, programId: v }))}
                                options={programs.map((p: any) => ({ value: p.unique_id, label: p.name }))}
                                placeholder="Select a Program"
                            />
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
                        type="button"
                        onClick={resetForm}
                        className="flex-1 sm:flex-none justify-center rounded-xl border border-gray-200 bg-white px-8 py-3 text-sm font-semibold text-gray-600 shadow-sm transition-all hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        Clear Form
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`flex-1 sm:flex-none justify-center rounded-xl bg-brand-500 px-10 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-600 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:hover:scale-100 ${isSubmitting ? 'cursor-not-allowed' : ''
                            }`}
                    >
                        {isSubmitting ? "Creating Staff..." : "Create Staff Profile"}
                    </button>
                </div>
            </form>
        </div>
    );
}
