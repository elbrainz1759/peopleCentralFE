"use client";
import React, { useState } from "react";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { EyeIcon, EyeCloseIcon } from "@/icons";

export default function ChangePasswordForm() {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsSubmitting(true);
        try {
            await authService.changePassword({ newPassword });

            const stored = localStorage.getItem("auth_user");
            if (stored) {
                const user = JSON.parse(stored);
                user.passChanged = 1;
                localStorage.setItem("auth_user", JSON.stringify(user));
            }

            toast.success("Password updated successfully!");
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Failed to update password. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full">
            <div className="mb-6 text-center">
                <h1 className="mb-1 font-bold text-gray-900 text-xl dark:text-white sm:text-2xl tracking-tight">
                    Set New Password
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    You must change your default password before continuing.
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    {error && (
                        <div className="p-4 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 animate-in fade-in slide-in-from-top-1">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showNew ? "text" : "password"}
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                className="w-full rounded-xl border border-gray-200 bg-white/50 px-5 py-2.5 pr-12 text-gray-900 outline-none transition focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white"
                            />
                            <span
                                onClick={() => setShowNew((p) => !p)}
                                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                {showNew
                                    ? <EyeIcon className="w-5 h-5 fill-current" />
                                    : <EyeCloseIcon className="w-5 h-5 fill-current" />}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirm ? "text" : "password"}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full rounded-xl border border-gray-200 bg-white/50 px-5 py-2.5 pr-12 text-gray-900 outline-none transition focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white"
                            />
                            <span
                                onClick={() => setShowConfirm((p) => !p)}
                                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                {showConfirm
                                    ? <EyeIcon className="w-5 h-5 fill-current" />
                                    : <EyeCloseIcon className="w-5 h-5 fill-current" />}
                            </span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-xl bg-brand-500 py-3 text-base font-bold text-white shadow-lg shadow-brand-500/20 transition-all hover:bg-brand-600 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        {isSubmitting ? "Updating..." : "Set New Password"}
                    </button>
                </div>
            </form>
        </div>
    );
}
