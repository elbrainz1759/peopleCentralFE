"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { MoreDotIcon } from "@/icons";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { leaveServiceInstance } from "@/services/leave.service";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function LeaveTrendsChart() {
    const [monthlyCounts, setMonthlyCounts] = useState<number[]>(new Array(12).fill(0));
    const [isLoading, setIsLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const currentYear = new Date().getFullYear();
                const response = await leaveServiceInstance.getAllLeaves(1, 1000);
                const leaves: any[] = response?.data ?? (Array.isArray(response) ? response : []);

                const counts = new Array(12).fill(0);
                leaves.forEach((leave: any) => {
                    const date = new Date(leave.created_at);
                    if (date.getFullYear() === currentYear) {
                        counts[date.getMonth()]++;
                    }
                });
                setMonthlyCounts(counts);
            } catch (error) {
                console.error("Failed to fetch leave trends:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const options: ApexOptions = {
        colors: ["#D0202E"],
        chart: {
            fontFamily: "Outfit, sans-serif",
            type: "bar",
            height: 180,
            toolbar: { show: false },
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: "39%",
                borderRadius: 5,
                borderRadiusApplication: "end",
            },
        },
        dataLabels: { enabled: false },
        stroke: { show: true, width: 4, colors: ["transparent"] },
        xaxis: {
            categories: MONTHS,
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        legend: { show: true, position: "top", horizontalAlign: "left", fontFamily: "Outfit" },
        yaxis: { title: { text: undefined } },
        grid: { yaxis: { lines: { show: true } } },
        fill: { opacity: 1 },
        tooltip: {
            x: { show: false },
            y: { formatter: (val: number) => `${val} requests` },
        },
    };

    const series = [{ name: "Leave Requests", data: monthlyCounts }];

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Leave Trends</h3>
                    {!isLoading && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            {new Date().getFullYear()} · {monthlyCounts.reduce((a, b) => a + b, 0)} total requests
                        </p>
                    )}
                </div>
                <div className="relative inline-block">
                    <button onClick={() => setIsOpen(!isOpen)} className="dropdown-toggle">
                        <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
                    </button>
                    <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-40 p-2">
                        <DropdownItem
                            onItemClick={() => setIsOpen(false)}
                            className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                        >
                            View Reports
                        </DropdownItem>
                    </Dropdown>
                </div>
            </div>

            <div className="max-w-full overflow-x-auto custom-scrollbar">
                <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
                    {isLoading ? (
                        <div className="flex items-end gap-3 h-[180px] px-6 pb-6">
                            {MONTHS.map((m) => (
                                <div key={m} className="flex-1 flex flex-col items-center gap-1">
                                    <div className="w-full animate-pulse rounded bg-gray-100 dark:bg-gray-800" style={{ height: `${Math.random() * 80 + 40}px` }} />
                                    <span className="text-xs text-gray-300">{m}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <ReactApexChart options={options} series={series} type="bar" height={180} />
                    )}
                </div>
            </div>
        </div>
    );
}
