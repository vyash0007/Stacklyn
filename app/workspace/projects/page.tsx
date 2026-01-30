"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Folder, Plus, Trash2, Clock, ArrowUpRight, Search, Activity } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { Project } from "@/types";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatRelativeTime } from "@/lib/utils";

export default function ProjectsPage() {
    const api = useApi();
    const [projectType, setProjectType] = useState<'self' | 'team'>('self');
    const [projects, setProjects] = useState<Project[]>([]);
    const [newProjectName, setNewProjectName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; projectId: string | null; projectName: string }>(
        { open: false, projectId: null, projectName: "" }
    );

    const loadProjects = useCallback(async () => {
        setIsFetching(true);
        try {
            const data = projectType === 'self'
                ? await api.getProjects()
                : (await api.getProjectMemberships()).map((m: any) => m.projects).filter(Boolean);
            setProjects(data);
        } catch (error) {
            console.error("Failed to load projects", error);
        } finally {
            setIsFetching(false);
        }
    }, [api, projectType]);

    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

    const handleCreateProject = async () => {
        if (!newProjectName.trim()) return;
        setIsLoading(true);
        try {
            await api.createProject({
                name: newProjectName,
                description: "Created via frontend",
            });
            setNewProjectName("");
            loadProjects();
        } catch (error) {
            console.error("Failed to create project", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClick = (id: string, name: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDeleteDialog({ open: true, projectId: id, projectName: name });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteDialog.projectId) return;
        try {
            await api.deleteProject(deleteDialog.projectId);
            setProjects(projects.filter((p) => p.id !== deleteDialog.projectId));
        } catch (error) {
            console.error("Failed to delete project", error);
        }
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-12">
            {/* Header and Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
                        Project <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-500">Directory.</span>
                    </h1>
                    <p className="text-zinc-500 font-medium tracking-wide">Orchestrate and version your AI workspaces.</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex p-1 bg-white/5 border border-white/10 rounded-md backdrop-blur-md">
                        <button
                            onClick={() => setProjectType('self')}
                            className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${projectType === 'self' ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-zinc-500 hover:text-white'}`}
                        >
                            Personal
                        </button>
                        <button
                            onClick={() => setProjectType('team')}
                            className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${projectType === 'team' ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-zinc-500 hover:text-white'}`}
                        >
                            Team
                        </button>
                    </div>

                    <div className="hidden sm:flex items-center bg-white/[0.03] border border-white/[0.08] rounded-md px-4 h-10 group focus-within:border-white/20 transition-all">
                        <Search className="h-3.5 w-3.5 text-zinc-600 group-focus-within:text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Filter projects..."
                            className="bg-transparent border-none text-[11px] text-white focus:ring-0 placeholder-zinc-700 w-32 md:w-48 ml-2"
                        />
                    </div>
                </div>
            </div>

            {/* Creation Area */}
            {projectType === 'self' && (
                <div className="bg-[#1F1F1F] border border-white/5 rounded-md p-8 backdrop-blur-md relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Plus className="h-32 w-32" />
                    </div>

                    <div className="relative z-10 max-w-2xl">
                        <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] mb-4">Initialize New Workspace</h3>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <input
                                type="text"
                                placeholder="Workspace Name (e.g. production-bot-v2)"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                className="flex-1 bg-white/5 border border-white/10 rounded-md px-5 py-3 text-sm text-white placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-white/20 transition-all font-medium"
                            />
                            <button
                                onClick={handleCreateProject}
                                disabled={isLoading || !newProjectName.trim()}
                                className="bg-white text-black border-0 px-8 py-3 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Grid of Projects */}
            {isFetching ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-64 bg-white/[0.02] rounded-2xl border border-white/[0.05] animate-pulse" />
                    ))}
                </div>
            ) : projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((p) => (
                        <Link
                            key={p.id}
                            href={`/workspace/projects/${p.id}`}
                            className="group block bg-[#1F1F1F] rounded-md border border-white/5 p-8 hover:bg-[#252527] hover:border-white/10 transition-all duration-300 relative overflow-hidden shadow-3xl"
                        >
                            {/* Hover Backdrop Glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="p-3 bg-white/5 rounded-md border border-white/10 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500 text-zinc-400 group-hover:text-white">
                                        <Folder className="h-5 w-5" />
                                    </div>
                                    <div className="flex gap-2">
                                        {projectType === 'self' && (
                                            <button
                                                className="h-8 w-8 flex items-center justify-center rounded-md text-zinc-700 hover:text-red-400 hover:bg-red-400/10 transition-all"
                                                onClick={(e) => handleDeleteClick(p.id, p.name, e)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                        <div className="h-8 w-8 flex items-center justify-center rounded-md text-zinc-700 group-hover:text-white transition-all">
                                            <ArrowUpRight className="h-4 w-4" />
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold tracking-tight text-white mb-2 group-hover:text-zinc-200 transition-colors uppercase">{p.name}</h3>
                                <p className="text-zinc-500 text-xs font-medium leading-relaxed mb-8 line-clamp-2 h-9">
                                    {p.description || "Operational AI environment ready for deployment and monitoring."}
                                </p>

                                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                                            {projectType === 'self' ? 'Independent' : 'Collaborative'}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-[10px] font-bold text-zinc-700 uppercase tracking-widest">
                                        <Clock className="h-3 w-3 mr-1.5" />
                                        {p.created_at ? formatRelativeTime(p.created_at) : "Legacy"}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-32 bg-white/[0.01] border-2 border-dashed border-white/[0.05] rounded-3xl flex flex-col items-center justify-center space-y-6">
                    <div className="p-5 bg-white/5 rounded-full border border-white/10 opacity-20">
                        <Folder className="h-10 w-10 text-white" />
                    </div>
                    <div>
                        <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">
                            No active workspaces detected
                        </p>
                        <p className="text-zinc-700 text-xs mt-2 font-medium">Create your first project to unlock intelligence monitoring.</p>
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, projectId: null, projectName: "" })}
                onConfirm={handleDeleteConfirm}
                title="Terminate Workspace"
                description={`This action will permanently delete "${deleteDialog.projectName}" and all associated intelligence data. This cannot be undone.`}
                confirmText="Terminate Now"
                variant="danger"
            />
        </div>
    );
}