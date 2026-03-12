"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { leaveServiceInstance } from "@/services/leave.service";
import { leaveBalanceService, LeaveBalance } from "@/services/leave-balance.service";
import { userService } from "@/services/user.service";
import { authService } from "@/services/auth.service";
import { LeaveType, LeaveRequest } from "@/types/service.types";
import { toast } from "react-hot-toast";
import DatePicker from "@/components/form/date-picker";
import {
    CalenderIcon,
    PaperPlaneIcon,
    ArrowRightIcon,
    ChevronLeftIcon,
    UserIcon,
    FileIcon,
    CheckCircleIcon,
} from "@/icons";

export default function MultiStepLeaveForm({ onClose, initialData }: { onClose: () => void, initialData?: any }) {
    const [step, setStep] = useState(1);
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [isLoadingTypes, setIsLoadingTypes] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
    const [isLoadingBalances, setIsLoadingBalances] = useState(false);

    const [formData, setFormData] = useState({
        leaveTypeId: initialData?.leaveTypeId || "",
        durationSelection: "custom",
        dates: initialData?.dates || initialData?.leaveDuration || [{ startDate: "", endDate: "" }],
        reason: initialData?.reason || "",
        handoverNotes: initialData?.handoverNotes || initialData?.handoverNote || "",
        supervisor: initialData?.supervisor || "",
    });

    // Auto-populate Start and End Date based on Selection Mode
    useEffect(() => {
        if (formData.durationSelection === "custom") return;

        const now = new Date();
        const todayStr = now.toISOString().split("T")[0];

        const newDates = formData.dates.map((range: { startDate: string, endDate: string }, index: number) => {
            // Only apply auto-population to the first range if durationSelection is not custom
            if (index > 0 && formData.durationSelection !== "custom") {
                return range; // Keep subsequent ranges as they are
            }

            let start = range.startDate || todayStr;
            let end = "";
            const startDateObj = new Date(start);

            if (formData.durationSelection === "one-day") {
                end = start;
            } else if (formData.durationSelection === "one-week") {
                const nextWeek = new Date(startDateObj);
                nextWeek.setDate(startDateObj.getDate() + 6);
                end = nextWeek.toISOString().split("T")[0];
            }
            return { startDate: start, endDate: end };
        });

        // Use a more stable dependency for comparison
        const currentDatesStr = JSON.stringify(formData.dates);
        const nextDatesStr = JSON.stringify(newDates);
        
        if (nextDatesStr !== currentDatesStr) {
            setFormData(prev => ({ ...prev, dates: newDates }));
        }
    }, [formData.durationSelection, formData.dates]); // trigger on mode selection change or first load

    const handleDateChange = (index: number, name: "startDate" | "endDate", value: string) => {
        const newDates = [...formData.dates];
        newDates[index] = { ...newDates[index], [name]: value };
        setFormData(prev => ({ ...prev, dates: newDates }));
    };

    const addDateRange = () => {
        setFormData(prev => ({
            ...prev,
            dates: [...prev.dates, { startDate: "", endDate: "" }]
        }));
    };

    const removeDateRange = (index: number) => {
        if (formData.dates.length === 1) return;
        const newDates = formData.dates.filter((_: any, i: number) => i !== index);
        setFormData(prev => ({ ...prev, dates: newDates }));
    };

    const fetchTypes = useCallback(async () => {
        setIsLoadingTypes(true);
        try {
            const response = await userService.getAllLeaveTypes(1, 100);
            setLeaveTypes(response.data || []);
        } catch (error) {
            console.error("Failed to fetch leave types:", error);
            toast.error("Could not load leave types");
        } finally {
            setIsLoadingTypes(false);
        }
    }, []);

    const fetchBalances = useCallback(async () => {
        setIsLoadingBalances(true);
        try {
            const currentUser = authService.getCurrentUser();
            const staffId = currentUser?.staff_id || currentUser?.id;
            if (!staffId) {
                toast.error("Staff ID not found. Please log in again.");
                return;
            }
            const response = await leaveBalanceService.getLeaveBalanceByStaffId(staffId);
            const balancesData = response.data || response || [];
            setLeaveBalances(Array.isArray(balancesData) ? balancesData : []);
        } catch (error) {
            console.error("Failed to fetch leave balances:", error);
            toast.error("Could not load leave balances");
        } finally {
            setIsLoadingBalances(false);
        }
    }, []);

    useEffect(() => {
        fetchTypes();
        fetchBalances();
    }, [fetchTypes, fetchBalances]);



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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log("Submit clicked - Current step:", step);
        console.log("Form data:", formData);

        const currentUser = authService.getCurrentUser();
        const employeeId = currentUser?.staff_id || currentUser?.id || currentUser?.unique_id;

        console.log("Current user:", currentUser);
        console.log("Employee ID:", employeeId);

        if (!employeeId) {
            toast.error("Staff ID not found. Please log in again.");
            return;
        }

        const validationErrors = [];
        if (!formData.leaveTypeId) validationErrors.push("leaveTypeId");
        if (formData.dates.some((d: any) => !d.startDate || !d.endDate)) validationErrors.push("dates");
        if (!formData.reason) validationErrors.push("reason");

        console.log("Validation errors:", validationErrors);

        if (validationErrors.length > 0) {
            toast.error("Please fill in all required fields: " + validationErrors.join(", "));
            return;
        }

        const leaveData: LeaveRequest = {
            staffId: typeof employeeId === 'number' ? employeeId : parseInt(String(employeeId)),
            leaveTypeId: parseInt(formData.leaveTypeId),
            reason: formData.reason,
            handoverNote: formData.handoverNotes,
            leaveDuration: formData.dates.map((d: any) => ({
                startDate: d.startDate,
                endDate: d.endDate
            }))
        };

        setIsSubmitting(true);
        try {
            await leaveServiceInstance.applyForLeave(leaveData);
            toast.success("Leave application submitted successfully!");
            onClose();
        } catch (error: any) {
            console.error("Leave submission error:", error);
            toast.error(error.response?.data?.message || "Failed to submit leave application");
        } finally {
            setIsSubmitting(false);
        }
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
                        {/* Leave Balance Display */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3">
                                Your Current Leave Balances
                            </h4>
                            {isLoadingBalances ? (
                                <div className="text-sm text-blue-700 dark:text-blue-300">
                                    Loading leave balances...
                                </div>
                            ) : leaveBalances.length === 0 ? (
                                <div className="text-sm text-blue-700 dark:text-blue-300">
                                    No leave balances found. Please contact HR.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {leaveBalances.map((balance) => {
                                        const remainingHours = parseFloat(balance.remaining_hours || '0');
                                        const totalHours = parseFloat(balance.total_hours || '0');
                                        const usagePercentage = totalHours > 0 ? ((totalHours - remainingHours) / totalHours) * 100 : 0;

                                        return (
                                            <div key={balance.id} className="flex justify-between items-center text-sm">
                                                <span className="font-medium text-blue-800 dark:text-blue-200">
                                                    {balance.leave_type_name}
                                                </span>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-blue-700 dark:text-blue-300">
                                                        {remainingHours}h remaining
                                                    </span>
                                                    <div className="w-20 bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full ${usagePercentage >= 80
                                                                ? 'bg-red-500'
                                                                : usagePercentage >= 60
                                                                    ? 'bg-yellow-500'
                                                                    : 'bg-green-500'
                                                                }`}
                                                            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-400">
                                Leave Type
                            </label>
                            <select
                                name="leaveTypeId"
                                value={formData.leaveTypeId}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500"
                            >
                                <option value="">{isLoadingTypes ? "Loading types..." : "Select Leave Type"}</option>
                                {leaveTypes.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-400">
                                Duration Mode
                            </label>
                            <select
                                name="durationSelection"
                                value={formData.durationSelection}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500"
                            >
                                <option value="custom">Custom Range</option>
                                <option value="one-day">One Day</option>
                                <option value="one-week">One Week</option>
                            </select>
                        </div>

                        {formData.dates.map((range: any, index: number) => (
                            <div key={index} className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl space-y-4 relative">
                                {formData.dates.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeDateRange(index)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div>
                                        <DatePicker
                                            id={`start-date-${index}`}
                                            label={`Start Date ${index > 0 ? `#${index + 1}` : ""}`}
                                            placeholder="Select start date"
                                            defaultDate={range.startDate}
                                            onChange={(selectedDates) => {
                                                const date = selectedDates[0];
                                                if (date) {
                                                    handleDateChange(index, "startDate", date.toISOString().split('T')[0]);
                                                }
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <DatePicker
                                            id={`end-date-${index}`}
                                            label={`End Date ${index > 0 ? `#${index + 1}` : ""}`}
                                            placeholder="Select end date"
                                            defaultDate={range.endDate}
                                            onChange={(selectedDates) => {
                                                const date = selectedDates[0];
                                                if (date) {
                                                    handleDateChange(index, "endDate", date.toISOString().split('T')[0]);
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={addDateRange}
                            className="w-full py-3 px-4 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium text-gray-500 hover:text-brand-500 hover:border-brand-500 transition-all flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Another Date Range
                        </button>
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
                                    {leaveTypes.find(t => String(t.id) === formData.leaveTypeId)?.name || "-"}
                                </span>
                            </div>
                            <div className="space-y-2 border-b border-gray-200 pb-2 dark:border-gray-700">
                                <span className="text-gray-500">Date Range(s):</span>
                                {formData.dates.map((range: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center text-xs">
                                        <span className="text-gray-400">Period {i + 1}:</span>
                                        <span className="font-medium text-gray-800 dark:text-white">
                                            {range.startDate || "-"} to {range.endDate || "-"}
                                        </span>
                                    </div>
                                ))}
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
                <div className="flex-1 overflow-y-auto p-6 md:p-8" style={{ overflow: 'visible' }}>
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
                            <>
                                {console.log("Rendering submit button - step:", step, "isSubmitting:", isSubmitting)}
                                <button
                                    onClick={(e) => {
                                        console.log("Submit button clicked!");
                                        handleSubmit(e);
                                    }}
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 px-6 py-2.5 font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-green-500/20"
                                >
                                    {isSubmitting ? "Submitting..." : "Submit Application"}
                                    <PaperPlaneIcon className="w-5 h-5" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
