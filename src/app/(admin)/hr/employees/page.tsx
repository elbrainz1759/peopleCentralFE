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
