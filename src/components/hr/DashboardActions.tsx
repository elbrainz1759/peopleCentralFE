"use client";

import React, { useState } from "react";
import { PlusIcon } from "@/icons";
import { Drawer } from "../ui/drawer/Drawer";
import MultiStepLeaveForm from "./MultiStepLeaveForm";

export default function DashboardActions() {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const openDrawer = () => setIsDrawerOpen(true);
    const closeDrawer = () => setIsDrawerOpen(false);

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    Overview
                </h2>
                <button
                    onClick={openDrawer}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                >
                    <PlusIcon className="w-5 h-5" />
                    Apply for Leave
                </button>
            </div>

            <Drawer
                isOpen={isDrawerOpen}
                onClose={closeDrawer}
                title="New Leave Request"
            >
                <MultiStepLeaveForm onClose={closeDrawer} />
            </Drawer>
        </>
    );
}
