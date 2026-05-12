"use client";
import React from "react";
import { Modal } from "@/components/ui/modal";

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "default";
    isLoading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "default",
    isLoading = false,
    onConfirm,
    onCancel,
}) => {
    const confirmClasses =
        variant === "danger"
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "bg-brand-500 hover:bg-brand-600 text-white";

    return (
        <Modal
            isOpen={isOpen}
            onClose={isLoading ? () => undefined : onCancel}
            showCloseButton={false}
            className="max-w-md mx-4"
        >
            <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {title}
                </h3>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {message}
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 ${confirmClasses}`}
                    >
                        {isLoading && (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        )}
                        {isLoading ? "Processing..." : confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
