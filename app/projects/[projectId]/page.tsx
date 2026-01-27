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
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/projects">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{project.name}</h2>
                    <p className="text-zinc-500 dark:text-zinc-400">{project.description}</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Prompts</CardTitle>
                        <CardDescription>Manage prompt chains within this project.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-4">
                            <Input
                                placeholder="New Prompt Name (e.g., 'Hero Generator')"
                                value={newPromptName}
                                onChange={(e) => setNewPromptName(e.target.value)}
                            />
                            <Button onClick={handleCreatePrompt} disabled={isLoading}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Prompt
                            </Button>
                        </div>

                        <div className="space-y-2 mt-4">
                            {prompts.map(prompt => (
                                <div key={prompt.id} className="flex items-center justify-between p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
                                    <div>
                                        <h4 className="font-semibold">{prompt.name}</h4>
                                        <p className="text-xs text-zinc-500">Updated {new Date(prompt.updated_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/prompts/${prompt.id}`}>
                                            <Button variant="secondary" size="sm">Open Workspace</Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 text-zinc-400 hover:text-red-500"
                                            onClick={() => handleDeletePrompt(prompt.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {prompts.length === 0 && (
                                <p className="text-center text-zinc-500 py-8">No prompts yet.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Project Info</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <div>
                            <span className="font-semibold block">ID:</span>
                            <span className="text-zinc-500 font-mono text-xs">{project.id}</span>
                        </div>
                        <div>
                            <span className="font-semibold block">Created By:</span>
                            <span className="text-zinc-500 font-mono text-xs">{project.created_by}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
