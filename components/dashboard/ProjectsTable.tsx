"use client";

import { MoreHorizontal, Folder, GitBranch, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Project } from "@/types";

interface ProjectsTableProps {
    projects: Project[];
}

export function ProjectsTable({ projects }: ProjectsTableProps) {
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="bg-[#1F1F1F] rounded-md border border-white/5 shadow-3xl overflow-hidden backdrop-blur-md">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-white/[0.02] border-b border-white/5 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] items-center">
                <div className="col-span-6">Project Name</div>
                <div className="col-span-3">Created On</div>
                <div className="col-span-3">Collaboration</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-white/[0.05] min-h-[320px]">
                {projects.length > 0 ? (
                    projects.slice(0, 5).map((project) => (
                        <Link
                            key={project.id}
                            href={`/workspace/projects/${project.id}`}
                            className="grid grid-cols-12 gap-4 px-6 py-5 hover:bg-white/[0.04] transition-all duration-300 items-center group relative overflow-hidden"
                        >
                            {/* Accent line on hover */}
                            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-white opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            {/* Project Info */}
                            <div className="col-span-6 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 group-hover:text-white transition-all duration-500 group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                    <Folder className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold text-white group-hover:text-zinc-200 transition-colors truncate">
                                            {project.name}
                                        </p>
                                        <ArrowUpRight className="h-3 w-3 text-zinc-700 opacity-0 group-hover:opacity-100 transition-all transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                    </div>
                                    <p className="text-xs text-zinc-500 truncate mt-0.5 font-medium">
                                        {project.description || "Experimental LLM Work"}
                                    </p>
                                </div>
                            </div>

                            {/* Created Date */}
                            <div className="col-span-3">
                                <p className="text-xs font-medium text-zinc-400">
                                    {formatDate(project.created_at)}
                                </p>
                            </div>

                            {/* Shared With */}
                            <div className="col-span-3">
                                <div className="flex items-center gap-2">
                                    {project.members && project.members.length > 0 ? (
                                        <>
                                            <div className="flex -space-x-2">
                                                {project.members.slice(0, 3).map((member, idx) => {
                                                    const imageUrl = member.users?.image_url || member.users?.avatar_url || member.users?.profile_image_url;
                                                    const initials = member.users?.name?.substring(0, 2).toUpperCase() ||
                                                        member.users?.email?.substring(0, 2).toUpperCase() || "??";
                                                    return (
                                                        <div
                                                            key={member.user_id || idx}
                                                            className="w-7 h-7 rounded-full border-2 border-[#0B0D13] overflow-hidden bg-zinc-800"
                                                        >
                                                            {imageUrl ? (
                                                                <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-zinc-400">
                                                                    {initials}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            {project.members.length > 3 && (
                                                <span className="text-[10px] font-bold text-zinc-500">
                                                    +{project.members.length - 3}
                                                </span>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                                            Private
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="px-6 py-12 text-center text-zinc-600 text-sm flex flex-col items-center justify-center h-full space-y-3">
                        <Folder className="h-8 w-8 opacity-20" />
                        <p className="font-medium tracking-wide">Secure your first project to begin</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            {projects.length > 0 && (
                <div className="px-6 py-4 bg-white/[0.01] border-t border-white/[0.08] flex items-center justify-between text-[11px] text-zinc-500 font-medium">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Showing {Math.min(projects.length, 5)} active workspaces
                    </div>
                    <Link
                        href="/workspace/projects"
                        className="text-zinc-400 hover:text-white font-bold flex items-center gap-2 transition-colors uppercase tracking-widest"
                    >
                        Project Directory
                        <ArrowUpRight className="h-3 w-3" />
                    </Link>
                </div>
            )}
        </div>
    );
}
