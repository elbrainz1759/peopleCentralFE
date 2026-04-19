"use client";
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'flatpickr/dist/flatpickr.css';
import Label from './Label';
import { CalenderIcon } from '../../icons';

// Dynamically import Flatpickr to avoid SSR issues
const Flatpickr = dynamic(() => import('react-flatpickr'), {
  ssr: false,
  loading: () => (
    <div className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800">
      Loading...
    </div>
  ),
});

type PropsType = {
  id: string;
  mode?: "single" | "multiple" | "range" | "time";
  onChange?: (selectedDates: Date[], dateStr: string, instance: any) => void;
  value?: Date | string | null;
  label?: string;
  placeholder?: string;
};

export default function DatePicker({
  id,
  mode,
  onChange,
  value,
  label,
  placeholder,
}: PropsType) {
  // Only run on client side
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Convert string to Date if needed
  const dateValue = value ? (typeof value === 'string' ? new Date(value) : value) : null;

  const handleChange = (selectedDates: Date[], dateStr: string, instance: any) => {
    console.log("DatePicker onChange:", selectedDates, dateStr);
    if (onChange) {
      onChange(selectedDates, dateStr, instance);
    }
  };

  if (!isClient) {
    return (
      <div>
        {label && <Label htmlFor={id}>{label}</Label>}
        <div className="relative">
          <input
            id={id}
            placeholder={placeholder || "YYYY-MM-DD"}
            className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30  bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700  dark:focus:border-brand-800"
            readOnly
          />
          <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
            <CalenderIcon className="size-6" />
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative">
        <Flatpickr
          id={id}
          value={dateValue || undefined}
          onChange={handleChange}
          options={{
            mode: mode || "single",
            static: false,
            monthSelectorType: "static",
            dateFormat: "Y-m-d",
            position: "auto left",
            appendTo: typeof window !== 'undefined' ? document.body : undefined,
          }}
          placeholder={placeholder || "YYYY-MM-DD"}
          className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30  bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700  dark:focus:border-brand-800"
        />

        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          <CalenderIcon className="size-6" />
        </span>
      </div>
    </div>
  );
}
