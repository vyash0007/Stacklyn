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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
    GitBranch,
    Shield,
    UserCircle,
    Eye
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { cn, formatRelativeTime } from "@/lib/utils";

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

    // Edit member role state
    const [editingMemberRole, setEditingMemberRole] = useState<string | null>(null);
    const [memberRoleLoading, setMemberRoleLoading] = useState<string | null>(null);

    useEffect(() => {
        if (projectId) {
            loadData();
        }
    }, [projectId]);

    const loadData = async () => {
        setError(null);
        try {
            // Check both owned projects and memberships
            const [allProjects, memberships] = await Promise.all([
                api.getProjects(),
                api.getProjectMemberships(),
            ]);
            setHasAttemptedLoad(true);

            // First check owned projects
            let p = allProjects.find((x) => x.id === projectId);

            // If not found in owned projects, check memberships
            if (!p) {
                const membership = memberships.find((m: any) => m.project_id === projectId);
                if (membership?.projects) {
                    p = membership.projects;
                }
            }

            if (!p) {
                // Only set error if we got responses but project wasn't in either
                if (allProjects.length > 0 || memberships.length > 0) {
                    setError('Project not found or you do not have access to this project.');
                }
                return;
            }

            setProject(p);

            // Fetch prompts for this project (handles member access on backend)
            const projectPrompts = await api.getPromptsByProject(projectId);
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

    const handleUpdateMemberRole = async (userId: string, newRole: string) => {
        setMemberRoleLoading(userId);
        try {
            await api.updateProjectMemberRole(projectId, userId, newRole);
            setMembers(members.map(m =>
                m.user_id === userId ? { ...m, role: newRole } : m
            ));
        } catch (error) {
            console.error("Failed to update member role", error);
        } finally {
            setMemberRoleLoading(null);
            setEditingMemberRole(null);
        }
    };

    const filteredPrompts = prompts.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Check if current user is an admin
    const currentUserMember = members.find(m => m.isCurrentUser);
    const isCurrentUserAdmin = currentUserMember?.role === 'admin';

    if (!projectId) return <div>Invalid Project ID</div>;

    // Don't render until we've attempted to load (prevents null errors)
    if (!hasAttemptedLoad) {
        return null;
    }

    // After loading, if error or no project found, show error
    if (error || !project) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#050505] text-white p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
                <div className="text-center max-w-md p-10 bg-white/[0.02] rounded-md border border-white/10 shadow-2xl backdrop-blur-xl relative z-10">
                    <div className="w-20 h-20 bg-red-500/10 rounded-md flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                        <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-[0.2em]">Matrix Rejection</h2>
                    <p className="text-zinc-500 mb-10 font-medium leading-relaxed">
                        {error || 'This workspace does not exist or your identity has not been authorized for access.'}
                    </p>
                    <Link href="/workspace/projects">
                        <button className="w-full bg-white text-black px-8 py-3.5 rounded-md hover:bg-zinc-200 transition-all font-bold text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                            Back to Control Center
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen font-sans text-zinc-900 dark:text-white animate-in fade-in duration-500 overflow-x-hidden relative">

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8 relative z-10">

                {/* --- Top Navigation & Header --- */}
                <div className="mb-10 space-y-6">

                    {/* Project Header */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex items-start gap-5">
                            <Link href="/workspace/projects">
                                <button
                                    className="group mt-1 p-2 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-white/20 hover:bg-zinc-200 dark:hover:bg-white/10 transition-all shadow-2xl backdrop-blur-md"
                                >
                                    <ArrowLeft className="h-4 w-4 md:h-5 md:w-5 group-hover:-translate-x-1 transition-transform" />
                                </button>
                            </Link>
                            <div>
                                <h1 className="text-2xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-600 to-zinc-400 dark:from-white dark:to-zinc-500">
                                        {project!.name}
                                    </span>
                                </h1>
                                <p className="text-sm md:text-lg text-zinc-500 mt-2 md:mt-3 font-medium tracking-tight max-w-2xl">
                                    {project!.description || 'Orchestrate your prompt chains and manage versions.'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleEditProjectClick}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-5 py-2 md:py-2.5 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-zinc-400 font-bold text-[10px] md:text-xs uppercase tracking-widest rounded-md hover:bg-zinc-200 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-all shadow-xl backdrop-blur-md"
                            >
                                <Settings className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                <span>Settings</span>
                            </button>
                            <button
                                onClick={() => setInviteDialogOpen(true)}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-5 py-2 md:py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold text-[10px] md:text-xs uppercase tracking-widest rounded-md hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-all shadow-lg"
                            >
                                <UserPlus className="h-3 w-3 md:h-3.5 md:w-3.5" />
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
                        <div className="bg-zinc-100 dark:bg-[#1F1F1F] p-1.5 md:p-2 rounded-md border border-zinc-200 dark:border-white/5 shadow-2xl flex items-center gap-2 focus-within:ring-4 focus-within:ring-zinc-200 dark:focus-within:ring-white/5 focus-within:border-zinc-300 dark:focus-within:border-white/20 transition-all backdrop-blur-md">
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
                                className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-700 text-sm md:text-base py-2.5 md:py-3 ml-3 md:ml-4 font-medium tracking-tight"
                            />
                            <div className="pr-1 md:pr-2 flex items-center gap-2">
                                <button
                                    onClick={handleCreatePrompt}
                                    disabled={isLoading || !newPromptName.trim()}
                                    className="bg-zinc-900 dark:bg-white text-white dark:text-black p-2 md:p-2.5 rounded-md hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors shadow-lg disabled:opacity-30"
                                >
                                    {isLoading ? <Clock className="h-4 w-4 md:h-5 md:w-5 animate-spin" /> : <Plus className="h-4 w-4 md:h-5 md:w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* List Header */}
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-[0.2em]">Prompts</h2>
                                <span className="bg-zinc-200 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-zinc-500 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                                    {filteredPrompts.length}
                                </span>
                            </div>
                        </div>

                        {/* Prompts List */}
                        <div className="grid gap-4 grid-cols-1 transition-all duration-300">
                            {filteredPrompts.map((prompt) => (
                                <div
                                    key={prompt.id}
                                    className="group bg-zinc-100 dark:bg-[#1F1F1F] rounded-md border border-zinc-200 dark:border-white/5 p-6 hover:bg-zinc-200 dark:hover:bg-[#252527] hover:border-zinc-300 dark:hover:border-white/10 transition-all shadow-2xl relative overflow-hidden backdrop-blur-sm"
                                >
                                    {/* Accent line on hover */}
                                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-zinc-900 dark:bg-white opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-zinc-900 dark:text-white text-base md:text-lg group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors tracking-tight uppercase">
                                                        {prompt.name}
                                                    </h3>
                                                </div>
                                                <div className="flex items-center gap-4 text-[9px] md:text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                                                    <span className="flex items-center gap-2">
                                                        <Clock className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                                        {prompt.created_at ? formatRelativeTime(prompt.created_at) : "Never"}
                                                    </span>
                                                    <span className="text-zinc-300 dark:text-zinc-800">•</span>
                                                    <span className="bg-zinc-200 dark:bg-white/5 px-2 py-0.5 rounded-md text-zinc-500 dark:text-zinc-400 border border-zinc-300 dark:border-white/5">
                                                        v1.0
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 md:opacity-0 md:group-hover:opacity-100 md:translate-x-4 md:group-hover:translate-x-0 transition-all">
                                            <Link href={`/prompts/${prompt.id}`} className="flex-1 md:flex-none">
                                                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-md hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-all shadow-xl">
                                                    Open <ExternalLink className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                                </button>
                                            </Link>

                                            <div className="hidden md:block w-px h-6 bg-zinc-300 dark:bg-white/10 mx-1"></div>

                                            <button
                                                onClick={() => handleEditPromptClick(prompt.id, prompt.name)}
                                                className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/5 rounded-md transition-all"
                                                title="Edit"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeletePromptClick(prompt.id, prompt.name)}
                                                className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 dark:hover:bg-red-400/5 rounded-md transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
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
                                className="border-2 border-dashed border-zinc-200 dark:border-white/5 rounded-md p-8 flex flex-col items-center justify-center text-zinc-500 hover:border-zinc-300 dark:hover:border-white/10 hover:bg-zinc-100 dark:hover:bg-[#1F1F1F] transition-all group min-h-[140px]"
                            >
                                <div className="w-12 h-12 rounded-md bg-zinc-200 dark:bg-white/5 border border-zinc-300 dark:border-white/10 flex items-center justify-center mb-4 group-hover:bg-zinc-300 dark:group-hover:bg-white/10 group-hover:border-zinc-400 dark:group-hover:border-white/20 group-hover:scale-110 shadow-2xl transition-all text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white">
                                    <Plus className="h-6 w-6" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Create another prompt</span>
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Sidebar (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">


                        {/* Team Members Card */}
                        <div className="bg-zinc-100 dark:bg-[#1F1F1F] rounded-md border border-zinc-200 dark:border-white/5 p-8 shadow-2xl backdrop-blur-md">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-[0.2em]">Team Members</h3>
                                <span className="text-[10px] bg-zinc-200 dark:bg-white/5 text-zinc-500 font-bold tracking-widest px-2 py-0.5 rounded-md border border-zinc-300 dark:border-white/5 shadow-inner">
                                    {members.length}
                                </span>
                            </div>

                            <div className="space-y-4">
                                {members.map((member) => (
                                    <div key={member.user_id} className="flex items-center justify-between group p-2 rounded-md hover:bg-zinc-200 dark:hover:bg-[#252527] transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center text-xs font-lg tracking-tight shadow-sm transition-transform group-hover:scale-105 overflow-hidden",
                                                member.role === 'admin' ? "bg-slate-200 text-slate-800 border border-slate-300" : "bg-slate-100 text-slate-600 border border-slate-200"
                                            )}>
                                                {member.users?.image_url || member.users?.avatar_url ? (
                                                    <img
                                                        src={member.users?.image_url || member.users?.avatar_url}
                                                        alt={member.users?.name || member.users?.email || "User"}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    member.users?.name?.substring(0, 2).toUpperCase() || member.users?.email?.substring(0, 2).toUpperCase() || "UN"
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight">
                                                    {member.users?.name || member.users?.email || "Unknown"}
                                                    {member.isCurrentUser && (
                                                        <span className="ml-1.5 text-[9px] text-zinc-400 dark:text-zinc-600 font-bold uppercase tracking-widest">(You)</span>
                                                    )}
                                                </div>
                                                {/* Role dropdown - only admins can change roles, and not their own */}
                                                <div className="relative">
                                                    {isCurrentUserAdmin && !member.isCurrentUser ? (
                                                        <>
                                                            <button
                                                                onClick={() => setEditingMemberRole(editingMemberRole === member.user_id ? null : member.user_id)}
                                                                disabled={memberRoleLoading === member.user_id}
                                                                className="text-[9px] font-bold tracking-[0.15em] text-zinc-500 uppercase mt-0.5 hover:text-zinc-300 transition-colors flex items-center gap-1"
                                                            >
                                                                {memberRoleLoading === member.user_id ? (
                                                                    <span className="animate-pulse">Updating...</span>
                                                                ) : (
                                                                    <>
                                                                        {member.role}
                                                                        <ChevronRight className={cn("h-3 w-3 transition-transform", editingMemberRole === member.user_id && "rotate-90")} />
                                                                    </>
                                                                )}
                                                            </button>
                                                            {editingMemberRole === member.user_id && (
                                                                <div className="absolute left-0 top-full mt-1 bg-[#181818] border border-white/10 rounded-md shadow-xl z-30 min-w-[100px]">
                                                                    {['admin', 'member', 'viewer'].map((role) => (
                                                                        <button
                                                                            key={role}
                                                                            onClick={() => handleUpdateMemberRole(member.user_id, role)}
                                                                            className={cn(
                                                                                "w-full px-3 py-2 text-left text-[10px] font-bold uppercase tracking-widest transition-colors",
                                                                                member.role === role ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"
                                                                            )}
                                                                        >
                                                                            {role}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="text-[9px] font-bold tracking-[0.15em] text-zinc-600 uppercase mt-0.5">
                                                            {member.role}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteMemberClick(member.user_id, member.users?.email || "Unknown")}
                                            className="p-2 text-zinc-400 dark:text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-white border-none rounded-md transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                                {members.length === 0 && (
                                    <p className="text-xs text-zinc-400 dark:text-slate-400 text-center py-6 font-medium italic">No members yet</p>
                                )}
                            </div>

                            <button
                                onClick={() => setInviteDialogOpen(true)}
                                className="w-full mt-8 py-3.5 border border-zinc-200 dark:border-white/10 rounded-md text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-white/20 hover:bg-zinc-200 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-3 group bg-white dark:bg-black/20"
                            >
                                <UserPlus className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
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
                <DialogContent className="sm:max-w-md bg-white dark:bg-[#1F1F1F] border-zinc-200 dark:border-white/10 rounded-md shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-zinc-900 dark:text-white font-bold tracking-tight text-xl uppercase tracking-[0.15em]">Edit Prompt</DialogTitle>
                        <DialogDescription className="text-zinc-500 font-medium">Update the prompt identifier.</DialogDescription>
                    </DialogHeader>
                    <div className="py-8">
                        <Input
                            placeholder="Prompt name"
                            value={editPromptDialog.name}
                            onChange={(e) => setEditPromptDialog({ ...editPromptDialog, name: e.target.value })}
                            className="h-12 bg-zinc-100 dark:bg-white/5 text-zinc-900 dark:text-white border-zinc-200 dark:border-white/10 rounded-md focus:ring-4 focus:ring-zinc-200 dark:focus:ring-white/5 focus:border-zinc-300 dark:focus:border-white/20 transition-all font-medium tracking-tight"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-white/5">
                        <Button
                            variant="ghost"
                            className="rounded-md font-bold text-xs uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-all"
                            onClick={() => setEditPromptDialog({ open: false, id: "", name: "" })}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleEditPromptSave}
                            disabled={editPromptLoading || !editPromptDialog.name.trim()}
                            className="bg-zinc-900 dark:bg-white hover:bg-zinc-700 dark:hover:bg-zinc-200 text-white dark:text-black rounded-md font-bold text-xs uppercase tracking-widest px-8 shadow-xl transition-all"
                        >
                            {editPromptLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Project Dialog */}
            <Dialog open={editProjectDialog} onOpenChange={setEditProjectDialog}>
                <DialogContent className="sm:max-w-md bg-white dark:bg-[#1F1F1F] border-zinc-200 dark:border-white/10 rounded-md shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-zinc-900 dark:text-white font-bold tracking-tight text-xl uppercase tracking-[0.15em]">Project Settings</DialogTitle>
                        <DialogDescription className="text-zinc-500 font-medium">Update the workspace protocol.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 dark:text-zinc-600 uppercase ml-1">Workspace Name</label>
                            <Input
                                placeholder="Project name"
                                value={editProjectName}
                                onChange={(e) => setEditProjectName(e.target.value)}
                                className="h-12 bg-zinc-100 dark:bg-white/5 text-zinc-900 dark:text-white border-zinc-200 dark:border-white/10 rounded-md focus:ring-4 focus:ring-zinc-200 dark:focus:ring-white/5 focus:border-zinc-300 dark:focus:border-white/20 transition-all font-medium tracking-tight"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 dark:text-zinc-600 uppercase ml-1">Description</label>
                            <Input
                                placeholder="Project description (optional)"
                                value={editProjectDescription}
                                onChange={(e) => setEditProjectDescription(e.target.value)}
                                className="h-12 bg-zinc-100 dark:bg-white/5 text-zinc-900 dark:text-white border-zinc-200 dark:border-white/10 rounded-md focus:ring-4 focus:ring-zinc-200 dark:focus:ring-white/5 focus:border-zinc-300 dark:focus:border-white/20 transition-all font-medium tracking-tight"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-white/5">
                        <Button
                            variant="ghost"
                            className="rounded-md font-bold text-xs uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-all"
                            onClick={() => setEditProjectDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleEditProjectSave}
                            disabled={editProjectLoading || !editProjectName.trim()}
                            className="bg-zinc-900 dark:bg-white hover:bg-zinc-700 dark:hover:bg-zinc-200 text-white dark:text-black rounded-md font-bold text-xs uppercase tracking-widest px-8 shadow-xl transition-all"
                        >
                            {editProjectLoading ? "Saving..." : "Save Settings"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Invitation Dialog */}
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogContent className="sm:max-w-md bg-white dark:bg-[#1F1F1F] border-zinc-200 dark:border-white/10 rounded-md shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-zinc-900 dark:text-white font-bold tracking-tight text-xl uppercase tracking-[0.15em]">Invite Team Member</DialogTitle>
                        <DialogDescription className="text-zinc-500 font-medium">
                            Add a collaborator to this workspace.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 dark:text-zinc-600 uppercase ml-1">Email Address</label>
                            <Input
                                placeholder="member@example.com"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                className="h-12 bg-zinc-100 dark:bg-white/5 text-zinc-900 dark:text-white border-zinc-200 dark:border-white/10 rounded-md focus:ring-4 focus:ring-zinc-200 dark:focus:ring-white/5 focus:border-zinc-300 dark:focus:border-white/20 transition-all font-medium tracking-tight"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 dark:text-zinc-600 uppercase ml-1">Role Type</label>
                            <Select value={inviteRole} onValueChange={setInviteRole}>
                                <SelectTrigger className="h-12 bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white rounded-md focus:ring-zinc-200 dark:focus:ring-white/5 transition-all">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-[#0c0c0e] border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white">
                                    <SelectItem value="admin">
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-4 w-4 text-zinc-500" />
                                            <span className="text-xs font-bold uppercase tracking-widest">Admin</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="member">
                                        <div className="flex items-center gap-2">
                                            <UserCircle className="h-4 w-4 text-zinc-500" />
                                            <span className="text-xs font-bold uppercase tracking-widest">Member</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="viewer">
                                        <div className="flex items-center gap-2">
                                            <Eye className="h-4 w-4 text-zinc-500" />
                                            <span className="text-xs font-bold uppercase tracking-widest">Viewer</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {inviteError && (
                            <p className="text-[10px] font-bold tracking-widest text-red-500 ml-1 uppercase">{inviteError}</p>
                        )}
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-white/5">
                        <Button
                            variant="ghost"
                            className="rounded-md font-bold text-xs uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-all"
                            onClick={() => setInviteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleInviteMember}
                            disabled={inviteLoading || !inviteEmail.trim()}
                            className="bg-zinc-900 dark:bg-white hover:bg-zinc-700 dark:hover:bg-zinc-200 text-white dark:text-black rounded-md font-bold text-xs uppercase tracking-widest px-8 shadow-xl transition-all"
                        >
                            {inviteLoading ? "Inviting..." : "Send Invitation"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    );
}
