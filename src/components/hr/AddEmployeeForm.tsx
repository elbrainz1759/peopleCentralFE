"use client";
import React, { useState } from "react";
import InputField from "../form/input/InputField";
import TextArea from "../form/input/TextArea";
import { Select } from "../form/Select";

export default function AddEmployeeForm({ onSuccess }: { onSuccess?: () => void }) {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        gender: "",
        dob: "",
        staffId: "",
        designation: "",
        department: "",
        grade: "",
        email: "",
        phone: "",
        address: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (value: string, name: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            console.log("New Employee Data:", formData);
            if (onSuccess) onSuccess();
        }, 1500);
    };

    return (
        <div className="p-1">
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Section 1: Basic Information */}
                <div>
                    <h4 className="mb-4 text-base font-semibold text-gray-800 dark:text-white border-b pb-2 border-gray-100 dark:border-gray-800">
                        Basic Information
                    </h4>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <InputField
                            label="First Name"
                            name="firstName"
                            placeholder="Enter first name"
                            value={formData.firstName}
                            onChange={handleInputChange}
                        />
                        <InputField
                            label="Last Name"
                            name="lastName"
                            placeholder="Enter last name"
                            value={formData.lastName}
                            onChange={handleInputChange}
                        />
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Gender</label>
                            <div className="grid grid-cols-3 gap-2">
                                {["Male", "Female", "Other"].map((g) => (
                                    <button
                                        key={g}
                                        type="button"
                                        onClick={() => handleSelectChange(g, 'gender')}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${formData.gender === g
                                                ? 'bg-brand-500 text-white border-brand-500'
                                                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400'
                                            }`}
                                    >
                                        {g}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <InputField
                            label="Date of Birth"
                            name="dob"
                            type="date"
                            value={formData.dob}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                {/* Section 2: Professional Details */}
                <div>
                    <h4 className="mb-4 text-base font-semibold text-gray-800 dark:text-white border-b pb-2 border-gray-100 dark:border-gray-800">
                        Professional Details
                    </h4>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <InputField
                            label="Staff ID"
                            name="staffId"
                            placeholder="EMP-001"
                            value={formData.staffId}
                            onChange={handleInputChange}
                        />
                        <InputField
                            label="Designation"
                            name="designation"
                            placeholder="e.g. Software Engineer"
                            value={formData.designation}
                            onChange={handleInputChange}
                        />
                        <div className="md:col-span-1">
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-400">Department</label>
                            <select
                                value={formData.department}
                                onChange={(e) => handleSelectChange(e.target.value, 'department')}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            >
                                <option value="">Select Department</option>
                                <option value="Engineering">Engineering</option>
                                <option value="HR">HR</option>
                                <option value="Product">Product</option>
                                <option value="Finance">Finance</option>
                            </select>
                        </div>
                        <InputField
                            label="Pay Grade"
                            name="grade"
                            placeholder="e.g. GS-10"
                            value={formData.grade}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                {/* Section 3: Contact Information */}
                <div>
                    <h4 className="mb-4 text-base font-semibold text-gray-800 dark:text-white border-b pb-2 border-gray-100 dark:border-gray-800">
                        Contact Details
                    </h4>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <InputField
                            label="Official Email"
                            name="email"
                            type="email"
                            placeholder="employee@company.com"
                            value={formData.email}
                            onChange={handleInputChange}
                        />
                        <InputField
                            label="Phone Number"
                            name="phone"
                            placeholder="+234..."
                            value={formData.phone}
                            onChange={handleInputChange}
                        />
                        <div className="md:col-span-2">
                            <TextArea
                                label="Current Address"
                                name="address"
                                placeholder="Enter full residential address"
                                value={formData.address}
                                onChange={handleInputChange}
                                rows={3}
                            />
                        </div>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-white dark:bg-gray-900 pb-2">
                    <button
                        type="button"
                        className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        Clear Form
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`rounded-lg bg-brand-500 px-8 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                    >
                        {isSubmitting ? "Saving..." : "Create Employee Profile"}
                    </button>
                </div>
            </form>
        </div>
    );
}
