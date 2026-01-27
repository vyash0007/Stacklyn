"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityItemProps {
    title: string;
    user: string;
    time: string;
    status: "success" | "warning" | "error";
}

export function ActivityItem({
    title,
    user,
    time,
    status,
}: ActivityItemProps) {
    return (
        <div className="flex items-start space-x-4 p-4 hover:bg-slate-50 rounded-xl transition-colors border-b border-slate-50 last:border-0">
            <div
                className={cn(
                    "mt-1.5 h-2 w-2 rounded-full",
                    status === "success"
                        ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                        : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                )}
            ></div>
            <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">{title}</p>
                <div className="flex items-center mt-1 space-x-2">
                    <span className="text-xs text-slate-500">{user}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-400">{time}</span>
                </div>
            </div>
            <button className="text-slate-400 hover:text-slate-600">
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
}
