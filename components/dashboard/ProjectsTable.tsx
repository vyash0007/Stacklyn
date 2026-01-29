"use client";

import { MoreHorizontal, Folder } from "lucide-react";
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
        <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-100 text-xs font-medium text-slate-500 uppercase tracking-wider">
                <div className="col-span-5">Project</div>
                <div className="col-span-3">Created</div>
                <div className="col-span-3">Shared</div>
                <div className="col-span-1"></div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-100 min-h-[280px]">
                {projects.length > 0 ? (
                    projects.slice(0, 5).map((project) => (
                        <Link
                            key={project.id}
                            href={`/workspace/projects/${project.id}`}
                            className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors items-center group"
                        >
                            {/* Project Info */}
                            <div className="col-span-5 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 flex-shrink-0">
                                    <Folder className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-slate-900 truncate group-hover:text-slate-700 transition-colors">
                                        {project.name}
                                    </p>
                                    <p className="text-xs text-slate-400 truncate">
                                        {project.description || "No description"}
                                    </p>
                                </div>
                            </div>

                            {/* Created Date */}
                            <div className="col-span-3">
                                <p className="text-sm text-slate-600">
                                    {formatDate(project.created_at)}
                                </p>
                            </div>

                            {/* Shared With */}
                            <div className="col-span-3">
                                <div className="flex items-center gap-1.5">
                                    {project.members && project.members.length > 0 ? (
                                        <>
                                            {project.members.slice(0, 4).map((member, idx) => {
                                                const imageUrl = member.users?.image_url || member.users?.avatar_url || member.users?.profile_image_url;
                                                const initials = member.users?.name?.substring(0, 2).toUpperCase() ||
                                                               member.users?.email?.substring(0, 2).toUpperCase() || "??";
                                                const userName = member.users?.name || member.users?.email || "Unknown";
                                                return (
                                                    <div
                                                        key={member.user_id || idx}
                                                        className="relative group/avatar"
                                                    >
                                                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium overflow-hidden ring-1 ring-slate-200">
                                                            {imageUrl ? (
                                                                <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600">
                                                                    {initials}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-slate-900 text-white text-[10px] rounded whitespace-nowrap opacity-0 invisible group-hover/avatar:opacity-100 group-hover/avatar:visible transition-all z-10">
                                                            {userName}
                                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {project.members.length > 4 && (
                                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-medium text-slate-500 ring-1 ring-slate-200">
                                                    +{project.members.length - 4}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <span className="text-sm text-slate-400">Only you</span>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="col-span-1 flex justify-end">
                                <button
                                    onClick={(e) => e.preventDefault()}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </button>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="px-6 py-8 text-center text-slate-400 text-sm flex items-center justify-center h-full">
                        No projects yet
                    </div>
                )}
            </div>

            {/* Footer */}
            {projects.length > 0 && (
                <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Showing {Math.min(projects.length, 5)} of {projects.length} projects</span>
                    <Link
                        href="/workspace/projects"
                        className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
                    >
                        View all projects
                        <span>&rarr;</span>
                    </Link>
                </div>
            )}
        </div>
    );
}
