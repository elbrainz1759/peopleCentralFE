"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen, isMobile } = useSidebar();

  const sidebarWidth = isExpanded || isHovered ? 290 : 90;

  return (
    <div className="min-h-screen">
      <AppSidebar />
      <Backdrop />
      <div
        className="flex-1 transition-all duration-300 ease-in-out"
        style={{
          marginLeft: isMobile ? 0 : `${sidebarWidth}px`,
        }}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-screen-2xl md:p-6">{children}</div>
      </div>
    </div>
  );
}
