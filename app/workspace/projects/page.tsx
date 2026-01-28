"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Folder, Plus, Trash2, Clock, MoreHorizontal } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { Project } from "@/types";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export default function ProjectsPage() {
    const api = useApi();
    const [projects, setProjects] = useState<Project[]>([]);
    const [newProjectName, setNewProjectName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; projectId: string | null; projectName: string }>(
        { open: false, projectId: null, projectName: "" }
    );

    const loadProjects = useCallback(async () => {
        try {
            const data = await api.getProjects();
            setProjects(data);
        } catch (error) {
            console.error("Failed to load projects", error);
        }
    }, [api]);

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
                <h2 className="text-lg font-bold text-slate-900 mb-6">
                    Create New Project
                </h2>
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Project Name (e.g. customer-onboarding-bot)"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-md px-5 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                    <button
                        onClick={handleCreateProject}
                        disabled={isLoading}
                        className="bg-slate-900 text-white border-0 px-8 py-3 rounded-md font-medium hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 flex items-center disabled:opacity-50"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Create Project
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((p) => (
                    <Link
                        key={p.id}
                        href={`/workspace/projects/${p.id}`}
                        className="group block bg-white rounded-md border border-slate-200 p-6 hover:shadow-lg hover:shadow-slate-200/50 hover:border-indigo-200 transition-all cursor-pointer relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[80px] -mr-6 -mt-6 transition-colors group-hover:bg-indigo-50"></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2.5 bg-slate-50 rounded-md group-hover:bg-indigo-50 transition-colors">
                                    <Folder className="h-5 w-5 text-slate-500 group-hover:text-indigo-600 transition-colors" />
                                </div>
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
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 mb-2">{p.name}</h3>
                            <p className="text-slate-500 text-sm mb-6 line-clamp-2 h-10">
                                {p.description || "No description provided."}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500">
                                    Development
                                </span>
                                <div className="flex items-center text-[11px] font-medium text-slate-400">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {p.updated_at ? new Date(p.updated_at).toLocaleDateString() : "Never"}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {projects.length === 0 && (
                <div className="text-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-md">
                    <p className="text-slate-500">
                        No projects found. Create one to get started.
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
