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
import { EyeIcon, CheckCircleIcon, CloseIcon, MoreDotIcon, PencilIcon, PlusIcon, TrashBinIcon } from "@/icons";
import CustomSelect from "@/components/form/CustomSelect";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Drawer } from "../ui/drawer/Drawer";
import { Modal } from "../ui/modal";
import { ExitService, ChecklistItem as ServiceChecklistItem } from "@/services/exit.service";
import { toast } from "react-hot-toast";
import Button from "../ui/button/Button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type QueueType = 'All' | 'HR' | 'Operations' | 'Finance';

interface ExitInterviewDisplay {
    id: any;
    uniqueId: string;
    staffId: string | number;
    employeeName: string;
    department: string;
    designation: string;
    supervisor: string;
    stage: string;
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
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [showChecklistManager, setShowChecklistManager] = useState(false);
    
    const [selectedChecklistIds, setSelectedChecklistIds] = useState<string[]>([]);
    const [isActioning, setIsActioning] = useState(false);
    
    const [availableQueues, setAvailableQueues] = useState<QueueType[]>(['All', 'HR', 'Operations', 'Finance']);
    const [authUser, setAuthUser] = useState<any>(null);

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
    }, []);

    useEffect(() => {
        if (!authUser) return;

        const role = authUser?.role?.toLowerCase() || '';

        // Admins and superadmins always see everything
        if (role.includes('admin') || role.includes('superadmin') || role === 'hr_manager') {
            setAvailableQueues(['All', 'HR', 'Operations', 'Finance']);
            setCurrentQueue('All');
            return;
        }

        // For non-admins, resolve the department UUID against the loaded departments list
        const deptUUID = authUser?.department || authUser?.department_id || '';
        const matchedDept = departments.find(
            (d: any) => d.unique_id === deptUUID || d.uniqueId === deptUUID || d.id === deptUUID
        );
        const deptName = (matchedDept?.name || authUser?.department_name || '').toLowerCase();

        if (deptName.includes('hr') || deptName.includes('human resources')) {
            setAvailableQueues(['All', 'HR']);
            setCurrentQueue('HR');
        } else if (deptName.includes('operation')) {
            setAvailableQueues(['All', 'Operations']);
            setCurrentQueue('Operations');
        } else if (deptName.includes('finance')) {
            setAvailableQueues(['All', 'Finance']);
            setCurrentQueue('Finance');
        } else {
            // Default: show all queues if department can't be resolved
            setAvailableQueues(['All', 'HR', 'Operations', 'Finance']);
            setCurrentQueue('All');
        }
    }, [authUser, departments]);

    useEffect(() => {
        if (currentQueue === 'All' || currentQueue === 'HR' || departments.length > 0) {
            fetchInterviews();
        }
    }, [currentQueue, departments]);

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
            
            // Map the API structure to the Display structure
            let mapped = data.map((item: any) => {
                const fName = item.staff_first_name || '';
                const lName = item.staff_last_name || '';
                const fullName = (fName || lName) ? `${fName} ${lName}`.trim() : `Staff #${item.staff_id || item.id}`;

                return {
                    id: item.id,
                    uniqueId: item.unique_id || item.uniqueId || item.id,
                    staffId: item.staff_id || item.id,
                    employeeName: item.staff_name || fullName,
                    department: item.department_name || item.department?.name || item.department || 'N/A',
                    designation: item.designation_name || item.designation || 'Not Specified',
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
                    handoverStatus: item.stage !== 'Supervisor' ? "Accepted" : "Pending", // basic fallback logic since handover_cleared isn't present
                    assetsStatus: item.operations_cleared === 1 ? "Cleared" : "Pending",
                    financeStatus: item.finance_cleared === 1 ? "Cleared" : "Pending",
                    status: item.status || 'Pending',
                    program: item.program_name || item.program?.name || item.program || 'N/A',
                    location: item.location_name || item.location?.name || item.location || 'N/A',
                };
            });

            // TODO: re-enable self-exclusion filter before go-live
            // mapped = mapped.filter((m: any) => {
            //     const isMatchingId = currentUserId && String(m.staffId) === String(currentUserId);
            //     const isMatchingStaffId = currentUserStaffId && String(m.staffId) === String(currentUserStaffId);
            //     return !isMatchingId && !isMatchingStaffId;
            // });

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
        const numericId = item?.id;
        if (!numericId || !confirm("Delete this item?")) return;

        try {
            await exitServiceInstance.deleteChecklistItem(numericId);
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

    const handleReview = (interview: ExitInterviewDisplay) => {
        setSelectedInterview(interview);
        setSelectedChecklistIds([]); // reset selection
        setIsReviewOpen(true);
    };

    const handleApprove = async () => {
        if (!selectedInterview) return;
        setIsActioning(true);

        // Determine action from the record's actual stage (works from any queue including All)
        const stage = selectedInterview.stage;

        try {
            if (stage === 'Supervisor') {
                await exitServiceInstance.advanceStage(selectedInterview.uniqueId as any, 'HR');
                toast.success(" approval submitted. Forwarded to HR.");
                setIsReviewOpen(false);
                fetchInterviews();

            } else if (stage === 'HR') {
                await exitServiceInstance.advanceStage(selectedInterview.uniqueId as any, 'Operations');
                toast.success("HR review approved. Forwarded to Operations/Finance.");
                setIsReviewOpen(false);
                fetchInterviews();

            } else if (stage === 'Operations') {
                if (selectedChecklistIds.length === 0) {
                    toast.error("Please verify at least one asset before approving.");
                    return;
                }
                const clearedBy = authUser?.unique_id || authUser?.uniqueId || String(authUser?.id || '');
                await exitServiceInstance.clearExitInterviewItems(selectedInterview.uniqueId as any, {
                    department: 'Operations',
                    checkListItemIds: selectedChecklistIds.map(Number),
                    clearedBy,
                } as any);
                toast.success("Operations cleared. Forwarded to Finance.");
                setIsReviewOpen(false);
                fetchInterviews();

            } else if (stage === 'Finance') {
                const clearedBy = authUser?.unique_id || authUser?.uniqueId || String(authUser?.id || '');
                await exitServiceInstance.clearExitInterviewItems(selectedInterview.uniqueId as any, {
                    department: 'Finance',
                    checkListItemIds: [],
                    clearedBy,
                } as any);
                toast.success("Finance cleared. Exit process completed.");
                setIsReviewOpen(false);
                fetchInterviews();

            } else if (stage === 'Completed') {
                await exitServiceInstance.finalizeExitInterview(selectedInterview.uniqueId as any);
                toast.success("Exit clearance finalized successfully.");
                setIsReviewOpen(false);
                fetchInterviews();

            } else if (stage === 'HR_Final') {
                await exitServiceInstance.finalizeExitInterview(selectedInterview.uniqueId as any);
                toast.success("Exit process completed successfully.");
                setIsReviewOpen(false);
                fetchInterviews();

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

    const getStageColor = (stage: string) => {
        switch (stage) {
            case "Supervisor": return "warning";
            case "Operations": return "info";
            case "Finance": return "success";
            case "HR": return "error";
            case "Completed": return "success";
            default: return "light";
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

                <button
                    onClick={() => setShowChecklistManager(!showChecklistManager)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                >
                    <PlusIcon className="w-4 h-4" />
                    {showChecklistManager ? "Hide Assets" : "Global Assets"}
                </button>
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

            <div className="max-w-full overflow-x-auto min-h-[400px]">
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
                                        {interview.stage}
                                    </Badge>
                                </TableCell>
                                <TableCell className="py-3 text-right">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleReview(interview)}
                                    >
                                        Review
                                    </Button>
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
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-800 rounded-lg">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-400">1. Supervisor (Handover)</span>
                                        <Badge color={selectedInterview.handoverStatus === "Accepted" ? "success" : "warning"}>{selectedInterview.handoverStatus}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-800 rounded-lg">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-400">2. HR (Review & Checklist)</span>
                                        {(() => {
                                            const s = selectedInterview.stage;
                                            if (s === "Operations" || s === "Finance" || s === "Completed") return <Badge color="success">Approved</Badge>;
                                            if (s === "HR") return <Badge color="warning">In Review</Badge>;
                                            return <Badge color="light">Not Reached</Badge>;
                                        })()}
                                    </div>
                                    <div className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-800 rounded-lg">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-400">3. Operations (Assets)</span>
                                        <Badge color={selectedInterview.assetsStatus === "Cleared" ? "success" : "warning"}>{selectedInterview.assetsStatus}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-800 rounded-lg">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-400">4. Finance (Outstanding)</span>
                                        <Badge color={selectedInterview.financeStatus === "Cleared" ? "success" : "warning"}>{selectedInterview.financeStatus}</Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Checklist section — scoped strictly to the stage's department */}
                            {selectedInterview.stage !== 'Completed' && (selectedInterview as any)?.status !== 'Completed' && (() => {
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
                                                <a href="/exit/checklist" className="text-xs text-brand-500 hover:underline">Manage Checklist Items</a>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}

                            {(selectedInterview as any)?.status === 'Completed' ? (
                                <div className="pt-6 space-y-3 text-center">
                                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-50 text-green-700 rounded-lg border border-green-200 font-semibold">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        Exit Clearance Completed
                                    </div>
                                    <button
                                        onClick={() => {
                                            const iv = selectedInterview;
                                            if (!iv) return;
                                            const doc = new jsPDF();

                                            // Header
                                            doc.setFontSize(18);
                                            doc.setFont("helvetica", "bold");
                                            doc.text("EXIT CLEARANCE CHECKLIST", 105, 20, { align: "center" });
                                            doc.setFontSize(10);
                                            doc.setFont("helvetica", "normal");
                                            doc.text("Mercy Corps - People Central", 105, 27, { align: "center" });

                                            // Line
                                            doc.setDrawColor(200);
                                            doc.line(14, 31, 196, 31);

                                            // Employee Info
                                            doc.setFontSize(12);
                                            doc.setFont("helvetica", "bold");
                                            doc.text("Employee Information", 14, 40);
                                            const infoData = [
                                                ["Employee", String(iv.employeeName)],
                                                ["Staff ID", String(iv.staffId)],
                                                ["Department", String(iv.department)],
                                                ["Location", String(iv.location)],
                                                ["Program", String(iv.program)],
                                                ["Exit Date", String((iv as any).resignationDate)],
                                                ["Submitted", String(iv.submittedOn)],
                                            ];
                                            autoTable(doc, {
                                                startY: 44,
                                                head: [["Field", "Details"]],
                                                body: infoData,
                                                theme: "grid",
                                                headStyles: { fillColor: [220, 53, 69], textColor: 255, fontStyle: "bold" },
                                                styles: { fontSize: 10 },
                                                columnStyles: { 0: { fontStyle: "bold", cellWidth: 50 } },
                                            });

                                            // Clearance Progress
                                            const afterInfo = (doc as any).lastAutoTable?.finalY || 90;
                                            doc.setFontSize(12);
                                            doc.setFont("helvetica", "bold");
                                            doc.text("Clearance Progress", 14, afterInfo + 10);
                                            const progressData = [
                                                ["1. Supervisor (Handover)", iv.handoverStatus],
                                                ["2. HR (Review & Checklist)", "Approved"],
                                                ["3. Operations (Assets)", iv.assetsStatus],
                                                ["4. Finance (Outstanding)", iv.financeStatus],
                                            ];
                                            autoTable(doc, {
                                                startY: afterInfo + 14,
                                                head: [["Step", "Status"]],
                                                body: progressData,
                                                theme: "grid",
                                                headStyles: { fillColor: [220, 53, 69], textColor: 255, fontStyle: "bold" },
                                                styles: { fontSize: 10 },
                                                columnStyles: { 0: { cellWidth: 100 } },
                                            });

                                            // Checklist Items
                                            const afterProgress = (doc as any).lastAutoTable?.finalY || 140;
                                            doc.setFontSize(12);
                                            doc.setFont("helvetica", "bold");
                                            doc.text("Checklist Items", 14, afterProgress + 10);
                                            const itemRows = checklistItems.map((item, i) => [
                                                String(i + 1),
                                                item.name,
                                                (item as any).department_name || item.departmentName || "N/A",
                                                "Cleared",
                                            ]);
                                            autoTable(doc, {
                                                startY: afterProgress + 14,
                                                head: [["#", "Item", "Department", "Status"]],
                                                body: itemRows.length > 0 ? itemRows : [["—", "No items", "—", "—"]],
                                                theme: "grid",
                                                headStyles: { fillColor: [220, 53, 69], textColor: 255, fontStyle: "bold" },
                                                styles: { fontSize: 10 },
                                                columnStyles: { 0: { cellWidth: 15 } },
                                            });

                                            // Footer
                                            const pageHeight = doc.internal.pageSize.height;
                                            doc.setFontSize(8);
                                            doc.setTextColor(150);
                                            doc.text(`Generated on ${new Date().toLocaleString()}`, 105, pageHeight - 10, { align: "center" });

                                            doc.save(`Exit_Checklist_${iv.staffId}_${iv.employeeName.replace(/\s+/g, '_')}.pdf`);
                                            toast.success("PDF downloaded.");
                                        }}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                        Download Exit Checklist (PDF)
                                    </button>
                                </div>
                            ) : (
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
                                            selectedInterview?.stage === 'Supervisor' ? "Approve & Forward to HR" :
                                            selectedInterview?.stage === 'HR' ? "Approve & Forward" :
                                            selectedInterview?.stage === 'Completed' ? "Finalize Exit" :
                                            selectedInterview?.stage === 'HR_Final' ? "Complete Exit Process" :
                                            "Approve Clearance"
                                        }
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Drawer>
        </div>
    );
}
