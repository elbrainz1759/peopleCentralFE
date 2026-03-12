"use client";
import MultiStepLeaveForm from "@/components/hr/MultiStepLeaveForm";
import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ApplyForLeavePage() {
    const router = useRouter();

    const handleClose = () => {
        router.push("/");
    };

    return (
        <div>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-title-md2 font-bold text-black dark:text-white">
                    Apply For Leave
                </h2>
                <nav>
                    <ol className="flex items-center gap-2">
                        <li>
                            <Link className="font-medium" href="/">
                                Dashboard /
                            </Link>
                        </li>
                        <li className="font-medium text-brand-500">Apply for Leave</li>
                    </ol>
                </nav>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-default dark:border-gray-800 dark:bg-boxdark">
                {/* <!-- Sign In Form --> */}
                <MultiStepLeaveForm onClose={handleClose} />
            </div>
        </div>
    );
}
