"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Folder, Plus, Trash2, Clock, MoreHorizontal } from "lucide-react";
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
        <div className="p-8 max-w-7xl mx-auto">
            <div className="bg-white rounded-md border border-slate-200 p-8 shadow-sm mb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-100 pb-6">
                    <div>
                        <h2 className="text-xl font-lg tracking-tight text-slate-900">
                            Projects
                        </h2>
                        <p className="text-sm text-slate-500 font-lg tracking-tight mt-1">
                            Manage your personal and team projects
                        </p>
                    </div>

                    <div className="flex p-1 bg-slate-100 rounded-md w-fit">
                        <button
                            onClick={() => setProjectType('self')}
                            className={`px-4 py-2 text-xs font-lg tracking-tight rounded-md transition-professional ${projectType === 'self' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Self Projects
                        </button>
                        <button
                            onClick={() => setProjectType('team')}
                            className={`px-4 py-2 text-xs font-lg tracking-tight rounded-md transition-professional ${projectType === 'team' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Team Projects
                        </button>
                    </div>
                </div>

                {projectType === 'self' && (
                    <div className="space-y-4">
                        <h3 className="text-sm font-lg tracking-tight text-slate-900">
                            Create New Project
                        </h3>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                placeholder="Project Name (e.g. customer-onboarding-bot)"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-md px-5 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/10 focus:border-slate-400 font-lg tracking-tight transition-professional"
                            />
                            <button
                                onClick={handleCreateProject}
                                disabled={isLoading}
                                className="bg-slate-900 text-white border-0 px-8 py-3 rounded-md font-lg tracking-tight hover:bg-slate-800 transition-professional shadow-sm flex items-center disabled:opacity-50"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Create Project
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {isFetching ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-48 bg-slate-50 rounded-md border border-slate-100 animate-pulse" />
                    ))}
                </div>
            ) : projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((p) => (
                        <Link
                            key={p.id}
                            href={`/workspace/projects/${p.id}`}
                            className="group block bg-white rounded-md border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-professional cursor-pointer relative overflow-hidden"
                        >
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2.5 bg-slate-50 rounded-md group-hover:bg-slate-100 transition-colors">
                                        <Folder className="h-5 w-5 text-slate-500 group-hover:text-slate-900 transition-colors" />
                                    </div>
                                    {projectType === 'self' && (
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-slate-400 hover:text-red-500"
                                                onClick={(e) => handleDeleteClick(p.id, p.name, e)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-lg font-lg tracking-tight text-slate-900 mb-2">{p.name}</h3>
                                <p className="text-slate-500 text-sm mb-6 line-clamp-2 h-10 font-lg tracking-tight">
                                    {p.description || "No description provided."}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-lg tracking-tight uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
                                        {projectType === 'self' ? 'Development' : 'Team Project'}
                                    </span>
                                    <div className="flex items-center text-[11px] font-medium text-slate-400">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {p.created_at ? formatRelativeTime(p.created_at) : "Never"}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-md">
                    <p className="text-slate-500 font-lg tracking-tight">
                        {projectType === 'self'
                            ? "No personal projects found. Create one to get started."
                            : "No team projects found."}
                    </p>
                </div>
            )}

            <ConfirmDialog
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, projectId: null, projectName: "" })}
                onConfirm={handleDeleteConfirm}
                title="Delete Project"
                description={`Are you sure you want to delete "${deleteDialog.projectName}"? This will permanently delete all prompts, commits, runs, and scores associated with this project.`}
                confirmText="Delete Project"
                variant="danger"
            />
        </div>
    );
}