"use client";

import { MoreHorizontal, Folder, GitBranch, ArrowUpRight, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { Project } from "@/types";

interface ProjectsTableProps {
    projects: Project[];
    limit?: number;
    showFooter?: boolean;
    onDelete?: (id: string, name: string, e: React.MouseEvent) => void;
    showPagination?: boolean;
    projectSource?: 'personal' | 'shared';
}

export function ProjectsTable({ projects, limit = 5, showFooter = true, onDelete, showPagination = false, projectSource }: ProjectsTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const totalPages = Math.ceil(projects.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProjects = showPagination
        ? projects.slice(startIndex, startIndex + itemsPerPage)
        : projects.slice(0, limit);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="bg-white dark:bg-[#1F1F1F] rounded-md border border-zinc-200 dark:border-white/5 dark:shadow-3xl overflow-hidden backdrop-blur-md">
            {/* Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-zinc-50 dark:bg-white/[0.02] border-b border-zinc-200 dark:border-white/5 text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-[0.2em] items-center">
                <div className="col-span-6">Project Name</div>
                <div className="col-span-3">Created On</div>
                <div className="col-span-3">Collaboration</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-zinc-100 dark:divide-white/[0.05] min-h-[320px]">
                {projects.length > 0 ? (
                    paginatedProjects.map((project) => (
                        <Link
                            key={project.id}
                            href={`/workspace/projects/${project.id}`}
                            className="flex flex-col md:grid md:grid-cols-12 gap-4 px-6 py-5 hover:bg-zinc-50 dark:hover:bg-white/[0.04] transition-all duration-300 md:items-center group relative overflow-hidden"
                        >
                            {/* Accent line on hover */}
                            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-zinc-900 dark:bg-white opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            {/* Project Info */}
                            <div className="md:col-span-6 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-md bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-all duration-500 group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                    <Folder className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors truncate">
                                            {project.name}
                                        </p>
                                        <ArrowUpRight className="h-3 w-3 text-zinc-400 dark:text-zinc-700 opacity-0 group-hover:opacity-100 transition-all transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                    </div>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-500 truncate mt-0.5 font-medium">
                                        {project.description || "Experimental LLM Work"}
                                    </p>
                                </div>
                            </div>

                            {/* Created Date */}
                            <div className="md:col-span-3 flex items-center gap-2 md:block">
                                <span className="text-[10px] md:hidden font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">Created:</span>
                                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                    {formatDate(project.created_at)}
                                </p>
                            </div>

                            {/* Shared With & Actions */}
                            <div className="md:col-span-3 flex items-center justify-between mt-2 md:mt-0">
                                <div className="flex items-center gap-2">
                                    {/* Source Badge - use project.type if available, otherwise fall back to projectSource prop */}
                                    {(() => {
                                        const badgeType = (project as any).type || projectSource;
                                        if (!badgeType) return null;
                                        return (
                                            <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${badgeType === 'personal'
                                                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20'
                                                    : 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20'
                                                }`}>
                                                {badgeType === 'personal' ? 'Personal' : 'Shared'}
                                            </div>
                                        );
                                    })()}
                                    {/* Member avatars - only show when projectSource is 'shared' (on shared tab) */}
                                    {projectSource === 'shared' && project.members && project.members.length > 0 && (
                                        <>
                                            <div className="flex -space-x-2">
                                                {project.members.slice(0, 3).map((member, idx) => {
                                                    const imageUrl = member.users?.image_url || member.users?.avatar_url || member.users?.profile_image_url;
                                                    const initials = member.users?.name?.substring(0, 2).toUpperCase() ||
                                                        member.users?.email?.substring(0, 2).toUpperCase() || "??";
                                                    return (
                                                        <div
                                                            key={member.user_id || idx}
                                                            className="w-7 h-7 rounded-full border-2 border-white dark:border-[#0B0D13] overflow-hidden bg-zinc-200 dark:bg-zinc-800"
                                                        >
                                                            {imageUrl ? (
                                                                <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
                                                                    {initials}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            {project.members.length > 3 && (
                                                <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500">
                                                    +{project.members.length - 3}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </div>

                                {onDelete && (
                                    <button
                                        onClick={(e) => onDelete(project.id, project.name, e)}
                                        className="p-2 text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 rounded-md transition-all opacity-0 group-hover:opacity-100 mr-2"
                                        title="Delete Project"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="px-6 py-12 text-center text-zinc-400 dark:text-zinc-600 text-sm flex flex-col items-center justify-center h-full space-y-3">
                        <Folder className="h-8 w-8 opacity-20" />
                        <p className="font-medium tracking-wide">Secure your first project to begin</p>
                    </div>
                )}
            </div>

            {/* Footer / Pagination */}
            {showFooter && projects.length > 0 && !showPagination && (
                <div className="px-6 py-4 bg-zinc-50 dark:bg-white/[0.01] border-t border-zinc-200 dark:border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500 dark:text-zinc-500 font-medium">
                    <div className="flex items-center gap-2 self-start sm:self-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Showing {Math.min(projects.length, limit)} active workspaces
                    </div>
                    <Link
                        href="/workspace/projects"
                        className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-bold flex items-center gap-2 transition-colors uppercase tracking-widest self-end sm:self-center"
                    >
                        Project Directory
                        <ArrowUpRight className="h-3 w-3" />
                    </Link>
                </div>
            )}

            {showPagination && totalPages > 1 && (
                <div className="px-6 py-4 bg-zinc-50 dark:bg-white/[0.01] border-t border-zinc-200 dark:border-white/[0.08] flex items-center justify-between">
                    <div className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">
                        Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(prev => Math.max(1, prev - 1));
                            }}
                            disabled={currentPage === 1}
                            className="p-2 rounded-md border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(prev => Math.min(totalPages, prev + 1));
                            }}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-md border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
