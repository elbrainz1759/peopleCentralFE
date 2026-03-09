"use client";
import React, { useState } from "react";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import { authService } from "@/services/auth.service";
import { userService } from "@/services/user.service";
import { Employee } from "@/types/service.types";
import { toast } from "react-hot-toast";
import { useEffect } from "react";

export default function UserManagementForm({ onSuccess }: { onSuccess?: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    role: "",
    password: "",
  });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await userService.getAllEmployees();
        setEmployees(response.data || []);
      } catch (err) {
        console.error("Error fetching employees:", err);
        toast.error("Failed to load employees list");
      } finally {
        setIsLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await authService.register({
        email: formData.email,
        password: formData.password,
        role: formData.role as 'User' | 'Admin' | 'Superadmin',
      });

      toast.success('User account created successfully!');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const message = err.message || 'Failed to create user';
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 p-6">
      <div className="w-full max-w-lg mx-auto overflow-y-auto no-scrollbar pb-10">
        <div className="mb-8">
          <h1 className="mb-2 font-bold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            New User Account
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create a new administrator or staff account using email, role, and a temporary password.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {error && (
              <div className="p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                {error}
              </div>
            )}

            <div>
              <Label>Select Employee (Email)<span className="text-error-500">*</span></Label>
              <select
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-700 transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300"
                required
                disabled={isLoadingEmployees}
              >
                <option value="">{isLoadingEmployees ? "Loading employees..." : "Select Employee"}</option>
                {employees.map((emp) => (
                  <option key={emp.unique_id || String(emp.id)} value={emp.email}>
                    {emp.first_name} {emp.last_name} ({emp.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>User Role<span className="text-error-500">*</span></Label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-700 transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300"
                required
              >
                <option value="">Select Role</option>
                <option value="User">User</option>
                <option value="Admin">Admin</option>
                <option value="Superadmin">Superadmin</option>
              </select>
            </div>

            <div>
              <Label>Temporary Password<span className="text-error-500">*</span></Label>
              <div className="relative">
                <Input
                  placeholder="Minimum 8 characters"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeIcon size={20} /> : <EyeCloseIcon size={20} />}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
              <Checkbox
                className="w-5 h-5"
                checked={isChecked}
                onChange={setIsChecked}
              />
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
                Send a secure welcome email with these login credentials to the user immediately.
              </p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center w-full px-4 py-4 text-sm font-bold text-white transition-all rounded-xl bg-brand-500 shadow-lg shadow-brand-500/25 hover:bg-brand-600 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Processing...</span>
                  </div>
                ) : "Create User Account"}
              </button>
            </div>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs font-normal text-center text-gray-500 dark:text-gray-400">
            This action will register a new user using the auth service. The user must use these credentials to sign in.
          </p>
        </div>
      </div>
    </div>
  );
}
