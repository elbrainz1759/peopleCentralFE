"use client";
import React, { useState, useEffect, useCallback } from "react";
import { leaveServiceInstance } from "@/services/leave.service";
import { leaveBalanceService, LeaveBalance } from "@/services/leave-balance.service";
import { userService } from "@/services/user.service";
import { authService } from "@/services/auth.service";
import { LeaveType, LeaveRequest } from "@/types/service.types";
import { toast } from "react-hot-toast";
import DatePicker from "@/components/form/date-picker";
import CustomSelect from "@/components/form/CustomSelect";
import {
    PaperPlaneIcon,
    ArrowRightIcon,
    ChevronLeftIcon,
    UserIcon,
    FileIcon,
    CheckCircleIcon,
} from "@/icons";

const STATIC_LEAVE_TYPES: LeaveType[] = [
    { id: "education_leave", name: "Education Leave", description: "", country: "" },
    { id: "paternity_leave", name: "Paternity Leave", description: "", country: "" },
    { id: "sick_leave", name: "Sick Leave", description: "", country: "" },
    { id: "bereavement_leave", name: "Bereavement Leave", description: "", country: "" },
];

function countWorkingDays(start: string, end: string): number {
    if (!start || !end) return 0;
    let count = 0;
    const current = new Date(start);
    const endDate = new Date(end);
    while (current <= endDate) {
        const day = current.getDay();
        if (day !== 0 && day !== 6) count++;
        current.setDate(current.getDate() + 1);
    }
    return count;
}

// Resolve an employee's display name. The API returns first_name/last_name,
// not employee_name/name, so fall back to those before giving up.
function empName(e: any): string {
    return (e?.employee_name || e?.name || `${e?.first_name ?? ""} ${e?.last_name ?? ""}`.trim()) || "";
}

// Format a picked date as YYYY-MM-DD in LOCAL time. flatpickr's dateStr is
// already local; using date.toISOString() would shift to UTC and roll the day
// back one in timezones ahead of UTC (e.g. WAT), so prefer dateStr.
function pickedYMD(selectedDates: Date[], dateStr: string): string {
    if (dateStr) return dateStr;
    const d = selectedDates?.[0];
    return d
        ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
        : "";
}

export default function MultiStepLeaveForm({
    onClose,
    initialData,
    compact = false,
    proxyMode = false,
}: {
    onClose: () => void;
    initialData?: any;
    compact?: boolean;
    proxyMode?: boolean;
}) {
    const [step, setStep] = useState(1);
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [isLoadingTypes, setIsLoadingTypes] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
    const [isLoadingBalances, setIsLoadingBalances] = useState(false);
    const [employees, setEmployees] = useState<any[]>([]);
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
    const [supportingDocument, setSupportingDocument] = useState<File | null>(null);
    const [proxyEmployeeId, setProxyEmployeeId] = useState<string>("");

    const [formData, setFormData] = useState({
        dates: initialData?.dates || initialData?.leaveDuration || [{ leaveTypeId: "", startDate: "", endDate: "" }],
        comment: initialData?.reason || "",
        handoverEntries: [] as { colleagueId: string; notes: string }[],
        supervisor: initialData?.supervisor || "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // ── Derived flags ──────────────────────────────────────────────
    const rowLeaveType = (leaveTypeId: string) =>
        leaveTypes.find((t: any) => String(t.unique_id ?? t.uniqueId ?? t.id) === String(leaveTypeId));
    const isExaminationLeave = formData.dates.some((d: any) => rowLeaveType(d.leaveTypeId)?.name?.toLowerCase().includes("exam"));
    const isSickLeave = formData.dates.some((d: any) => rowLeaveType(d.leaveTypeId)?.name?.toLowerCase().includes("sick"));
    const maxWorkingDays = formData.dates.reduce(
        (max: number, d: any) => Math.max(max, countWorkingDays(d.startDate, d.endDate)),
        0
    );
    const needsMedicalDoc = isSickLeave && maxWorkingDays > 2;
    const hasTriggerDoc = formData.dates.some((d: any) => {
        const lt = rowLeaveType(d.leaveTypeId) as any;
        // Sick Leave's document requirement is governed strictly by the day count
        // (> 2 working days) via needsMedicalDoc — never by the leave-type trigger,
        // so a 1–2 day sick leave never asks for a document.
        if (lt?.name?.toLowerCase().includes("sick")) return false;
        return lt?.require_document === 'Yes' || (lt?.trigger_value ?? 0) > 0;
    });
    const needsSupportingDoc = isExaminationLeave || needsMedicalDoc || hasTriggerDoc;
    const needsHandover = formData.handoverEntries.length > 0;

    const addHandoverEntry = () =>
        setFormData(prev => ({ ...prev, handoverEntries: [...prev.handoverEntries, { colleagueId: "", notes: "" }] }));
    const removeHandoverEntry = (i: number) =>
        setFormData(prev => ({ ...prev, handoverEntries: prev.handoverEntries.filter((_, idx) => idx !== i) }));
    const updateHandoverEntry = (i: number, field: "colleagueId" | "notes", value: string) =>
        setFormData(prev => {
            const entries = [...prev.handoverEntries];
            entries[i] = { ...entries[i], [field]: value };
            return { ...prev, handoverEntries: entries };
        });

    const handleDateChange = (index: number, name: "startDate" | "endDate" | "leaveTypeId", value: string) => {
        const newDates = [...formData.dates];
        newDates[index] = { ...newDates[index], [name]: value };
        setFormData(prev => ({ ...prev, dates: newDates }));
        const errorKey = `${name}_${index}`;
        if (errors[errorKey]) setErrors((prev) => { const next = { ...prev }; delete next[errorKey]; return next; });
    };

    const addDateRange = () => {
        setFormData(prev => ({ ...prev, dates: [...prev.dates, { leaveTypeId: "", startDate: "", endDate: "" }] }));
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
            const apiTypes = response.data || [];
            setLeaveTypes(apiTypes.length > 0 ? apiTypes : STATIC_LEAVE_TYPES);
        } catch {
            setLeaveTypes(STATIC_LEAVE_TYPES);
        } finally {
            setIsLoadingTypes(false);
        }
    }, []);

    const fetchBalances = useCallback(async () => {
        setIsLoadingBalances(true);
        try {
            const currentUser = authService.getCurrentUser();
            const staffId = currentUser?.staff_id || currentUser?.id;
            if (!staffId) return;
            const response = await leaveBalanceService.getLeaveBalanceByStaffId(staffId);
            const balancesData = response.data || response || [];
            setLeaveBalances(Array.isArray(balancesData) ? balancesData : []);
        } catch {
            toast.error("Could not load leave balances");
        } finally {
            setIsLoadingBalances(false);
        }
    }, []);

    const fetchEmployees = useCallback(async () => {
        if (employees.length > 0) return;
        setIsLoadingEmployees(true);
        try {
            const response = await userService.getAllEmployees();
            const data: any[] = response?.data ?? [];
            setEmployees(data);
        } catch {
            // silent
        } finally {
            setIsLoadingEmployees(false);
        }
    }, [employees.length]);

    useEffect(() => { fetchTypes(); fetchBalances(); }, []);

    // Load employees for handover colleague selector OR proxy mode
    useEffect(() => {
        if (needsHandover || proxyMode) fetchEmployees();
    }, [needsHandover, proxyMode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
    };

    const validateStep = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (step === 1) {
            formData.dates.forEach((d: any, i: number) => {
                if (!d.leaveTypeId) newErrors[`leaveTypeId_${i}`] = "Select a leave type.";
                if (!d.startDate) newErrors[`startDate_${i}`] = "Start date is required.";
                if (!d.endDate) newErrors[`endDate_${i}`] = "End date is required.";
                if (d.startDate && d.endDate && d.startDate === d.endDate)
                    newErrors[`endDate_${i}`] = "Start and end date cannot be the same.";
                else if (d.startDate && d.endDate && d.endDate < d.startDate)
                    newErrors[`endDate_${i}`] = "End date must be after start date.";
            });

            // Backend rejects overlapping date ranges — flag them here first.
            // ISO (YYYY-MM-DD) strings compare correctly with <=.
            for (let i = 0; i < formData.dates.length; i++) {
                const a = formData.dates[i];
                if (!a.startDate || !a.endDate || a.endDate < a.startDate) continue;
                for (let j = 0; j < i; j++) {
                    const b = formData.dates[j];
                    if (!b.startDate || !b.endDate || b.endDate < b.startDate) continue;
                    if (a.startDate <= b.endDate && b.startDate <= a.endDate) {
                        newErrors[`startDate_${i}`] = `These dates overlap with leave row ${j + 1}. Use non-overlapping date ranges.`;
                        break;
                    }
                }
            }
        }

        if (step === 1 && proxyMode) {
            if (!proxyEmployeeId) newErrors.proxyEmployeeId = "Please select the employee you are applying on behalf of.";
        }

        if (step === 2) {
            if (needsSupportingDoc && !supportingDocument) {
                newErrors.supportingDocument = isExaminationLeave
                    ? "A supporting document (exam timetable, registration slip, or official notification) is required for Examination Leave."
                    : needsMedicalDoc
                    ? "A medical certificate or excuse duty note is required for Sick Leave exceeding 2 working days."
                    : "A supporting document is required for this leave type.";
            }
            formData.handoverEntries.forEach((entry, i) => {
                if (!entry.colleagueId) newErrors[`handoverColleague_${i}`] = "Select a colleague.";
                if (!entry.notes.trim()) newErrors[`handoverNotes_${i}`] = "Enter handover notes for this colleague.";
            });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => { if (validateStep()) { setErrors({}); setStep((prev) => prev + 1); } };
    const prevStep = () => { setErrors({}); setStep((prev) => prev - 1); };

    const submitGrouped = async (staffId: number) => {
        const handoverNotes = formData.handoverEntries
            .filter(e => e.colleagueId)
            .map(e => {
                const emp = employees.find((em: any) => String(em.unique_id ?? em.id) === String(e.colleagueId));
                return { staffEmail: emp?.email ?? e.colleagueId, note: e.notes };
            });
        const leaveDuration = formData.dates.map((d: any) => {
            const lt = rowLeaveType(d.leaveTypeId);
            const ltUniqueId = (lt as any)?.unique_id ?? (lt as any)?.uniqueId ?? d.leaveTypeId;
            return { startDate: d.startDate, endDate: d.endDate, leaveTypeId: String(ltUniqueId) };
        });
        const payload: LeaveRequest = {
            staffId,
            reason: formData.comment || "Leave application",
            ...(handoverNotes.length > 0 ? { handoverNotes } : {}),
            leaveDuration,
            ...(supportingDocument ? { document: supportingDocument } : {}),
        };
        await leaveServiceInstance.applyForLeave(payload);
    };

    const handleSubmit = async () => {
        if (proxyMode) {
            if (!proxyEmployeeId) { toast.error("Please select the employee you are applying on behalf of."); return; }
            if (formData.dates.some((d: any) => !d.leaveTypeId || !d.startDate || !d.endDate)) { toast.error("Please complete all leave rows."); return; }
            const proxyEmp = employees.find((e: any) => String(e.unique_id ?? e.id) === String(proxyEmployeeId));
            const empStaffId = parseInt(String(proxyEmp?.staff_id ?? proxyEmp?.staffId ?? proxyEmployeeId));
            setIsSubmitting(true);
            try {
                await submitGrouped(empStaffId);
                toast.success(`Leave application(s) submitted on behalf of ${empName(proxyEmp) || "employee"}.`);
                onClose();
            } catch (error: any) {
                toast.error(error?.response?.data?.message || error?.message || "Failed to submit leave application");
            } finally { setIsSubmitting(false); }
            return;
        }

        let currentUser = authService.getCurrentUser();
        let employeeId = currentUser?.staff_id || currentUser?.staffId;

        if (!employeeId) {
            const authToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
            if (authToken) {
                try {
                    const payload = JSON.parse(atob(authToken.split('.')[1]));
                    employeeId = payload.staff_id || payload.staffId || payload.sub;
                } catch { /* ignore */ }
            }
            if (!employeeId) {
                try {
                    const response = await leaveServiceInstance.getStaffDetails();
                    const rawData = response.data || response;
                    const staffData = Array.isArray(rawData) ? rawData[0] : rawData;
                    if (staffData) employeeId = staffData.staff_id || staffData.staffId;
                } catch { /* ignore */ }
            }
        }

        if (!employeeId) { toast.error("Staff ID not found. Please log in again."); return; }
        if (formData.dates.some((d: any) => !d.leaveTypeId || !d.startDate || !d.endDate)) { toast.error("Please complete all leave rows."); return; }

        setIsSubmitting(true);
        try {
            await submitGrouped(typeof employeeId === 'number' ? employeeId : parseInt(String(employeeId)));
            toast.success("Leave application submitted successfully!");
            onClose();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error?.message || "Failed to submit leave application");
        } finally { setIsSubmitting(false); }
    };

    const steps = [
        { title: "Leave Details", icon: <UserIcon />, description: "Select type & dates" },
        { title: "Additional Info", icon: <FileIcon />, description: "Comment & documents" },
        { title: "Review", icon: <CheckCircleIcon />, description: "Confirm & Submit" },
    ];

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6 animate-fadeIn">
                        {/* Proxy mode: employee selector */}
                        {proxyMode && (
                            <div className="rounded-xl border border-purple-200 bg-purple-50 dark:bg-purple-900/10 dark:border-purple-800 p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500 text-white text-xs font-bold flex-shrink-0">HR</div>
                                    <p className="text-sm font-semibold text-purple-800 dark:text-purple-300">Proxy Leave Application</p>
                                </div>
                                <p className="text-xs text-purple-600 dark:text-purple-400">
                                    You are submitting this leave request on behalf of an employee. Select the employee below.
                                </p>
                                <CustomSelect
                                    value={proxyEmployeeId}
                                    onChange={(v) => {
                                        setProxyEmployeeId(v);
                                        if (errors.proxyEmployeeId) setErrors((prev) => { const next = { ...prev }; delete next.proxyEmployeeId; return next; });
                                    }}
                                    options={employees.map((e: any) => ({
                                        value: String(e.unique_id ?? e.id),
                                        label: empName(e) || `Employee ${e.id}`,
                                    }))}
                                    placeholder={isLoadingEmployees ? "Loading employees..." : "Select employee..."}
                                    disabled={isLoadingEmployees}
                                />
                                {errors.proxyEmployeeId && <p className="text-xs text-red-500">{errors.proxyEmployeeId}</p>}
                                {proxyEmployeeId && (() => {
                                    const emp = employees.find((e: any) => String(e.unique_id ?? e.id) === proxyEmployeeId);
                                    return emp ? (
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="h-7 w-7 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center text-xs font-bold text-purple-700 dark:text-purple-300">
                                                {(empName(emp) || "?")[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-purple-800 dark:text-purple-200">{empName(emp)}</p>
                                                <p className="text-xs text-purple-500">{emp.designation ?? emp.job_title ?? ""}</p>
                                            </div>
                                        </div>
                                    ) : null;
                                })()}
                            </div>
                        )}

                        {/* Leave Balances */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3">Your Current Leave Balances</h4>
                            {isLoadingBalances ? (
                                <div className="text-sm text-blue-700 dark:text-blue-300">Loading leave balances...</div>
                            ) : leaveBalances.length === 0 ? (
                                <div className="text-sm text-blue-700 dark:text-blue-300">No leave balances found. Please contact HR.</div>
                            ) : (
                                <div className="space-y-2">
                                    {leaveBalances.map((balance) => {
                                        const remainingHours = parseFloat(balance.remaining_hours || '0');
                                        const totalHours = parseFloat(balance.total_hours || '0');
                                        const usagePercentage = totalHours > 0 ? ((totalHours - remainingHours) / totalHours) * 100 : 0;
                                        const typeName = balance.leave_type_name
                                            || leaveTypes.find((t: any) => t.id === balance.leave_type_id || t.unique_id === balance.leave_type_id)?.name
                                            || `Leave Type ${balance.leave_type_id}`;
                                        return (
                                            <div key={balance.id} className="flex justify-between items-center text-sm">
                                                <span className="font-medium text-blue-800 dark:text-blue-200">{typeName}</span>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-blue-700 dark:text-blue-300">{remainingHours}h remaining of {totalHours}h</span>
                                                    <div className="w-20 bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full ${usagePercentage >= 80 ? 'bg-red-500' : usagePercentage >= 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                                            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Leave rows — each row: Leave Type | Start Date | End Date */}
                        <div className="space-y-3">
                            <div className="grid grid-cols-[1fr_1fr_1fr_28px] gap-2 px-1">
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Leave Type <span className="text-red-500">*</span></span>
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Start Date <span className="text-red-500">*</span></span>
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">End Date <span className="text-red-500">*</span></span>
                                <span></span>
                            </div>

                            {formData.dates.map((range: any, index: number) => (
                                <div key={index} className="space-y-1">
                                    <div className="grid grid-cols-[1fr_1fr_1fr_28px] gap-2 items-start">
                                        <div>
                                            <CustomSelect
                                                value={range.leaveTypeId}
                                                onChange={(v) => {
                                                    handleDateChange(index, "leaveTypeId", v);
                                                    setSupportingDocument(null);
                                                }}
                                                options={leaveTypes.map((type: any) => ({
                                                    value: type.unique_id ?? type.uniqueId ?? type.id,
                                                    label: type.name,
                                                }))}
                                                placeholder={isLoadingTypes ? "Loading..." : "Select type"}
                                                disabled={isLoadingTypes}
                                            />
                                            {errors[`leaveTypeId_${index}`] && <p className="mt-1 text-xs text-red-500">{errors[`leaveTypeId_${index}`]}</p>}
                                        </div>
                                        <div>
                                            <DatePicker id={`start-date-${index}`} placeholder="Start date" value={range.startDate}
                                                onChange={(selectedDates, dateStr) => {
                                                    const v = pickedYMD(selectedDates, dateStr);
                                                    if (v) handleDateChange(index, "startDate", v);
                                                }} />
                                            {errors[`startDate_${index}`] && <p className="mt-1 text-xs text-red-500">{errors[`startDate_${index}`]}</p>}
                                        </div>
                                        <div>
                                            <DatePicker id={`end-date-${index}`} placeholder="End date" value={range.endDate}
                                                onChange={(selectedDates, dateStr) => {
                                                    const v = pickedYMD(selectedDates, dateStr);
                                                    if (v) handleDateChange(index, "endDate", v);
                                                }} />
                                            {errors[`endDate_${index}`] && <p className="mt-1 text-xs text-red-500">{errors[`endDate_${index}`]}</p>}
                                        </div>
                                        <div className="flex items-center justify-center pt-2">
                                            {formData.dates.length > 1 && (
                                                <button type="button" onClick={() => removeDateRange(index)}
                                                    className="text-red-400 hover:text-red-600 transition-colors p-0.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button type="button" onClick={addDateRange}
                            className="w-full py-3 px-4 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium text-gray-500 hover:text-brand-500 hover:border-brand-500 transition-all flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Leave Type / Date Range
                        </button>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6 animate-fadeIn">
                        {/* Comment */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-400">Comment</label>
                            <textarea name="comment" value={formData.comment} onChange={handleChange} rows={4}
                                placeholder="Add any comments (optional)..."
                                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500 resize-none" />
                        </div>

                        {/* Handover Colleagues */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Handover Colleagues</label>
                                <button type="button" onClick={() => { addHandoverEntry(); fetchEmployees(); }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-500 border border-brand-300 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Add Colleague
                                </button>
                            </div>

                            {formData.handoverEntries.length === 0 && (
                                <p className="text-xs text-gray-400 dark:text-gray-500 italic">No handover colleagues added. Click "Add Colleague" if needed.</p>
                            )}

                            {formData.handoverEntries.map((entry, i) => (
                                <div key={i} className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800 p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Colleague {i + 1}</p>
                                        <button type="button" onClick={() => removeHandoverEntry(i)}
                                            className="text-red-400 hover:text-red-600 transition-colors p-0.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    <CustomSelect
                                        value={entry.colleagueId}
                                        onChange={(v) => {
                                            updateHandoverEntry(i, "colleagueId", v);
                                            if (errors[`handoverColleague_${i}`]) setErrors(prev => { const next = { ...prev }; delete next[`handoverColleague_${i}`]; return next; });
                                        }}
                                        options={employees
                                            .filter((e: any) => !formData.handoverEntries.some((en, idx) => idx !== i && en.colleagueId === String(e.unique_id ?? e.id)))
                                            .map((e: any) => ({ value: String(e.unique_id ?? e.id), label: empName(e) || `Employee ${e.id}` }))}
                                        placeholder={isLoadingEmployees ? "Loading..." : "Select colleague..."}
                                        disabled={isLoadingEmployees}
                                    />
                                    {errors[`handoverColleague_${i}`] && <p className="text-xs text-red-500">{errors[`handoverColleague_${i}`]}</p>}

                                    {entry.colleagueId && (
                                        <div>
                                            <textarea
                                                value={entry.notes}
                                                onChange={(e) => {
                                                    updateHandoverEntry(i, "notes", e.target.value);
                                                    if (errors[`handoverNotes_${i}`]) setErrors(prev => { const next = { ...prev }; delete next[`handoverNotes_${i}`]; return next; });
                                                }}
                                                rows={2}
                                                placeholder="Tasks to hand over to this colleague..."
                                                className="w-full rounded-lg border border-amber-300 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-amber-700 dark:text-white/90 resize-none"
                                            />
                                            {errors[`handoverNotes_${i}`] && <p className="text-xs text-red-500 mt-1">{errors[`handoverNotes_${i}`]}</p>}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Supporting Document — only shown when required */}
                        {needsSupportingDoc && (
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-400">
                                    Supporting Document <span className="text-red-500">*</span>
                                </label>

                                {isExaminationLeave && (
                                    <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800 px-4 py-2.5 text-sm text-blue-700 dark:text-blue-300">
                                        Examination Leave requires a valid supporting document — e.g. exam timetable, registration slip, or official examination notification.
                                    </div>
                                )}
                                {needsMedicalDoc && (
                                    <div className="mb-3 rounded-lg border border-orange-200 bg-orange-50 dark:bg-orange-900/10 dark:border-orange-800 px-4 py-2.5 text-sm text-orange-700 dark:text-orange-300">
                                        Sick Leave exceeding 2 consecutive working days ({maxWorkingDays} days selected) requires a medical certificate or excuse duty note.
                                    </div>
                                )}
                                {hasTriggerDoc && !isExaminationLeave && !needsMedicalDoc && (
                                    <div className="mb-3 rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-800 px-4 py-2.5 text-sm text-yellow-700 dark:text-yellow-300">
                                        The selected leave type requires a supporting document. Please upload one to proceed.
                                    </div>
                                )}

                                <div className={`relative flex items-center justify-center w-full rounded-xl border-2 border-dashed px-4 py-6 transition-colors ${
                                    errors.supportingDocument
                                        ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
                                        : supportingDocument
                                        ? 'border-green-400 bg-green-50 dark:bg-green-900/10'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-brand-400'
                                }`}>
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0] ?? null;
                                            setSupportingDocument(file);
                                            if (errors.supportingDocument) setErrors((prev) => { const next = { ...prev }; delete next.supportingDocument; return next; });
                                        }}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="text-center pointer-events-none">
                                        {supportingDocument ? (
                                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                                <CheckCircleIcon className="w-5 h-5" />
                                                <span className="text-sm font-medium">{supportingDocument.name}</span>
                                            </div>
                                        ) : (
                                            <>
                                                <svg className="mx-auto w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 16v-8m0 0l-3 3m3-3l3 3M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1" />
                                                </svg>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Click to upload or drag & drop</p>
                                                <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG, DOC up to 10MB</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                                {errors.supportingDocument && <p className="mt-1.5 text-xs text-red-500">{errors.supportingDocument}</p>}
                            </div>
                        )}
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-4 animate-fadeIn">
                        <h4 className="font-medium text-gray-800 dark:text-white/90">Review Application</h4>
                        {proxyMode && proxyEmployeeId && (() => {
                            const emp = employees.find((e: any) => String(e.unique_id ?? e.id) === proxyEmployeeId);
                            return emp ? (
                                <div className="flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 dark:bg-purple-900/10 px-3 py-2 text-sm text-purple-700 dark:text-purple-300">
                                    <span className="font-medium">Applying on behalf of:</span>
                                    <span>{empName(emp)}</span>
                                </div>
                            ) : null;
                        })()}
                        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 space-y-3 text-sm border border-gray-100 dark:border-gray-700">
                            <div className="space-y-2 border-b border-gray-200 pb-2 dark:border-gray-700">
                                <span className="text-gray-500">Leave Breakdown:</span>
                                {formData.dates.map((range: any, i: number) => {
                                    const lt = rowLeaveType(range.leaveTypeId);
                                    return (
                                        <div key={i} className="flex justify-between items-center text-xs gap-2">
                                            <span className="text-gray-500 shrink-0">{lt?.name || "—"}:</span>
                                            <span className="font-medium text-gray-800 dark:text-white text-right">{range.startDate || "-"} → {range.endDate || "-"}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            {formData.comment && (
                                <div className="flex justify-between border-b border-gray-200 pb-2 dark:border-gray-700">
                                    <span className="text-gray-500">Comment:</span>
                                    <span className="font-medium text-gray-800 dark:text-white truncate max-w-[200px]">{formData.comment}</span>
                                </div>
                            )}
                            {formData.handoverEntries.length > 0 && (
                                <div className="border-b border-gray-200 pb-2 dark:border-gray-700 space-y-1">
                                    <span className="text-gray-500">Handover:</span>
                                    {formData.handoverEntries.map((entry, i) => {
                                        const emp = employees.find((e: any) => String(e.unique_id ?? e.id) === String(entry.colleagueId));
                                        return (
                                            <div key={i} className="text-xs">
                                                <span className="font-medium text-gray-800 dark:text-white">{empName(emp) || "—"}</span>
                                                {entry.notes && <span className="text-gray-500 ml-1">— {entry.notes}</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            {supportingDocument && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Document:</span>
                                    <span className="font-medium text-green-600 dark:text-green-400 truncate max-w-[200px]">{supportingDocument.name}</span>
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 italic">By clicking Submit, you confirm the details are correct.</p>
                    </div>
                );
            default:
                return null;
        }
    };

    const footerButtons = (
        <div className="flex items-center justify-between">
            {step > 1 ? (
                <button onClick={prevStep}
                    className="flex items-center gap-2 px-5 py-2.5 font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-white/5 transition-colors">
                    <ChevronLeftIcon className="w-5 h-5" /> Back
                </button>
            ) : <div />}
            {step < 3 ? (
                <button onClick={nextStep}
                    className="flex items-center gap-2 px-5 py-2.5 font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20">
                    Next <ArrowRightIcon className="w-5 h-5" />
                </button>
            ) : (
                <button onClick={handleSubmit} disabled={isSubmitting}
                    className="flex items-center gap-2 px-5 py-2.5 font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-green-500/20">
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                    <PaperPlaneIcon className="w-5 h-5" />
                </button>
            )}
        </div>
    );

    if (compact) {
        return (
            <div className="flex flex-col h-full">
                <div className="px-6 pt-4 pb-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/30">
                    <div className="flex items-center justify-between gap-2">
                        {steps.map((s, index) => {
                            const stepNumber = index + 1;
                            const isActive = step === stepNumber;
                            const isCompleted = step > stepNumber;
                            return (
                                <React.Fragment key={index}>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium transition-colors duration-300 ${
                                            isActive || isCompleted ? "border-brand-500 bg-brand-500 text-white" : "border-gray-300 bg-white text-gray-500 dark:bg-gray-800 dark:border-gray-600"
                                        }`}>
                                            {isCompleted ? <CheckCircleIcon className="w-5 h-5" /> : stepNumber}
                                        </div>
                                        <span className={`hidden sm:inline text-sm font-medium ${isActive ? "text-gray-800 dark:text-white" : "text-gray-500"}`}>{s.title}</span>
                                    </div>
                                    {index !== steps.length - 1 && <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700" />}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">{steps[step - 1].title}</h2>
                    {renderStep()}
                </div>
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">{footerButtons}</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row h-full">
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
                            {index !== steps.length - 1 && (
                                <div className="absolute left-[15px] top-[30px] -bottom-6 w-0.5 bg-gray-200 dark:bg-gray-700 hidden md:block" />
                            )}
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium transition-colors duration-300 ${
                                isActive || isCompleted ? "border-brand-500 bg-brand-500 text-white" : "border-gray-300 bg-white text-gray-500 dark:bg-gray-800 dark:border-gray-600"
                            }`}>
                                {isCompleted ? <CheckCircleIcon className="w-5 h-5" /> : stepNumber}
                            </div>
                            <div className="hidden md:block">
                                <h4 className={`text-sm font-semibold ${isActive ? "text-gray-800 dark:text-white" : "text-gray-500"}`}>{s.title}</h4>
                                <p className="text-xs text-gray-400">{s.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900">
                <div className="flex-1 overflow-y-auto p-6 md:p-8" style={{ overflow: 'visible' }}>
                    <div className="max-w-xl mx-auto">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">{steps[step - 1].title}</h2>
                        {renderStep()}
                    </div>
                </div>
                <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <div className="max-w-xl mx-auto">{footerButtons}</div>
                </div>
            </div>
        </div>
    );
}
