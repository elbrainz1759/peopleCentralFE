"use client";
import React, { useState, useEffect } from "react";
import { leaveBalanceService, BulkUploadRequest } from "@/services/leave-balance.service";
import { userService } from "@/services/user.service";
import { leaveServiceInstance } from "@/services/leave.service";
import { Employee } from "@/types/service.types";
import { toast } from "react-hot-toast";
import { PlusIcon, TrashBinIcon, PaperPlaneIcon } from "@/icons";

export default function LeaveBalanceBulkUpload({ onSuccess }: { onSuccess?: () => void }) {
  const [balances, setBalances] = useState<BulkUploadRequest[]>([
    {
      staffId: 0,
      leaveTypeId: 0,
      totalHours: 0
    }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState<{ id: number; name: string }[]>([]);
  const [isLoadingLeaveTypes, setIsLoadingLeaveTypes] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoadingEmployees(true);
      try {
        const response = await userService.getAllEmployees();
        setEmployees(response.data || []);
      } catch (error) {
        console.error("Failed to fetch employees:", error);
        toast.error("Could not load employee list");
      } finally {
        setIsLoadingEmployees(false);
      }
    };

    const fetchLeaveTypes = async () => {
      setIsLoadingLeaveTypes(true);
      try {
        const response = await leaveServiceInstance.getLeaveTypes();
        setLeaveTypes(response.data || []);
      } catch (error) {
        console.error("Failed to fetch leave types:", error);
        toast.error("Could not load leave types");
      } finally {
        setIsLoadingLeaveTypes(false);
      }
    };

    fetchEmployees();
    fetchLeaveTypes();
  }, []);

  const addBalanceRow = () => {
    setBalances([...balances, {
      staffId: 0,
      leaveTypeId: 0,
      totalHours: 0
    }]);
  };

  const removeBalanceRow = (index: number) => {
    if (balances.length === 1) return;
    const newBalances = balances.filter((_, i) => i !== index);
    setBalances(newBalances);
  };

  const updateBalance = (index: number, field: keyof BulkUploadRequest, value: string | number) => {
    const newBalances = [...balances];
    newBalances[index] = {
      ...newBalances[index],
      [field]: field === 'staffId' || field === 'leaveTypeId' || field === 'totalHours' ? Number(value) : value
    };
    setBalances(newBalances);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const invalidRows = balances.filter(b => !b.staffId || !b.leaveTypeId || !b.totalHours || b.totalHours <= 0);
    if (invalidRows.length > 0) {
      toast.error("Please fill in all required fields with valid values");
      return;
    }

    setIsSubmitting(true);
    try {
      await leaveBalanceService.bulkUploadLeaveBalances(balances);
      toast.success(`Successfully uploaded ${balances.length} leave balance(s)!`);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Bulk upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload leave balances");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Bulk Upload Leave Balances
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Add leave balances for multiple employees at once
          </p>
        </div>
        <button
          type="button"
          onClick={addBalanceRow}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-500 border border-brand-500 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Add Row
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="w-full">
          {/* Header Row */}
          <div className="grid grid-cols-[1fr_2fr_1fr_60px] gap-2 pb-3 border-b border-gray-200 dark:border-gray-700 mb-4">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Staff ID
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Leave Type
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Hours
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
              Act.
            </div>
          </div>

          {/* Data Rows */}
          {balances.map((balance, index) => (
            <div key={index} className="grid grid-cols-[1fr_2fr_1fr_60px] gap-2 pb-4 items-center">
              <div>
                <select
                  value={balance.staffId}
                  onChange={(e) => updateBalance(index, 'staffId', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  required
                  disabled={isLoadingEmployees}
                >
                  <option value="">{isLoadingEmployees ? "Loading employees..." : "Select Staff"}</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name} ({emp.staff_id || emp.id})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={balance.leaveTypeId}
                  onChange={(e) => updateBalance(index, 'leaveTypeId', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  required
                >
                  <option value="">Type</option>
                  {leaveTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <input
                  type="number"
                  value={balance.totalHours}
                  onChange={(e) => updateBalance(index, 'totalHours', e.target.value)}
                  placeholder="Hrs"
                  className="w-full rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  min="1"
                  required
                />
              </div>
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => removeBalanceRow(index)}
                  disabled={balances.length === 1}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <TrashBinIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => setBalances([{
              staffId: 0,
              leaveTypeId: 0,
              totalHours: 0
            }])}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-white/5 transition-colors"
          >
            Reset Form
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PaperPlaneIcon className="w-4 h-4" />
            {isSubmitting ? "Uploading..." : "Upload Balances"}
          </button>
        </div>
      </form>
    </div>
  );
}