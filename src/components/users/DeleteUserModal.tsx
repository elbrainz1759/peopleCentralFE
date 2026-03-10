"use client";
import React, { useState } from "react";
import { userService } from "@/services/user.service";
import { toast } from "react-hot-toast";
import { Modal } from "@/components/ui/modal";
import { TrashBinIcon } from "@/icons";
import { User } from "./UserTable";

interface DeleteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onSuccess: () => void;
}

export default function DeleteUserModal({ isOpen, onClose, user, onSuccess }: DeleteUserModalProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!user) return;

        setIsDeleting(true);

        try {
            await userService.deleteUser(user.unique_id);
            toast.success(`User account for ${user.email} has been deleted`);
            onSuccess();
        } catch (err: any) {
            const message = err.message || 'Failed to delete user';
            toast.error(message);
        } finally {
            setIsDeleting(false);
        }
    };

    if (!user) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[450px] p-8">
            <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-500">
                    <TrashBinIcon className="h-8 w-8" />
                </div>
                
                <h2 className="mb-2 text-xl font-bold text-gray-800 dark:text-white">
                    Delete User Account?
                </h2>
                
                <p className="mb-8 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    Are you sure you want to delete the account for <span className="font-semibold text-gray-700 dark:text-gray-200">{user.first_name} {user.last_name}</span> ({user.email})? 
                    <br />
                    This action is permanent and cannot be undone.
                </p>

                <div className="flex w-full gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-3 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all shadow-lg shadow-red-500/25 disabled:opacity-50"
                    >
                        {isDeleting ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                <span>Deleting...</span>
                            </div>
                        ) : "Yes, Delete User"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
