"use client";

import { ChevronRight, User, Terminal, GitBranch, Sparkles } from "lucide-react";
import Link from "next/link";

interface ActivityItemProps {
    title: string;
    user: string;
    userImage?: string;
    time: string;
    fullTime?: string;
    entityType?: string;
    entityId?: string;
    projectId?: string;
}

export function ActivityItem({
    title,
    user,
    userImage,
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

    const getEntityIcon = () => {
        switch (entityType) {
            case 'prompt': return <Terminal className="h-3 w-3 text-zinc-500" />;
            case 'commit': return <GitBranch className="h-3 w-3 text-zinc-500" />;
            case 'run': return <Sparkles className="h-3 w-3 text-zinc-500" />;
            default: return <User className="h-3 w-3 text-zinc-500" />;
        }
    };

    return (
        <div className="group flex items-center justify-between gap-3 py-3 border-b border-white/[0.03] last:border-0 hover:opacity-100 transition-all duration-300">
            <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* User Avatar */}
                <div className="shrink-0">
                    <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden bg-zinc-900 flex items-center justify-center text-[10px] font-bold text-zinc-500 uppercase shadow-inner">
                        {userImage ? (
                            <img src={userImage} alt={user} className="w-full h-full object-cover" />
                        ) : (
                            user.charAt(0)
                        )}
                    </div>
                </div>

                <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-200 truncate max-w-[100px] xs:max-w-[150px] md:max-w-[120px]">
                            {user}
                        </span>
                        <div className="shrink-0 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all scale-75">
                            {getEntityIcon()}
                        </div>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-medium truncate max-w-[150px] xs:max-w-[200px] md:max-w-[180px] group-hover:text-zinc-400 transition-colors">
                        {title}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-700 whitespace-nowrap group-hover:text-zinc-500 transition-colors">
                    {time}
                </span>
                {link && (
                    <Link href={link} className="shrink-0 mt-0.5">
                        <ChevronRight className="h-3.5 w-3.5 text-zinc-800 group-hover:text-white transition-all" />
                    </Link>
                )}
            </div>
        </div>
    );
}
