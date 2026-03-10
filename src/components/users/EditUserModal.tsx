"use client";
import React, { useState, useEffect } from "react";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import { userService } from "@/services/user.service";
import { toast } from "react-hot-toast";
import { Modal } from "@/components/ui/modal";
import { Employee } from "@/types/service.types";
import { User } from "./UserTable";

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onSuccess: () => void;
}

export default function EditUserModal({ isOpen, onClose, user, onSuccess }: EditUserModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        role: "",
        password: "",
        status: "Active",
    });
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await userService.getAllEmployees();
                setEmployees(response.data || []);
            } catch (err) {
                console.error("Error fetching employees:", err);
            } finally {
                setIsLoadingEmployees(false);
            }
        };
        fetchEmployees();
    }, []);

    useEffect(() => {
        if (user) {
            setFormData({
                email: user.email || "",
                role: user.role || "",
                password: "", // Usually keep password blank for edits unless you want to change it
                status: user.status || "Active",
            });
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSubmitting(true);

        try {
            // Include password only if it's set
            const updateData: any = {
                email: formData.email,
                role: formData.role as 'User' | 'Admin' | 'Superadmin',
                status: formData.status,
            };

            if (formData.password) {
                updateData.password = formData.password;
            }

            await userService.updateUser(user.unique_id, updateData);

            toast.success('User account updated successfully!');
            onSuccess();
        } catch (err: any) {
            const message = err.message || 'Failed to update user';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] p-8">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                    Edit User Account
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Update user details and system permissions.
                </p>
            </div>

            <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="h-12 w-12 flex items-center justify-center rounded-full bg-brand-500/10 text-brand-500 font-bold text-lg uppercase">
                    {(user.first_name?.[0] || "") + (user.last_name?.[0] || user.email[0])}
                </div>
                <div>
                    <h3 className="font-bold text-gray-800 dark:text-white">
                        {user.first_name ? `${user.first_name} ${user.last_name}` : 'System User'}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate max-w-[200px]">
                        {user.email}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                        <option value="">{isLoadingEmployees ? "Loading..." : "Select Employee"}</option>
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
                    <Label>Account Status</Label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-700 transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300"
                    >
                        <option value="Active">Active</option>
                        <option value="Suspended">Suspended</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>

                <div>
                    <Label>New Password (Optional)</Label>
                    <div className="relative">
                        <Input
                            placeholder="Keep empty to leave unchanged"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                        />
                        <span
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeIcon size={20} /> : <EyeCloseIcon size={20} />}
                        </span>
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-3 text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-all shadow-lg shadow-brand-500/25 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                <span>Updating...</span>
                            </div>
                        ) : "Update Account"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
