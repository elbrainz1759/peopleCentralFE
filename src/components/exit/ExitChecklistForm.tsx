"use client";
import React, { useState } from "react";
// Assuming Button exists in ui/button or similar, otherwise use HTML button
// Using standard inputs for simplicity and robustness as custom inputs might have specific props

export default function ExitChecklistForm() {
    const [formData, setFormData] = useState({
        employeeName: "John Doe", // Mocked current user
        department: "Engineering",
        role: "Senior Developer",
        supervisorEmail: "",
        handoverNotes: "",
        interviewNotes: "",
        assets: {
            laptop: false,
            idCard: false,
            accessKey: false,
            monitor: false,
            phone: false,
            other: false,
        },
        files: null as File | null,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            assets: { ...prev.assets, [name]: checked },
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData((prev) => ({ ...prev, files: e.target.files![0] }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitted(true);
            console.log("Form Submitted:", formData);
        }, 1500);
    };

    if (submitted) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] text-center py-16">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 mb-6">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Checklist Submitted</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    Your exit checklist has been sent to your supervisor ({formData.supervisorEmail}) for approval.
                    You will be notified once the next stage (Operations) is ready.
                </p>
                <button
                    onClick={() => setSubmitted(false)}
                    className="mt-8 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200"
                >
                    View Status
                </button>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] lg:p-8">
            <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                Employee Exit Checklist
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Employee Info (Read-only) */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
                            Employee Name
                        </label>
                        <input
                            type="text"
                            value={formData.employeeName}
                            disabled
                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-500 outline-none dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-400"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
                            Department
                        </label>
                        <input
                            type="text"
                            value={formData.department}
                            disabled
                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-500 outline-none dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-400"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
                            Role
                        </label>
                        <input
                            type="text"
                            value={formData.role}
                            disabled
                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-500 outline-none dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-400"
                        />
                    </div>
                </div>

                {/* Supervisor Approval Routing */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
                        Supervisor&apos;s Email for Approval <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        name="supervisorEmail"
                        value={formData.supervisorEmail}
                        onChange={handleInputChange}
                        required
                        placeholder="supervisor@company.com"
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-brand-500"
                    />
                    <p className="mt-1.5 text-xs text-gray-500">
                        Your checklist will be sent to this email for the first stage of approval.
                    </p>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 my-6"></div>

                {/* Assets Return */}
                <div>
                    <h4 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">
                        Assets Returned
                    </h4>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                        {[
                            { id: 'laptop', label: 'Company Laptop' },
                            { id: 'idCard', label: 'ID Card / Badge' },
                            { id: 'accessKey', label: 'Office Keys / Access Card' },
                            { id: 'monitor', label: 'Monitor / Peripherals' },
                            { id: 'phone', label: 'Company Phone' },
                            { id: 'other', label: 'Other Documents' },
                        ].map((item) => (
                            <label key={item.id} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50">
                                <input
                                    type="checkbox"
                                    name={item.id}
                                    checked={formData.assets[item.id as keyof typeof formData.assets]}
                                    onChange={handleCheckboxChange}
                                    className="h-5 w-5 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 my-6"></div>

                {/* Handover & Files */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
                            Handover Notes <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="handoverNotes"
                            value={formData.handoverNotes}
                            onChange={handleInputChange}
                            required
                            rows={5}
                            placeholder="Describe current project status, key contacts, and file locations..."
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-brand-500"
                        ></textarea>
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
                            Upload Handover Document
                        </label>
                        <div className="flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-10 dark:border-gray-700">
                            <div className="text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" />
                                </svg>
                                <div className="mt-4 flex text-sm leading-6 text-gray-600 dark:text-gray-400">
                                    <label
                                        htmlFor="file-upload"
                                        className="relative cursor-pointer rounded-md bg-white font-semibold text-brand-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-brand-600 focus-within:ring-offset-2 hover:text-brand-500 dark:bg-transparent dark:text-brand-400"
                                    >
                                        <span>Upload a file</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">PDF, DOC up to 10MB</p>
                                {formData.files && (
                                    <p className="mt-2 text-sm text-green-600 font-medium">Selected: {formData.files.name}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 my-6"></div>

                {/* Interview Notes (Optional) */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
                        Exit Interview Notes (Optional)
                    </label>
                    <textarea
                        name="interviewNotes"
                        value={formData.interviewNotes}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Any feedback or notes from your exit interview..."
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-brand-500"
                    ></textarea>
                </div>

                {/* Submit Actions */}
                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        Save Draft
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
                    </button>
                </div>
            </form>
        </div>
    );
}
