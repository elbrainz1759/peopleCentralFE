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
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Drawer } from "../ui/drawer/Drawer";
import { Modal } from "../ui/modal";
import { ExitService, ChecklistItem as ServiceChecklistItem } from "@/services/exit.service";
import { toast } from "react-hot-toast";
import Button from "../ui/button/Button";

type QueueType = 'All' | 'Operations' | 'Finance' | 'HR_Final';

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
    
    const [selectedChecklistIds, setSelectedChecklistIds] = useState<number[]>([]);
    const [isActioning, setIsActioning] = useState(false);
    
    const [availableQueues, setAvailableQueues] = useState<QueueType[]>(['All', 'Operations', 'Finance', 'HR_Final']);

    const exitServiceInstance = ExitService.getInstance();

    const fetchInterviews = React.useCallback(async () => {
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
                    stage: item.stage || 'N/A',
                    submittedOn: item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A',
                    handoverStatus: item.stage !== 'Supervisor' ? "Accepted" : "Pending", // basic fallback logic since handover_cleared isn't present
                    assetsStatus: item.operations_cleared === 1 ? "Cleared" : "Pending",
                    financeStatus: item.finance_cleared === 1 ? "Cleared" : "Pending",
                    program: item.program_name || item.program?.name || item.program || 'N/A',
                    location: item.location_name || item.location?.name || item.location || 'N/A',
                };
            });

            // Prevent users from seeing/approving their own exit
            mapped = mapped.filter((m: any) => {
                const isMatchingId = currentUserId && String(m.staffId) === String(currentUserId);
                const isMatchingStaffId = currentUserStaffId && String(m.staffId) === String(currentUserStaffId);
                return !isMatchingId && !isMatchingStaffId;
            });

            if (currentQueue === 'HR_Final') {
                mapped = mapped.filter((m: any) => m.stage === 'HR_Final' || m.stage === 'HR');
            }

            setExitInterviews(mapped);
        } catch (error) {
            console.error("Failed to fetch intervews", error);
            toast.error("Failed to fetch records. Try again.");
        } finally {
            setIsLoadingInterviews(false);
        }
    }, [currentQueue, currentUserId, currentUserStaffId, departments, exitServiceInstance]);

    const fetchChecklistItems = React.useCallback(async () => {
        setIsLoadingChecklist(true);
        try {
            const response = await exitServiceInstance.getAllChecklistItems();
            setChecklistItems(response.data || response || []);
        } catch (error) {
            console.error("Failed to fetch checklist items:", error);
        } finally {
            setIsLoadingChecklist(false);
        }
    }, [exitServiceInstance]);

    const fetchDepartments = React.useCallback(async () => {
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
    }, [exitServiceInstance]);

    useEffect(() => {
        // Evaluate the logged-in user's role or department
        // to restrict which queues they can see.
        try {
            const authUserJson = localStorage.getItem('auth_user') || localStorage.getItem('user');
            if (authUserJson) {
                const user = JSON.parse(authUserJson);
                setCurrentUserId(user?.id);
                setCurrentUserStaffId(user?.staff_id || user?.staffId);
                
                // Example RBAC Logic:
                const deptName = user?.department?.name?.toLowerCase() || user?.department_name?.toLowerCase() || '';
                const role = user?.role?.toLowerCase() || '';
                
                if (role.includes('admin') || role === 'super_admin' || role === 'hr_manager') {
                    // Admins and HR see everything
                    setAvailableQueues(['All', 'Operations', 'Finance', 'HR_Final']);
                    setCurrentQueue('All');
                } else if (deptName.includes('operation')) {
                    setAvailableQueues(['Operations']);
                    setCurrentQueue('Operations');
                } else if (deptName.includes('finance')) {
                    setAvailableQueues(['Finance']);
                    setCurrentQueue('Finance');
                } else if (deptName.includes('hr') || deptName.includes('human resources')) {
                    setAvailableQueues(['All', 'HR_Final']);
                    setCurrentQueue('HR_Final');
                }
            }
        } catch (e) {
            console.error("Failed to parse auth user for RBAC", e);
        }

        fetchChecklistItems();
        fetchDepartments();
    }, [fetchChecklistItems, fetchDepartments]);

    useEffect(() => {
        // Only fetch if we're on "All"/"HR_Final", or if we are on a dept queue and departments have loaded
        if (currentQueue === 'All' || currentQueue === 'HR_Final' || departments.length > 0) {
            fetchInterviews();
        }
    }, [currentQueue, departments, fetchInterviews]);

    const handleAddItem = async () => {
        if (!newItemName.trim() || !selectedDeptId) {
            toast.error("Please provide both name and department");
            return;
        }

        setIsAddingItem(true);
        try {
            await exitServiceInstance.createChecklistItem({
                name: newItemName,
                department: selectedDeptId
            });
            toast.success("Checklist item added");
            setNewItemName("");
            fetchChecklistItems();
        } catch (error) {
            toast.error("Failed to add checklist item");
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

        try {
            if (currentQueue === 'Operations' || currentQueue === 'Finance') {
                if (selectedChecklistIds.length === 0) {
                    toast.error("Please verify at least one asset before approving.");
                    setIsActioning(false);
                    return;
                }
                
                await exitServiceInstance.clearExitInterviewItems(selectedInterview.id, {
                    department: currentQueue,
                    checkListItemIds: selectedChecklistIds
                });
                toast.success(`${currentQueue} clearance submitted successfully.`);
            
            } else if (currentQueue === 'HR_Final' || selectedInterview.stage.includes('HR')) {
                await exitServiceInstance.finalizeExitInterview(selectedInterview.id);
                toast.success(`Exit successfully finalized.`);
            } else {
                toast.error("Please act within the Operations, Finance, or HR queues.");
            }

            setIsReviewOpen(false);
            fetchInterviews();
        } catch (error: any) {
            console.error("Approval error", error);
            toast.error(error.message || "Failed to approve record.");
        } finally {
            setIsActioning(false);
        }
    };

    const handleReject = () => {
        if (!selectedInterview) return;
        toast.error(`Clearance rejected for ${selectedInterview.employeeName}`);
        setIsReviewOpen(false);
    };

    const toggleChecklistId = (id: number) => {
        setSelectedChecklistIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const getStageColor = (stage: string) => {
        switch (stage) {
            case "Supervisor": return "warning";
            case "Operations": return "info";
            case "Finance": return "success";
            case "HR": case "HR_Final": return "error";
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
                            <select
                                value={selectedDeptId}
                                onChange={(e) => setSelectedDeptId(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:border-brand-500 appearance-none"
                            >
                                {departments.map((dept) => (
                                    <option key={dept.uniqueId || dept.id} value={dept.uniqueId || dept.id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
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
                                    No records found for &quot;{currentQueue}&quot;
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
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-400">Supervisor (Handover)</span>
                                        <Badge color={selectedInterview.handoverStatus === "Accepted" ? "success" : "warning"}>{selectedInterview.handoverStatus}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-800 rounded-lg">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-400">Operations (Assets)</span>
                                        <Badge color={selectedInterview.assetsStatus === "Cleared" ? "success" : "warning"}>{selectedInterview.assetsStatus}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-800 rounded-lg">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-400">Finance (Outstanding)</span>
                                        <Badge color={selectedInterview.financeStatus === "Cleared" ? "success" : "warning"}>{selectedInterview.financeStatus}</Badge>
                                    </div>
                                </div>
                            </div>

                            {(currentQueue === 'Operations' || currentQueue === 'Finance') && (
                                <div className="space-y-4">
                                    <h5 className="font-semibold text-gray-800 dark:text-white/90 border-b pb-2 border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                        Asset / Finance Verification
                                        <span className="text-[10px] bg-brand-500/10 text-brand-500 px-2 py-0.5 rounded-full uppercase tracking-tighter">Required for your Stage</span>
                                    </h5>
                                    
                                    <div className="space-y-2">
                                        {checklistItems.length > 0 ? (
                                            checklistItems.map((item) => {
                                                if (!item.id) return null;
                                                // If we had API filtering, we could selectively show dept items
                                                return (
                                                <label key={item.uniqueId || item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/20 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/40 transition-all border border-transparent hover:border-brand-500/20">
                                                    <div className="flex items-center gap-3">
                                                        <input 
                                                            type="checkbox" 
                                                            className="w-5 h-5 rounded border-gray-300 text-brand-500 focus:ring-brand-500 transition-all" 
                                                            checked={selectedChecklistIds.includes(item.id)}
                                                            onChange={() => toggleChecklistId(item.id!)}
                                                        />
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.name}</span>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">{item.departmentName || 'General'}</span>
                                                </label>
                                                )
                                            })
                                        ) : (
                                            <p className="text-sm text-gray-500 italic text-center py-4">No verification checklist configured.</p>
                                        )}
                                    </div>
                                </div>
                            )}

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
                                    {isActioning ? "Processing..." : (currentQueue === 'HR_Final' ? "Finalize Exit" : "Approve Stage")}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </Drawer>
        </div>
    );
}
