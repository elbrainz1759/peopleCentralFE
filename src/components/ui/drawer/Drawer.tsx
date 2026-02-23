"use client";
import React, { useEffect, useRef } from "react";
import { CloseIcon } from "@/icons";

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    width?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
    isOpen,
    onClose,
    title,
    children,
    width = "w-full md:w-[500px]",
}) => {
    const drawerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    return (
        <div
            className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
                }`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Drawer Content */}
            <div
                ref={drawerRef}
                className={`relative h-full bg-white dark:bg-gray-900 shadow-xl transition-transform duration-300 transform ${width
                    } ${isOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                            {title}
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                        >
                            <CloseIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-6">{children}</div>
                </div>
            </div>
        </div>
    );
};
