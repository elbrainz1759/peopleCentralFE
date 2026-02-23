"use client";
import React, { useState } from "react";
import EmployeeTable from "@/components/hr/EmployeeTable";
import AddEmployeeForm from "@/components/hr/AddEmployeeForm";
import { Drawer } from "@/components/ui/drawer/Drawer";

export default function EmployeePage() {
    const [isAddOpen, setIsAddOpen] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Employee Database
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Maintain and update staff information across departments.
                    </p>
                </div>

                <button
                    onClick={() => setIsAddOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add New Employee
                </button>
            </div>

            <EmployeeTable />

            <Drawer
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                title="Add New Employee"
            >
                <div className="p-6">
                    <AddEmployeeForm onSuccess={() => setIsAddOpen(false)} />
                </div>
            </Drawer>
        </div>
    );
}
