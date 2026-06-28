"use client";
import React, { useState, useEffect } from "react";
import { DownloadIcon } from "@/icons";
import { authService } from "@/services/auth.service";
import { leaveServiceInstance } from "@/services/leave.service";
import { ExitService } from "@/services/exit.service";
import { toast } from "react-hot-toast";

// ── Types ────────────────────────────────────────────────────────
type FreqRating = "Almost Always" | "Usually" | "Sometimes" | "Never" | "";
type QualRating = "Excellent" | "Good" | "Fair" | "Poor" | "";
type BenefitRating = "Excellent" | "Good" | "Fair" | "Poor" | "No Opinion" | "";
type WorkloadRating = "Too heavy" | "About right" | "Too light" | "";
type RecommendRating = "Most definitely" | "With reservations" | "No" | "";

interface FormData {
    // Header
    employeeName: string;
    supervisor: string;
    department: string;
    jobTitle: string;
    hireDate: string;
    terminationDate: string;
    // Q1-Q4
    whyLeaving: string;
    whatWouldPrevent: string;
    likedMost: string;
    likedLeast: string;
    // Q5 — Supervisor evaluation
    supervisorFair: FreqRating;
    supervisorRecognition: FreqRating;
    supervisorComplaints: FreqRating;
    supervisorSensitive: FreqRating;
    supervisorFeedback: FreqRating;
    supervisorCommunication: FreqRating;
    supervisorPolicies: FreqRating;
    // Q6 — Organisation ratings
    ratingCoopDept: QualRating;
    ratingCoopOther: QualRating;
    ratingTraining: QualRating;
    ratingEquipment: QualRating;
    ratingPerfReview: QualRating;
    ratingOrientation: QualRating;
    ratingPay: QualRating;
    ratingCareerDev: QualRating;
    ratingWorkConditions: QualRating;
    ratingComments: string;
    // Q7
    workAsExpected: "Yes" | "No" | "";
    workExpectedComments: string;
    // Q8
    workload: WorkloadRating;
    // Q9 — Benefits
    benefitHolidays: BenefitRating;
    benefitAnnualLeave: BenefitRating;
    benefitMedical: BenefitRating;
    benefitSickLeave: BenefitRating;
    benefitGratuity: BenefitRating;
    benefitEducation: BenefitRating;
    // Q10
    wouldRecommend: RecommendRating;
    // Q11
    suggestions: string;
    // Signature
    signature: boolean;
}

// ── Reusable row components ───────────────────────────────────────
function FreqRow({ label, field, value, onChange }: { label: string; field: string; value: FreqRating; onChange: (f: string, v: FreqRating) => void }) {
    const opts: FreqRating[] = ["Almost Always", "Usually", "Sometimes", "Never"];
    return (
        <tr className="border-b border-gray-100 dark:border-gray-800">
            <td className="py-2 pr-4 text-sm text-gray-700 dark:text-gray-300">{label}</td>
            {opts.map(o => (
                <td key={o} className="py-2 text-center">
                    <input type="radio" name={field} value={o} checked={value === o} onChange={() => onChange(field, o)}
                        className="accent-brand-500" />
                </td>
            ))}
        </tr>
    );
}

function QualRow({ label, field, value, onChange }: { label: string; field: string; value: QualRating; onChange: (f: string, v: QualRating) => void }) {
    const opts: QualRating[] = ["Excellent", "Good", "Fair", "Poor"];
    return (
        <tr className="border-b border-gray-100 dark:border-gray-800">
            <td className="py-2 pr-4 text-sm text-gray-700 dark:text-gray-300">{label}</td>
            {opts.map(o => (
                <td key={o} className="py-2 text-center">
                    <input type="radio" name={field} value={o} checked={value === o} onChange={() => onChange(field, o)}
                        className="accent-brand-500" />
                </td>
            ))}
        </tr>
    );
}

function BenefitRow({ label, field, value, onChange }: { label: string; field: string; value: BenefitRating; onChange: (f: string, v: BenefitRating) => void }) {
    const opts: BenefitRating[] = ["Excellent", "Good", "Fair", "Poor", "No Opinion"];
    return (
        <tr className="border-b border-gray-100 dark:border-gray-800">
            <td className="py-2 pr-4 text-sm text-gray-700 dark:text-gray-300">{label}</td>
            {opts.map(o => (
                <td key={o} className="py-2 text-center">
                    <input type="radio" name={field} value={o} checked={value === o} onChange={() => onChange(field, o)}
                        className="accent-brand-500" />
                </td>
            ))}
        </tr>
    );
}

// ── Main component ────────────────────────────────────────────────
export default function ExitInterviewForm() {
    const [formData, setFormData] = useState<FormData>({
        employeeName: "", supervisor: "", department: "", jobTitle: "",
        hireDate: "", terminationDate: "",
        whyLeaving: "", whatWouldPrevent: "", likedMost: "", likedLeast: "",
        supervisorFair: "", supervisorRecognition: "", supervisorComplaints: "",
        supervisorSensitive: "", supervisorFeedback: "", supervisorCommunication: "", supervisorPolicies: "",
        ratingCoopDept: "", ratingCoopOther: "", ratingTraining: "", ratingEquipment: "",
        ratingPerfReview: "", ratingOrientation: "", ratingPay: "", ratingCareerDev: "", ratingWorkConditions: "",
        ratingComments: "",
        workAsExpected: "", workExpectedComments: "",
        workload: "",
        benefitHolidays: "", benefitAnnualLeave: "", benefitMedical: "",
        benefitSickLeave: "", benefitGratuity: "", benefitEducation: "",
        wouldRecommend: "",
        suggestions: "",
        signature: false,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const exitServiceInstance = ExitService.getInstance();

    useEffect(() => {
        try {
            const user = authService.getCurrentUser();
            if (user) {
                setFormData(prev => ({
                    ...prev,
                    employeeName: user.employee_name ?? user.name ?? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim(),
                    department: user.department_name ?? user.department ?? "",
                    jobTitle: user.designation ?? user.job_title ?? "",
                }));
            }
        } catch { /* ignore */ }
    }, []);

    const set = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));

    const handleText = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        set(e.target.name, e.target.value);

    // Map form → backend ExitInterview payload
    const buildPayload = () => {
        const user = authService.getCurrentUser();
        const staffId = user?.staff_id ?? user?.id ?? 0;

        // Average supervisor freq rating (Almost Always=4, Usually=3, Sometimes=2, Never=1)
        const freqScore: Record<FreqRating, number> = { "Almost Always": 4, "Usually": 3, "Sometimes": 2, "Never": 1, "": 2 };
        const supFields: FreqRating[] = [
            formData.supervisorFair, formData.supervisorRecognition, formData.supervisorComplaints,
            formData.supervisorSensitive, formData.supervisorFeedback, formData.supervisorCommunication, formData.supervisorPolicies,
        ];
        const supAvg = Math.round(supFields.reduce((s, f) => s + freqScore[f], 0) / supFields.length);
        const ratingManagerMapped = Math.max(1, Math.min(5, Math.round((supAvg / 4) * 5)));

        // Average org rating (Excellent=4, Good=3, Fair=2, Poor=1)
        const qualScore: Record<QualRating, number> = { Excellent: 4, Good: 3, Fair: 2, Poor: 1, "": 2 };
        const orgFields: QualRating[] = [
            formData.ratingCoopDept, formData.ratingCoopOther, formData.ratingTraining, formData.ratingEquipment,
            formData.ratingPerfReview, formData.ratingOrientation, formData.ratingPay, formData.ratingCareerDev, formData.ratingWorkConditions,
        ];
        const orgAvg = orgFields.reduce((s, f) => s + qualScore[f], 0) / orgFields.length;
        const ratingJobMapped = Math.max(1, Math.min(5, Math.round((orgAvg / 4) * 5)));

        const recommendMap: Record<RecommendRating, "Yes" | "No" | "Maybe"> = {
            "Most definitely": "Yes", "With reservations": "Maybe", "No": "No", "": "Maybe",
        };

        return {
            staffId,
            supervisorId: user?.supervisor ?? user?.supervisor_id ?? user?.supervisorId ?? staffId,
            departmentId: user?.department_id ?? user?.departmentId ?? user?.department ?? "",
            resignationDate: formData.terminationDate || new Date().toISOString(),
            handoverNotes: "",
            reasonForLeaving: formData.whyLeaving || "Other",
            otherReason: formData.whatWouldPrevent,
            ratingJob: ratingJobMapped,
            ratingManager: ratingManagerMapped,
            ratingCulture: ratingManagerMapped,
            mostEnjoyed: formData.likedMost,
            companyImprovement: formData.likedLeast,
            wouldRecommend: recommendMap[formData.wouldRecommend],
            additionalComments: JSON.stringify({
                workAsExpected: formData.workAsExpected,
                workExpectedComments: formData.workExpectedComments,
                workload: formData.workload,
                ratingComments: formData.ratingComments,
                suggestions: formData.suggestions,
                benefits: {
                    holidays: formData.benefitHolidays,
                    annualLeave: formData.benefitAnnualLeave,
                    medical: formData.benefitMedical,
                    sickLeave: formData.benefitSickLeave,
                    gratuity: formData.benefitGratuity,
                    education: formData.benefitEducation,
                },
            }),
            signature: formData.signature,
            status: "Pending" as const,
            stage: "Employee" as const,
        };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.signature) { toast.error("Please sign the form before submitting."); return; }
        if (!formData.whyLeaving.trim()) { toast.error("Please answer Question 1."); return; }
        setIsSubmitting(true);
        try {
            await exitServiceInstance.createExitInterview(buildPayload());
            setSubmitted(true);
            toast.success("Exit interview submitted successfully.");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error?.message || "Failed to submit. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] text-center py-16">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 mb-6">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Exit Interview Submitted</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
                    Thank you for your feedback. We appreciate your honesty and wish you the best in your future endeavours.
                </p>
                <button onClick={() => window.print()}
                    className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2 mx-auto">
                    <DownloadIcon className="w-5 h-5" /> Print / Save PDF
                </button>
            </div>
        );
    }

    const sectionClass = "space-y-4";
    const headingClass = "text-base font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4";
    const textAreaClass = "w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-brand-500 resize-none";
    const thClass = "py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 text-center whitespace-nowrap";

    return (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] print:shadow-none print:border-none">
            {/* Header bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">EXIT INTERVIEW</h2>
                    <p className="text-xs text-gray-400 mt-0.5 italic">This form is to be completed by the employee</p>
                </div>
                <button onClick={() => window.print()}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 print:hidden">
                    <DownloadIcon className="w-4 h-4" /> Print / Save PDF
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-8">

                {/* ── Header fields ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 border-b border-gray-200 dark:border-gray-700 pb-6">
                    {[
                        { label: "Employee Name", field: "employeeName" },
                        { label: "Supervisor", field: "supervisor" },
                        { label: "Department", field: "department" },
                        { label: "Job Title", field: "jobTitle" },
                        { label: "Hire Date", field: "hireDate", type: "date" },
                        { label: "Termination Date", field: "terminationDate", type: "date" },
                    ].map(({ label, field, type = "text" }) => (
                        <div key={field} className="flex items-end gap-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap min-w-[120px]">{label}</label>
                            <input type={type} name={field} value={(formData as any)[field]} onChange={handleText}
                                className="flex-1 border-b border-gray-400 dark:border-gray-600 bg-transparent text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-brand-500 pb-1" />
                        </div>
                    ))}
                </div>

                {/* ── Q1 ── */}
                <div className={sectionClass}>
                    <h4 className={headingClass}>1. Why are you leaving Mercy Corps?</h4>
                    <textarea name="whyLeaving" value={formData.whyLeaving} onChange={handleText} rows={3} required className={textAreaClass} placeholder="Please explain..." />
                </div>

                {/* ── Q2 ── */}
                <div className={sectionClass}>
                    <h4 className={headingClass}>2. What circumstances would have prevented your departure?</h4>
                    <textarea name="whatWouldPrevent" value={formData.whatWouldPrevent} onChange={handleText} rows={3} className={textAreaClass} placeholder="Please explain..." />
                </div>

                {/* ── Q3 ── */}
                <div className={sectionClass}>
                    <h4 className={headingClass}>3. What did you like most about your job?</h4>
                    <textarea name="likedMost" value={formData.likedMost} onChange={handleText} rows={3} className={textAreaClass} placeholder="Please explain..." />
                </div>

                {/* ── Q4 ── */}
                <div className={sectionClass}>
                    <h4 className={headingClass}>4. What did you like least about your job?</h4>
                    <textarea name="likedLeast" value={formData.likedLeast} onChange={handleText} rows={3} className={textAreaClass} placeholder="Please explain..." />
                </div>

                {/* ── Q5 — Supervisor evaluation ── */}
                <div className={sectionClass}>
                    <h4 className={headingClass}>5. What did you think of your supervisor on the following points:</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[480px]">
                            <thead>
                                <tr>
                                    <th className="text-left pb-2 text-xs font-medium text-gray-400"></th>
                                    {(["Almost Always", "Usually", "Sometimes", "Never"] as FreqRating[]).map(h => <th key={h} className={thClass}>{h}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                <FreqRow label="Was consistently fair" field="supervisorFair" value={formData.supervisorFair} onChange={(f, v) => set(f, v)} />
                                <FreqRow label="Provided recognition" field="supervisorRecognition" value={formData.supervisorRecognition} onChange={(f, v) => set(f, v)} />
                                <FreqRow label="Resolved complaints" field="supervisorComplaints" value={formData.supervisorComplaints} onChange={(f, v) => set(f, v)} />
                                <FreqRow label="Was sensitive to employees' needs" field="supervisorSensitive" value={formData.supervisorSensitive} onChange={(f, v) => set(f, v)} />
                                <FreqRow label="Provided feedback on performance" field="supervisorFeedback" value={formData.supervisorFeedback} onChange={(f, v) => set(f, v)} />
                                <FreqRow label="Was receptive to open communication" field="supervisorCommunication" value={formData.supervisorCommunication} onChange={(f, v) => set(f, v)} />
                                <FreqRow label="Followed Mercy Corps' policies" field="supervisorPolicies" value={formData.supervisorPolicies} onChange={(f, v) => set(f, v)} />
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Q6 — Organisation ratings ── */}
                <div className={sectionClass}>
                    <h4 className={headingClass}>6. How would you rate the following:</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[480px]">
                            <thead>
                                <tr>
                                    <th className="text-left pb-2 text-xs font-medium text-gray-400"></th>
                                    {(["Excellent", "Good", "Fair", "Poor"] as QualRating[]).map(h => <th key={h} className={thClass}>{h}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                <QualRow label="Cooperation within your department/program" field="ratingCoopDept" value={formData.ratingCoopDept} onChange={(f, v) => set(f, v)} />
                                <QualRow label="Cooperation with other departments" field="ratingCoopOther" value={formData.ratingCoopOther} onChange={(f, v) => set(f, v)} />
                                <QualRow label="Personal job training" field="ratingTraining" value={formData.ratingTraining} onChange={(f, v) => set(f, v)} />
                                <QualRow label="Equipment provided (materials, resources, facilities)" field="ratingEquipment" value={formData.ratingEquipment} onChange={(f, v) => set(f, v)} />
                                <QualRow label="Organisation's performance review system" field="ratingPerfReview" value={formData.ratingPerfReview} onChange={(f, v) => set(f, v)} />
                                <QualRow label="Organisation's new employee orientation program" field="ratingOrientation" value={formData.ratingOrientation} onChange={(f, v) => set(f, v)} />
                                <QualRow label="Rate of pay for your job" field="ratingPay" value={formData.ratingPay} onChange={(f, v) => set(f, v)} />
                                <QualRow label="Career development/Advancement opportunities" field="ratingCareerDev" value={formData.ratingCareerDev} onChange={(f, v) => set(f, v)} />
                                <QualRow label="Physical working conditions" field="ratingWorkConditions" value={formData.ratingWorkConditions} onChange={(f, v) => set(f, v)} />
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Comments:</label>
                        <textarea name="ratingComments" value={formData.ratingComments} onChange={handleText} rows={2} className={textAreaClass} />
                    </div>
                </div>

                {/* ── Q7 ── */}
                <div className={sectionClass}>
                    <h4 className={headingClass}>7. Was the work you were doing approximately what you expected it would be?</h4>
                    <div className="flex gap-6 mb-3">
                        {(["Yes", "No"] as const).map(v => (
                            <label key={v} className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="workAsExpected" value={v} checked={formData.workAsExpected === v} onChange={() => set("workAsExpected", v)} className="accent-brand-500" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">{v}</span>
                            </label>
                        ))}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Comments:</label>
                        <textarea name="workExpectedComments" value={formData.workExpectedComments} onChange={handleText} rows={2} className={textAreaClass} />
                    </div>
                </div>

                {/* ── Q8 ── */}
                <div className={sectionClass}>
                    <h4 className={headingClass}>8. Was your workload usually:</h4>
                    <div className="flex flex-wrap gap-6">
                        {(["Too heavy", "About right", "Too light"] as WorkloadRating[]).map(v => (
                            <label key={v} className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="workload" value={v} checked={formData.workload === v} onChange={() => set("workload", v)} className="accent-brand-500" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">{v}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* ── Q9 — Benefits ── */}
                <div className={sectionClass}>
                    <h4 className={headingClass}>9. How did you feel about the employee benefits provided by the company?</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[560px]">
                            <thead>
                                <tr>
                                    <th className="text-left pb-2 text-xs font-medium text-gray-400"></th>
                                    {(["Excellent", "Good", "Fair", "Poor", "No Opinion"] as BenefitRating[]).map(h => <th key={h} className={thClass}>{h}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                <BenefitRow label="Paid holidays" field="benefitHolidays" value={formData.benefitHolidays} onChange={(f, v) => set(f, v)} />
                                <BenefitRow label="Paid Annual Leave" field="benefitAnnualLeave" value={formData.benefitAnnualLeave} onChange={(f, v) => set(f, v)} />
                                <BenefitRow label="Medical plan" field="benefitMedical" value={formData.benefitMedical} onChange={(f, v) => set(f, v)} />
                                <BenefitRow label="Sick leave" field="benefitSickLeave" value={formData.benefitSickLeave} onChange={(f, v) => set(f, v)} />
                                <BenefitRow label="Gratuity/Severance" field="benefitGratuity" value={formData.benefitGratuity} onChange={(f, v) => set(f, v)} />
                                <BenefitRow label="Educational assistance" field="benefitEducation" value={formData.benefitEducation} onChange={(f, v) => set(f, v)} />
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Q10 ── */}
                <div className={sectionClass}>
                    <h4 className={headingClass}>10. Would you recommend MC to a friend as a good organisation to work for?</h4>
                    <div className="flex flex-wrap gap-6">
                        {(["Most definitely", "With reservations", "No"] as RecommendRating[]).map(v => (
                            <label key={v} className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="wouldRecommend" value={v} checked={formData.wouldRecommend === v} onChange={() => set("wouldRecommend", v)} className="accent-brand-500" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">{v}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* ── Q11 ── */}
                <div className={sectionClass}>
                    <h4 className={headingClass}>11. What suggestions do you have to make Mercy Corps a better place to work?</h4>
                    <textarea name="suggestions" value={formData.suggestions} onChange={handleText} rows={4} className={textAreaClass} placeholder="Your suggestions..." />
                </div>

                {/* ── Signatures ── */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <div className="border-b border-gray-400 dark:border-gray-600 pb-1 text-sm text-gray-400 italic min-h-[32px]">{formData.employeeName}</div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Employee Signature</p>
                            <p className="text-xs text-gray-400">Date: {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</p>
                        </div>
                        <div className="space-y-1">
                            <div className="border-b border-gray-400 dark:border-gray-600 pb-1 min-h-[32px]"></div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Human Resources Representative Signature</p>
                            <p className="text-xs text-gray-400">Date: ________________</p>
                        </div>
                        <div className="space-y-1">
                            <div className="border-b border-gray-400 dark:border-gray-600 pb-1 min-h-[32px]"></div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Supervisor Signature</p>
                            <p className="text-xs text-gray-400">Date: ________________</p>
                        </div>
                    </div>

                    {/* Digital consent */}
                    <div className="rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800 p-4">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input type="checkbox" name="signature" checked={formData.signature} onChange={e => set("signature", e.target.checked)} required
                                className="mt-0.5 h-5 w-5 rounded border-gray-300 accent-brand-500 flex-shrink-0" />
                            <div className="text-sm">
                                <span className="font-semibold text-gray-800 dark:text-white">I hereby certify that the information provided above is true and complete.</span>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">
                                    By checking this box I acknowledge this serves as my digital signature for the Exit Interview.
                                </p>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="flex justify-end pt-2 print:hidden">
                    <button type="submit" disabled={isSubmitting}
                        className="rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-60 px-8 py-3 text-base font-medium text-white shadow-sm transition-colors">
                        {isSubmitting ? "Submitting..." : "Submit Exit Interview"}
                    </button>
                </div>
            </form>
        </div>
    );
}
