"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useApi } from "@/hooks/useApi";
import { Prompt, Commit, Run, Score, Tag } from "@/types";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
    ArrowLeft,
    GitBranch,
    GitCommit,
    Play,
    Settings,
    CornerDownLeft,
    ChevronDown,
    Layers,
    Zap,
    Trash2,
    X,
    GitCompare
} from 'lucide-react';
import { Sidebar } from "@/components/layout/Sidebar";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { cn } from "@/lib/utils";

export default function PromptWorkspacePage() {
    const params = useParams();
    const api = useApi();
    const promptId = typeof params?.promptId === 'string' ? params.promptId :
        Array.isArray(params?.promptId) ? params.promptId[0] : "";

    const [prompt, setPrompt] = useState<Prompt | null>(null);
    const [commits, setCommits] = useState<Commit[]>([]);
    const [selectedCommit, setSelectedCommit] = useState<Commit | null>(null);
    const [runs, setRuns] = useState<Run[]>([]);
    const [scores, setScores] = useState<Score[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [availableModels, setAvailableModels] = useState<string[]>([]);

    // Editor State
    const [systemPrompt, setSystemPrompt] = useState("");
    const [userQuery, setUserQuery] = useState("");
    const [commitMessage, setCommitMessage] = useState("Update prompt");

    const [isSaving, setIsSaving] = useState(false);
    const [isRunning, setIsRunning] = useState(false);

    // Scoring State
    const [scoreDialogOpen, setScoreDialogOpen] = useState(false);
    const [selectedRunForScore, setSelectedRunForScore] = useState<Run | null>(null);
    const [scoreValue, setScoreValue] = useState("0.5");
    const [scoreReasoning, setScoreReasoning] = useState("");

    // Tagging State
    const [tagDialogOpen, setTagDialogOpen] = useState(false);
    const [tagName, setTagName] = useState("");
    const [commitToTag, setCommitToTag] = useState<Commit | null>(null);

    // Compare State
    const [compareDialogOpen, setCompareDialogOpen] = useState(false);
    const [commitToCompare, setCommitToCompare] = useState<Commit | null>(null);
    const [compareTargetId, setCompareTargetId] = useState<string>("");
    const [comparisonResult, setComparisonResult] = useState<{
        oldCommit: { id: string; system_prompt: string; commit_message: string; created_at: string };
        newCommit: { id: string; system_prompt: string; commit_message: string; created_at: string };
        diff: Array<{ value: string; type: "added" | "removed" | "unchanged" }>;
    } | null>(null);
    const [isComparing, setIsComparing] = useState(false);

    // Delete state
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        type: 'commit' | 'run' | 'score' | 'tag' | null;
        id: string;
        name: string;
        metadata?: any;
    }>({ open: false, type: null, id: "", name: "" });

    useEffect(() => {
        if (promptId) loadData();
    }, [promptId]);

    useEffect(() => {
        if (selectedCommit) {
            setSystemPrompt(selectedCommit.system_prompt);
            setUserQuery(selectedCommit.user_query);
            loadRuns(selectedCommit.id);
            loadScores(selectedCommit.id);
        }
    }, [selectedCommit]);

    const loadData = async () => {
        try {
            const allPrompts = await api.getPrompts();
            const p = allPrompts.find(x => x.id === promptId);
            setPrompt(p || null);

            const allCommits = await api.getCommits();
            const promptCommits = allCommits
                .filter(c => c.prompt_id === promptId)
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            setCommits(promptCommits);

            // Load all tags for context
            const allTags = await api.getTags();
            setTags(allTags);

            // Load models
            const models = await api.getAvailableModels();
            const flatModels = Object.values(models).flat();
            setAvailableModels(flatModels);

            if (promptCommits.length > 0) {
                setSelectedCommit(promptCommits[0]);
            }
        } catch (e) {
            console.error("Failed to load workspace", e);
        }
    };

    const loadRuns = async (commitId: string) => {
        try {
            const allRuns = await api.getRuns();
            const commitRuns = allRuns.filter(r => r.commit_id === commitId);
            commitRuns.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setRuns(commitRuns);
        } catch (e) {
            console.error("Failed to load runs", e);
        }
    };

    const loadScores = async (commitId: string) => {
        try {
            const allScores = await api.getScores();
            const commitScores = allScores.filter(s => s.commit_id === commitId);
            setScores(commitScores);
        } catch (e) {
            console.error("Failed to load scores", e);
        }
    };

    const handleCommit = async () => {
        if (!prompt) return;
        setIsSaving(true);
        try {
            const newCommit = await api.createCommit({
                prompt_id: prompt.id,
                system_prompt: systemPrompt,
                user_query: userQuery,
                commit_message: commitMessage,
                created_by: prompt.created_by,
            });
            setCommits([newCommit, ...commits]);
            setSelectedCommit(newCommit);
            setCommitMessage("Update prompt");
        } catch (e) {
            console.error("Failed to commit", e);
        } finally {
            setIsSaving(false);
        }
    };

    const handleRun = async (model?: string) => {
        if (!selectedCommit) return;
        setIsRunning(true);
        try {
            const newRun = await api.executeCommit(selectedCommit.id, model);
            setRuns(prev => [newRun, ...prev]);
        } catch (e) {
            console.error("Failed to run", e);
        } finally {
            setIsRunning(false);
        }
    };

    const handleRunAll = async () => {
        if (!selectedCommit || availableModels.length === 0) return;
        setIsRunning(true);
        try {
            // Run all models in parallel
            const promises = availableModels.map(model =>
                api.executeCommit(selectedCommit.id, model)
                    .catch(e => {
                        console.error(`Failed to run model ${model}`, e);
                        return null;
                    })
            );

            const results = await Promise.all(promises);
            const successfulRuns = results.filter(r => r !== null) as Run[];

            setRuns(prev => [...successfulRuns, ...prev]);
        } catch (e) {
            console.error("Failed to run all models", e);
        } finally {
            setIsRunning(false);
        }
    };

    const openScoreDialog = (run: Run) => {
        setSelectedRunForScore(run);
        setScoreValue("0.5");
        setScoreReasoning("");
        setScoreDialogOpen(true);
    };

    const handleCreateScore = async () => {
        if (!selectedCommit || !selectedRunForScore) return;
        try {
            const newScore = await api.createScore({
                commit_id: selectedCommit.id,
                score: parseFloat(scoreValue),
                scorer: "human",
                reasoning: scoreReasoning,
            });
            setScores([...scores, newScore]);
            setScoreDialogOpen(false);
        } catch (e) {
            console.error("Failed to score", e);
        }
    };

    const openTagDialog = (commit: Commit, e: React.MouseEvent) => {
        e.stopPropagation();
        setCommitToTag(commit);
        setTagName("");
        setTagDialogOpen(true);
    };

    const handleCreateTag = async () => {
        if (!commitToTag || !tagName.trim()) return;
        try {
            const newTag = await api.addTag(commitToTag.id, { tagName });
            // Note: Backend might return just the Tag object.
            // We update local state
            setTags([...tags, newTag]);
            setTagDialogOpen(false);
        } catch (e) {
            console.error("Failed to tag", e);
        }
    };

    const handleDeleteTagClick = (commitId: string, tagName: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setDeleteDialog({ open: true, type: 'tag', id: commitId, name: tagName, metadata: { tagName } });
    };

    const handleDeleteRunClick = (runId: string) => {
        setDeleteDialog({ open: true, type: 'run', id: runId, name: "this run" });
    };

    const handleDeleteScoreClick = (scoreId: string) => {
        setDeleteDialog({ open: true, type: 'score', id: scoreId, name: "this score" });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteDialog.id) return;
        try {
            switch (deleteDialog.type) {
                case 'run':
                    await api.deleteRun(deleteDialog.id);
                    setRuns(runs.filter(r => r.id !== deleteDialog.id));
                    break;
                case 'score':
                    await api.deleteScore(deleteDialog.id);
                    setScores(scores.filter(s => s.id !== deleteDialog.id));
                    break;
                case 'tag':
                    await api.deleteTag(deleteDialog.id, deleteDialog.metadata.tagName);
                    setTags(tags.filter(t => !(t.commit_id === deleteDialog.id && t.tag_name === deleteDialog.metadata.tagName)));
                    break;
            }
            setDeleteDialog({ ...deleteDialog, open: false });
        } catch (e) {
            console.error(`Failed to delete ${deleteDialog.type}`, e);
        }
    };

    const openCompareDialog = () => {
        if (!selectedCommit) return;
        setCommitToCompare(selectedCommit);
        setCompareTargetId("");
        setComparisonResult(null);
        setCompareDialogOpen(true);
    };

    const handleCompare = async () => {
        if (!commitToCompare || !compareTargetId) return;
        setIsComparing(true);
        try {
            const result = await api.compareCommits(commitToCompare.id, compareTargetId);
            setComparisonResult(result);
        } catch (error) {
            console.error("Failed to compare commits", error);
        } finally {
            setIsComparing(false);
        }
    };

    if (!promptId) return <div>Invalid ID</div>;
    if (!prompt) return <div className="p-8">Loading workspace...</div>;

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            {/* Editor Header */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20">
                <div className="flex items-center space-x-4">
                    <Link href={`/workspace/projects/${prompt.project_id}`}>
                        <button
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                    </Link>
                    <div>
                        <div className="flex items-center space-x-2">
                            <h1 className="text-lg font-bold text-slate-900">{prompt.name}</h1>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 tracking-wider uppercase">Workspace</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={openCompareDialog}
                        disabled={!selectedCommit || commits.length < 2}
                        className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 rounded-full shadow-sm hover:border-indigo-200 hover:bg-slate-50 transition-all flex items-center disabled:opacity-50"
                    >
                        <GitBranch className="h-4 w-4 mr-2" />
                        Compare
                    </button>
                    <button
                        onClick={handleCommit}
                        disabled={isSaving}
                        className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 rounded-full shadow-sm hover:border-indigo-200 hover:bg-slate-50 transition-all flex items-center disabled:opacity-50"
                    >
                        <GitCommit className="h-4 w-4 mr-2" />
                        Commit
                    </button>

                    <div className="relative flex items-center bg-indigo-600 rounded-full shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all hover:scale-[1.02] active:scale-[0.98]">
                        <button
                            onClick={() => handleRun()}
                            disabled={isRunning || !selectedCommit}
                            className="pl-5 pr-3 py-2 text-sm font-bold text-white flex items-center disabled:opacity-75"
                        >
                            <Play className="h-4 w-4 mr-2 fill-current" />
                            {isRunning ? "Running..." : "Run"}
                        </button>
                        <div className="w-[1px] h-4 bg-indigo-400 opacity-50" />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="pl-2 pr-4 py-2 text-white disabled:opacity-75 h-full" disabled={isRunning || !selectedCommit}>
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 p-1 rounded-2xl border-slate-200 shadow-xl mt-2 animate-in fade-in slide-in-from-top-2">
                                <DropdownMenuItem onClick={handleRunAll} className="text-xs font-semibold rounded-xl py-2.5 cursor-pointer focus:bg-indigo-50 focus:text-indigo-600 transition-colors">
                                    <Layers className="mr-2 h-4 w-4 text-slate-400 group-focus:text-indigo-600" />
                                    Run All Models
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="my-1 bg-slate-100" />
                                <DropdownMenuLabel className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-3 py-2">Run with...</DropdownMenuLabel>
                                {availableModels.map(model => (
                                    <DropdownMenuItem key={model} onClick={() => handleRun(model)} className="text-xs font-semibold rounded-xl py-2.5 cursor-pointer focus:bg-indigo-50 focus:text-indigo-600 transition-colors">
                                        <Zap className="mr-2 h-4 w-4 text-amber-500" />
                                        {model}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            {/* Main Workspace Layout */}
            <div className="flex-1 flex overflow-hidden">

                {/* LEFT SIDEBAR: Versions */}
                <div className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
                    <div className="p-4 border-b border-slate-100">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Versions</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {commits.map((commit) => {
                            const isActive = selectedCommit?.id === commit.id;
                            const commitTags = tags.filter(t => t.commit_id === commit.id);
                            return (
                                <div
                                    key={commit.id}
                                    onClick={() => setSelectedCommit(commit)}
                                    className={cn(
                                        "p-3 rounded-lg border cursor-pointer transition-all group",
                                        isActive
                                            ? "bg-indigo-50 border-indigo-100"
                                            : "hover:bg-slate-50 border-transparent hover:border-slate-100"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-1.5">
                                            <span className={cn(
                                                "text-xs font-mono px-1.5 py-0.5 rounded",
                                                isActive ? "text-indigo-600 bg-indigo-100" : "text-slate-400 bg-slate-100 group-hover:text-slate-600"
                                            )}>
                                                {commit.id.substring(0, 6)}
                                            </span>
                                            <button
                                                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-indigo-600"
                                                onClick={(e) => openTagDialog(commit, e)}
                                            >
                                                <Settings className="h-3 w-3" />
                                            </button>
                                        </div>
                                        <span className="text-[10px] text-slate-400">
                                            {new Date(commit.created_at).toLocaleDateString() === new Date().toLocaleDateString()
                                                ? new Date(commit.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                : new Date(commit.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className={cn("text-sm font-medium truncate", isActive ? "text-slate-900" : "text-slate-600 group-hover:text-slate-900")}>
                                        {commit.commit_message}
                                    </p>
                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                        {commitTags.map((tag, i) => (
                                            <Badge
                                                key={`${tag.commit_id}-${tag.tag_name}-${i}`}
                                                variant="secondary"
                                                className="group/tag inline-flex items-center gap-1 text-[9px] px-1.5 py-0 h-3.5 font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 border-none hover:pr-4 relative transition-all"
                                            >
                                                {tag.tag_name}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteTagClick(commit.id, tag.tag_name, e);
                                                    }}
                                                    className="absolute right-0.5 opacity-0 group-hover/tag:opacity-100 hover:text-red-600 transition-opacity p-0.5"
                                                >
                                                    <X className="h-2 w-2" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* CENTER: Editor Area */}
                <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50 overflow-y-auto">
                    <div className="max-w-4xl mx-auto w-full p-8 space-y-8">

                        {/* System Prompt Section */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden group focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500 transition-all duration-300">
                            <div className="bg-slate-50/80 backdrop-blur-sm border-b border-slate-100 px-5 py-3 flex justify-between items-center">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">System Prompt</label>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] text-slate-400 font-mono tracking-tight font-medium uppercase">Active Editor</span>
                                </div>
                            </div>
                            <textarea
                                value={systemPrompt}
                                onChange={(e) => setSystemPrompt(e.target.value)}
                                className="w-full h-56 p-6 text-sm font-mono text-slate-800 focus:outline-none resize-none leading-relaxed"
                                placeholder="Define the persona and rules for the AI..."
                            />
                        </div>

                        {/* User Query Section */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden group focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500 transition-all duration-300">
                            <div className="bg-slate-50/80 backdrop-blur-sm border-b border-slate-100 px-5 py-3">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">User Query</label>
                            </div>
                            <textarea
                                value={userQuery}
                                onChange={(e) => setUserQuery(e.target.value)}
                                className="w-full h-40 p-6 text-sm font-mono text-slate-800 focus:outline-none resize-none leading-relaxed"
                                placeholder="Enter a test message to preview the prompt..."
                            />
                        </div>

                        {/* COMMIT SECTION */}
                        <div className="pt-8 border-t border-slate-200/60">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                                    <GitCommit className="h-4 w-4" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Save New Version</h3>
                            </div>
                            <div className="flex gap-3">
                                <div className="relative flex-1 group">
                                    <input
                                        type="text"
                                        value={commitMessage}
                                        onChange={(e) => setCommitMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCommit()}
                                        placeholder="Briefly describe what changed..."
                                        className="w-full pl-5 pr-12 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                        <CornerDownLeft className="h-4 w-4" />
                                    </div>
                                </div>
                                <button
                                    onClick={handleCommit}
                                    disabled={isSaving}
                                    className="bg-slate-900 text-white px-8 rounded-2xl text-sm font-bold hover:bg-slate-800 active:scale-[0.98] transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
                                >
                                    {isSaving ? "Saving..." : "Commit"}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* RIGHT SIDEBAR: Run History */}
                <div className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Run History</h3>
                        <button className="text-slate-400 hover:text-slate-600">
                            <Settings className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {runs.map((run) => (
                            <div key={run.id} className="rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow bg-white relative group">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-2">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded text-[10px] font-bold border uppercase",
                                            run.status === 'success' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
                                        )}>
                                            {run.status}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-mono">{run.latency_ms}ms</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-[10px] text-slate-400">{run.model_name}</span>
                                        <button
                                            onClick={() => handleDeleteRunClick(run.id)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 font-mono leading-relaxed border border-slate-100 whitespace-pre-wrap">
                                    {run.response}
                                </div>
                            </div>
                        ))}
                        {runs.length === 0 && (
                            <div className="text-center py-10 opacity-40">
                                <p className="text-[12px] font-medium text-slate-500">No runs yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Dialogs */}
            <Dialog open={scoreDialogOpen} onOpenChange={setScoreDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold">Evaluate Result</DialogTitle>
                        <DialogDescription className="text-[13px] text-slate-500">
                            Score this execution result to track quality over time.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="space-y-2">
                            <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Score (0.0 - 1.0)</Label>
                            <Input
                                type="number"
                                step="0.1"
                                min="0"
                                max="1"
                                value={scoreValue}
                                onChange={(e) => setScoreValue(e.target.value)}
                                className="h-10 text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Reasoning</Label>
                            <Input
                                placeholder="Why this score?"
                                value={scoreReasoning}
                                onChange={(e) => setScoreReasoning(e.target.value)}
                                className="h-10 text-sm"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCreateScore} className="bg-slate-900 text-white hover:bg-slate-800 h-10 px-6 font-bold text-xs uppercase tracking-wider transition-all">Save Score</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold">Tag Version</DialogTitle>
                        <DialogDescription className="text-[13px] text-slate-500">
                            Add a tag to version {commitToTag?.id.substring(0, 6)}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Tag Name</Label>
                            <Input
                                placeholder="v1.0-release"
                                value={tagName}
                                onChange={(e) => setTagName(e.target.value)}
                                className="h-10 text-sm"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCreateTag} className="bg-slate-900 text-white hover:bg-slate-800 h-10 px-6 font-bold text-xs uppercase tracking-wider transition-all">Add Tag</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={compareDialogOpen} onOpenChange={setCompareDialogOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold">Compare Versions</DialogTitle>
                        <DialogDescription className="text-[13px] text-slate-500">
                            Compare version {commitToCompare?.id.substring(0, 6)} with another version
                        </DialogDescription>
                    </DialogHeader>

                    {!comparisonResult ? (
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Compare With</Label>
                                <select
                                    value={compareTargetId}
                                    onChange={(e) => setCompareTargetId(e.target.value)}
                                    className="w-full h-10 px-3 text-sm border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                                >
                                    <option value="">Select a version...</option>
                                    {commits
                                        .filter(c => c.id !== commitToCompare?.id)
                                        .map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.id.substring(0, 6)} - {c.commit_message}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>
                            <DialogFooter>
                                <Button
                                    onClick={handleCompare}
                                    disabled={!compareTargetId || isComparing}
                                    className="bg-slate-900 text-white hover:bg-slate-800 h-10 px-6 font-bold text-xs uppercase tracking-wider transition-all"
                                >
                                    {isComparing ? "Comparing..." : "Compare"}
                                </Button>
                            </DialogFooter>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-hidden flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4 text-[11px]">
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded bg-red-100 border border-red-200"></span>
                                        <span className="text-slate-500">Removed</span>
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded bg-green-100 border border-green-200"></span>
                                        <span className="text-slate-500">Added</span>
                                    </span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setComparisonResult(null)}
                                    className="h-7 text-[10px]"
                                >
                                    Compare Another
                                </Button>
                            </div>
                            <div className="flex-1 overflow-y-auto border border-slate-200 rounded-lg bg-white">
                                <div className="text-[14px] leading-relaxed">
                                    {comparisonResult.diff.map((part, index) => {
                                        if (part.type === "unchanged") {
                                            return (
                                                <span key={index} className="text-slate-700">
                                                    {part.value}
                                                </span>
                                            );
                                        }
                                        if (part.type === "removed") {
                                            return (
                                                <div key={index} className="bg-red-100 border-l-4 border-red-400 px-3 py-2 my-1">
                                                    <span className="text-red-500 font-bold mr-2 select-none">−</span>
                                                    <span className="text-red-800">{part.value}</span>
                                                </div>
                                            );
                                        }
                                        if (part.type === "added") {
                                            return (
                                                <div key={index} className="bg-green-100 border-l-4 border-green-400 px-3 py-2 my-1">
                                                    <span className="text-green-600 font-bold mr-2 select-none">+</span>
                                                    <span className="text-green-800">{part.value}</span>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({ ...deleteDialog, open: false })}
                onConfirm={handleDeleteConfirm}
                title={`Delete ${deleteDialog.type?.[0].toUpperCase()}${deleteDialog.type?.slice(1)}`}
                description={`Are you sure you want to delete ${deleteDialog.name}? This action cannot be undone.`}
                confirmText={`Delete ${deleteDialog.type?.[0].toUpperCase()}${deleteDialog.type?.slice(1)}`}
                variant="danger"
            />
        </div>
    );

}
