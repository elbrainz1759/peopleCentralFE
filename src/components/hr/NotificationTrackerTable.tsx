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
import Button from "../ui/button/Button";
import { SearchIcon, MoreDotIcon as MoreIcon, PlusIcon } from "@/icons";
import { Modal } from "../ui/modal";
import { toast } from "react-hot-toast";
import { trackerService } from "@/services/data-tracker.service";

export default function NotificationTrackerTable() {
    const [searchTerm, setSearchTerm] = useState("");
    const [trackers, setTrackers] = useState<any[]>([]);
    const [meta, setMeta] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Tracker form state
    const [trackerData, setTrackerData] = useState({
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        recipients_csv: "", // comma separated emails
        periods_csv: "30,15,7" // comma separated days
    });

    const loadTrackers = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await trackerService.getTrackers();
            // The new API structure returns: { data: [...], meta: {...} }
            const items = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
            setTrackers(items);
            if (res?.meta) {
                setMeta(res.meta);
            }
        } catch (err) {
            console.error("Failed to load trackers", err);
            toast.error("Failed to load trackers");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTrackers();
    }, [loadTrackers]);

    const filteredTrackers = trackers.filter(record =>
        (record.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.description || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getDaysRemaining = (endDate: string) => {
        if (!endDate) return 0;
        const today = new Date();
        const end = new Date(endDate);
        const diffTime = end.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const getStatus = (days: number) => {
        if (days < 0) return { label: "Expired", color: "error" as const };
        if (days <= 60) return { label: "Expiring Soon", color: "warning" as const };
        return { label: "Active", color: "success" as const };
    };

    const handleCreateTracker = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const rawRecipients = trackerData.recipients_csv.split(",").map(e => e.trim()).filter(Boolean);
        const rawPeriods = trackerData.periods_csv.split(",").map(p => p.trim()).filter(Boolean);
        const periods = rawPeriods.map(p => parseInt(p)).filter(p => !isNaN(p));

        if (!trackerData.title) {
            toast.error("Title is required.");
            return;
        }
        if (!trackerData.start_date || !trackerData.end_date) {
            toast.error("Please enter valid Start and End dates.");
            return;
        }
        if (rawRecipients.length === 0) {
            toast.error("Please provide at least one recipient email address.");
            return;
        }
        if (rawPeriods.length > 0 && periods.length === 0) {
            toast.error(`Notification periods must be numbers, but received: "${trackerData.periods_csv}"`);
            return;
        }
        if (periods.length === 0) {
            toast.error("Please provide at least one valid notification period (e.g., 30, 15, 7).");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                title: trackerData.title,
                description: trackerData.description || undefined,
                start_date: trackerData.start_date,
                end_date: trackerData.end_date,
                recipients: rawRecipients,
                notification_periods: periods
            };
            
            await trackerService.createTracker(payload);
            toast.success("Data Tracker created successfully!");
            setIsCreateModalOpen(false);
            setTrackerData({
                title: "",
                description: "",
                start_date: "",
                end_date: "",
                recipients_csv: "",
                periods_csv: "30,15,7"
            });
            loadTrackers();
        } catch (error: any) {
            console.error("Failed to create tracker:", error);
            toast.error(error.message || "Failed to create tracker");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-sm overflow-hidden">
            {/* Table Header/Filter */}
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 dark:border-gray-800">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Data Trackers</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Track and manage your automated notifications</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative w-full sm:w-64">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <SearchIcon size={18} />
                        </span>
                        <input
                            type="text"
                            placeholder="Search by Title or Description..."
                            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 px-4 py-2">
                        <PlusIcon className="w-4 h-4" />
                        Create Tracker
                    </Button>
                </div>
            </div>

            <div className="max-w-full overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50 dark:bg-gray-800/50">
                            <TableCell isHeader className="py-4 px-5 text-xs font-semibold uppercase tracking-wider text-gray-500">Title & Description</TableCell>
                            <TableCell isHeader className="py-4 px-5 text-xs font-semibold uppercase tracking-wider text-gray-500">Period</TableCell>
                            <TableCell isHeader className="py-4 px-5 text-xs font-semibold uppercase tracking-wider text-gray-500">Recipients</TableCell>
                            <TableCell isHeader className="py-4 px-5 text-xs font-semibold uppercase tracking-wider text-gray-500">Notification Periods</TableCell>
                            <TableCell isHeader className="py-4 px-5 text-xs font-semibold uppercase tracking-wider text-gray-500">Status</TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                                    Loading trackers...
                                </TableCell>
                            </TableRow>
                        ) : filteredTrackers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                                    No data trackers found.
                                </TableCell>
                            </TableRow>
                        ) : filteredTrackers.map((record, index) => {
                            const days = getDaysRemaining(record.end_date);
                            const status = getStatus(days);
                            const isUrgent = days <= 60;

                            const uniqueKey = record.unique_id || record.id || index;

                            return (
                                <TableRow key={uniqueKey} className={`hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors ${isUrgent ? 'bg-orange-50/30 dark:bg-orange-900/5' : ''}`}>
                                    <TableCell className="py-4 px-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{record.title}</span>
                                            {record.description && (
                                                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{record.description}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 px-5 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex flex-col gap-0.5">
                                            <span>
                                                {record.start_date ? new Date(record.start_date).toLocaleDateString() : 'N/A'} - {record.end_date ? new Date(record.end_date).toLocaleDateString() : 'N/A'}
                                            </span>
                                            <span className={`text-[11px] font-medium ${isUrgent ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500'}`}>
                                                {days < 0 ? 'Expired' : `${days} days remaining`}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 px-5">
                                        <div className="flex flex-wrap gap-1">
                                            {(record.recipients || []).slice(0, 2).map((email: string, i: number) => (
                                                <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                                    {email}
                                                </span>
                                            ))}
                                            {(record.recipients?.length || 0) > 2 && (
                                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                                    +{(record.recipients.length - 2)} more
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 px-5 text-sm text-gray-600 dark:text-gray-400">
                                        {record.notification_periods ? record.notification_periods.join(', ') + ' days' : 'N/A'}
                                    </TableCell>
                                    <TableCell className="py-4 px-5">
                                        <Badge size="sm" color={status.color}>
                                            {status.label}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} className="max-w-2xl p-0">
                <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create Data Tracker</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Setup an automated notification tracker for important dates.</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        <form id="tracker-form" onSubmit={handleCreateTracker} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1.5">Title <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={trackerData.title}
                                    onChange={(e) => setTrackerData({ ...trackerData, title: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                                    placeholder="e.g., Q3 Contract Renewals"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1.5">Description</label>
                                <textarea
                                    value={trackerData.description}
                                    onChange={(e) => setTrackerData({ ...trackerData, description: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none min-h-[80px]"
                                    placeholder="Optional description of this tracker..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1.5">Start Date <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        required
                                        value={trackerData.start_date}
                                        onChange={(e) => setTrackerData({ ...trackerData, start_date: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1.5">End Date <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        required
                                        value={trackerData.end_date}
                                        onChange={(e) => setTrackerData({ ...trackerData, end_date: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1.5">Recipients (Emails) <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={trackerData.recipients_csv}
                                    onChange={(e) => setTrackerData({ ...trackerData, recipients_csv: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                                    placeholder="hr@company.com, manager@company.com"
                                />
                                <p className="text-[11px] text-gray-500 mt-1.5">Comma separated list of email addresses.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1.5">Notification Periods (Days) <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={trackerData.periods_csv}
                                    onChange={(e) => setTrackerData({ ...trackerData, periods_csv: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                                    placeholder="30, 15, 7"
                                />
                                <p className="text-[11px] text-gray-500 mt-1.5">Days before end date to send notifications (e.g., 30, 15, 7).</p>
                            </div>
                        </form>
                    </div>

                    <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                            Cancel
                        </Button>
                        <button type="submit" form="tracker-form" disabled={isSubmitting} className="px-5 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 transition-all">
                            {isSubmitting ? "Creating..." : "Create Tracker"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
