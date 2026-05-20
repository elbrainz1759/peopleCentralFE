"use client";
import React, { useState, useEffect } from "react";
import {Employee} from "@/types/service.types";
import { userService } from "@/services/user.service";
import { toast } from "react-hot-toast";

type ApproveEmployeeProps = {
    employee: Employee;
    onSuccess: () => void;

};
    
export default function ApproveEmployee({ employee, onSuccess}: ApproveEmployeeProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [supervisorEmail, setSupervisorEmail] = useState(""); 
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setisLoading] = useState(false);
    const [role, setRole] = useState("");
    const [roles, setRoles] = useState<any[]>([]);

    useEffect(() => {
        Promise.all([
        userService.getAllEmployees(),
        userService.getAllRoles()])
        .then(([empsRes, rolesRes]) => {
            setEmployees(empsRes.data || []);
            setRoles(Array.isArray(rolesRes) ? rolesRes :(rolesRes as any)?.data || []);
        })
        .catch(() => toast.error("Failed to load employees or roles"))
        .finally(() => setisLoading(false));
    }, []);

   

    const handleApprove = async () => {
        setIsSubmitting(true);
        setError(null);

        try{

            await userService.approveEmployee({
                email: employee.email,
                role: role,
                supervisorEmail: supervisorEmail
            });
            toast.success("Employee approved successfully");
            onSuccess();
        } catch (err: any) {
            const errorMessage = err.message || "Failed to approve employee. Please try again.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };


return (

    <div className="p-6 space-y-6">
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Approve Employee</h3>
            <p className="text-gray-500 dark:text-gray-400">
                {employee.first_name} {employee.last_name} 
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{employee.email}</p>
           {error && (
    <div className="p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 flex items-center gap-3">
        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse flex-shrink-0"></div>
        {error}
    </div>
)}

        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Supervisor <span className="text-red-500">*</span>
            </label>
            <select
                value={supervisorEmail}
                onChange={(e) => setSupervisorEmail(e.target.value)}
                className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-700 transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300"
                required
            >
                <option value="">Select Supervisor</option>
                {employees.map((emp) => (
                    <option key={emp.unique_id} value={emp.email}>
                        {emp.first_name} {emp.last_name} ({emp.email})
                    </option>
                ))}
            </select>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role <span className="text-red-500">*</span>
            </label>
            <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-700 transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300"
                required
            >
                <option value="">Select Role</option>
                {roles.map((r: any) => (
                    <option key={r.unique_id || r.id} value={r.name}>
                        {r.name}
                    </option>
                ))}
            </select>
        </div>
        <button
            onClick={handleApprove}
            disabled={isSubmitting}
            className="flex items-center justify-center w-full px-4 py-4 text-sm font-bold text-white transition-all rounded-xl bg-brand-500 shadow-lg shadow-brand-500/25 hover:bg-brand-600 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
            <div className="flex items-center g-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2  boeder-t-transparent"> </div>
                <span className="ml-2">Approving...</span>
            </div>
        ) : "Approve Employee"}
        </button>
    </div>
    
    
);
}
