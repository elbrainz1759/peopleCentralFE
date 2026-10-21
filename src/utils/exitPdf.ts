import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { addPdfLogo } from "./pdfLogo";

export interface ExitPdfEmployee {
    employeeName: string;
    staffId: string | number;
    department: string;
    location: string;
    program: string;
    resignationDate: string;
    submittedOn: string;
    stage: string;
    handoverStatus?: string;
    assetsStatus?: string;
    financeStatus?: string;
}

const RED: [number, number, number] = [220, 53, 69];

const headStyles = {
    fillColor: RED,
    textColor: [255, 255, 255] as unknown as number[],
    fontStyle: "bold" as const,
};

const tableStyles = { fontSize: 9, cellPadding: 3 };
const labelCol = { fontStyle: "bold" as const, cellWidth: 70 };

// A signature-style block recording exactly when the employee submitted —
// distinct from pdfFooter()'s "Generated on" timestamp, which is just when
// this particular PDF was produced (e.g. downloaded weeks later by HR).
function signatureBlock(
    doc: jsPDF,
    y: number,
    employeeName: string,
    submittedAtRaw: string | undefined
): number {
    const pageHeight = doc.internal.pageSize.height;
    if (y > pageHeight - 35) {
        doc.addPage();
        y = 20;
    }

    const submittedAt = submittedAtRaw
        ? new Date(submittedAtRaw).toLocaleString()
        : "N/A";

    doc.setDrawColor(200);
    doc.line(14, y, 90, y);
    y += 5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(60);
    doc.text("Digitally Signed / Created", 14, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100);
    doc.text(`${employeeName} — submitted ${submittedAt}`, 14, y);
    y += 4.5;

    doc.setFontSize(7.5);
    doc.setTextColor(150);
    doc.text(
        "This is a system-generated record reflecting the exact date and time of digital submission.",
        14,
        y
    );
    doc.setTextColor(0);
    return y;
}

function pdfFooter(doc: jsPDF) {
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
        `Generated on ${new Date().toLocaleString()} — Mercy Corps Nigeria People Central`,
        105,
        pageHeight - 10,
        { align: "center" }
    );
    doc.setTextColor(0);
}

function sectionTitle(doc: jsPDF, y: number, title: string): number {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setFillColor(245, 245, 245);
    doc.rect(14, y, 182, 7, "F");
    doc.setTextColor(60);
    doc.text(title, 16, y + 5.5);
    doc.setTextColor(0);
    return y + 10;
}

function employeeInfoBody(emp: ExitPdfEmployee) {
    return [
        ["Employee Name", String(emp.employeeName)],
        ["Staff ID", String(emp.staffId)],
        ["Department", String(emp.department)],
        ["Location", String(emp.location)],
        ["Program", String(emp.program)],
        ["Exit / Termination Date", String(emp.resignationDate ?? "N/A")],
        ["Date Submitted", String(emp.submittedOn)],
    ];
}

const val = (d: any, ...keys: string[]) => {
    for (const k of keys) {
        const v = d?.[k];
        if (v !== undefined && v !== null && v !== "") return String(v);
    }
    return "N/A";
};

// Like val(), but returns undefined instead of "N/A" when missing — needed
// wherever the raw value gets parsed (e.g. new Date(...)) rather than shown
// as text, since "N/A" would otherwise parse as an Invalid Date.
const rawVal = (d: any, ...keys: string[]): string | undefined => {
    for (const k of keys) {
        const v = d?.[k];
        if (v !== undefined && v !== null && v !== "") return String(v);
    }
    return undefined;
};

export function generateInterviewPDF(emp: ExitPdfEmployee, details: any) {
    const doc = new jsPDF();
    addPdfLogo(doc);

    doc.setFontSize(18); doc.setFont("helvetica", "bold");
    doc.text("EXIT INTERVIEW REPORT", 105, 18, { align: "center" });
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text("Mercy Corps Nigeria - People Central", 105, 25, { align: "center" });
    doc.setDrawColor(200); doc.line(14, 29, 196, 29);

    let y = sectionTitle(doc, 33, "Employee Information");
    autoTable(doc, {
        startY: y, head: [["Field", "Details"]], body: employeeInfoBody(emp),
        theme: "grid", headStyles, styles: tableStyles,
        columnStyles: { 0: labelCol },
    });

    y = sectionTitle(doc, (doc as any).lastAutoTable.finalY + 6, "Q1–Q4 & Q7–Q8 — Reasons for Leaving & Job Experience");
    autoTable(doc, {
        startY: y, head: [["Question", "Response"]],
        body: [
            ["Q1. Reason for leaving (category)", val(details, "reason_for_leaving", "reasonForLeaving")],
            ["Q1. Why are you leaving? (detail)", val(details, "why_leaving", "whyLeaving")],
            ["Q2. What would have prevented you from leaving?", val(details, "what_would_prevent", "whatWouldPrevent", "other_reason", "otherReason")],
            ["Q3. What did you like most about working here?", val(details, "most_enjoyed", "mostEnjoyed")],
            ["Q4. What did you like least / areas for improvement?", val(details, "company_improvement", "companyImprovement")],
            ["Q7. Was the work as expected?", val(details, "work_as_expected", "workAsExpected")],
            ["Q7. Comments on job expectations", val(details, "work_expected_comments", "workExpectedComments")],
            ["Q8. Workload assessment", val(details, "workload")],
            ["Q11. Additional suggestions", val(details, "suggestions")],
        ],
        theme: "grid", headStyles, styles: tableStyles,
        columnStyles: { 0: labelCol },
    });

    y = sectionTitle(doc, (doc as any).lastAutoTable.finalY + 6, "Q5 — Supervisor Evaluation");
    autoTable(doc, {
        startY: y, head: [["Criteria", "Rating"]],
        body: [
            ["Is fair and consistent in treatment", val(details, "supervisor_fair", "supervisorFair")],
            ["Provides recognition for good work", val(details, "supervisor_recognition", "supervisorRecognition")],
            ["Handles complaints well", val(details, "supervisor_complaints", "supervisorComplaints")],
            ["Is sensitive to employees' needs", val(details, "supervisor_sensitive", "supervisorSensitive")],
            ["Provides feedback on performance", val(details, "supervisor_feedback", "supervisorFeedback")],
            ["Communicates well with staff", val(details, "supervisor_communication", "supervisorCommunication")],
            ["Follows company policies", val(details, "supervisor_policies", "supervisorPolicies")],
        ],
        theme: "grid", headStyles, styles: tableStyles,
        columnStyles: { 0: labelCol },
    });

    y = sectionTitle(doc, (doc as any).lastAutoTable.finalY + 6, "Q6 — Organisation Ratings");
    autoTable(doc, {
        startY: y, head: [["Area", "Rating"]],
        body: [
            ["Cooperation within department", val(details, "rating_coop_dept", "ratingCoopDept")],
            ["Cooperation with other departments", val(details, "rating_coop_other", "ratingCoopOther")],
            ["Training & development", val(details, "rating_training", "ratingTraining")],
            ["Equipment & resources", val(details, "rating_equipment", "ratingEquipment")],
            ["Performance review process", val(details, "rating_perf_review", "ratingPerfReview")],
            ["Orientation / onboarding", val(details, "rating_orientation", "ratingOrientation")],
            ["Pay & compensation", val(details, "rating_pay", "ratingPay")],
            ["Career development opportunities", val(details, "rating_career_dev", "ratingCareerDev")],
            ["Work conditions", val(details, "rating_work_conditions", "ratingWorkConditions")],
            ["Comments", val(details, "rating_comments", "ratingComments")],
        ],
        theme: "grid", headStyles, styles: tableStyles,
        columnStyles: { 0: labelCol },
    });

    y = sectionTitle(doc, (doc as any).lastAutoTable.finalY + 6, "Q9 — Benefits Assessment");
    autoTable(doc, {
        startY: y, head: [["Benefit", "Rating"]],
        body: [
            ["Annual / Public Holidays", val(details, "benefit_holidays", "benefitHolidays")],
            ["Annual Leave", val(details, "benefit_annual_leave", "benefitAnnualLeave")],
            ["Medical Benefits", val(details, "benefit_medical", "benefitMedical")],
            ["Sick Leave", val(details, "benefit_sick_leave", "benefitSickLeave")],
            ["Gratuity / End of Service Benefits", val(details, "benefit_gratuity", "benefitGratuity")],
            ["Education / Training Benefits", val(details, "benefit_education", "benefitEducation")],
        ],
        theme: "grid", headStyles, styles: tableStyles,
        columnStyles: { 0: labelCol },
    });

    y = sectionTitle(doc, (doc as any).lastAutoTable.finalY + 6, "Q10 — Recommendation");
    autoTable(doc, {
        startY: y, head: [["Question", "Response"]],
        body: [
            ["Would you recommend Mercy Corps as a place to work?", val(details, "would_recommend", "wouldRecommend")],
        ],
        theme: "grid", headStyles, styles: tableStyles,
        columnStyles: { 0: labelCol },
    });

    signatureBlock(
        doc,
        (doc as any).lastAutoTable.finalY + 10,
        emp.employeeName,
        rawVal(details, "created_at", "createdAt")
    );

    pdfFooter(doc);
    doc.save(`Exit_Interview_${emp.staffId}_${String(emp.employeeName).replace(/\s+/g, "_")}.pdf`);
}

export interface ExitApprovalSignature {
    name: string;
    position: string;
    dateTime: string;
}

export interface ExitApprovalTrail {
    Supervisor?: ExitApprovalSignature;
    Operations?: ExitApprovalSignature;
    Finance?: ExitApprovalSignature;
    HR?: ExitApprovalSignature;
    HRLead?: ExitApprovalSignature;
}

export function generateClearancePDF(emp: ExitPdfEmployee, details: any, checklistItems: any[], approvals?: ExitApprovalTrail) {
    const stageOrder = ["Employee", "Supervisor", "Operations", "Finance", "HR", "HR_Final", "HR_Director", "Completed"];
    const currentIdx = stageOrder.indexOf(emp.stage);
    const pastStage = (s: string) => currentIdx > stageOrder.indexOf(s);

    const doc = new jsPDF();
    addPdfLogo(doc);
    doc.setFontSize(18); doc.setFont("helvetica", "bold");
    doc.text("EXIT CLEARANCE REPORT", 105, 18, { align: "center" });
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text("Mercy Corps Nigeria - People Central", 105, 25, { align: "center" });
    doc.setDrawColor(200); doc.line(14, 29, 196, 29);

    let y = sectionTitle(doc, 33, "Employee Information");
    autoTable(doc, {
        startY: y, head: [["Field", "Details"]], body: employeeInfoBody(emp),
        theme: "grid", headStyles, styles: tableStyles,
        columnStyles: { 0: labelCol },
    });

    // "Approved By" / "Date & Time" are per-stage digital signatures — who
    // actually cleared each stage and when, not just a bare "Cleared" label.
    const sigName = (s?: ExitApprovalSignature) => s ? `${s.name}\n${s.position}` : "—";
    const sigDate = (s?: ExitApprovalSignature) => s ? s.dateTime : "—";

    y = sectionTitle(doc, (doc as any).lastAutoTable.finalY + 6, "Approval Trail");
    autoTable(doc, {
        startY: y, head: [["Stage", "Status", "Approved By", "Date & Time"]],
        body: [
            ["1. Employee Submission", "Submitted", emp.employeeName, emp.submittedOn],
            ["2. Supervisor (Handover)", pastStage("Supervisor") || emp.handoverStatus === "Accepted" ? "Accepted" : "Pending", sigName(approvals?.Supervisor), sigDate(approvals?.Supervisor)],
            ["3. Operations (Asset Clearance)", pastStage("Operations") || emp.assetsStatus === "Cleared" ? "Cleared" : "Pending", sigName(approvals?.Operations), sigDate(approvals?.Operations)],
            ["4. Finance (Outstanding Obligations)", pastStage("Finance") || emp.financeStatus === "Cleared" ? "Cleared" : "Pending", sigName(approvals?.Finance), sigDate(approvals?.Finance)],
            ["5. HR (Final Review)", pastStage("HR") ? "Reviewed" : "Pending", sigName(approvals?.HR), sigDate(approvals?.HR)],
            ["6. HR Lead (Final Sign-off)", emp.stage === "Completed" ? "Completed" : "Pending", sigName(approvals?.HRLead), sigDate(approvals?.HRLead)],
        ],
        theme: "grid", headStyles, styles: { ...tableStyles, fontSize: 8 },
        columnStyles: { 0: { cellWidth: 55 }, 2: { cellWidth: 45 } },
    });

    y = sectionTitle(doc, (doc as any).lastAutoTable.finalY + 6, "Clearance Checklist Items");
    autoTable(doc, {
        startY: y, head: [["#", "Item", "Department", "Status"]],
        body: checklistItems.length > 0
            ? checklistItems.map((item: any, i: number) => [
                String(i + 1), item.name,
                item.department_name || item.departmentName || "N/A",
                "Cleared",
            ])
            : [["—", "No items recorded", "—", "—"]],
        theme: "grid", headStyles, styles: tableStyles,
        columnStyles: { 0: { cellWidth: 12 } },
    });

    signatureBlock(
        doc,
        (doc as any).lastAutoTable.finalY + 10,
        emp.employeeName,
        rawVal(details, "created_at", "createdAt")
    );

    pdfFooter(doc);
    doc.save(`Exit_Clearance_${emp.staffId}_${String(emp.employeeName).replace(/\s+/g, "_")}.pdf`);
}
