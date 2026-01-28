"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useApi } from "@/hooks/useApi";
import { Project, Prompt } from "@/types";
import { Plus, ArrowLeft, Trash2, UserPlus, X } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export default function ProjectDetailsPage() {
    const params = useParams();
    const api = useApi();
    // Ensure we consistently treat params.projectId as a string.
    // In newer Next.js versions params can be a promise or parsed differently, 
    // but useParams() hook usually returns strings for dynamic segments.
    const projectId = typeof params?.projectId === 'string' ? params.projectId :
        Array.isArray(params?.projectId) ? params.projectId[0] : "";

    const [project, setProject] = useState<Project | null>(null);
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [newPromptName, setNewPromptName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Member invite state
    const [members, setMembers] = useState<any[]>([]);
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("member");
    const [inviteLoading, setInviteLoading] = useState(false);
    const [inviteError, setInviteError] = useState("");

    // Delete dialog state
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        type: 'prompt' | 'member' | null;
        id: string;
        name: string;
    }>({ open: false, type: null, id: "", name: "" });

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

            // Load project members
            const projectMembers = await api.getProjectMembers(projectId);
            setMembers(projectMembers);
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

    const handleDeletePromptClick = (id: string, name: string) => {
        setDeleteDialog({ open: true, type: 'prompt', id, name });
    };

    const handleDeleteMemberClick = (id: string, email: string) => {
        setDeleteDialog({ open: true, type: 'member', id, name: email });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteDialog.id) return;

        try {
            if (deleteDialog.type === 'prompt') {
                await api.deletePrompt(deleteDialog.id);
                setPrompts(prompts.filter(p => p.id !== deleteDialog.id));
            } else if (deleteDialog.type === 'member') {
                await api.removeProjectMember(projectId, deleteDialog.id);
                setMembers(members.filter(m => m.user_id !== deleteDialog.id));
            }
        } catch (error) {
            console.error(`Failed to delete ${deleteDialog.type}`, error);
        }
    };

    const handleInviteMember = async () => {
        if (!inviteEmail.trim()) return;
        setInviteLoading(true);
        setInviteError("");
        try {
            await api.addProjectMemberByEmail(projectId, { email: inviteEmail, role: inviteRole });
            setInviteEmail("");
            setInviteRole("member");
            setInviteDialogOpen(false);
            loadData();
        } catch (error: any) {
            setInviteError(error.message || "Failed to invite member");
        } finally {
            setInviteLoading(false);
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (!confirm("Are you sure you want to remove this member?")) return;
        try {
            await api.removeProjectMember(projectId, userId);
            setMembers(members.filter(m => m.user_id !== userId));
        } catch (error) {
            console.error("Failed to remove member", error);
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
                            <Button onClick={handleCreatePrompt} disabled={isLoading} size="sm" className="bg-[#4F46E5] hover:bg-[#4338CA] transition-colors h-9 px-4 text-white">
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
                                            onClick={() => handleDeletePromptClick(prompt.id, prompt.name)}
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

                        {/* Members Section */}
                        <div className="space-y-3 pt-2 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Members</span>
                                <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-7 text-[11px] text-[#4F46E5] hover:bg-[#4F46E5]/10">
                                            <UserPlus className="h-3 w-3 mr-1" />
                                            Invite
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Invite Member</DialogTitle>
                                            <DialogDescription>
                                                Add a team member by their email address.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">Email</label>
                                                <Input
                                                    placeholder="member@example.com"
                                                    value={inviteEmail}
                                                    onChange={(e) => setInviteEmail(e.target.value)}
                                                    className="h-9 text-[13px]"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">Role</label>
                                                <select
                                                    value={inviteRole}
                                                    onChange={(e) => setInviteRole(e.target.value)}
                                                    className="w-full h-9 px-3 text-[13px] border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                                                >
                                                    <option value="member">Member</option>
                                                    <option value="admin">Admin</option>
                                                    <option value="viewer">Viewer</option>
                                                </select>
                                            </div>
                                            {inviteError && (
                                                <p className="text-sm text-red-500">{inviteError}</p>
                                            )}
                                            <Button
                                                onClick={handleInviteMember}
                                                disabled={inviteLoading || !inviteEmail.trim()}
                                                className="w-full bg-[#4F46E5] hover:bg-[#4338CA]"
                                            >
                                                {inviteLoading ? "Inviting..." : "Send Invite"}
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                            <div className="space-y-2">
                                {members.map((member) => (
                                    <div
                                        key={member.user_id}
                                        className="flex items-center justify-between p-2 bg-slate-50/50 rounded-md border border-slate-100 group"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[13px] font-medium text-slate-700 truncate">
                                                {member.users?.name || member.users?.email || "Unknown"}
                                            </p>
                                            <p className="text-[11px] text-slate-400 truncate">{member.role}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                            onClick={() => handleDeleteMemberClick(member.user_id, member.users?.email || "Unknown")}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                                {members.length === 0 && (
                                    <p className="text-[12px] text-slate-400 text-center py-3">No members yet</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <ConfirmDialog
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({ ...deleteDialog, open: false })}
                onConfirm={handleDeleteConfirm}
                title={`Delete ${deleteDialog.type === 'prompt' ? 'Prompt' : 'Member'}`}
                description={
                    deleteDialog.type === 'prompt'
                        ? `Are you sure you want to delete the prompt "${deleteDialog.name}"? This will permanently delete all its versions, runs, and scores.`
                        : `Are you sure you want to remove ${deleteDialog.name} from this project?`
                }
                confirmText={deleteDialog.type === 'prompt' ? "Delete Prompt" : "Remove Member"}
                variant="danger"
            />
        </div>
    );
}
