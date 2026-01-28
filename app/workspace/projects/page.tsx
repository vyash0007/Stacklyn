"use client";

import { useEffect, useState } from "react";
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
import {
    Plus,
    ArrowLeft,
    Trash2,
    UserPlus,
    X,
    Pencil,
    ExternalLink,
    Search,
    Zap,
    Clock,
    LayoutGrid,
    List,
    ChevronRight,
    Settings,
    Edit2,
    MoreVertical,
    GitBranch
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { cn } from "@/lib/utils";

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
    const [error, setError] = useState<string | null>(null);
    const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

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

    // Edit prompt state
    const [editPromptDialog, setEditPromptDialog] = useState<{
        open: boolean;
        id: string;
        name: string;
    }>({ open: false, id: "", name: "" });
    const [editPromptLoading, setEditPromptLoading] = useState(false);

    // Edit project state
    const [editProjectDialog, setEditProjectDialog] = useState(false);
    const [editProjectName, setEditProjectName] = useState("");
    const [editProjectDescription, setEditProjectDescription] = useState("");
    const [editProjectLoading, setEditProjectLoading] = useState(false);

    useEffect(() => {
        if (projectId) {
            loadData();
        }
    }, [projectId]);

    const loadData = async () => {
        setError(null);
        try {
            const allProjects = await api.getProjects();
            setHasAttemptedLoad(true);
            const p = allProjects.find((x) => x.id === projectId);

            if (!p) {
                // If we got projects but ours isn't there, it's a 404/Access Denied
                if (allProjects.length > 0) {
                    setError('Project not found or you do not have access to this project.');
                }
                return;
            }

            setProject(p);

            const allPrompts = await api.getPrompts();
            // Filter clientside because our mock API might not have filtering.
            // If real API has filtering, use that.
            // Assuming getPrompts() returns everything for now as per api.ts
            const projectPrompts = allPrompts.filter((x) => x.project_id === projectId);
            setPrompts(projectPrompts);

            // Load project members
            const projectMembers = await api.getProjectMembers(projectId);
            setMembers(projectMembers);
        } catch (e: any) {
            console.error("Failed to load project data", e);
            setHasAttemptedLoad(true);
            setError(e.message || 'Failed to load project. Please try again.');
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

    const handleEditPromptClick = (id: string, name: string) => {
        setEditPromptDialog({ open: true, id, name });
    };

    const handleEditPromptSave = async () => {
        if (!editPromptDialog.name.trim()) return;
        setEditPromptLoading(true);
        try {
            await api.updatePrompt(editPromptDialog.id, { name: editPromptDialog.name });
            setEditPromptDialog({ open: false, id: "", name: "" });
            loadData();
        } catch (error) {
            console.error("Failed to update prompt", error);
        } finally {
            setEditPromptLoading(false);
        }
    };

    const handleEditProjectClick = () => {
        if (project) {
            setEditProjectName(project.name);
            setEditProjectDescription(project.description || "");
            setEditProjectDialog(true);
        }
    };

    const handleEditProjectSave = async () => {
        if (!editProjectName.trim()) return;
        setEditProjectLoading(true);
        try {
            await api.updateProject(projectId, {
                name: editProjectName,
                description: editProjectDescription
            });
            setEditProjectDialog(false);
            loadData();
        } catch (error) {
            console.error("Failed to update project", error);
        } finally {
            setEditProjectLoading(false);
        }
    };

    const filteredPrompts = prompts.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!projectId) return <div>Invalid Project ID</div>;

    // Don't render until we've attempted to load (prevents null errors)
    if (!hasAttemptedLoad) {
        return null;
    }

    // After loading, if error or no project found, show error
    if (error || !project) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="text-center max-w-md p-8 bg-white rounded-lg border border-slate-200 shadow-sm">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
                    <p className="text-slate-600 mb-6">
                        {error || 'This project does not exist or you do not have permission to access it.'}
                    </p>
                    <Link href="/workspace/projects">
                        <button className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                            Back to Projects
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900 animate-in fade-in duration-500 overflow-x-hidden">
            {/* Decorative Background - Subtle & Modern */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-indigo-50/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4" />
            </div>

            <div className="max-w-7xl mx-auto p-8 relative z-10">

                {/* --- Top Navigation & Header --- */}
                <div className="mb-10 space-y-6">

                    {/* Project Header */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <Link href="/workspace/projects">
                                <button
                                    className="group mt-1 p-2 bg-white border border-slate-200 rounded-md text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-md transition-all duration-300"
                                >
                                    <ArrowLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
                                </button>
                            </Link>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                                    {project!.name}
                                </h1>
                                <p className="text-slate-500 mt-2 text-lg">
                                    {project!.description || 'Orchestrate your prompt chains and manage versions.'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleEditProjectClick}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 font-medium rounded-md hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
                            >
                                <Settings className="h-4 w-4" />
                                <span>Settings</span>
                            </button>
                            <button
                                onClick={() => setInviteDialogOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 transition-all shadow-md"
                            >
                                <UserPlus className="h-4 w-4" />
                                <span>Invite</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- Main Content Grid --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column: Prompt Management (8 cols) */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Input / Action Bar */}
                        <div className="bg-white p-2 rounded-md border border-slate-200 shadow-sm flex items-center gap-2 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-300 transition-all duration-300">
                            <input
                                type="text"
                                value={newPromptName}
                                onChange={(e) => {
                                    setNewPromptName(e.target.value);
                                    setSearchQuery(e.target.value);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleCreatePrompt();
                                    }
                                }}
                                placeholder="Create a new prompt chain..."
                                className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-slate-900 placeholder-slate-400 text-base py-3 ml-4"
                            />
                            <div className="pr-2 flex items-center gap-2">
                                <button
                                    onClick={handleCreatePrompt}
                                    disabled={isLoading || !newPromptName.trim()}
                                    className="bg-slate-900 text-white p-2.5 rounded-md hover:bg-slate-800 transition-colors shadow-md disabled:opacity-50"
                                >
                                    {isLoading ? <Clock className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* List Header */}
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold text-slate-900">Prompts</h2>
                                <span className="bg-white border border-slate-200 text-slate-500 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                                    {filteredPrompts.length}
                                </span>
                            </div>
                        </div>

                        {/* Prompts List */}
                        <div className="grid gap-4 grid-cols-1 transition-all duration-300">
                            {filteredPrompts.map((prompt) => (
                                <div
                                    key={prompt.id}
                                    className="group bg-white rounded-md border border-slate-200 p-6 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-300 relative overflow-hidden"
                                >
                                    {/* Hover Decoration */}
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-700 transition-colors uppercase tracking-tight">
                                                        {prompt.name}
                                                    </h3>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium tracking-tight">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        {prompt.updated_at ? new Date(prompt.updated_at).toLocaleDateString() : "Never"}
                                                    </span>
                                                    <span className="text-slate-300 font-bold">•</span>
                                                    <span className="font-mono bg-slate-50 px-2 py-0.5 rounded-md text-slate-600 border border-slate-100">
                                                        v1.0
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                            <Link href={`/prompts/${prompt.id}`}>
                                                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-md hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm">
                                                    Open <ExternalLink className="h-3.5 w-3.5" />
                                                </button>
                                            </Link>

                                            <div className="w-px h-6 bg-slate-200 mx-1"></div>

                                            <button
                                                onClick={() => handleEditPromptClick(prompt.id, prompt.name)}
                                                className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all"
                                                title="Edit"
                                            >
                                                <Edit2 className="h-4.5 w-4.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeletePromptClick(prompt.id, prompt.name)}
                                                className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4.5 w-4.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Empty State / Add Placeholder */}
                            <button
                                onClick={() => {
                                    const input = document.querySelector('input');
                                    if (input) input.focus();
                                }}
                                className="border-2 border-dashed border-slate-200 rounded-md p-8 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-600 transition-all group min-h-[120px]"
                            >
                                <div className="w-12 h-12 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center mb-3 group-hover:bg-white group-hover:border-indigo-200 group-hover:scale-110 shadow-sm transition-all text-slate-400 group-hover:text-indigo-600">
                                    <Plus className="h-6 w-6" />
                                </div>
                                <span className="text-sm font-bold tracking-tight">Create another prompt</span>
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Sidebar (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">


                        {/* Team Members Card */}
                        <div className="bg-white rounded-md border border-slate-200 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-slate-900 tracking-tight">Team Members</h3>
                                <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full border border-slate-200 shadow-sm">
                                    {members.length}
                                </span>
                            </div>

                            <div className="space-y-4">
                                {members.map((member) => (
                                    <div key={member.user_id} className="flex items-center justify-between group p-2 rounded-md hover:bg-slate-50/50 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-10 h-10 rounded-md flex items-center justify-center text-xs font-bold shadow-sm transition-transform group-hover:scale-105",
                                                member.role === 'admin' ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"
                                            )}>
                                                {member.users?.name?.substring(0, 2).toUpperCase() || member.users?.email?.substring(0, 2).toUpperCase() || "UN"}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-900 tracking-tight">{member.users?.name || member.users?.email || "Unknown"}</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{member.role}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteMemberClick(member.user_id, member.users?.email || "Unknown")}
                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-white border-none rounded-md transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                                {members.length === 0 && (
                                    <p className="text-xs text-slate-400 text-center py-6 font-medium italic">No members yet</p>
                                )}
                            </div>

                            <button
                                onClick={() => setInviteDialogOpen(true)}
                                className="w-full mt-6 py-3 border-2 border-dashed border-slate-200 rounded-md text-sm font-bold text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all flex items-center justify-center gap-2 group"
                            >
                                <UserPlus className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                Invite Member
                            </button>
                        </div>


                    </div>

                </div>
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

            {/* Edit Prompt Dialog */}
            <Dialog open={editPromptDialog.open} onOpenChange={(open) => setEditPromptDialog({ ...editPromptDialog, open })}>
                <DialogContent className="sm:max-w-md rounded-md">
                    <DialogHeader>
                        <DialogTitle className="font-bold text-xl">Edit Prompt</DialogTitle>
                        <DialogDescription className="text-slate-500">Update the prompt name.</DialogDescription>
                    </DialogHeader>
                    <div className="py-6">
                        <Input
                            placeholder="Prompt name"
                            value={editPromptDialog.name}
                            onChange={(e) => setEditPromptDialog({ ...editPromptDialog, name: e.target.value })}
                            className="h-12 text-sm rounded-md border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                        />
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="ghost"
                            className="rounded-sm font-bold text-slate-500 hover:bg-slate-100"
                            onClick={() => setEditPromptDialog({ open: false, id: "", name: "" })}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleEditPromptSave}
                            disabled={editPromptLoading || !editPromptDialog.name.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-bold px-6 shadow-md shadow-indigo-100"
                        >
                            {editPromptLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Project Dialog */}
            <Dialog open={editProjectDialog} onOpenChange={setEditProjectDialog}>
                <DialogContent className="sm:max-w-md rounded-md">
                    <DialogHeader>
                        <DialogTitle className="font-bold text-xl">Project Settings</DialogTitle>
                        <DialogDescription className="text-slate-500">Update the project details.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Project Name</label>
                            <Input
                                placeholder="Project name"
                                value={editProjectName}
                                onChange={(e) => setEditProjectName(e.target.value)}
                                className="h-12 text-sm rounded-md border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Description</label>
                            <Input
                                placeholder="Project description (optional)"
                                value={editProjectDescription}
                                onChange={(e) => setEditProjectDescription(e.target.value)}
                                className="h-12 text-sm rounded-md border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="ghost"
                            className="rounded-sm font-bold text-slate-500 hover:bg-slate-100"
                            onClick={() => setEditProjectDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleEditProjectSave}
                            disabled={editProjectLoading || !editProjectName.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-bold px-6 shadow-md shadow-indigo-100"
                        >
                            {editProjectLoading ? "Saving..." : "Save Settings"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Invitation Dialog */}
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-md">
                    <DialogHeader>
                        <DialogTitle className="font-bold text-xl">Invite Team Member</DialogTitle>
                        <DialogDescription className="text-slate-500">
                            Add a team member by their email address.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                            <Input
                                placeholder="member@example.com"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                className="h-12 text-sm rounded-md border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Role</label>
                            <select
                                value={inviteRole}
                                onChange={(e) => setInviteRole(e.target.value)}
                                className="w-full h-12 px-4 text-sm font-semibold border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                            >
                                <option value="member">Member</option>
                                <option value="admin">Admin</option>
                                <option value="viewer">Viewer</option>
                            </select>
                        </div>
                        {inviteError && (
                            <p className="text-xs font-bold text-red-500 ml-1">{inviteError}</p>
                        )}
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="ghost"
                            className="rounded-sm font-bold text-slate-500 hover:bg-slate-100"
                            onClick={() => setInviteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleInviteMember}
                            disabled={inviteLoading || !inviteEmail.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-bold px-8 shadow-md shadow-indigo-100"
                        >
                            {inviteLoading ? "Inviting..." : "Send Invitation"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
