"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "@/icons";

export interface SelectOption {
  value: string | number;
  label: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value?: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function CustomSelect({
  options,
  value = "",
  onChange,
  placeholder = "Select an option",
  disabled = false,
  className = "",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => String(o.value) === String(value));

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        disabled={disabled}
        className={`flex h-11 w-full items-center justify-between rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs transition focus:outline-none focus:ring-3
          ${
            disabled
              ? "cursor-not-allowed bg-gray-50 text-gray-400 border-gray-200 dark:bg-gray-800 dark:border-gray-700"
              : "cursor-pointer bg-white border-gray-300 hover:border-brand-300 focus:border-brand-300 focus:ring-brand-500/10 dark:bg-gray-900 dark:border-gray-700 dark:hover:border-brand-800"
          }
          ${isOpen ? "border-brand-300 ring-3 ring-brand-500/10 dark:border-brand-800" : ""}
        `}
      >
        <span
          className={
            selectedOption
              ? "text-gray-800 dark:text-white/90"
              : "text-gray-400 dark:text-gray-500"
          }
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDownIcon
          className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <ul className="absolute z-[9999] mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
          {options.length === 0 ? (
            <li className="px-4 py-2 text-sm text-gray-400">No options</li>
          ) : (
            options.map((option) => (
              <li
                key={option.value}
                onClick={() => {
                  onChange(String(option.value));
                  setIsOpen(false);
                }}
                className={`cursor-pointer px-4 py-2 text-sm transition-colors
                  ${
                    String(option.value) === String(value)
                      ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                      : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                  }
                `}
              >
                {option.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
