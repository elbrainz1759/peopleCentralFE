import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

export function generateInterviewPDF(emp: ExitPdfEmployee, details: any) {
    const doc = new jsPDF();
    let comments: any = {};
    try { comments = JSON.parse(details?.additional_comments || details?.additionalComments || "{}"); } catch { /* */ }

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

    y = sectionTitle(doc, (doc as any).lastAutoTable.finalY + 6, "Reasons for Leaving & Job Experience");
    autoTable(doc, {
        startY: y, head: [["Question", "Response"]],
        body: [
            ["Q1. Why are you leaving?", details?.reason_for_leaving || details?.reasonForLeaving || "N/A"],
            ["Q2. What would have prevented you from leaving?", details?.other_reason || details?.otherReason || "N/A"],
            ["Q3. What did you like most about working here?", details?.most_enjoyed || details?.mostEnjoyed || "N/A"],
            ["Q4. What did you like least / areas needing improvement?", details?.company_improvement || details?.companyImprovement || "N/A"],
            ["Q7. Was the work as expected?", comments.workAsExpected || "N/A"],
            ["Q7. Comments on job expectations", comments.workExpectedComments || "N/A"],
            ["Q8. Workload assessment", comments.workload || "N/A"],
            ["Q11. Additional suggestions", comments.suggestions || "N/A"],
        ],
        theme: "grid", headStyles, styles: tableStyles,
        columnStyles: { 0: labelCol },
    });

    y = sectionTitle(doc, (doc as any).lastAutoTable.finalY + 6, "Q5 & Q6 — Supervisor & Organisation Ratings");
    autoTable(doc, {
        startY: y, head: [["Category", "Score (out of 5)"]],
        body: [
            ["Overall Manager / Supervisor Rating", String(details?.rating_manager || details?.ratingManager || "N/A")],
            ["Overall Job / Organisation Rating", String(details?.rating_job || details?.ratingJob || "N/A")],
            ["Overall Culture Rating", String(details?.rating_culture || details?.ratingCulture || "N/A")],
            ["Rating Comments", comments.ratingComments || "N/A"],
        ],
        theme: "grid", headStyles, styles: tableStyles,
        columnStyles: { 0: labelCol },
    });

    const benefits = comments.benefits || {};
    y = sectionTitle(doc, (doc as any).lastAutoTable.finalY + 6, "Q9 — Benefits Assessment");
    autoTable(doc, {
        startY: y, head: [["Benefit", "Rating"]],
        body: [
            ["Annual / Public Holidays", benefits.holidays || "N/A"],
            ["Annual Leave", benefits.annualLeave || "N/A"],
            ["Medical Benefits", benefits.medical || "N/A"],
            ["Sick Leave", benefits.sickLeave || "N/A"],
            ["Gratuity / End of Service Benefits", benefits.gratuity || "N/A"],
            ["Education / Training Benefits", benefits.education || "N/A"],
        ],
        theme: "grid", headStyles, styles: tableStyles,
        columnStyles: { 0: labelCol },
    });

    y = sectionTitle(doc, (doc as any).lastAutoTable.finalY + 6, "Q10 — Recommendation");
    autoTable(doc, {
        startY: y, head: [["Question", "Response"]],
        body: [
            ["Would you recommend Mercy Corps as a place to work?", details?.would_recommend || details?.wouldRecommend || "N/A"],
        ],
        theme: "grid", headStyles, styles: tableStyles,
        columnStyles: { 0: labelCol },
    });

    pdfFooter(doc);
    doc.save(`Exit_Interview_${emp.staffId}_${String(emp.employeeName).replace(/\s+/g, "_")}.pdf`);
}

export function generateClearancePDF(emp: ExitPdfEmployee, _details: any, checklistItems: any[]) {
    const stageOrder = ["Employee", "Supervisor", "Operations", "Finance", "HR", "HR_Final", "HR_Director", "Completed"];
    const currentIdx = stageOrder.indexOf(emp.stage);
    const pastStage = (s: string) => currentIdx > stageOrder.indexOf(s);

    const doc = new jsPDF();
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

    y = sectionTitle(doc, (doc as any).lastAutoTable.finalY + 6, "Approval Trail");
    autoTable(doc, {
        startY: y, head: [["Stage", "Status"]],
        body: [
            ["1. Employee Submission", "Submitted"],
            ["2. Supervisor (Handover)", pastStage("Supervisor") || emp.handoverStatus === "Accepted" ? "Accepted" : "Pending"],
            ["3. Operations (Asset Clearance)", pastStage("Operations") || emp.assetsStatus === "Cleared" ? "Cleared" : "Pending"],
            ["4. Finance (Outstanding Obligations)", pastStage("Finance") || emp.financeStatus === "Cleared" ? "Cleared" : "Pending"],
            ["5. HR (Final Review & Sign-off)", pastStage("HR") || emp.stage === "Completed" ? "Completed" : "Pending"],
        ],
        theme: "grid", headStyles, styles: tableStyles,
        columnStyles: { 0: { cellWidth: 100 } },
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

    pdfFooter(doc);
    doc.save(`Exit_Clearance_${emp.staffId}_${String(emp.employeeName).replace(/\s+/g, "_")}.pdf`);
}
