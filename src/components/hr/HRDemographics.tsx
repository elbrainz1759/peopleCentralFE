"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useState } from "react";
import { MoreDotIcon } from "@/icons";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
    ssr: false,
});

export default function HRDemographics() {
    const [isOpen, setIsOpen] = useState(false);

    function toggleDropdown() {
        setIsOpen(!isOpen);
    }

    function closeDropdown() {
        setIsOpen(false);
    }

    const series = [44, 55, 41];

    const options: ApexOptions = {
        colors: ["#D0202E", "#FF7F7F", "#FCA5A5"],
        chart: {
            fontFamily: "Outfit, sans-serif",
            type: "donut",
            width: 380,
        },
        labels: ["Operations", "Finance", "HR"],
        legend: {
            show: false,
            position: "bottom",
        },
        plotOptions: {
            pie: {
                donut: {
                    size: "65%",
                    labels: {
                        show: true,
                        name: {
                            show: true,
                        },
                        value: {
                            show: true,
                            fontSize: "20px",
                            fontWeight: "600",
                        },
                        total: {
                            show: true,
                            label: "Staff",
                            color: "#64748B",
                            formatter: function (w) {
                                return w.globals.seriesTotals.reduce((a: number, b: number) => {
                                    return a + b;
                                }, 0);
                            },
                        },
                    },
                },
            },
        },
        dataLabels: {
            enabled: false,
        },
        responsive: [
            {
                breakpoint: 2600,
                options: {
                    chart: {
                        width: 380,
                    },
                },
            },
            {
                breakpoint: 640,
                options: {
                    chart: {
                        width: 200,
                    },
                },
            },
        ],
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
            <div className="flex justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Staff Distribution
                    </h3>
                    <p className="mt-1 text-gray-500 text-theme-xs dark:text-gray-400">
                        By Department
                    </p>
                </div>

                <div className="relative inline-block">
                    <button onClick={toggleDropdown} className="dropdown-toggle">
                        <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
                    </button>
                    <Dropdown
                        isOpen={isOpen}
                        onClose={closeDropdown}
                        className="w-40 p-2"
                    >
                        <DropdownItem
                            onItemClick={closeDropdown}
                            className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                        >
                            View More
                        </DropdownItem>
                        <DropdownItem
                            onItemClick={closeDropdown}
                            className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                        >
                            Download
                        </DropdownItem>
                    </Dropdown>
                </div>
            </div>

            <div className="flex items-center justify-center">
                <ReactApexChart options={options} series={series} type="donut" />
            </div>

            <div className="flex flex-col gap-4 mt-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="block w-4 h-4 rounded-full bg-[#D0202E]"></span>
                        <span className="text-gray-600 text-theme-sm dark:text-gray-400">
                            Operations
                        </span>
                    </div>
                    <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        44%
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="block w-4 h-4 rounded-full bg-[#FF7F7F]"></span>
                        <span className="text-gray-600 text-theme-sm dark:text-gray-400">
                            Finance
                        </span>
                    </div>
                    <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        55%
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="block w-4 h-4 rounded-full bg-[#FCA5A5]"></span>
                        <span className="text-gray-600 text-theme-sm dark:text-gray-400">
                            HR
                        </span>
                    </div>
                    <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        41%
                    </span>
                </div>
            </div>
        </div>
    );
}
