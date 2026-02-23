"use client";
import React, { useState } from "react";
import {
    CalenderIcon,
    PaperPlaneIcon,
    ArrowRightIcon,
    ChevronLeftIcon,
    UserIcon,
    FileIcon,
    CheckCircleIcon,
} from "@/icons";

export default function MultiStepLeaveForm({ onClose }: { onClose: () => void }) {
    const [step, setStep] = useState(1);
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

    const nextStep = () => setStep((prev) => prev + 1);
    const prevStep = () => setStep((prev) => prev - 1);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form Submitted:", formData);
        // Add logic to submit form data
        onClose();
    };

    const steps = [
        { title: "Leave Details", icon: <UserIcon />, description: "Select type & dates" },
        { title: "Reason & Notes", icon: <FileIcon />, description: "Provide justification" },
        { title: "Review", icon: <CheckCircleIcon />, description: "Confirm & Submit" },
    ];

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6 animate-fadeIn">
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-400">
                                Leave Type
                            </label>
                            <select
                                name="leaveType"
                                value={formData.leaveType}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500"
                            >
                                <option value="">Select Leave Type</option>
                                <option value="Annual Leave">Annual Leave</option>
                                <option value="Sick Leave">Sick Leave</option>
                                <option value="Study Leave">Study Leave</option>
                                <option value="Casual Leave">Casual Leave</option>
                                <option value="Maternity Leave">Maternity Leave</option>
                                <option value="Paternity Leave">Paternity Leave</option>
                            </select>
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
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-400">
                                    Start Date
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <CalenderIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-400">
                                    End Date
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <CalenderIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6 animate-fadeIn">
                        <div>
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
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-400">
                                Handover Notes
                            </label>
                            <textarea
                                name="handoverNotes"
                                value={formData.handoverNotes}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Tasks to be handed over..."
                                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500 resize-none"
                            ></textarea>
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-400">
                                Supporting Document
                            </label>
                            <input
                                type="file"
                                className="w-full text-gray-500 font-medium text-sm bg-gray-100 file:cursor-pointer cursor-pointer file:border-0 file:py-2 file:px-4 file:mr-4 file:bg-gray-800 file:hover:bg-gray-700 file:text-white rounded"
                            />
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-4 animate-fadeIn">
                        <h4 className="font-medium text-gray-800 dark:text-white/90">
                            Review Application
                        </h4>
                        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 space-y-3 text-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between border-b border-gray-200 pb-2 dark:border-gray-700">
                                <span className="text-gray-500">Type:</span>
                                <span className="font-medium text-gray-800 dark:text-white">
                                    {formData.leaveType || "-"}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-gray-200 pb-2 dark:border-gray-700">
                                <span className="text-gray-500">Supervisor:</span>
                                <span className="font-medium text-gray-800 dark:text-white">
                                    {formData.supervisor || "-"}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-gray-200 pb-2 dark:border-gray-700">
                                <span className="text-gray-500">Start Date:</span>
                                <span className="font-medium text-gray-800 dark:text-white">
                                    {formData.startDate || "-"}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-gray-200 pb-2 dark:border-gray-700">
                                <span className="text-gray-500">End Date:</span>
                                <span className="font-medium text-gray-800 dark:text-white">
                                    {formData.endDate || "-"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Reason:</span>
                                <span className="font-medium text-gray-800 dark:text-white truncate max-w-[200px]">
                                    {formData.reason || "-"}
                                </span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 italic">
                            By clicking Submit, you confirm the details are correct.
                        </p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-full">
            {/* Sidebar Stepper */}
            <div className="w-full md:w-64 bg-gray-50 dark:bg-gray-800/50 border-r border-gray-100 dark:border-gray-800 p-6 flex flex-col gap-6">
                <div className="mb-4 hidden md:block">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Steps</h3>
                </div>
                {steps.map((s, index) => {
                    const stepNumber = index + 1;
                    const isActive = step === stepNumber;
                    const isCompleted = step > stepNumber;

                    return (
                        <div key={index} className={`flex items-start gap-3 relative ${isActive ? "opacity-100" : "opacity-50"}`}>
                            {/* Connector Line */}
                            {index !== steps.length - 1 && (
                                <div className="absolute left-[15px] top-[30px] bottom-[-24px] w-[2px] bg-gray-200 dark:bg-gray-700 hidden md:block"></div>
                            )}

                            <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium transition-colors duration-300
                    ${isActive ? "border-brand-500 bg-brand-500 text-white" : isCompleted ? "border-brand-500 bg-brand-500 text-white" : "border-gray-300 bg-white text-gray-500 dark:bg-gray-800 dark:border-gray-600"}
                    `}
                            >
                                {isCompleted ? <CheckCircleIcon className="w-5 h-5" /> : stepNumber}
                            </div>
                            <div className="hidden md:block">
                                <h4 className={`text-sm font-semibold ${isActive ? "text-gray-800 dark:text-white" : "text-gray-500"}`}>{s.title}</h4>
                                <p className="text-xs text-gray-400">{s.description}</p>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Form Content Area */}
            <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900">
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    <div className="max-w-xl mx-auto">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                            {steps[step - 1].title}
                        </h2>
                        {renderStep()}
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <div className="max-w-xl mx-auto flex items-center justify-between">
                        {step > 1 ? (
                            <button
                                onClick={prevStep}
                                className="flex items-center gap-2 px-6 py-2.5 font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-white/5 transition-colors"
                            >
                                <ChevronLeftIcon className="w-5 h-5" />
                                Back
                            </button>
                        ) : (
                            <div></div> // Spacer
                        )}

                        {step < 3 ? (
                            <button
                                onClick={nextStep}
                                className="flex items-center gap-2 px-6 py-2.5 font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20"
                            >
                                Next
                                <ArrowRightIcon className="w-5 h-5" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                className="flex items-center gap-2 px-6 py-2.5 font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20"
                            >
                                Submit Application
                                <PaperPlaneIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
