"use client";
import React, { useState, useEffect } from "react";
import { leaveBalanceService } from "@/services/leave-balance.service";
import { userService } from "@/services/user.service";
import { leaveServiceInstance } from "@/services/leave.service";
import { Employee } from "@/types/service.types";
import { toast } from "react-hot-toast";
import { PaperPlaneIcon } from "@/icons";
import CustomSelect from "@/components/form/CustomSelect";

export default function LeaveBalanceSingleAdd({ onSuccess }: { onSuccess?: () => void }) {
  const [staffId, setStaffId] = useState<number>(0);
  const [leaveTypeId, setLeaveTypeId] = useState<string>("");
  const [totalHours, setTotalHours] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState<{ id: number; unique_id: string; name: string }[]>([]);

  useEffect(() => {
    setIsLoadingEmployees(true);
    userService.getAllEmployees()
      .then((response) => setEmployees(response.data || []))
      .catch(() => toast.error("Could not load employee list"))
      .finally(() => setIsLoadingEmployees(false));

    leaveServiceInstance.getLeaveTypes()
      .then((response) => setLeaveTypes(response.data || []))
      .catch(() => toast.error("Could not load leave types"));
  }, []);

  const resetForm = () => {
    setStaffId(0);
    setLeaveTypeId("");
    setTotalHours(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!staffId || !leaveTypeId || !totalHours || totalHours <= 0) {
      toast.error("Please select a staff member, leave type, and enter hours greater than 0");
      return;
    }

    setIsSubmitting(true);
    try {
      await leaveBalanceService.createLeaveBalance({ staffId, leaveTypeId, totalHours });
      toast.success("Leave balance added successfully!");
      resetForm();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Create leave balance error:", error);
      toast.error(error?.response?.data?.message || error?.message || "Failed to add leave balance");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Add Leave Balance
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Seed a leave balance for one employee for the current year
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Staff Member
          </label>
          <CustomSelect
            value={staffId}
            onChange={(v) => setStaffId(Number(v))}
            options={employees.map((emp) => ({
              value: emp.staff_id,
              label: `${emp.first_name} ${emp.last_name} (${emp.staff_id})`,
            }))}
            placeholder={isLoadingEmployees ? "Loading employees..." : "Select Staff"}
            disabled={isLoadingEmployees}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Leave Type
          </label>
          <CustomSelect
            value={leaveTypeId}
            onChange={(v) => setLeaveTypeId(String(v))}
            options={leaveTypes.map((type) => ({
              value: type.unique_id,
              label: type.name,
            }))}
            placeholder="Select Leave Type"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Total Hours
          </label>
          <input
            type="number"
            value={totalHours || ""}
            onChange={(e) => setTotalHours(Number(e.target.value))}
            placeholder="e.g. 40"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            min="0.01"
            step="any"
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={resetForm}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-white/5 transition-colors"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PaperPlaneIcon className="w-4 h-4" />
            {isSubmitting ? "Adding..." : "Add Balance"}
          </button>
        </div>
      </form>
    </div>
  );
}
