"use client";
import React, { useState, useEffect } from "react";
import { leaveBalanceService, LeaveBalance } from "@/services/leave-balance.service";
import { toast } from "react-hot-toast";
import LeaveBalanceBulkUpload from "@/components/leave/LeaveBalanceBulkUpload";
import { Drawer } from "@/components/ui/drawer/Drawer";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { EyeIcon, PencilIcon, TrashBinIcon, MoreDotIcon } from "@/icons";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";

export default function LeaveBalanceManagement() {
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchBalances = async () => {
    setIsLoading(true);
    try {
      // For now, using a hardcoded staff ID. You should get this from the current user
      const staffId = 1; // Replace with actual staff ID from auth context
      const response = await leaveBalanceService.getLeaveBalanceByStaffId(staffId);
      console.log("API Response:", response); // Debug log
      console.log("Response data:", response.data); // Debug log
      
      // Handle different response structures
      const balancesData = response.data || response || [];
      console.log("Balances to set:", balancesData); // Debug log
      setBalances(Array.isArray(balancesData) ? balancesData : []);
    } catch (error) {
      console.error("Failed to fetch leave balances:", error);
      toast.error("Failed to load leave balances");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, []);

  const toggleDropdown = (id: string) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const closeDropdown = () => setOpenDropdownId(null);

  const handleDelete = async (id: number) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    
    try {
      await leaveBalanceService.deleteLeaveBalance(deleteId);
      toast.success("Leave balance deleted successfully");
      fetchBalances();
    } catch (error) {
      toast.error("Failed to delete leave balance");
    } finally {
      setDeleteModalOpen(false);
      setDeleteId(null);
    }
  };

  const getLeaveTypeName = (leaveType: number) => {
    const types: { [key: number]: string } = {
      1: "Annual Leave",
      2: "Sick Leave", 
      3: "Study Leave",
      4: "Casual Leave",
      5: "Maternity Leave",
      6: "Paternity Leave"
    };
    return types[leaveType] || `Type ${leaveType}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Leave Balance Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage employee leave balances and allocations
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Bulk Upload
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Leave Balances
            </h3>
            <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-500 rounded-full dark:bg-gray-800 dark:text-gray-400">
              {balances.length} Total
            </span>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto min-h-[400px]">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  S/N
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Staff ID
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Leave Type
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Total Hours
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Used Hours
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Remaining
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Status
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-gray-500">
                    Loading leave balances...
                  </TableCell>
                </TableRow>
              ) : balances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-gray-500">
                    No leave balances found. Start by uploading some balances.
                  </TableCell>
                </TableRow>
              ) : (
                balances.map((balance, index) => {
                  const remainingHours = parseFloat(balance.remaining_hours || '0');
                  const usedHours = parseFloat(balance.used_hours || '0');
                  const totalHours = parseFloat(balance.total_hours || '0');
                  const usagePercentage = totalHours > 0 ? (usedHours / totalHours) * 100 : 0;
                  
                  return (
                    <TableRow key={balance.id}>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {index + 1}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        EMP{balance.staff_id?.toString().padStart(4, '0')}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {balance.leave_type_name || `Type ${balance.leave_type_id}`}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {totalHours}h
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {usedHours}h
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        <span className={`font-medium ${remainingHours < 20 ? 'text-red-500' : 'text-green-500'}`}>
                          {remainingHours}h
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge
                          size="sm"
                          color={
                            usagePercentage >= 80
                              ? "error"
                              : usagePercentage >= 60
                              ? "warning"
                              : "success"
                          }
                        >
                          {usagePercentage >= 80
                            ? "Low"
                            : usagePercentage >= 60
                            ? "Medium"
                            : "Good"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        <div className="relative">
                          <button
                            onClick={() => toggleDropdown(balance.id?.toString() || '')}
                            className="dropdown-toggle text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            style={{ transform: 'rotate(90deg)' }}
                          >
                            <MoreDotIcon className="w-5 h-5" />
                          </button>
                          <Dropdown
                            isOpen={openDropdownId === balance.id?.toString()}
                            onClose={closeDropdown}
                            className="w-40 right-0 mt-2 top-full"
                          >
                            <DropdownItem
                              onItemClick={() => {
                                closeDropdown();
                                // Handle view
                              }}
                              className="flex gap-2 items-center"
                            >
                              <EyeIcon className="w-4 h-4" />
                              View Details
                            </DropdownItem>
                            <DropdownItem
                              onItemClick={() => {
                                closeDropdown();
                                // Handle edit
                              }}
                              className="flex gap-2 items-center"
                            >
                              <PencilIcon className="w-4 h-4" />
                              Edit
                            </DropdownItem>
                            <DropdownItem
                              onItemClick={() => {
                                closeDropdown();
                                handleDelete(balance.id!);
                              }}
                              className="flex gap-2 items-center text-red-500"
                            >
                              <TrashBinIcon className="w-4 h-4" />
                              Delete
                            </DropdownItem>
                          </Dropdown>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Drawer
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Bulk Upload Leave Balances"
      >
        <div className="p-6">
          <LeaveBalanceBulkUpload onSuccess={() => {
            setIsUploadOpen(false);
            fetchBalances();
          }} />
        </div>
      </Drawer>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this leave balance? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeleteId(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
