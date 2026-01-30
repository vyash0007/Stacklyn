"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Folder, Plus, Trash2, Clock, ArrowUpRight, Search, Activity } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { Project } from "@/types";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatRelativeTime } from "@/lib/utils";
import { ProjectsTable } from "@/components/dashboard/ProjectsTable";

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
        <div className="p-4 lg:p-8 max-w-[1600px] mx-auto space-y-12">
            {/* Header and Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div>
                    <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white mb-2">
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

                    <div className="hidden sm:flex items-center bg-white/[0.03] border border-white/[0.08] rounded-md px-4 h-10 group transition-all">
                        <Search className="h-3.5 w-3.5 text-zinc-600 group-focus-within:text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Filter projects..."
                            className="bg-transparent border-none text-[11px] text-white focus:ring-0 focus:outline-none placeholder-zinc-700 w-32 md:w-48 ml-2"
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

            {/* Table of Projects */}
            {isFetching ? (
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-16 bg-[#1F1F1F] rounded-md border border-white/5 animate-pulse" />
                    ))}
                </div>
            ) : projects.length > 0 ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <ProjectsTable
                        projects={projects}
                        limit={Infinity}
                        showFooter={false}
                        onDelete={handleDeleteClick}
                        showPagination={true}
                    />
                </div>
            ) : (
                <div className="text-center py-32 bg-[#1F1F1F] border-2 border-dashed border-white/5 rounded-md flex flex-col items-center justify-center space-y-6">
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