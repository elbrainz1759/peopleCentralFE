"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PlusIcon } from "@/icons";
import { Drawer } from "../ui/drawer/Drawer";
import MultiStepLeaveForm from "./MultiStepLeaveForm";
import { authService } from "@/services/auth.service";

export default function DashboardActions() {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [greeting, setGreeting] = useState("Good morning");
    const [dateStr, setDateStr] = useState("");
    const [userName, setUserName] = useState("there");

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good morning");
        else if (hour < 17) setGreeting("Good afternoon");
        else setGreeting("Good evening");

        const now = new Date();
        setDateStr(now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }));

        const user = authService.getCurrentUser();
        if (user?.first_name) setUserName(user.first_name);
        else if (user?.name) setUserName(user.name);
    }, []);

    return (
        <>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 px-6 py-7 md:px-8 md:py-8">
                {/* Decorative circles */}
                <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10" />
                <div className="pointer-events-none absolute -right-4 bottom-0 h-32 w-32 rounded-full bg-white/5" />
                <div className="pointer-events-none absolute left-1/2 top-0 h-24 w-24 -translate-x-1/2 rounded-full bg-white/5" />

                <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-white/70">{dateStr}</p>
                        <h1 className="mt-1 text-2xl font-bold text-white md:text-3xl">
                            {greeting}, {userName} 👋
                        </h1>
                        <p className="mt-1.5 text-sm text-white/70">
                            Here&apos;s what&apos;s happening with your team today.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => setIsDrawerOpen(true)}
                            className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-brand-600 shadow-md transition hover:bg-white/90 active:scale-[0.98]"
                        >
                            <PlusIcon className="w-4 h-4" />
                            Apply for Leave
                        </button>
                        <Link
                            href="/exit"
                            className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 active:scale-[0.98]"
                        >
                            Exit Request
                        </Link>
                    </div>
                </div>
            </div>

            <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="New Leave Request">
                <MultiStepLeaveForm onClose={() => setIsDrawerOpen(false)} />
            </Drawer>
        </>
    );
}
