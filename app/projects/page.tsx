"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { Project, User } from "@/types";
import { Plus, Trash2 } from "lucide-react";

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [newProjectName, setNewProjectName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Hardcoded user ID for now as we don't have real auth yet.
    // In a real app, this would come from an Auth Context.
    const [userId, setUserId] = useState<string>("");

    useEffect(() => {
        loadProjects();
        ensureUser();
    }, []);

    const ensureUser = async () => {
        // Attempt to get a user or create a default one for this session
        try {
            const users = await api.getUsers();
            if (users.length > 0) {
                setUserId(users[0].id);
            } else {
                const newUser = await api.createUser({ name: "Demo User", email: "demo@stacklyn.com" });
                setUserId(newUser.id);
            }
        } catch (e) {
            console.error("Failed to ensure user", e);
        }
    };

    const loadProjects = async () => {
        try {
            const data = await api.getProjects();
            setProjects(data);
        } catch (error) {
            console.error("Failed to load projects", error);
        }
    };

    const handleCreateProject = async () => {
        if (!newProjectName.trim() || !userId) return;
        setIsLoading(true);
        try {
            await api.createProject({
                name: newProjectName,
                description: "Created via frontend",
                created_by: userId,
            });
            setNewProjectName("");
            loadProjects();
        } catch (error) {
            console.error("Failed to create project", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this project? This will delete everything inside it (prompts, versions, runs).")) return;
        try {
            await api.deleteProject(id);
            setProjects(projects.filter(p => p.id !== id));
        } catch (error) {
            console.error("Failed to delete project", error);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Projects</h2>
                    <p className="text-zinc-500 dark:text-zinc-400">Manage your prompt engineering workspaces.</p>
                </div>
            </div>

            <Card className="border-dashed border-2 bg-zinc-50/50 dark:bg-zinc-900/50">
                <CardHeader>
                    <CardTitle className="text-base">Create New Project</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <Input
                            placeholder="Project Name"
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            className="max-w-md"
                        />
                        <Button onClick={handleCreateProject} disabled={isLoading || !userId}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Project
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                    <Link key={project.id} href={`/projects/${project.id}`}>
                        <Card className="h-full transition-all hover:border-blue-500/50 hover:shadow-md cursor-pointer group relative">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>{project.name}</CardTitle>
                                        <CardDescription>Created {new Date(project.created_at).toLocaleDateString()}</CardDescription>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-red-500"
                                        onClick={(e) => handleDeleteProject(project.id, e)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-zinc-500 line-clamp-3">
                                    {project.description || "No description provided."}
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {projects.length === 0 && (
                <div className="text-center py-20 bg-zinc-50 rounded-lg dark:bg-zinc-900">
                    <p className="text-zinc-500">No projects found. Create one to get started.</p>
                </div>
            )}
        </div>
    );
}
