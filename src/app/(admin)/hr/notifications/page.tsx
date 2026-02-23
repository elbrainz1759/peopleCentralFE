import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import NotificationTrackerTable from "@/components/hr/NotificationTrackerTable";

export default function NotificationTrackerPage() {
    return (
        <div className="min-h-screen">
            <PageBreadcrumb pageTitle="Notification Tracker" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Contract Renewal Tracker</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Monitor employee contract durations and take timely action on renewals.
                    </p>
                </div>

                <NotificationTrackerTable />
            </div>
        </div>
    );
}
