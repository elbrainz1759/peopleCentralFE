"use client";
import React, { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { EyeIcon, CheckCircleIcon, CloseIcon, MoreDotIcon, PencilIcon, PlusIcon, TrashBinIcon, DownloadIcon } from "@/icons";
import CustomSelect from "@/components/form/CustomSelect";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Drawer } from "../ui/drawer/Drawer";
import { Modal } from "../ui/modal";
import { ExitService, ChecklistItem as ServiceChecklistItem } from "@/services/exit.service";
import { userService } from "@/services/user.service";
import { toast } from "react-hot-toast";
import Button from "../ui/button/Button";
import { generateInterviewPDF, generateClearancePDF } from "@/utils/exitPdf";

type QueueType = 'All' | 'HR' | 'Operations' | 'Finance';

interface ExitInterviewDisplay {
    id: any;
    uniqueId: string;
    staffId: string | number;
    supervisorId: string;
    employeeName: string;
    department: string;
    designation: string;
    supervisor: string;
    stage: string;
    status: string;
    submittedOn: string;
    handoverStatus: string;
    assetsStatus: string;
    financeStatus: string;
    program: string;
    location: string;
}

export default function ExitApprovalsTable() {
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const [selectedInterview, setSelectedInterview] = useState<ExitInterviewDisplay | null>(null);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    
    // Core state
    const [exitInterviews, setExitInterviews] = useState<ExitInterviewDisplay[]>([]);
    const [isLoadingInterviews, setIsLoadingInterviews] = useState(true);
    const [currentQueue, setCurrentQueue] = useState<QueueType>('All');
    const [currentUserId, setCurrentUserId] = useState<string | number | null>(null);
    const [currentUserStaffId, setCurrentUserStaffId] = useState<string | number | null>(null);
    
    // Checklist Management State
    const [checklistItems, setChecklistItems] = useState<ServiceChecklistItem[]>([]);
    const [isLoadingChecklist, setIsLoadingChecklist] = useState(false);
    const [newItemName, setNewItemName] = useState("");
    const [selectedDeptId, setSelectedDeptId] = useState("");
    const [departments, setDepartments] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [showChecklistManager, setShowChecklistManager] = useState(false);
    
    const [selectedChecklistIds, setSelectedChecklistIds] = useState<string[]>([]);
    const [isActioning, setIsActioning] = useState(false);

    const [availableQueues, setAvailableQueues] = useState<QueueType[]>(['All', 'HR', 'Operations', 'Finance']);
    const [authUser, setAuthUser] = useState<any>(null);

    // Interview details + HR Assessment state
    const [interviewDetails, setInterviewDetails] = useState<any>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [hrAssessment, setHrAssessment] = useState<{
        assessmentNotes: string;
        keyThemes: string;
        recommendation: "" | "Rehire" | "Do Not Rehire" | "Neutral";
        assessedBy: string;
        assessedAt: string;
    }>({ assessmentNotes: "", keyThemes: "", recommendation: "", assessedBy: "", assessedAt: "" });
    const [isSavingAssessment, setIsSavingAssessment] = useState(false);

    // HR record-edit state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editRecord, setEditRecord] = useState<any>(null);
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [downloadingId, setDownloadingId] = useState<string | number | null>(null);

    const exitServiceInstance = ExitService.getInstance();

    useEffect(() => {
        // Read auth user — merge with JWT payload so role is always available
        try {
            const authUserJson = localStorage.getItem('auth_user') || localStorage.getItem('user');
            const authToken = localStorage.getItem('auth_token');

            let user: any = authUserJson ? JSON.parse(authUserJson) : {};

            // JWT payload is the source of truth for role — merge it in
            if (authToken) {
                try {
                    const payload = JSON.parse(atob(authToken.split('.')[1]));
                    // Prefer token values for identity/role fields
                    user = { ...user, ...payload };
                } catch (e) {
                    console.error("Failed to decode JWT", e);
                }
            }

            setCurrentUserId(user?.id);
            setCurrentUserStaffId(user?.staff_id || user?.staffId);
            setAuthUser(user);
        } catch (e) {
            console.error("Failed to parse auth user", e);
        }

        fetchChecklistItems();
        fetchDepartments();
        fetchEmployees();
    }, []);

    useEffect(() => {
        if (!authUser) return;

        const role = authUser?.role?.toLowerCase() || '';

        // Superadmin and Admin see all queues
        if (role === 'superadmin' || role === 'admin') {
            setAvailableQueues(['All', 'HR', 'Operations', 'Finance']);
            setCurrentQueue('All');
            return;
        }

        // Role-based queue access (check role name first, then department)
        if (role === 'hr' || role.includes('hr')) {
            setAvailableQueues(['HR']);
            setCurrentQueue('HR');
            return;
        }
        if (role === 'operations' || role === 'operation' || role.includes('operation')) {
            setAvailableQueues(['Operations']);
            setCurrentQueue('Operations');
            return;
        }
        if (role === 'finance' || role.includes('finance')) {
            setAvailableQueues(['Finance']);
            setCurrentQueue('Finance');
            return;
        }

        // Fallback: resolve by department name
        const deptUUID = authUser?.department || authUser?.department_id || '';
        const matchedDept = departments.find(
            (d: any) => d.unique_id === deptUUID || d.uniqueId === deptUUID || d.id === deptUUID
        );
        const deptName = (matchedDept?.name || authUser?.department_name || '').toLowerCase();

        if (deptName.includes('hr') || deptName.includes('human resources')) {
            setAvailableQueues(['HR']);
            setCurrentQueue('HR');
        } else if (deptName.includes('operation')) {
            setAvailableQueues(['Operations']);
            setCurrentQueue('Operations');
        } else if (deptName.includes('finance')) {
            setAvailableQueues(['Finance']);
            setCurrentQueue('Finance');
        } else {
            // Default: supervisor/unknown roles see all
            setAvailableQueues(['All', 'HR', 'Operations', 'Finance']);
            setCurrentQueue('All');
        }
    }, [authUser, departments]);

    useEffect(() => {
        if (currentQueue === 'All' || currentQueue === 'HR' || departments.length > 0) {
            fetchInterviews();
        }
    }, [currentQueue, departments, employees]);

    const fetchInterviews = async () => {
        setIsLoadingInterviews(true);
        try {
            let res;
            if (currentQueue === 'Operations' || currentQueue === 'Finance') {
                const targetDept = departments.find((d: any) => d.name?.toLowerCase() === currentQueue.toLowerCase());
                const deptIdentifier = targetDept?.unique_id || targetDept?.uniqueId || targetDept?.id || currentQueue;
                res = await exitServiceInstance.getPendingExitInterviewsByDepartment(deptIdentifier);
            } else {
                res = await exitServiceInstance.getAllExitInterviews();
            }

            const data = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);

            // The exit list endpoint often omits the employee's name/designation, so
            // join against the employees directory by staff_id to fill the gaps.
            const empByStaff = new Map<string, any>();
            employees.forEach((e: any) => {
                const sid = String(e.staff_id ?? e.staffId ?? '');
                if (sid) empByStaff.set(sid, e);
                const uid = String(e.unique_id ?? e.uniqueId ?? '');
                if (uid) empByStaff.set(uid, e);
            });

            // Map the API structure to the Display structure
            let mapped = data.map((item: any) => {
                const staffId = item.staff_id || item.id;
                const emp = empByStaff.get(String(staffId));
                const fName = item.staff_first_name || emp?.first_name || '';
                const lName = item.staff_last_name || emp?.last_name || '';
                const joinedName = `${fName} ${lName}`.trim();
                const fullName = item.staff_name || item.employee_name || emp?.employee_name || emp?.name
                    || (joinedName || `Staff #${staffId}`);

                return {
                    id: item.id,
                    uniqueId: item.unique_id || item.uniqueId || item.id,
                    staffId,
                    supervisorId: item.supervisor_id || '',
                    employeeName: fullName,
                    department: item.department_name || item.department?.name || item.department || emp?.department_name || 'N/A',
                    designation: item.designation_name || item.designation || emp?.designation || emp?.job_title || 'Not Specified',
                    supervisor: item.supervisor?.name || item.supervisor || 'N/A',
                    stage: (() => {
                        const s = item.stage || 'N/A';
                        // Derive effective stage from cleared flags when backend hasn't advanced it
                        if (s === 'Operations' && item.operations_cleared === 1 && item.finance_cleared === 0) return 'Finance';
                        if (s === 'Operations' && item.operations_cleared === 1 && item.finance_cleared === 1) return 'Completed';
                        if (s === 'Finance' && item.finance_cleared === 1) return 'Completed';
                        return s;
                    })(),
                    resignationDate: item.resignation_date ? new Date(item.resignation_date).toLocaleDateString() : 'N/A',
                    submittedOn: item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A',
                    handoverStatus: (String(item.supervisor_cleared) === '1' || item.supervisor_cleared === 'Accepted' || item.supervisor_cleared === 'Cleared') ? "Accepted" : "Pending",
                    assetsStatus: item.operations_cleared === 1 ? "Cleared" : "Pending",
                    financeStatus: item.finance_cleared === 1 ? "Cleared" : "Pending",
                    status: item.status || 'Pending',
                    program: item.program_name || item.program?.name || item.program || 'N/A',
                    location: item.location_name || item.location?.name || item.location || 'N/A',
                };
            });

            // Pending records are only visible to the assigned supervisor and super_admin
            const isSuperAdmin = (authUser?.role || '').toLowerCase().includes('superadmin');
            const userUniqueId = authUser?.unique_id || authUser?.uniqueId || '';
            mapped = mapped.filter((m: any) => {
                if ((m.status || 'Pending') !== 'Pending') return true;
                return isSuperAdmin || (userUniqueId && String(m.supervisorId) === String(userUniqueId));
            });

            if (currentQueue === 'HR') {
                mapped = mapped.filter((m: any) => m.stage === 'HR');
            }

            setExitInterviews(mapped);
        } catch (error) {
            console.error("Failed to fetch intervews", error);
            toast.error("Failed to fetch records. Try again.");
        } finally {
            setIsLoadingInterviews(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await userService.getAllEmployees();
            setEmployees(response?.data || response || []);
        } catch (error) {
            console.error("Failed to fetch employees:", error);
        }
    };

    const fetchChecklistItems = async () => {
        setIsLoadingChecklist(true);
        try {
            const response = await exitServiceInstance.getAllChecklistItems();
            setChecklistItems(response.data || response || []);
        } catch (error) {
            console.error("Failed to fetch checklist items:", error);
        } finally {
            setIsLoadingChecklist(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await exitServiceInstance.getDepartments();
            const depts = response.data || response || [];
            setDepartments(depts);
            if (depts.length > 0) {
                setSelectedDeptId(depts[0].uniqueId || depts[0].id);
            }
        } catch (error) {
            console.error("Failed to fetch departments:", error);
        }
    };

    const handleAddItem = async (deptIdOverride?: string) => {
        const deptId = deptIdOverride || selectedDeptId;
        if (!newItemName.trim() || !deptId) {
            toast.error("Please provide both name and department");
            return;
        }

        setIsAddingItem(true);
        try {
            await exitServiceInstance.createChecklistItem({
                name: newItemName,
                departmentId: deptId
            });
            toast.success("Checklist item added");
            setNewItemName("");
            fetchChecklistItems();
        } catch (error: any) {
            const msg = error?.response?.data?.message || error?.message || "";
            if (msg.toLowerCase().includes("already exists")) {
                toast("Item already exists — showing current checklist.", { icon: "ℹ️" });
                setNewItemName("");
                fetchChecklistItems();
            } else {
                toast.error("Failed to add checklist item");
            }
        } finally {
            setIsAddingItem(false);
        }
    };

    const handleDeleteItem = async (itemId: number | string | undefined) => {
        if (!itemId) return;
        const item = checklistItems.find(i => i.uniqueId === itemId || i.id === itemId);
        const uid = item?.uniqueId;
        if (!uid || !confirm("Delete this item?")) return;

        try {
            await exitServiceInstance.deleteChecklistItem(uid);
            toast.success("Item deleted");
            fetchChecklistItems();
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    const toggleDropdown = (id: string) => {
        setOpenDropdownId(openDropdownId === id ? null : id);
    };

    const closeDropdown = () => setOpenDropdownId(null);

    // localStorage key for HR assessments (backend PATCH DTO does not accept additionalComments)
    const assessmentKey = (id: string | number) => `hr_assessment_${id}`;

    const loadSavedAssessment = (id: string | number) => {
        try {
            const raw = localStorage.getItem(assessmentKey(id));
            if (raw) return JSON.parse(raw);
        } catch { /* ignore */ }
        return null;
    };

    const handleReview = async (interview: ExitInterviewDisplay) => {
        setSelectedInterview(interview);
        setSelectedChecklistIds([]);
        setInterviewDetails(null);
        setIsReviewOpen(true);

        // Load any previously saved HR assessment from localStorage
        const key = interview.uniqueId || interview.id;
        const saved = loadSavedAssessment(key);
        setHrAssessment(saved || { assessmentNotes: "", keyThemes: "", recommendation: "", assessedBy: "", assessedAt: "" });

        // Fetch full interview details for Q&A display — use uniqueId (UUID), not numeric id
        setIsLoadingDetails(true);
        try {
            const lookupId = interview.uniqueId || interview.id;
            const res = await exitServiceInstance.getExitInterviewById(lookupId as any);
            const rec = res?.data || res || {};
            setInterviewDetails(rec);

            // Hydrate HR assessment from backend additionalComments (source of truth)
            try {
                const raw = rec.additionalComments || rec.additional_comments || '{}';
                const parsed = JSON.parse(raw);
                if (parsed?.hrAssessment) {
                    setHrAssessment(parsed.hrAssessment);
                    // Keep localStorage in sync
                    const cacheKey = interview.uniqueId || interview.id;
                    localStorage.setItem(assessmentKey(cacheKey), JSON.stringify(parsed.hrAssessment));
                }
            } catch { /* malformed JSON — keep whatever was loaded from localStorage */ }
        } catch { /* silent — details are optional, assessment still works */ } finally {
            setIsLoadingDetails(false);
        }
    };

    const saveHRAssessment = async () => {
        if (!selectedInterview) return;
        if (!hrAssessment.assessmentNotes.trim() && !hrAssessment.keyThemes.trim() && !hrAssessment.recommendation) {
            toast.error("Please fill in at least one assessment field before saving.");
            return;
        }
        setIsSavingAssessment(true);
        try {
            const assessment = {
                ...hrAssessment,
                assessedAt: new Date().toISOString(),
                assessedBy: authUser?.name || authUser?.employee_name || authUser?.email || "HR",
            };
            const key = selectedInterview.uniqueId || selectedInterview.id;
            await exitServiceInstance.saveHRAssessment(selectedInterview.uniqueId || selectedInterview.id, assessment);
            localStorage.setItem(assessmentKey(key), JSON.stringify(assessment));
            setHrAssessment(assessment);
            toast.success("HR assessment saved. Exit clearance completed.");
            setIsReviewOpen(false);
            fetchInterviews();
        } catch (e: any) {
            toast.error("Failed to save HR assessment.");
        } finally { setIsSavingAssessment(false); }
    };

    const openEditModal = (interview: ExitInterviewDisplay) => {
        setEditRecord({ ...interview, reasonForLeaving: (interview as any).reasonForLeaving || "" });
        setIsEditModalOpen(true);
    };

    const saveEditRecord = async () => {
        if (!editRecord || !selectedInterview) return;
        setIsSavingEdit(true);
        try {
            await exitServiceInstance.updateExitInterview(editRecord.id, {
                reasonForLeaving: editRecord.reasonForLeaving,
                handoverNotes: editRecord.handoverNotes,
            });
            toast.success("Exit record updated.");
            setIsEditModalOpen(false);
            fetchInterviews();
        } catch (e: any) {
            toast.error(e?.message || "Failed to update record.");
        } finally { setIsSavingEdit(false); }
    };

    const handleApprove = async () => {
        if (!selectedInterview) return;
        setIsActioning(true);

        // Determine action from the record's actual stage (works from any queue including All)
        const stage = selectedInterview.stage;

        try {
            if (stage === 'Employee' || stage === 'Supervisor') {
                await exitServiceInstance.advanceStage(selectedInterview.uniqueId as any, 'Operations');
                toast.success("Supervisor approved. Forwarded to Operations for asset clearance.");
                setIsReviewOpen(false);
                fetchInterviews();

            } else if (stage === 'Operations') {
                if (selectedChecklistIds.length === 0) {
                    toast.error("Please verify at least one asset before approving.");
                    return;
                }
                await exitServiceInstance.clearExitInterviewItems(selectedInterview.uniqueId as any, {
                    department: 'Operations',
                    checkListItemIds: selectedChecklistIds.map(Number),
                    notes: 'Assets returned',
                });
                toast.success("Operations cleared. Forwarded to Finance.");
                setIsReviewOpen(false);
                fetchInterviews();

            } else if (stage === 'Finance') {
                await exitServiceInstance.clearExitInterviewItems(selectedInterview.uniqueId as any, {
                    department: 'Finance',
                    checkListItemIds: selectedChecklistIds.map(Number),
                    notes: 'Final salary processed',
                });
                toast.success("Finance cleared. Forwarded to HR for final review.");
                setIsReviewOpen(false);
                fetchInterviews();

            } else if (stage === 'HR') {
                await exitServiceInstance.clearExitInterviewItems(selectedInterview.uniqueId as any, {
                    department: 'HR',
                    checkListItemIds: selectedChecklistIds.map(Number),
                    notes: 'Documents filed',
                });
                toast.success("HR cleared. Forwarded to Snr HR Manager for final sign-off.");
                setIsReviewOpen(false);
                fetchInterviews();

            } else if (stage === 'HR_Final' || stage === 'HR_Director') {
                await exitServiceInstance.finalizeExitInterview(selectedInterview.uniqueId as any);
                toast.success("Snr HR Manager finalized. Exit clearance process is now closed.");
                setIsReviewOpen(false);
                fetchInterviews();

            } else if (stage === 'Completed') {
                toast("This exit request has already been completed.", { icon: "ℹ️" });
                setIsReviewOpen(false);

            } else {
                toast.error(`No approval action available for stage: ${stage}`);
            }
        } catch (error: any) {
            console.error("Approval error", error);
            toast.error(error.response?.data?.message || error.message || "Failed to approve record.");
        } finally {
            setIsActioning(false);
        }
    };

    const handleReject = () => {
        if (!selectedInterview) return;
        toast.error(`Clearance rejected for ${selectedInterview.employeeName}`);
        setIsReviewOpen(false);
    };

    const toggleChecklistId = (uid: string) => {
        setSelectedChecklistIds(prev =>
            prev.includes(uid) ? prev.filter(i => i !== uid) : [...prev, uid]
        );
    };

    const getStageColor = (stage: string): "warning" | "info" | "success" | "error" | "light" => {
        switch (stage) {
            case "Employee":   return "light";
            case "Supervisor": return "warning";
            case "Operations": return "info";
            case "Finance":    return "info";
            case "HR":          return "warning";
            case "HR_Final":    return "warning";
            case "HR_Director": return "warning";
            case "Completed":  return "success";
            default:           return "light";
        }
    };

    // Human-readable stage label. Keeps the internal stage keys (a backend contract)
    // untouched while showing friendly text — e.g. "HR Director" is now "Snr HR Manager".
    const stageLabel = (stage: string): string => {
        switch (stage) {
            case "HR_Director": return "Snr HR Manager";
            case "HR_Final":    return "HR Final";
            default:            return stage;
        }
    };

    const isUserHR = (() => {
        const role = (authUser?.role || authUser?.designation || "").toLowerCase();
        return role.includes('hr') || role.includes('admin') || role.includes('superadmin');
    })();

    const toEmpInfo = (iv: ExitInterviewDisplay) => ({
        employeeName: iv.employeeName,
        staffId: iv.staffId,
        department: iv.department,
        location: iv.location,
        program: iv.program,
        resignationDate: String((iv as any).resignationDate ?? "N/A"),
        submittedOn: iv.submittedOn,
        stage: iv.stage,
        handoverStatus: iv.handoverStatus,
        assetsStatus: iv.assetsStatus,
        financeStatus: iv.financeStatus,
    });

    const handleDownload = async (interview: ExitInterviewDisplay, type: 'interview' | 'clearance') => {
        setDownloadingId(interview.id);
        try {
            const lookupId = interview.uniqueId || interview.id;
            const res = await exitServiceInstance.getExitInterviewById(lookupId as any);
            const details = res?.data || res || {};
            if (type === 'interview') {
                generateInterviewPDF(toEmpInfo(interview), details);
                toast.success("Exit Interview PDF downloaded.");
            } else {
                generateClearancePDF(toEmpInfo(interview), details, checklistItems);
                toast.success("Exit Clearance PDF downloaded.");
            }
        } catch {
            toast.error("Failed to fetch exit details for PDF.");
        } finally {
            setDownloadingId(null);
        }
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            <div className="flex flex-col gap-2 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    Exit Clearance Workflow
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Monitor and approve employee exit clearance across departments.
                </p>
            </div>

            <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
                {availableQueues.length > 1 ? (
                    <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
                        {availableQueues.map((queue) => (
                            <button
                                key={queue}
                                onClick={() => setCurrentQueue(queue)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                                    currentQueue === queue
                                        ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm"
                                        : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50"
                                }`}
                            >
                                {queue.replace('_', ' ')} Queue
                            </button>
                        ))}
                    </div>
                ) : (
                    <div>
                        <h4 className="text-xl font-bold text-gray-800 dark:text-white">
                            {currentQueue.replace('_', ' ')} Queue
                        </h4>
                    </div>
                )}

                {isUserHR && (
                    <button
                        onClick={() => setShowChecklistManager(!showChecklistManager)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                    >
                        <PlusIcon className="w-4 h-4" />
                        {showChecklistManager ? "Hide Assets" : "Global Assets"}
                    </button>
                )}
            </div>

            {showChecklistManager && (
                <div className="mb-10 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-top-4">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wider">
                        Global Asset Configuration
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="md:col-span-2">
                            <input
                                type="text"
                                placeholder="Item name (e.g. Laptop)"
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:border-brand-500"
                            />
                        </div>
                        <div>
                            <CustomSelect
                                value={selectedDeptId}
                                onChange={(v) => setSelectedDeptId(v)}
                                options={departments.map((dept) => ({
                                    value: dept.uniqueId || dept.id,
                                    label: dept.name,
                                }))}
                                placeholder="Select Department"
                            />
                        </div>
                        <Button
                            onClick={handleAddItem}
                            disabled={isAddingItem}
                            className="w-full"
                        >
                            {isAddingItem ? "Processing..." : "Add Item"}
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {checklistItems.map((item) => (
                            <div key={item.uniqueId || item.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 group">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-gray-800 dark:text-white">{item.name}</span>
                                    <span className="text-[10px] text-gray-400 uppercase tracking-tighter">{item.departmentName}</span>
                                </div>
                                <button
                                    onClick={() => handleDeleteItem(item.uniqueId || item.id)}
                                    className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <TrashBinIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Mobile card grid */}
            <div className="block md:hidden min-h-[400px]">
                {isLoadingInterviews ? (
                    <p className="py-10 text-center text-gray-500">Loading exit interviews...</p>
                ) : exitInterviews.length === 0 ? (
                    <p className="py-10 text-center text-gray-500">No records found for "{currentQueue}"</p>
                ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {exitInterviews.map((interview: ExitInterviewDisplay, i) => (
                            <div key={interview.uniqueId || i} className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-10 w-10 flex items-center justify-center rounded-full shrink-0 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-bold text-xs uppercase">
                                        {interview.employeeName.split(" ").map((n: string) => n[0]).join("")}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-white/90 text-sm">{interview.employeeName}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{interview.department}</p>
                                    </div>
                                </div>
                                <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
                                    <div className="flex justify-between">
                                        <span className="font-medium text-gray-600 dark:text-gray-300">Designation</span>
                                        <span>{interview.designation}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium text-gray-600 dark:text-gray-300">Location</span>
                                        <span>{interview.location}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium text-gray-600 dark:text-gray-300">Exit Date</span>
                                        <span>{(interview as any).resignationDate}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium text-gray-600 dark:text-gray-300">Submitted</span>
                                        <span>{interview.submittedOn}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-gray-600 dark:text-gray-300">Stage</span>
                                        <Badge size="sm" color={getStageColor(interview.stage)}>{stageLabel(interview.stage)}</Badge>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => handleReview(interview)} className="flex-1">
                                        Review
                                    </Button>
                                    {(interview.stage === "Completed" || isUserHR) && (
                                        <>
                                            <button
                                                onClick={() => handleDownload(interview, 'interview')}
                                                disabled={downloadingId === interview.id}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 text-xs font-medium hover:bg-blue-50 transition-colors disabled:opacity-50"
                                                title="Exit Interview PDF"
                                            >
                                                {downloadingId === interview.id
                                                    ? <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                                                    : <DownloadIcon className="w-3.5 h-3.5" />
                                                }
                                                Interview
                                            </button>
                                            <button
                                                onClick={() => handleDownload(interview, 'clearance')}
                                                disabled={downloadingId === interview.id}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-200 text-green-600 text-xs font-medium hover:bg-green-50 transition-colors disabled:opacity-50"
                                                title="Exit Clearance PDF"
                                            >
                                                {downloadingId === interview.id
                                                    ? <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                                                    : <DownloadIcon className="w-3.5 h-3.5" />
                                                }
                                                Clearance
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block max-w-full overflow-x-auto min-h-[400px]">
                <Table>
                    <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                        <TableRow>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Employee
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Designation
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Location
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Exit Date
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Submitted On
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Current Stage
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 text-right">
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {isLoadingInterviews ? (
                            <TableRow>
                                <TableCell colSpan={6} className="py-10 text-center text-gray-500">
                                    Loading exit interviews...
                                </TableCell>
                            </TableRow>
                        ) : exitInterviews.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="py-10 text-center text-gray-500">
                                    No records found for "{currentQueue}"
                                </TableCell>
                            </TableRow>
                        ) : exitInterviews.map((interview: ExitInterviewDisplay, i) => (
                            <TableRow key={interview.uniqueId || i}>
                                <TableCell className="py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 flex items-center justify-center rounded-full shrink-0 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-bold text-xs uppercase">
                                            {interview.employeeName.split(" ").map((n: string) => n[0]).join("")}
                                        </div>
                                        <div>
                                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                {interview.employeeName}
                                            </span>
                                            <span className="block text-xs text-gray-500 dark:text-gray-400">
                                                {interview.department}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {interview.designation}
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {interview.location}
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {(interview as any).resignationDate}
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {interview.submittedOn}
                                </TableCell>
                                <TableCell className="py-3">
                                    <Badge size="sm" color={getStageColor(interview.stage)}>
                                        {stageLabel(interview.stage)}
                                    </Badge>
                                </TableCell>
                                <TableCell className="py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button size="sm" variant="outline" onClick={() => handleReview(interview)}>
                                            Review
                                        </Button>
                                        {(interview.stage === "Completed" || isUserHR) && (
                                            <>
                                                <button
                                                    onClick={() => handleDownload(interview, 'interview')}
                                                    disabled={downloadingId === interview.id}
                                                    className="p-1.5 rounded-lg border border-blue-200 dark:border-blue-800 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50"
                                                    title="Download Exit Interview PDF"
                                                >
                                                    {downloadingId === interview.id
                                                        ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                                                        : <DownloadIcon className="w-4 h-4" />
                                                    }
                                                </button>
                                                <button
                                                    onClick={() => handleDownload(interview, 'clearance')}
                                                    disabled={downloadingId === interview.id}
                                                    className="p-1.5 rounded-lg border border-green-200 dark:border-green-800 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors disabled:opacity-50"
                                                    title="Download Exit Clearance PDF"
                                                >
                                                    {downloadingId === interview.id
                                                        ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                                                        : <DownloadIcon className="w-4 h-4" />
                                                    }
                                                </button>
                                            </>
                                        )}
                                        {isUserHR && (
                                            <button
                                                onClick={() => { setSelectedInterview(interview); openEditModal(interview); }}
                                                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-brand-500 hover:border-brand-500 transition-colors"
                                                title="Edit Record"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Drawer
                isOpen={isReviewOpen}
                onClose={() => setIsReviewOpen(false)}
                title="Exit Clearance Review"
            >
                <div className="p-6">
                    {selectedInterview && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                <div className="h-16 w-16 flex items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-bold text-xl uppercase">
                                    {selectedInterview.employeeName.split(" ").map(n => n[0]).join("")}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">{selectedInterview.employeeName}</h4>
                                    <p className="text-sm text-gray-500">{selectedInterview.department} • Ref: {selectedInterview.id}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h5 className="font-semibold text-gray-800 dark:text-white/90 border-b pb-2 border-gray-100 dark:border-gray-800">Clearance Progress</h5>
                                <div className="grid grid-cols-1 gap-3">
                                    {(() => {
                                        const stageOrder = ['Employee', 'Supervisor', 'Operations', 'Finance', 'HR', 'HR_Final', 'HR_Director', 'Completed'];
                                        const currentIdx = stageOrder.indexOf(selectedInterview.stage);
                                        const pastStage = (s: string) => currentIdx > stageOrder.indexOf(s);
                                        const atOrPastStage = (s: string) => currentIdx >= stageOrder.indexOf(s);

                                        return [
                                            {
                                                label: "1. Employee",
                                                color: "success" as const,
                                                status: "Submitted",
                                            },
                                            {
                                                label: "2. Supervisor (Handover)",
                                                color: (pastStage('Supervisor') || selectedInterview.handoverStatus === "Accepted" ? "success" : "warning") as "success" | "warning",
                                                status: pastStage('Supervisor') || selectedInterview.handoverStatus === "Accepted" ? "Accepted" : "Pending",
                                            },
                                            {
                                                label: "3. Operations (Asset Clearance)",
                                                color: (pastStage('Operations') || selectedInterview.assetsStatus === "Cleared" ? "success" : "warning") as "success" | "warning",
                                                status: pastStage('Operations') || selectedInterview.assetsStatus === "Cleared" ? "Cleared" : "Pending",
                                            },
                                            {
                                                label: "4. Finance (Outstanding Obligations)",
                                                color: (pastStage('Finance') || selectedInterview.financeStatus === "Cleared" ? "success" : "warning") as "success" | "warning",
                                                status: pastStage('Finance') || selectedInterview.financeStatus === "Cleared" ? "Cleared" : "Pending",
                                            },
                                            {
                                                label: "5. HR (Final Review & Sign-off)",
                                                color: (() => {
                                                    if (selectedInterview.stage === "Completed") return "success" as const;
                                                    if (atOrPastStage('HR')) return "warning" as const;
                                                    return "light" as const;
                                                })(),
                                                status: (() => {
                                                    if (selectedInterview.stage === "Completed") return "Completed";
                                                    if (atOrPastStage('HR')) return "In Review";
                                                    return "Pending";
                                                })(),
                                            },
                                        ];
                                    })().map(({ label, color, status }) => (
                                        <div key={label} className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-800 rounded-lg">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-400">{label}</span>
                                            <Badge color={color}>{status}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Checklist section — HR-only confidential section */}
                            {!isUserHR && (
                                <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
                                    Exit interview notes and checklist details are restricted to HR staff only.
                                </div>
                            )}
                            {isUserHR && selectedInterview.stage !== 'Completed' && (selectedInterview as any)?.status !== 'Completed' && (() => {
                                const stage = selectedInterview.stage;

                                // Stage → canonical department name + accepted synonyms
                                const stageToDept: Record<string, { canonical: string; synonyms: string[] }> = {
                                    HR: { canonical: 'HR', synonyms: ['hr', 'human resources', 'human resource'] },
                                    HR_Final: { canonical: 'HR', synonyms: ['hr', 'human resources', 'human resource'] },
                                    Operations: { canonical: 'Operations', synonyms: ['operations', 'operation', 'ops'] },
                                    Finance: { canonical: 'Finance', synonyms: ['finance', 'finances', 'accounts'] },
                                    Supervisor: { canonical: 'Supervisor', synonyms: ['supervisor'] },
                                };
                                const mapping = stageToDept[stage];
                                // Only Operations/Finance/HR/HR_Final get a department-scoped checklist
                                if (!mapping || mapping.canonical === 'Supervisor') return null;

                                const normalize = (s: any) => String(s || '').toLowerCase().trim();
                                const matchesStageDept = (name: any) =>
                                    !!name && mapping.synonyms.includes(normalize(name));

                                const stageDept = departments.find((d: any) =>
                                    matchesStageDept(d?.name)
                                );
                                const stageDeptId = stageDept?.uniqueId || stageDept?.unique_id || stageDept?.id || '';
                                const stageDeptLabel = stageDept?.name || mapping.canonical;

                                const resolveDeptName = (item: any) => {
                                    if (item.department_name) return item.department_name;
                                    if (item.departmentName) return item.departmentName;
                                    const deptId = item.departmentId || item.department || '';
                                    const match = departments.find((d: any) => d.uniqueId === deptId || d.unique_id === deptId || d.id === deptId);
                                    return match?.name || stageDeptLabel;
                                };

                                // Strict match: by department UUID first, then by exact synonym name match.
                                const stageItems = checklistItems.filter((item: any) => {
                                    const itemDeptId = item.departmentId || item.department || '';
                                    if (stageDeptId && itemDeptId && itemDeptId === stageDeptId) return true;
                                    const itemDeptName = item.departmentName || item.department_name;
                                    return matchesStageDept(itemDeptName);
                                });
                                return (
                                    <div className="space-y-4">
                                        <h5 className="font-semibold text-gray-800 dark:text-white/90 border-b pb-2 border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                            Checklist Items
                                            <span className="text-[10px] bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-full uppercase tracking-tighter">{stageDeptLabel}</span>
                                        </h5>

                                        {/* Select/tick items from the stage's department */}
                                        {stageItems.length > 0 ? (
                                            <div className="space-y-1 max-h-48 overflow-y-auto">
                                                {stageItems.map((item) => {
                                                    if (!item.id) return null;
                                                    const deptLabel = resolveDeptName(item);
                                                    return (
                                                        <label key={item.uniqueId || item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/20 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/40 transition-all border border-transparent hover:border-brand-500/20">
                                                            <div className="flex items-center gap-3">
                                                                <input
                                                                    type="checkbox"
                                                                    className="w-5 h-5 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                                                                    checked={selectedChecklistIds.includes(String(item.id))}
                                                                    onChange={() => toggleChecklistId(String(item.id))}
                                                                />
                                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.name}</span>
                                                            </div>
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase">{deptLabel}</span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4">
                                                <p className="text-xs text-gray-400 italic mb-2">No checklist items for {stageDeptLabel}.</p>
                                                {isUserHR && <a href="/exit/checklist" className="text-xs text-brand-500 hover:underline">Manage Checklist Items</a>}
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}

                            {/* ── HR Assessment Section (HR-only, only when Operations & Finance have cleared) ── */}
                            {isUserHR && (selectedInterview?.stage === 'HR' || selectedInterview?.stage === 'HR_Final' || selectedInterview?.stage === 'HR_Director') && (
                                <div className="space-y-4">
                                    <h5 className="font-semibold text-gray-800 dark:text-white/90 border-b pb-2 border-gray-100 dark:border-gray-800 flex items-center gap-2">
                                        HR Assessment
                                        <span className="text-[10px] bg-purple-500/10 text-purple-600 px-2 py-0.5 rounded-full uppercase tracking-tighter">Confidential</span>
                                    </h5>
                                    {isLoadingDetails ? (
                                        <p className="text-xs text-gray-400 italic">Loading interview details...</p>
                                    ) : (
                                        <>
                                            {/* Full exit interview responses */}
                                            {interviewDetails && (
                                                <div className="rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-900/10 p-4 space-y-4 max-h-[420px] overflow-y-auto">
                                                    <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Exit Interview Responses</p>

                                                    {/* General */}
                                                    <div className="space-y-1.5">
                                                        {[
                                                            ["Reason for leaving", interviewDetails.reason_for_leaving],
                                                            ["New employer", interviewDetails.new_employer],
                                                            ["Why leaving", interviewDetails.why_leaving],
                                                            ["What would have prevented leaving", interviewDetails.what_would_prevent],
                                                            ["What they enjoyed most", interviewDetails.most_enjoyed],
                                                            ["Suggested company improvements", interviewDetails.company_improvement],
                                                            ["Work was as expected", interviewDetails.work_as_expected],
                                                            ["Work expectations comment", interviewDetails.work_expected_comments],
                                                            ["Workload", interviewDetails.workload],
                                                            ["Would recommend organisation", interviewDetails.would_recommend],
                                                            ["Suggestions", interviewDetails.suggestions],
                                                        ].filter(([, v]) => v && v !== 'N/A').map(([label, value]) => (
                                                            <div key={label as string} className="text-xs flex gap-1">
                                                                <span className="font-semibold text-gray-600 dark:text-gray-400 shrink-0">{label}:</span>
                                                                <span className="text-gray-700 dark:text-gray-300">{value as string}</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Supervisor ratings */}
                                                    {[
                                                        interviewDetails.supervisor_fair,
                                                        interviewDetails.supervisor_recognition,
                                                        interviewDetails.supervisor_complaints,
                                                        interviewDetails.supervisor_sensitive,
                                                        interviewDetails.supervisor_feedback,
                                                        interviewDetails.supervisor_communication,
                                                        interviewDetails.supervisor_policies,
                                                    ].some(Boolean) && (
                                                        <div>
                                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Supervisor Evaluation</p>
                                                            <div className="space-y-1">
                                                                {[
                                                                    ["Treated fairly", interviewDetails.supervisor_fair],
                                                                    ["Recognised contributions", interviewDetails.supervisor_recognition],
                                                                    ["Handled complaints", interviewDetails.supervisor_complaints],
                                                                    ["Sensitive to personal needs", interviewDetails.supervisor_sensitive],
                                                                    ["Provided feedback", interviewDetails.supervisor_feedback],
                                                                    ["Communicated clearly", interviewDetails.supervisor_communication],
                                                                    ["Explained policies", interviewDetails.supervisor_policies],
                                                                ].filter(([, v]) => v).map(([label, value]) => (
                                                                    <div key={label as string} className="text-xs flex justify-between">
                                                                        <span className="text-gray-600 dark:text-gray-400">{label}</span>
                                                                        <span className="font-medium text-gray-800 dark:text-gray-200">{value as string}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Organisation ratings */}
                                                    {[
                                                        interviewDetails.rating_coop_dept,
                                                        interviewDetails.rating_pay,
                                                        interviewDetails.rating_training,
                                                    ].some(Boolean) && (
                                                        <div>
                                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Organisation Ratings</p>
                                                            <div className="space-y-1">
                                                                {[
                                                                    ["Cooperation within dept", interviewDetails.rating_coop_dept],
                                                                    ["Cooperation across depts", interviewDetails.rating_coop_other],
                                                                    ["Training", interviewDetails.rating_training],
                                                                    ["Equipment / resources", interviewDetails.rating_equipment],
                                                                    ["Performance review", interviewDetails.rating_perf_review],
                                                                    ["Orientation", interviewDetails.rating_orientation],
                                                                    ["Pay", interviewDetails.rating_pay],
                                                                    ["Career development", interviewDetails.rating_career_dev],
                                                                    ["Work conditions", interviewDetails.rating_work_conditions],
                                                                    ["Rating comments", interviewDetails.rating_comments],
                                                                ].filter(([, v]) => v).map(([label, value]) => (
                                                                    <div key={label as string} className="text-xs flex justify-between">
                                                                        <span className="text-gray-600 dark:text-gray-400">{label}</span>
                                                                        <span className="font-medium text-gray-800 dark:text-gray-200">{value as string}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Benefits */}
                                                    {[
                                                        interviewDetails.benefit_medical,
                                                        interviewDetails.benefit_annual_leave,
                                                        interviewDetails.benefit_holidays,
                                                    ].some(Boolean) && (
                                                        <div>
                                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Benefits Ratings</p>
                                                            <div className="space-y-1">
                                                                {[
                                                                    ["Medical", interviewDetails.benefit_medical],
                                                                    ["Annual leave", interviewDetails.benefit_annual_leave],
                                                                    ["Public holidays", interviewDetails.benefit_holidays],
                                                                    ["Sick leave", interviewDetails.benefit_sick_leave],
                                                                    ["Gratuity", interviewDetails.benefit_gratuity],
                                                                    ["Education assistance", interviewDetails.benefit_education],
                                                                ].filter(([, v]) => v).map(([label, value]) => (
                                                                    <div key={label as string} className="text-xs flex justify-between">
                                                                        <span className="text-gray-600 dark:text-gray-400">{label}</span>
                                                                        <span className="font-medium text-gray-800 dark:text-gray-200">{value as string}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Assessment Notes</label>
                                                <textarea
                                                    rows={3}
                                                    value={hrAssessment.assessmentNotes}
                                                    onChange={e => setHrAssessment(prev => ({ ...prev, assessmentNotes: e.target.value }))}
                                                    placeholder="Key observations from the exit interview..."
                                                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-brand-500 resize-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Key Themes Identified</label>
                                                <textarea
                                                    rows={2}
                                                    value={hrAssessment.keyThemes}
                                                    onChange={e => setHrAssessment(prev => ({ ...prev, keyThemes: e.target.value }))}
                                                    placeholder="Common patterns or themes raised by the employee..."
                                                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-brand-500 resize-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Re-hire Recommendation</label>
                                                <select
                                                    value={hrAssessment.recommendation}
                                                    onChange={e => setHrAssessment(prev => ({ ...prev, recommendation: e.target.value as any }))}
                                                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-brand-500"
                                                >
                                                    <option value="">Select recommendation...</option>
                                                    <option value="Rehire">Eligible for Re-hire</option>
                                                    <option value="Neutral">Neutral / Case by Case</option>
                                                    <option value="Do Not Rehire">Not Eligible for Re-hire</option>
                                                </select>
                                            </div>
                                            {hrAssessment.assessedAt && (
                                                <p className="text-xs text-gray-400 italic">
                                                    Last assessed: {new Date(hrAssessment.assessedAt).toLocaleString()} by {hrAssessment.assessedBy || "HR"}
                                                </p>
                                            )}
                                            <button
                                                onClick={saveHRAssessment}
                                                disabled={isSavingAssessment || isLoadingDetails}
                                                className="w-full px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSavingAssessment ? "Saving & Finalizing..." : isLoadingDetails ? "Loading..." : "Save & Finalize HR Assessment"}
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}

                            {((selectedInterview as any)?.status === 'Completed' || selectedInterview?.stage === 'Completed') ? (
                                <div className="pt-6 space-y-3 text-center">
                                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-50 text-green-700 rounded-lg border border-green-200 font-semibold">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        Exit Clearance Completed
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (!selectedInterview) return;
                                            generateInterviewPDF(toEmpInfo(selectedInterview), interviewDetails);
                                            toast.success("Exit Interview PDF downloaded.");
                                        }}
                                        className="w-full px-4 py-2.5 rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50 font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        <DownloadIcon className="w-4 h-4" />
                                        Download Exit Interview (PDF)
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (!selectedInterview) return;
                                            generateClearancePDF(toEmpInfo(selectedInterview), interviewDetails, checklistItems);
                                            toast.success("Exit Clearance PDF downloaded.");
                                        }}
                                        className="w-full px-4 py-2.5 rounded-lg border border-green-300 text-green-700 hover:bg-green-50 font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        <DownloadIcon className="w-4 h-4" />
                                        Download Exit Clearance (PDF)
                                    </button>
                                </div>
                            ) : selectedInterview?.stage !== 'HR' && (
                                <div className="pt-6 flex gap-3">
                                    <button
                                        onClick={handleReject}
                                        disabled={isActioning}
                                        className="w-full px-4 py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-medium transition-colors disabled:opacity-50"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={handleApprove}
                                        disabled={isActioning}
                                        className="w-full px-4 py-2.5 rounded-lg bg-brand-500 text-white hover:bg-brand-600 font-medium transition-colors shadow-sm disabled:opacity-50"
                                    >
                                        {isActioning ? "Processing..." :
                                            (selectedInterview?.stage === 'Employee' || selectedInterview?.stage === 'Supervisor') ? "Approve & Forward to Operations" :
                                            selectedInterview?.stage === 'Completed' ? "Finalize Exit" :
                                            (selectedInterview?.stage === 'HR_Final' || selectedInterview?.stage === 'HR_Director') ? "Complete Exit Process" :
                                            "Approve Clearance"
                                        }
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Drawer>

            {/* HR Edit Record Modal */}
            {isEditModalOpen && editRecord && (
                <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} className="max-w-lg w-full m-4">
                    <div className="p-6 space-y-5">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit Exit Record</h3>
                            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Audit trail maintained</span>
                        </div>
                        <p className="text-xs text-gray-500">All changes are recorded in the system audit log. Only authorized HR personnel can make adjustments.</p>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason for Leaving</label>
                            <textarea
                                rows={3}
                                value={editRecord.reasonForLeaving || ""}
                                onChange={e => setEditRecord((prev: any) => ({ ...prev, reasonForLeaving: e.target.value }))}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-brand-500 resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Handover Notes</label>
                            <textarea
                                rows={2}
                                value={editRecord.handoverNotes || ""}
                                onChange={e => setEditRecord((prev: any) => ({ ...prev, handoverNotes: e.target.value }))}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-brand-500 resize-none"
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setIsEditModalOpen(false)} className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors">
                                Cancel
                            </button>
                            <button onClick={saveEditRecord} disabled={isSavingEdit} className="flex-1 px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors disabled:opacity-50">
                                {isSavingEdit ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
