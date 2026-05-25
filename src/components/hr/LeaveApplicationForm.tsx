"use client";
import React, { useState } from "react";
import { PaperPlaneIcon } from "@/icons";
import DatePicker from "@/components/form/date-picker";
import CustomSelect from "@/components/form/CustomSelect";
import { toast } from "react-hot-toast";

export default function LeaveApplicationForm() {
    const [formData, setFormData] = useState({
        leaveType: "",
        startDate: "",
        endDate: "",
        reason: "",
        handoverNotes: "",
        supervisor: "",
    });

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.startDate && formData.endDate) {
            if (formData.startDate === formData.endDate) {
                toast.error("Start date and end date cannot be the same.");
                return;
            }
            if (formData.endDate < formData.startDate) {
                toast.error("End date must be after the start date.");
                return;
            }
        }
        console.log("Form Submitted:", formData);
        // Add submission logic here
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                    Leave Application Form
                </h3>
            </div>
            <div className="p-6">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-400">
                                Leave Type
                            </label>
                            <CustomSelect
                                value={formData.leaveType}
                                onChange={(v) => setFormData((prev) => ({ ...prev, leaveType: v }))}
                                options={[
                                    { value: "Annual Leave", label: "Annual Leave" },
                                    { value: "Sick Leave", label: "Sick Leave" },
                                    { value: "Study Leave", label: "Study Leave" },
                                    { value: "Casual Leave", label: "Casual Leave" },
                                    { value: "Maternity Leave", label: "Maternity Leave" },
                                    { value: "Paternity Leave", label: "Paternity Leave" },
                                ]}
                                placeholder="Select Leave Type"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-400">
                                Supervisor / Line Manager
                            </label>
                            <input
                                type="text"
                                name="supervisor"
                                value={formData.supervisor}
                                onChange={handleChange}
                                placeholder="Enter Supervisor Name"
                                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-400">
                                Start Date
                            </label>
                            <DatePicker
                                id="startDate"
                                value={formData.startDate}
                                onChange={(_, dateStr) => setFormData(prev => ({ ...prev, startDate: dateStr }))}
                                placeholder="YYYY-MM-DD"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-400">
                                End Date
                            </label>
                            <DatePicker
                                id="endDate"
                                value={formData.endDate}
                                onChange={(_, dateStr) => setFormData(prev => ({ ...prev, endDate: dateStr }))}
                                placeholder="YYYY-MM-DD"
                            />
                        </div>

                        <div className="col-span-1 xl:col-span-2">
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-400">
                                Reason for Leave
                            </label>
                            <textarea
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Briefly describe the reason for your leave..."
                                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500 resize-none"
                            ></textarea>
                        </div>

                        <div className="col-span-1 xl:col-span-2">
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-400">
                                Handover Notes (Optional)
                            </label>
                            <textarea
                                name="handoverNotes"
                                value={formData.handoverNotes}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Any important tasks to be handed over..."
                                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500 resize-none"
                            ></textarea>
                        </div>

                        <div className="col-span-1 xl:col-span-2">
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-400">
                                Supporting Document (e.g. Medical Certificate)
                            </label>
                            <input
                                type="file"
                                className="w-full text-gray-500 font-medium text-sm bg-gray-100 file:cursor-pointer cursor-pointer file:border-0 file:py-2 file:px-4 file:mr-4 file:bg-gray-800 file:hover:bg-gray-700 file:text-white rounded"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 flex items-center gap-2 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600 transition-colors"
                        >
                            <PaperPlaneIcon className="w-5 h-5" />
                            Submit Application
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
