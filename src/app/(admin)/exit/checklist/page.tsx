"use client";
import ChecklistItemsManager from "@/components/exit/ChecklistItemsManager";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ExitChecklistPage() {
    const router = useRouter();
    const [allowed, setAllowed] = useState<boolean | null>(null);

    useEffect(() => {
        try {
            const raw = localStorage.getItem('auth_user');
            const token = localStorage.getItem('auth_token');
            let user: any = raw ? JSON.parse(raw) : {};
            if (token) {
                try { user = { ...user, ...JSON.parse(atob(token.split('.')[1])) }; } catch { /* ignore */ }
            }
            const role = (user?.role || user?.designation || "").toLowerCase();
            const isHR = role.includes('hr') || role.includes('admin') || role.includes('superadmin');
            setAllowed(isHR);
            if (!isHR) router.replace('/dashboard');
        } catch {
            setAllowed(false);
            router.replace('/dashboard');
        }
    }, []);

    if (allowed === null) return null;
    if (!allowed) return null;

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Exit Checklist Management
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Add and manage checklist items per department. These items will appear during exit clearance approvals.
                </p>
            </div>
            <ChecklistItemsManager />
        </div>
    );
}
