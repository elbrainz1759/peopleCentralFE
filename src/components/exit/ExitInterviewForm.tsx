"use client";
import React, { useState } from "react";
import { DownloadIcon } from "@/icons"; // Assuming you have an icon, or use text

export default function ExitInterviewForm() {
    const [formData, setFormData] = useState({
        employeeName: "John Doe",
        role: "Senior Developer",
        department: "Engineering",
        manager: "",
        dateJoined: "2023-01-15",
        lastWorkingDay: "2026-03-31",
        reasonForLeaving: "",
        otherReason: "",
        newEmployer: "",
        ratingJob: "3",
        ratingManager: "3",
        ratingCulture: "3",
        mostEnjoyed: "",
        companyImprovement: "",
        wouldRecommend: "Yes",
        signature: false,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData((prev) => ({ ...prev, [name]: checked }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitted(true);
        }, 1500);
    };

    const handlePrint = () => {
        window.print();
    };

    if (submitted) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] text-center py-16">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 mb-6">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Interview Submitted</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
                    Thank you for your feedback. We appreciate your honesty and wish you the best in your future endeavors.
                </p>
                <button
                    onClick={handlePrint}
                    className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2 mx-auto"
                >
                    <DownloadIcon className="w-5 h-5" />
                    Download PDF Copy
                </button>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] lg:p-10 print:shadow-none print:border-none">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        Exit Interview Questionnaire
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 print:hidden">
                        Please answer honestly. Your feedback helps us improve.
                    </p>
                </div>
                <button
                    onClick={handlePrint}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 print:hidden"
                >
                    <DownloadIcon className="w-4 h-4" />
                    Print / Save PDF
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. Employee Details */}
                <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg print:bg-transparent print:p-0">
                    <h4 className="text-base font-semibold text-gray-800 dark:text-white mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">1. Employee Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Name</label>
                            <div className="text-gray-900 dark:text-white font-medium">{formData.employeeName}</div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Rate / Role</label>
                            <div className="text-gray-900 dark:text-white font-medium">{formData.role}</div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Department</label>
                            <div className="text-gray-900 dark:text-white font-medium">{formData.department}</div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Last Working Day</label>
                            <div className="text-gray-900 dark:text-white font-medium">{formData.lastWorkingDay}</div>
                        </div>
                    </div>
                </div>

                {/* 2. Reason for Leaving */}
                <div>
                    <h4 className="text-base font-semibold text-gray-800 dark:text-white mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">2. Reason for Leaving</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Reason <span className="text-red-500">*</span></label>
                            <select
                                name="reasonForLeaving"
                                value={formData.reasonForLeaving}
                                onChange={handleInputChange}
                                required
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            >
                                <option value="">Select a reason...</option>
                                <option value="Career Advancement">Career Advancement / Better Opportunity</option>
                                <option value="Salary">Salary / Compensation</option>
                                <option value="Management">Dissatisfaction with Management</option>
                                <option value="Work Environment">Work Environment / Culture</option>
                                <option value="Personal">Personal Reasons (Relocation, Health, Family)</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        {formData.reasonForLeaving === "Other" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Please Specify</label>
                                <input
                                    type="text"
                                    name="otherReason"
                                    value={formData.otherReason}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Employer (Optional)</label>
                            <input
                                type="text"
                                name="newEmployer"
                                value={formData.newEmployer}
                                onChange={handleInputChange}
                                placeholder="Company Name"
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Ratings */}
                <div>
                    <h4 className="text-base font-semibold text-gray-800 dark:text-white mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">3. Your Experience (1 = Poor, 5 = Excellent)</h4>
                    <div className="space-y-4">
                        {[
                            { id: "ratingJob", label: "Job Satisfaction & Content" },
                            { id: "ratingManager", label: "Support from Manager / Supervisor" },
                            { id: "ratingCulture", label: "Company Culture & Environment" },
                        ].map((item) => (
                            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-gray-50/50 dark:bg-gray-900/20 rounded-lg">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</label>
                                <div className="flex gap-4">
                                    {[1, 2, 3, 4, 5].map((val) => (
                                        <label key={val} className="flex flex-col items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                name={item.id}
                                                value={val}
                                                checked={formData[item.id as keyof typeof formData] === String(val)}
                                                onChange={handleInputChange}
                                                className="mb-1"
                                            />
                                            <span className="text-xs text-gray-500">{val}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. Feedback */}
                <div>
                    <h4 className="text-base font-semibold text-gray-800 dark:text-white mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">4. Feedback & Comments</h4>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">What did you enjoy most about working here?</label>
                            <textarea
                                name="mostEnjoyed"
                                value={formData.mostEnjoyed}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">What could the company do to improve?</label>
                            <textarea
                                name="companyImprovement"
                                value={formData.companyImprovement}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Would you recommend this company to a friend?</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2">
                                    <input type="radio" name="wouldRecommend" value="Yes" checked={formData.wouldRecommend === "Yes"} onChange={handleInputChange} />
                                    <span>Yes</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="radio" name="wouldRecommend" value="No" checked={formData.wouldRecommend === "No"} onChange={handleInputChange} />
                                    <span>No</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="radio" name="wouldRecommend" value="Maybe" checked={formData.wouldRecommend === "Maybe"} onChange={handleInputChange} />
                                    <span>Maybe</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. Declaration */}
                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            name="signature"
                            checked={formData.signature}
                            onChange={handleCheckboxChange}
                            required
                            className="mt-1 h-5 w-5 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                        />
                        <div className="text-sm">
                            <span className="font-semibold text-gray-800 dark:text-white">I hereby certify that the information provided above is true and complete.</span>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                By checking this box, I acknowledge that this serves as my digital signature for the Exit Interview process.
                            </p>
                            <div className="mt-2 text-xs text-gray-400">Date: {new Date().toLocaleDateString()}</div>
                        </div>
                    </label>
                </div>

                <div className="flex justify-end pt-4 print:hidden">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`rounded-lg bg-brand-500 px-8 py-3 text-base font-medium text-white shadow-sm hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Interview'}
                    </button>
                </div>
            </form>
        </div>
    );
}
