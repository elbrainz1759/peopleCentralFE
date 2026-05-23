"use client";
import React, { useState, useEffect, useRef } from "react";
import { leaveBalanceService, BulkUploadRequest } from "@/services/leave-balance.service";
import { userService } from "@/services/user.service";
import { leaveServiceInstance } from "@/services/leave.service";
import { Employee } from "@/types/service.types";
import { toast } from "react-hot-toast";
import { PlusIcon, TrashBinIcon, PaperPlaneIcon } from "@/icons";
import * as XLSX from "xlsx";
import CustomSelect from "@/components/form/CustomSelect";

export default function LeaveBalanceBulkUpload({ onSuccess }: { onSuccess?: () => void }) {
  const [balances, setBalances] = useState<BulkUploadRequest[]>([
    {
      staffId: 0,
      leaveTypeId: 0,
      totalHours: 0
    }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["staffId", "leaveTypeId", "totalHours"],
      [1001, 1, 40],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "LeaveBalances");
    XLSX.writeFile(wb, "leave_balances_template.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast.error("Please upload a valid Excel or CSV file");
      return;
    }

    setIsParsingFile(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(sheet);

        if (rows.length === 0) {
          toast.error("The file is empty or has no data rows");
          return;
        }

        const parsed: BulkUploadRequest[] = rows.map((row: any, i: number) => {
          const staffId = Number(row.staffId || row["Staff ID"] || row["staff_id"] || 0);
          const leaveTypeId = Number(row.leaveTypeId || row["Leave Type ID"] || row["leave_type_id"] || 0);
          const totalHours = Number(row.totalHours || row["Total Hours"] || row["total_hours"] || 0);

          if (!staffId || !leaveTypeId || !totalHours) {
            throw new Error(`Row ${i + 2} is missing required fields (staffId, leaveTypeId, totalHours)`);
          }
          return { staffId, leaveTypeId, totalHours };
        });

        setBalances(parsed);
        toast.success(`${parsed.length} row(s) loaded from file`);
      } catch (err: any) {
        toast.error(err.message || "Failed to parse file");
      } finally {
        setIsParsingFile(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsArrayBuffer(file);
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

      {/* Excel Upload */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Upload Excel / CSV</p>
          <p className="text-xs text-gray-400 mt-0.5">Columns: staffId, leaveTypeId, totalHours</p>
        </div>
        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="px-3 py-2 text-xs font-medium text-brand-500 border border-brand-300 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors whitespace-nowrap"
        >
          Download Template
        </button>
        <label className="px-3 py-2 text-xs font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors cursor-pointer whitespace-nowrap">
          {isParsingFile ? "Parsing..." : "Choose File"}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isParsingFile}
          />
        </label>
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
                <CustomSelect
                  value={balance.staffId}
                  onChange={(v) => updateBalance(index, 'staffId', v)}
                  options={employees.map(emp => ({
                    value: emp.id,
                    label: `${emp.first_name} ${emp.last_name} (${emp.staff_id || emp.id})`,
                  }))}
                  placeholder={isLoadingEmployees ? "Loading employees..." : "Select Staff"}
                  disabled={isLoadingEmployees}
                />
              </div>
              <div>
                <CustomSelect
                  value={balance.leaveTypeId}
                  onChange={(v) => updateBalance(index, 'leaveTypeId', v)}
                  options={leaveTypes.map(type => ({
                    value: type.id,
                    label: type.name,
                  }))}
                  placeholder="Type"
                />
              </div>
              <div>
                <input
                  type="number"
                  value={balance.totalHours}
                  onChange={(e) => updateBalance(index, 'totalHours', e.target.value)}
                  placeholder="Hrs"
                  className="w-full rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  min="0.01"
                  step="any"
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