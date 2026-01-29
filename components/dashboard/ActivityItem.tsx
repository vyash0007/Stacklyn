"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface ActivityItemProps {
    title: string;
    user: string;
    time: string;
    fullTime?: string;
    entityType?: string;
    entityId?: string;
    projectId?: string;
}

export function ActivityItem({
    title,
    user,
    time,
    fullTime,
    entityType,
    entityId,
    projectId,
}: ActivityItemProps) {
    // Generate link based on entity type
    const getEntityLink = () => {
        if (!entityType || !entityId) return null;
        switch (entityType) {
            case 'project':
                return `/workspace/projects/${entityId}`;
            case 'prompt':
                return `/prompts/${entityId}`;
            case 'commit':
            case 'run':
                return projectId ? `/workspace/projects/${projectId}` : null;
            default:
                return null;
        }
    };

    const link = getEntityLink();

    return (
        <div className="mb-3 last:mb-0">
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-700">
                    <span className="text-[#4F46E5] font-semibold hover:underline cursor-pointer">
                        {user}
                    </span>
                    {" "}
                    <span>{title}</span>
                </p>
                {link ? (
                    <Link href={link}>
                        <button className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </Link>
                ) : (
                    <button className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                        <ChevronRight className="h-4 w-4" />
                    </button>
                )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{fullTime || time}</p>
        </div>
    );
}
