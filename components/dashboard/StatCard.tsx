"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    value: string | number;
    subtext: string;
    icon: LucideIcon;
}

export function StatCard({
    title,
    value,
    subtext,
    icon: Icon,
}: StatCardProps) {
    return (
        <div className="bg-white dark:bg-[#1F1F1F] p-4 md:p-6 rounded-md border border-zinc-200 dark:border-white/5 dark:shadow-3xl hover:bg-zinc-50 dark:hover:bg-[#252527] hover:border-zinc-300 dark:hover:border-white/10 transition-all duration-300 group relative overflow-hidden backdrop-blur-md">
            {/* Subtle Gradient Glow */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-zinc-200/50 dark:bg-white/5 blur-2xl rounded-full group-hover:bg-zinc-300/50 dark:group-hover:bg-white/10 transition-all duration-500"></div>

            <div className="flex justify-between items-start mb-4 md:mb-6">
                <div className="bg-zinc-100 dark:bg-white/5 p-2 md:p-3 rounded-lg border border-zinc-200 dark:border-white/10 group-hover:scale-110 group-hover:bg-zinc-200 dark:group-hover:bg-white/10 transition-all duration-500">
                    <Icon className="h-4 w-4 md:h-5 md:w-5 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                </div>
            </div>

            <div className="space-y-1">
                <h3 className="text-zinc-500 dark:text-zinc-500 text-[10px] uppercase font-bold tracking-[0.15em]">{title}</h3>
                <div className="flex flex-col md:flex-row md:items-baseline md:space-x-3">
                    <span className="text-2xl md:text-4xl font-bold text-zinc-900 dark:text-white tracking-tighter">
                        {value}
                    </span>
                    <span className="text-zinc-500 dark:text-zinc-500 text-[10px] md:text-xs font-medium tracking-wide">{subtext}</span>
                </div>
            </div>
        </div>
    );
}
