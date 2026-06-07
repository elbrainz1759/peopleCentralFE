"use client";
import React, { useState, useEffect } from "react";
import { authService } from "@/services/auth.service";
import { ExitService } from "@/services/exit.service";
import { DownloadIcon } from "@/icons";

interface CheckItem {
    label: string;
    checked: boolean;
    na?: boolean; // has a second column (N/A or No)
    naChecked?: boolean;
    extra?: string; // e.g. annual leave days
}

function mkItem(label: string, hasSecond = false, extra = ""): CheckItem {
    return { label, checked: false, na: hasSecond, naChecked: false, extra };
}

interface FormState {
    // Header
    employeeName: string;
    employeeId: string;
    supervisor: string;
    dateOfSeparation: string;
    department: string;
    location: string;
    personalEmail: string;
    telephone: string;
    forwardingAddress: string;
    // Supervisor notes
    supervisorNotes: string;
    supervisorAcknowledged: boolean;
    // Operations — Assets (Returned / N/A)
    assets: CheckItem[];
    opsOtherComments: string;
    // Operations — IT (Applicable / N/A)
    itItems: CheckItem[];
    // Finance
    advancesCleared: "Yes" | "No" | "";
    amountDuePaid: "Yes" | "No" | "";
    // HR items (single checkbox)
    hrItems: CheckItem[];
    annualLeaveDays: string;
    hrOtherComments: string;
    // Attachments
    hasResignationLetter: boolean;
    hasFinalTimesheet: boolean;
    hasAdditionalDocs: boolean;
    // Employee acknowledgement
    employeeAcknowledged: boolean;
}

function initState(): FormState {
    return {
        employeeName: "", employeeId: "", supervisor: "", dateOfSeparation: "",
        department: "", location: "", personalEmail: "", telephone: "", forwardingAddress: "",
        supervisorNotes: "", supervisorAcknowledged: false,
        assets: [
            mkItem("Keys", true),
            mkItem("Laptop / PC", true),
            mkItem("Computer Accessories - bag", true),
            mkItem("Mouse", true),
            mkItem("Camera", true),
        ],
        opsOtherComments: "",
        itItems: [
            mkItem("Digital Library - Flash etc", true),
            mkItem("Cell Phone / Charger / SIM", true),
            mkItem("Email / Password deactivated", true),
        ],
        advancesCleared: "", amountDuePaid: "",
        hrItems: [
            mkItem("Termination / Resignation Letter"),
            mkItem("Annual Leave"),
            mkItem("Employee ID Cards"),
            mkItem("Final Timesheet"),
            mkItem("Health Insurance Cards"),
            mkItem("Health Insurance Cancellation"),
            mkItem("Life Insurance Cancellation"),
            mkItem("Exit Checklist"),
            mkItem("Employment Certificate"),
        ],
        annualLeaveDays: "", hrOtherComments: "",
        hasResignationLetter: false, hasFinalTimesheet: false, hasAdditionalDocs: false,
        employeeAcknowledged: false,
    };
}

// ── Sub-components ─────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
    return (
        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide border-b border-gray-300 dark:border-gray-700 pb-1 mb-3">
            {children}
        </h3>
    );
}

function FieldLine({ label, value, onChange, type = "text", className = "" }: {
    label: string; value: string; onChange: (v: string) => void; type?: string; className?: string;
}) {
    return (
        <div className={`flex items-end gap-2 ${className}`}>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap min-w-[140px]">{label}</span>
            <input type={type} value={value} onChange={e => onChange(e.target.value)}
                className="flex-1 border-b border-gray-400 dark:border-gray-600 bg-transparent text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-brand-500 pb-0.5" />
        </div>
    );
}

function CheckRow({ item, col1Label, col2Label, onChange }: {
    item: CheckItem;
    col1Label: string;
    col2Label: string;
    onChange: (checked: boolean, naChecked: boolean) => void;
}) {
    return (
        <tr className="border-b border-gray-100 dark:border-gray-800">
            <td className="py-1.5 pr-4 text-sm text-gray-700 dark:text-gray-300">{item.label}</td>
            <td className="py-1.5 text-center w-20">
                <input type="checkbox" checked={item.checked} onChange={e => onChange(e.target.checked, item.naChecked ?? false)}
                    className="h-4 w-4 accent-brand-500 cursor-pointer" />
            </td>
            {item.na !== undefined && (
                <td className="py-1.5 text-center w-20">
                    <input type="checkbox" checked={item.naChecked ?? false} onChange={e => onChange(item.checked, e.target.checked)}
                        className="h-4 w-4 accent-gray-400 cursor-pointer" />
                </td>
            )}
        </tr>
    );
}

function SignatureLine({ label }: { label: string }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 mt-3">
            <div className="flex-1">
                <div className="border-b border-gray-400 dark:border-gray-600 pb-1 min-h-[28px]" />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">{label}</p>
            </div>
            <div className="sm:w-40">
                <div className="border-b border-gray-400 dark:border-gray-600 pb-1 min-h-[28px]" />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">Date</p>
            </div>
        </div>
    );
}

// ── Main component ──────────────────────────────────────────────

type ApprovalStatus = "loading" | "not-started" | "pending" | "completed";

export default function EndOfServiceChecklist() {
    const [form, setForm] = useState<FormState>(initState());
    const [submitted, setSubmitted] = useState(false);
    const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>("loading");
    const [exitStage, setExitStage] = useState<string>("");

    useEffect(() => {
        const exitService = ExitService.getInstance();

        const init = async () => {
            try {
                const user = authService.getCurrentUser();
                if (!user) { setApprovalStatus("not-started"); return; }

                const staffId = user.staff_id ?? user.id;

                setForm(prev => ({
                    ...prev,
                    employeeName: user.employee_name ?? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim(),
                    employeeId: String(staffId ?? ""),
                    department: user.department_name ?? user.department ?? "",
                    personalEmail: user.email ?? "",
                    telephone: user.phone ?? "",
                }));

                // Check if this employee has a completed exit interview
                const res = await exitService.getAllExitInterviews(1, 200);
                const interviews: any[] = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
                const mine = interviews.find((i: any) =>
                    String(i.staff_id ?? i.staffId ?? "") === String(staffId ?? "")
                );

                if (!mine) {
                    setApprovalStatus("not-started");
                    return;
                }

                const stage = mine.stage ?? "";
                const status = mine.status ?? "";
                setExitStage(stage);

                if (stage === "Completed" || status === "Completed" || status === "Approved") {
                    // Pre-fill any additional fields from the exit record
                    setForm(prev => ({
                        ...prev,
                        dateOfSeparation: mine.resignation_date
                            ? new Date(mine.resignation_date).toISOString().split("T")[0]
                            : prev.dateOfSeparation,
                    }));
                    setApprovalStatus("completed");
                } else {
                    setApprovalStatus("pending");
                }
            } catch {
                setApprovalStatus("not-started");
            }
        };

        init();
    }, []);

    const set = (field: keyof FormState, value: any) => setForm(prev => ({ ...prev, [field]: value }));

    const updateAsset = (index: number, checked: boolean, naChecked: boolean) =>
        setForm(prev => {
            const assets = [...prev.assets];
            assets[index] = { ...assets[index], checked, naChecked };
            return { ...prev, assets };
        });

    const updateIT = (index: number, checked: boolean, naChecked: boolean) =>
        setForm(prev => {
            const itItems = [...prev.itItems];
            itItems[index] = { ...itItems[index], checked, naChecked };
            return { ...prev, itItems };
        });

    const updateHR = (index: number, checked: boolean) =>
        setForm(prev => {
            const hrItems = [...prev.hrItems];
            hrItems[index] = { ...hrItems[index], checked };
            return { ...prev, hrItems };
        });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.employeeAcknowledged) {
            alert("Please acknowledge by signing (checking the employee acknowledgement box) before submitting.");
            return;
        }
        setSubmitted(true);
    };

    const thClass = "text-xs font-semibold text-gray-500 dark:text-gray-400 text-center pb-2 w-20";

    if (approvalStatus === "loading") {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-10 text-center">
                <div className="mx-auto h-10 w-10 rounded-full border-4 border-brand-500 border-t-transparent animate-spin mb-4" />
                <p className="text-sm text-gray-500">Checking approval status...</p>
            </div>
        );
    }

    if (approvalStatus === "not-started") {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-10 text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 mb-2">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">No Exit Request Found</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-sm">
                    You have not submitted an exit request yet. Please submit an Exit Request first — this document will become available once your exit clearance has been fully approved.
                </p>
                <a href="/exit" className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-medium transition-colors text-sm">
                    Go to Exit Request
                </a>
            </div>
        );
    }

    if (approvalStatus === "pending") {
        const stageLabels: Record<string, string> = {
            Employee: "Employee Submission",
            Supervisor: "Supervisor Review",
            Operations: "Operations Clearance",
            Finance: "Finance Clearance",
            HR: "HR Final Review",
            HR_Final: "HR Final Review",
        };
        const stages = ["Employee", "Supervisor", "Operations", "Finance", "HR"];
        const currentIdx = stages.indexOf(exitStage.replace("_Final", ""));

        return (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800 p-10 text-center space-y-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Approval In Progress</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md mx-auto">
                        The End of Service Checklist will be available for download once your exit clearance has been fully approved by all departments.
                    </p>
                </div>

                {/* Progress tracker */}
                <div className="flex items-center justify-center gap-1 flex-wrap max-w-lg mx-auto">
                    {stages.map((s, idx) => {
                        const done = idx < currentIdx;
                        const active = idx === currentIdx;
                        return (
                            <React.Fragment key={s}>
                                <div className={`flex flex-col items-center gap-1 ${idx !== stages.length - 1 ? "flex-1" : ""}`}>
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                        done ? "bg-green-500 text-white" : active ? "bg-amber-500 text-white ring-4 ring-amber-500/20" : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                                    }`}>
                                        {done ? "✓" : idx + 1}
                                    </div>
                                    <span className={`text-[10px] font-medium hidden sm:block ${active ? "text-amber-700 dark:text-amber-400" : done ? "text-green-600 dark:text-green-400" : "text-gray-400"}`}>
                                        {stageLabels[s]}
                                    </span>
                                </div>
                                {idx !== stages.length - 1 && (
                                    <div className={`h-0.5 flex-1 mb-4 ${done ? "bg-green-400" : "bg-gray-200 dark:bg-gray-700"}`} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>

                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    Current stage: <span className="font-bold">{stageLabels[exitStage] ?? exitStage}</span>
                </p>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-10 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 mb-6">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">End of Service Checklist Submitted</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
                    Your checklist has been submitted. The relevant departments will complete their sections and sign off before your final paycheck is processed.
                </p>
                <button onClick={() => window.print()}
                    className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-medium flex items-center gap-2 mx-auto transition-colors">
                    <DownloadIcon className="w-5 h-5" /> Print / Save PDF
                </button>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] print:shadow-none print:border-none">
            {/* Header */}
            <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">End of Service Checklist</h2>
                    <p className="text-xs text-gray-400 mt-0.5 italic">
                        **The following information must be provided and approved before release of final pay check
                    </p>
                </div>
                <button onClick={() => window.print()}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 print:hidden">
                    <DownloadIcon className="w-4 h-4" /> Print / Save PDF
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-8">

                {/* ── Header Info ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3">
                    <FieldLine label="Employee Name" value={form.employeeName} onChange={v => set("employeeName", v)} />
                    <FieldLine label="Employee ID" value={form.employeeId} onChange={v => set("employeeId", v)} />
                    <FieldLine label="Supervisor" value={form.supervisor} onChange={v => set("supervisor", v)} />
                    <FieldLine label="Date of Separation" value={form.dateOfSeparation} onChange={v => set("dateOfSeparation", v)} type="date" />
                    <FieldLine label="Department" value={form.department} onChange={v => set("department", v)} />
                    <FieldLine label="Location" value={form.location} onChange={v => set("location", v)} />
                    <FieldLine label="Personal Email" value={form.personalEmail} onChange={v => set("personalEmail", v)} type="email" />
                    <FieldLine label="Telephone" value={form.telephone} onChange={v => set("telephone", v)} />
                    <div className="sm:col-span-2">
                        <FieldLine label="Forwarding Address" value={form.forwardingAddress} onChange={v => set("forwardingAddress", v)} />
                    </div>
                </div>

                {/* ── Employee Acknowledgement ── */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-4">
                    <SectionHeading>Employee</SectionHeading>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        I understand that each of the sections below must be completed, cleared by the appropriate signatory, and that outstanding company property must be returned. I agree that failure to complete and return this form and any Mercy Corps property by my last scheduled work day will result in the delay of my final payments.
                    </p>
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" checked={form.employeeAcknowledged} onChange={e => set("employeeAcknowledged", e.target.checked)}
                            className="mt-0.5 h-5 w-5 accent-brand-500 flex-shrink-0" required />
                        <span className="text-sm font-medium text-gray-800 dark:text-white">
                            I acknowledge and agree to the above statement (Employee Signature)
                        </span>
                    </label>
                    <SignatureLine label="Signature of Employee" />
                </div>

                {/* ── Supervisor ── */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-4">
                    <SectionHeading>Supervisor</SectionHeading>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Supervisor should ensure all pending work / Closing Report / Handover Notes submitted (if applicable) are completed and turned in. Note any outstanding work below:
                    </p>
                    <textarea value={form.supervisorNotes} onChange={e => set("supervisorNotes", e.target.value)} rows={3}
                        placeholder="Note any outstanding work here..."
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-brand-500 resize-none" />
                    <SignatureLine label="Signature of Supervisor" />
                </div>

                {/* ── Items to be returned ── */}
                <div className="space-y-6">
                    <SectionHeading>Items to be Returned by Employee</SectionHeading>

                    {/* Operations */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-5">
                        <p className="text-sm font-bold text-gray-800 dark:text-white underline">Operations:</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Assets */}
                            <div>
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Assets</p>
                                <table className="w-full">
                                    <thead>
                                        <tr>
                                            <th className="text-left pb-1 text-xs text-gray-400"></th>
                                            <th className={thClass}>Returned</th>
                                            <th className={thClass}>N/A</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {form.assets.map((item, i) => (
                                            <CheckRow key={item.label} item={item} col1Label="Returned" col2Label="N/A"
                                                onChange={(c, n) => updateAsset(i, c, n)} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* IT */}
                            <div>
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Information Technology</p>
                                <table className="w-full">
                                    <thead>
                                        <tr>
                                            <th className="text-left pb-1 text-xs text-gray-400"></th>
                                            <th className={thClass}>Applicable</th>
                                            <th className={thClass}>N/A</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {form.itItems.map((item, i) => (
                                            <CheckRow key={item.label} item={item} col1Label="Applicable" col2Label="N/A"
                                                onChange={(c, n) => updateIT(i, c, n)} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Other Items / Comments</label>
                            <input type="text" value={form.opsOtherComments} onChange={e => set("opsOtherComments", e.target.value)}
                                className="w-full border-b border-gray-400 dark:border-gray-600 bg-transparent text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-brand-500 pb-0.5" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <SignatureLine label="Assets Controller" />
                            </div>
                            <div>
                                <SignatureLine label="IT Officer / Manager" />
                            </div>
                        </div>
                    </div>

                    {/* Finance */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-4">
                        <p className="text-sm font-bold text-gray-800 dark:text-white underline">Finance:</p>
                        <table className="w-full max-w-sm">
                            <thead>
                                <tr>
                                    <th className="text-left pb-1 text-xs text-gray-400"></th>
                                    <th className={thClass}>Yes</th>
                                    <th className={thClass}>No</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { label: "Outstanding Advances Cleared", field: "advancesCleared" },
                                    { label: "Total Amount Due to Company Paid", field: "amountDuePaid" },
                                ].map(({ label, field }) => (
                                    <tr key={field} className="border-b border-gray-100 dark:border-gray-800">
                                        <td className="py-1.5 pr-4 text-sm text-gray-700 dark:text-gray-300">{label}</td>
                                        <td className="py-1.5 text-center w-20">
                                            <input type="radio" name={field} value="Yes"
                                                checked={(form as any)[field] === "Yes"}
                                                onChange={() => set(field as keyof FormState, "Yes")}
                                                className="accent-brand-500" />
                                        </td>
                                        <td className="py-1.5 text-center w-20">
                                            <input type="radio" name={field} value="No"
                                                checked={(form as any)[field] === "No"}
                                                onChange={() => set(field as keyof FormState, "No")}
                                                className="accent-brand-500" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <SignatureLine label="Finance Manager" />
                    </div>

                    {/* HR */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-4">
                        <p className="text-sm font-bold text-gray-800 dark:text-white underline">Human Resources:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                            {form.hrItems.map((item, i) => (
                                <label key={item.label} className="flex items-center gap-2 py-1 cursor-pointer">
                                    <input type="checkbox" checked={item.checked} onChange={e => updateHR(i, e.target.checked)}
                                        className="h-4 w-4 accent-brand-500" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        {item.label}
                                        {item.label === "Annual Leave" && (
                                            <span className="ml-1 inline-flex items-center gap-1">
                                                No of days (
                                                <input type="text" value={form.annualLeaveDays}
                                                    onChange={e => set("annualLeaveDays", e.target.value)}
                                                    className="w-12 border-b border-gray-400 dark:border-gray-600 bg-transparent text-sm outline-none text-center" />
                                                )
                                            </span>
                                        )}
                                    </span>
                                </label>
                            ))}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Other Items / Comments</label>
                            <input type="text" value={form.hrOtherComments} onChange={e => set("hrOtherComments", e.target.value)}
                                className="w-full border-b border-gray-400 dark:border-gray-600 bg-transparent text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-brand-500 pb-0.5" />
                        </div>
                        <SignatureLine label="Human Resources Representative" />
                    </div>
                </div>

                {/* ── HR Director Final Approval ── */}
                <div className="border-t-2 border-gray-900 dark:border-gray-400 pt-5 space-y-3">
                    <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                        Approved for Payment of Final Paycheck
                    </p>
                    <SignatureLine label="Signature of HR Director" />
                </div>

                {/* ── Required Attachments ── */}
                <div className="space-y-3">
                    <SectionHeading>Required Attachments</SectionHeading>
                    <div className="flex flex-wrap gap-6">
                        {[
                            { label: "Letter of Resignation (if applicable)", field: "hasResignationLetter" },
                            { label: "Final Timesheet", field: "hasFinalTimesheet" },
                            { label: "Additional Documentation (as applicable)", field: "hasAdditionalDocs" },
                        ].map(({ label, field }) => (
                            <label key={field} className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={(form as any)[field]}
                                    onChange={e => set(field as keyof FormState, e.target.checked)}
                                    className="h-4 w-4 accent-brand-500" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* ── Submit ── */}
                <div className="flex justify-end pt-2 print:hidden">
                    <button type="submit"
                        className="rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-60 px-8 py-3 text-base font-medium text-white shadow-sm transition-colors">
                        Submit Checklist
                    </button>
                </div>
            </form>
        </div>
    );
}
