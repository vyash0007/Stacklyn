"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { Project, Prompt } from "@/types";
import { Plus, ArrowLeft, Trash2 } from "lucide-react";

export default function ProjectDetailsPage() {
    const params = useParams();
    // Ensure we consistently treat params.projectId as a string.
    // In newer Next.js versions params can be a promise or parsed differently, 
    // but useParams() hook usually returns strings for dynamic segments.
    const projectId = typeof params?.projectId === 'string' ? params.projectId :
        Array.isArray(params?.projectId) ? params.projectId[0] : "";

    const [project, setProject] = useState<Project | null>(null);
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [newPromptName, setNewPromptName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (projectId) {
            loadData();
        }
    }, [projectId]);

    const loadData = async () => {
        try {
            const allProjects = await api.getProjects();
            const p = allProjects.find((x) => x.id === projectId);
            setProject(p || null);

            const allPrompts = await api.getPrompts();
            // Filter clientside because our mock API might not have filtering.
            // If real API has filtering, use that. 
            // Assuming getPrompts() returns everything for now as per api.ts
            const projectPrompts = allPrompts.filter((x) => x.project_id === projectId);
            setPrompts(projectPrompts);
        } catch (e) {
            console.error("Failed to load project data", e);
        }
    };

    const handleCreatePrompt = async () => {
        if (!newPromptName.trim() || !project) return;
        setIsLoading(true);
        try {
            await api.createPrompt({
                name: newPromptName,
                project_id: project.id,
                created_by: project.created_by, // minimal auth assumption
            });
            setNewPromptName("");
            loadData();
        } catch (error) {
            console.error("Failed to create prompt", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeletePrompt = async (id: string) => {
        if (!confirm("Are you sure you want to delete this prompt? This will delete all its versions and history.")) return;
        try {
            await api.deletePrompt(id);
            setPrompts(prompts.filter(p => p.id !== id));
        } catch (error) {
            console.error("Failed to delete prompt", error);
        }
    };

    if (!projectId) return <div>Invalid Project ID</div>;
    if (!project) return <div className="p-8">Loading project...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <Link href="/workspace/projects">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:bg-slate-100">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">{project.name}</h2>
                </div>
                <p className="text-[13px] text-slate-500 ml-10">{project.description}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                <Card className="md:col-span-8 shadow-sm border-slate-200/60 transition-all hover:shadow-md/5">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-bold text-slate-900">Prompts</CardTitle>
                        <CardDescription className="text-[13px]">Manage prompt chains within this project.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex gap-3">
                            <Input
                                placeholder="New Prompt Name (e.g., 'Hero Generator')"
                                value={newPromptName}
                                onChange={(e) => setNewPromptName(e.target.value)}
                                className="h-9 text-[13px] bg-slate-50/50"
                            />
                            <Button onClick={handleCreatePrompt} disabled={isLoading} size="sm" className="bg-[#4F46E5] hover:bg-[#4338CA] transition-colors h-9 px-4">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Prompt
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {prompts.map(prompt => (
                                <div key={prompt.id} className="flex items-center justify-between p-4 border border-slate-200/60 rounded-xl bg-white shadow-sm hover:border-slate-300 transition-all group">
                                    <div className="space-y-1">
                                        <h4 className="font-semibold text-slate-900 text-sm">{prompt.name}</h4>
                                        <p className="text-[11px] text-slate-400 font-medium">
                                            Updated {prompt.updated_at ? new Date(prompt.updated_at).toLocaleDateString() : "Never"}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link href={`/prompts/${prompt.id}`}>
                                            <Button variant="outline" size="sm" className="h-8 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 border-slate-200">
                                                Open Workspace
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                            onClick={() => handleDeletePrompt(prompt.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {prompts.length === 0 && (
                                <div className="text-center text-slate-400 py-12 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                    <p className="text-sm font-medium">No prompts yet.</p>
                                    <p className="text-xs">Create your first prompt to get started.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-4 shadow-sm border-slate-200/60 h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-slate-900">Project Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="space-y-1.5">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">ID:</span>
                            <span className="text-[13px] text-slate-600 font-medium break-all block bg-slate-50/50 p-2 rounded-md border border-slate-100">
                                {project.id}
                            </span>
                        </div>
                        <div className="space-y-1.5">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Created By:</span>
                            <span className="text-[13px] text-slate-600 font-medium block bg-slate-50/50 p-2 rounded-md border border-slate-100">
                                {project.created_by}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
