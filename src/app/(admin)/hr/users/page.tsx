"use client";
import React, { useState } from "react";
import UserManagementForm from "@/components/auth/SignUpForm";
import UserTable from "@/components/users/UserTable";
import { Drawer } from "@/components/ui/drawer/Drawer";
import { PlusIcon } from "@/icons";

export default function UserManagementPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleUserAdded = () => {
    setIsDrawerOpen(false);
    // Force user table to refresh
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
              User Management
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage system permissions and administrator accounts
            </p>
          </div>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-600 hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusIcon className="w-5 h-5" />
            Add New User
          </button>
        </div>

        {/* User Table */}
        <div className="w-full">
          <UserTable />
        </div>
      </div>

      {/* Add User Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Create New User Account"
      >
        <div className="p-0 overflow-y-auto no-scrollbar h-full">
          <UserManagementForm onSuccess={handleUserAdded} />
        </div>
      </Drawer>
    </div>
  );
}
