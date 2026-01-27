"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    value: string | number;
    subtext: string;
    icon: LucideIcon;
    trend?: number;
}

export function StatCard({
    title,
    value,
    subtext,
    icon: Icon,
    trend,
}: StatCardProps) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className="bg-slate-50 p-2.5 rounded-xl group-hover:bg-indigo-50 transition-colors">
                    <Icon className="h-5 w-5 text-slate-500 group-hover:text-indigo-600 transition-colors" />
                </div>
                {trend !== undefined && (
                    <span
                        className={cn(
                            "text-xs font-medium px-2 py-1 rounded-full",
                            trend > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                        )}
                    >
                        {trend > 0 ? "+" : ""}
                        {trend}%
                    </span>
                )}
            </div>
            <div>
                <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
                <div className="flex items-end space-x-2">
                    <span className="text-3xl font-bold text-slate-900 tracking-tight">
                        {value}
                    </span>
                    <span className="text-slate-400 text-sm mb-1">{subtext}</span>
                </div>
            </div>
        </div>
    );
}
