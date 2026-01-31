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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useApi } from "@/hooks/useApi";
import { toast } from "sonner";
import { Prompt, Commit, Run, Score, Tag, ModelInfo } from "@/types";
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
    Zap,
    Trash2,
    X,
    GitCompare,
    Terminal,
    History,
    Save,
    Code,
    Cpu,
    Sparkles,
    ArrowUpRight,
    MessageSquare,
    Smile,
    Send,
    Activity,
    Rocket,
    Loader2
} from 'lucide-react';
import { Sidebar } from "@/components/layout/Sidebar";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { cn } from "@/lib/utils";

// Helper function to get local icon path based on model ID
const getModelIcon = (modelId: string): string => {
    const id = modelId.toLowerCase();
    if (id.includes('llama')) return '/icons/meta.svg';
    if (id.includes('gpt') || id.includes('openai')) return '/icons/openai.svg';
    if (id.includes('claude') || id.includes('anthropic')) return '/icons/anthropic.svg';
    if (id.includes('gemini')) return '/icons/gemini.svg';
    return '/icons/openai.svg'; // fallback
};

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
    const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
    const [selectedModel, setSelectedModel] = useState<ModelInfo | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

    // Editor State
    const [systemPrompt, setSystemPrompt] = useState("");
    const [userQuery, setUserQuery] = useState("");
    const [commitMessage, setCommitMessage] = useState("");

    const [isSaving, setIsSaving] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [isPushingToProd, setIsPushingToProd] = useState(false);
    const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);

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

    // Releases State
    const [releasesDialogOpen, setReleasesDialogOpen] = useState(false);
    const [releases, setReleases] = useState<Array<{
        id: string;
        commit_message: string;
        created_at: string;
        version: string;
        is_current_prod: boolean;
        tags: string[];
    }>>([]);
    const [releasesPagination, setReleasesPagination] = useState<{ limit: number; offset: number; total: number } | null>(null);
    const [isLoadingReleases, setIsLoadingReleases] = useState(false);
    const [isLoadingMoreReleases, setIsLoadingMoreReleases] = useState(false);

    // Commits pagination state
    const [commitsPagination, setCommitsPagination] = useState<{ limit: number; offset: number; total: number } | null>(null);
    const [prodCommit, setProdCommit] = useState<Commit | null>(null);
    const [isLoadingMoreCommits, setIsLoadingMoreCommits] = useState(false);

    // Delete state
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        type: 'commit' | 'run' | 'score' | 'tag' | null;
        id: string;
        name: string;
        metadata?: any;
    }>({ open: false, type: null, id: "", name: "" });

    const [mobileTab, setMobileTab] = useState<'editor' | 'history' | 'variables' | 'runs'>('editor');

    // Template variables state - extracted from {{variable}} patterns in prompts
    const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});

    // Function to extract {{variable}} patterns from text
    const extractTemplateVariables = useCallback((text: string): string[] => {
        const regex = /\{\{(\w+)\}\}/g;
        const matches: string[] = [];
        let match;
        while ((match = regex.exec(text)) !== null) {
            if (!matches.includes(match[1])) {
                matches.push(match[1]);
            }
        }
        return matches;
    }, []);

    // Get all unique variables from both prompts
    const detectedVariables = useCallback(() => {
        const systemVars = extractTemplateVariables(systemPrompt);
        const userVars = extractTemplateVariables(userQuery);
        const allVars = [...new Set([...systemVars, ...userVars])];
        return allVars;
    }, [systemPrompt, userQuery, extractTemplateVariables]);

    // Update template variables when new variables are detected
    useEffect(() => {
        const vars = detectedVariables();
        setTemplateVariables(prev => {
            const updated: Record<string, string> = {};
            vars.forEach(varName => {
                // Preserve existing value if variable already exists
                updated[varName] = prev[varName] ?? '';
            });
            return updated;
        });
    }, [detectedVariables]);

    // Function to replace {{variable}} with actual values
    const injectVariables = useCallback((text: string): string => {
        return text.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
            return templateVariables[varName] ?? match;
        });
    }, [templateVariables]);

    // Render text with colored {{variable}} patterns (just color, no background)
    const renderColoredText = useCallback((text: string) => {
        const parts = text.split(/(\{\{\w+\}\})/g);
        return parts.map((part, index) => {
            if (/^\{\{\w+\}\}$/.test(part)) {
                return <span key={index} className="text-purple-600 dark:text-purple-400">{part}</span>;
            }
            return <span key={index}>{part}</span>;
        });
    }, []);

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
        setError(null);
        try {
            // Fetch prompt directly - backend handles member access authorization
            const p = await api.getPrompt(promptId);
            setHasAttemptedLoad(true);

            if (!p || !p.id) {
                setError('Prompt not found or you do not have access to this prompt.');
                return;
            }

            setPrompt(p);

            // Fetch commits for this prompt (handles member access on backend)
            const commitsResponse = await api.getCommitsByPrompt(promptId, { limit: 9, offset: 0 });
            // Sort by created_at descending (most recent first)
            const sortedCommits = commitsResponse.commits.sort((a: Commit, b: Commit) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            setCommits(sortedCommits);
            setCommitsPagination(commitsResponse.pagination);
            setProdCommit(commitsResponse.prodCommit);

            // Load all tags for context
            const allTags = await api.getTags();
            setTags(allTags);

            // Load models (limit to 2 per provider)
            const models = await api.getAvailableModels();
            const flatModels = Object.values(models).flatMap((providerModels: any) =>
                (providerModels as ModelInfo[]).slice(0, 2)
            ) as ModelInfo[];
            setAvailableModels(flatModels);
            // Set default model (first one, usually GPT-4)
            if (flatModels.length > 0) {
                setSelectedModel(flatModels[0]);
            }

            if (sortedCommits.length > 0) {
                setSelectedCommit(sortedCommits[0]);
            }
        } catch (e: any) {
            console.error("Failed to load workspace", e);
            setHasAttemptedLoad(true);
            setError(e.message || 'Failed to load prompt. Please try again.');
        }
    };

    const loadRuns = async (commitId: string) => {
        try {
            // Fetch runs for this commit (handles member access on backend)
            const commitRuns = await api.getRunsByCommit(commitId);
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
            setCommitMessage("");
        } catch (e) {
            console.error("Failed to commit", e);
        } finally {
            setIsSaving(false);
        }
    };

    const handleGenerateCommitMessage = async () => {
        if (isGeneratingMessage) return;

        // Find the most recent commit (previous version) to compare against
        const sortedCommits = [...commits].sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        const previousCommit = sortedCommits[0];
        const oldSystemPrompt = previousCommit?.system_prompt || "";

        setIsGeneratingMessage(true);
        try {
            const result = await api.generateCommitMessage(oldSystemPrompt, systemPrompt);
            console.log("=== Generate Commit Message API Response ===", result);
            setCommitMessage(result.commitMessage || "");
        } catch (e: any) {
            console.error("Failed to generate commit message", e);
            toast.error(e.message || "Failed to generate commit message");
        } finally {
            setIsGeneratingMessage(false);
        }
    };

    const handlePushToProd = async () => {
        if (!selectedCommit) return;
        setIsPushingToProd(true);
        try {
            await api.pushToProd(selectedCommit.id);
            toast.success("Pushed to production!");
            // Re-fetch all data to align UI with backend state
            await loadData();
        } catch (e: any) {
            console.error("Failed to push to prod", e);
            toast.error(e.message || "Failed to push to production");
        } finally {
            setIsPushingToProd(false);
        }
    };

    const handleViewReleases = async () => {
        setIsLoadingReleases(true);
        setReleasesDialogOpen(true);
        setReleases([]);
        try {
            const response = await api.getReleases(promptId, { limit: 9, offset: 0 });
            setReleases(response.releases);
            setReleasesPagination(response.pagination);
        } catch (e: any) {
            console.error("Failed to fetch releases", e);
            toast.error(e.message || "Failed to fetch releases");
        } finally {
            setIsLoadingReleases(false);
        }
    };

    const handleReleasesPageChange = async (direction: 'prev' | 'next') => {
        if (!releasesPagination || isLoadingMoreReleases) return;

        const newOffset = direction === 'next'
            ? releasesPagination.offset + releasesPagination.limit
            : releasesPagination.offset - releasesPagination.limit;

        if (newOffset < 0 || newOffset >= releasesPagination.total) return;

        setIsLoadingMoreReleases(true);
        try {
            const response = await api.getReleases(promptId, { limit: 9, offset: newOffset });
            setReleases(response.releases);
            setReleasesPagination(response.pagination);
        } catch (e: any) {
            console.error("Failed to load releases", e);
            toast.error(e.message || "Failed to load releases");
        } finally {
            setIsLoadingMoreReleases(false);
        }
    };

    const handleLoadMoreCommits = async () => {
        if (!commitsPagination || isLoadingMoreCommits) return;

        const newOffset = commitsPagination.offset + commitsPagination.limit;
        if (newOffset >= commitsPagination.total) return;

        setIsLoadingMoreCommits(true);
        try {
            const response = await api.getCommitsByPrompt(promptId, { limit: 9, offset: newOffset });
            const sortedNewCommits = response.commits.sort((a: Commit, b: Commit) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            // Append new commits to existing ones
            setCommits(prev => [...prev, ...sortedNewCommits]);
            setCommitsPagination(response.pagination);
        } catch (e: any) {
            console.error("Failed to load more commits", e);
            toast.error(e.message || "Failed to load more commits");
        } finally {
            setIsLoadingMoreCommits(false);
        }
    };

    const handleRun = async (model?: string) => {
        if (!selectedCommit) return;
        setIsRunning(true);
        try {
            // Inject template variables into current editor content (not saved commit)
            const hasVariables = Object.keys(templateVariables).length > 0;

            // Debug logs
            console.log("=== DEBUG: handleRun ===");
            console.log("templateVariables:", templateVariables);
            console.log("hasVariables:", hasVariables);
            console.log("systemPrompt (before inject):", systemPrompt);
            console.log("userQuery (before inject):", userQuery);
            console.log("systemPrompt (after inject):", injectVariables(systemPrompt));
            console.log("userQuery (after inject):", injectVariables(userQuery));

            const overridePrompts = hasVariables ? {
                system_prompt: injectVariables(systemPrompt),
                user_query: injectVariables(userQuery)
            } : undefined;

            console.log("overridePrompts being sent:", overridePrompts);

            const newRun = await api.executeCommit(selectedCommit.id, model, overridePrompts);
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
            // Inject template variables into current editor content (not saved commit)
            const hasVariables = Object.keys(templateVariables).length > 0;
            const overridePrompts = hasVariables ? {
                system_prompt: injectVariables(systemPrompt),
                user_query: injectVariables(userQuery)
            } : undefined;
            // Run all models in parallel
            const promises = availableModels.map(model =>
                api.executeCommit(selectedCommit.id, model.id, overridePrompts)
                    .catch(e => {
                        console.error(`Failed to run model ${model.id}`, e);
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
        if (!selectedCommit || commits.length < 2) {
            setCommitToCompare(selectedCommit || (commits.length > 0 ? commits[0] : null));
            setCompareTargetId("");
            setComparisonResult(null);
            setCompareDialogOpen(true);
            return;
        };

        const currentIndex = commits.findIndex(c => c.id === selectedCommit.id);
        const nextCommit = commits[currentIndex + 1] || (currentIndex > 0 ? commits[0] : commits[1]);

        setCommitToCompare(selectedCommit);
        setCompareTargetId(nextCommit.id);
        setComparisonResult(null);
        setCompareDialogOpen(true);

        // Auto trigger compare
        handleCompare(nextCommit.id);
    };

    const handleCompare = async (targetId?: string) => {
        const idToCompare = targetId || compareTargetId;
        if (!commitToCompare || !idToCompare) return;

        setIsComparing(true);
        try {
            const result = await api.compareCommits(commitToCompare.id, idToCompare);
            setComparisonResult(result);
            setCompareTargetId(idToCompare);
        } catch (error) {
            console.error("Failed to compare commits", error);
        } finally {
            setIsComparing(false);
        }
    };

    if (!promptId) return <div>Invalid ID</div>;

    // Don't render until we've attempted to load (prevents null errors)
    if (!hasAttemptedLoad) {
        return null;
    }

    // After loading, if error or no prompt found, show error
    if (error || !prompt) {
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
                        {error || 'This prompt does not exist or you do not have permission to access it.'}
                    </p>
                    <Link href="/workspace/projects">
                        <button className="bg-slate-900 text-white px-6 py-2 rounded-md hover:bg-slate-800 transition-professional font-lg tracking-tight">
                            Back to Projects
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-zinc-50 dark:bg-[#181818] overflow-hidden font-sans selection:bg-zinc-900/30 dark:selection:bg-white/30">

            {/* --- Premium IDE Header --- */}
            <header className="h-16 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between px-6 bg-white dark:bg-[#181818]/50 backdrop-blur-sm shrink-0 z-30">
                <div className="flex items-center gap-4">
                    <Link href={`/workspace/projects/${prompt.project_id}`}>
                        <button className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all">
                            <ArrowLeft size={18} />
                        </button>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-100 dark:bg-white/5 rounded-lg text-zinc-900 dark:text-white border border-zinc-200 dark:border-white/10 shrink-0">
                            <Terminal size={16} />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h1 className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight truncate max-w-[120px] sm:max-w-none">{prompt.name}</h1>
                                <span className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[9px] text-zinc-500 dark:text-zinc-400 border border-zinc-300 dark:border-white/5 font-mono hidden xs:inline">DRAFT</span>
                            </div>
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono truncate">
                                v{selectedCommit?.id.substring(0, 7) || 'latest'} • {commits.length} iters
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                    <button
                        onClick={openCompareDialog}
                        disabled={commits.length < 2 || !selectedCommit}
                        className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-lg text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-white/20 transition-all disabled:opacity-30"
                    >
                        <GitCompare size={14} /> Compare
                    </button>

                    <button
                        onClick={handlePushToProd}
                        disabled={!selectedCommit || isPushingToProd}
                        className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 border border-emerald-500 rounded-lg text-xs font-medium text-white transition-all disabled:opacity-50"
                    >
                        {isPushingToProd ? <Loader2 size={14} className="animate-spin" /> : <Rocket size={14} />}
                        Push to Prod
                    </button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-lg text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-white/20 transition-all">
                                {selectedModel ? (
                                    <>
                                        <img src={getModelIcon(selectedModel.id)} alt="" className="w-4 h-4" />
                                        <span className="hidden sm:inline">{selectedModel.name}</span>
                                        <span className="sm:hidden">Model</span>
                                    </>
                                ) : (
                                    <>
                                        <Cpu size={14} />
                                        <span>Select Model</span>
                                    </>
                                )}
                                <ChevronDown size={12} />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white dark:bg-[#1F1F1F] border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-300 min-w-[200px]">
                            {availableModels.map(model => (
                                <DropdownMenuItem
                                    key={model.id}
                                    onClick={() => setSelectedModel(model)}
                                    className={`hover:bg-zinc-100 dark:hover:bg-white/5 cursor-pointer flex items-center gap-2 ${selectedModel?.id === model.id ? 'bg-zinc-100 dark:bg-white/10' : ''}`}
                                >
                                    <img src={getModelIcon(model.id)} alt="" className="w-4 h-4" />
                                    <span>{model.name}</span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            {/* --- Mobile Tab Navigation --- */}
            <div className="lg:hidden flex border-b border-zinc-200 dark:border-white/5 bg-zinc-100 dark:bg-[#121212] overflow-x-auto no-scrollbar shrink-0">
                {[
                    { id: 'editor', label: 'Editor', icon: Code },
                    { id: 'runs', label: 'Simulation', icon: Play },
                    { id: 'history', label: 'History', icon: History },
                    { id: 'variables', label: 'Config', icon: Zap },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setMobileTab(tab.id as any)}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3 px-4 transition-all border-b-2 shrink-0",
                            mobileTab === tab.id
                                ? "text-zinc-900 dark:text-white border-zinc-900 dark:border-white bg-zinc-200 dark:bg-white/5"
                                : "text-zinc-400 dark:text-zinc-500 border-transparent hover:text-zinc-600 dark:hover:text-zinc-300"
                        )}
                    >
                        <tab.icon size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* --- Main Workspace Layout --- */}
            <div className="flex-1 flex min-h-0 relative z-10">

                {/* 1. LEFT: Version Sidebar */}
                <div className={cn(
                    "w-full lg:w-64 border-r border-zinc-200 dark:border-white/5 bg-zinc-100 dark:bg-[#121212] flex flex-col shrink-0",
                    mobileTab === 'history' ? "flex" : "hidden lg:flex"
                )}>
                    <div className="px-4 py-3 border-b border-zinc-200 dark:border-white/[0.05] flex items-center justify-between">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Version History</span>
                        <History size={12} className="text-zinc-400 dark:text-zinc-600" />
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {commits
                            .filter(c => !c.commit_tags?.some(t => t.tag_name === 'PROD'))
                            .sort((a, b) => {
                                const aHasMain = a.commit_tags?.some(t => t.tag_name === 'main');
                                const bHasMain = b.commit_tags?.some(t => t.tag_name === 'main');
                                if (aHasMain && !bHasMain) return -1;
                                if (!aHasMain && bHasMain) return 1;
                                return 0; // Keep original order for non-main commits
                            })
                            .map((commit) => {
                            const isActive = selectedCommit?.id === commit.id;
                            const commitTags = commit.commit_tags?.map(t => ({ commit_id: commit.id, tag_name: t.tag_name })) || [];
                            return (
                                <div
                                    key={commit.id}
                                    onClick={() => setSelectedCommit(commit)}
                                    className={cn(
                                        "p-3 rounded-md border cursor-pointer transition-all group",
                                        isActive
                                            ? "bg-zinc-200 dark:bg-white/10 border-zinc-300 dark:border-white/10 shadow-lg"
                                            : "hover:bg-zinc-200/50 dark:hover:bg-white/[0.02] border-transparent hover:border-zinc-200 dark:hover:border-white/[0.05]"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-1.5">
                                            <span className={cn(
                                                "text-[10px] font-mono px-1.5 py-0.5 rounded",
                                                isActive ? "text-zinc-900 dark:text-white bg-zinc-300 dark:bg-white/10 border border-zinc-400 dark:border-white/10" : "text-zinc-500 bg-zinc-200 dark:bg-white/5"
                                            )}>
                                                {commit.id.substring(0, 7)}
                                            </span>
                                            <button
                                                onClick={(e) => openTagDialog(commit, e)}
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-300 dark:hover:bg-white/5 rounded text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all"
                                            >
                                                <Settings size={10} />
                                            </button>
                                        </div>
                                        <span className="text-[10px] text-zinc-400 dark:text-zinc-600">
                                            {new Date(commit.created_at).toLocaleDateString() === new Date().toDateString() ? 'Today' : new Date(commit.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className={cn("text-xs font-medium truncate", isActive ? "text-zinc-900 dark:text-white" : "text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300")}>
                                        {commit.commit_message}
                                    </p>
                                    {commitTags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {commitTags.map(tag => (
                                                <Badge
                                                    key={`${tag.commit_id}-${tag.tag_name}`}
                                                    variant="secondary"
                                                    className="group/tag inline-flex items-center gap-1 text-[8px] px-1.5 py-0 h-3.5 font-bold uppercase tracking-wider bg-zinc-200 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 border border-zinc-300 dark:border-white/10 hover:pr-4 relative transition-all"
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
                                    )}
                                </div>
                            );
                        })}
                        {/* Load More Button */}
                        {commitsPagination && commitsPagination.offset + commitsPagination.limit < commitsPagination.total && (
                            <button
                                onClick={handleLoadMoreCommits}
                                disabled={isLoadingMoreCommits}
                                className="w-full mt-2 py-2 text-[10px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 bg-zinc-200/50 dark:bg-white/[0.02] hover:bg-zinc-200 dark:hover:bg-white/[0.05] rounded-md transition-colors disabled:opacity-50"
                            >
                                {isLoadingMoreCommits ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 size={12} className="animate-spin" />
                                        Loading...
                                    </span>
                                ) : (
                                    "Load More"
                                )}
                            </button>
                        )}
                    </div>

                    {/* Production Section */}
                    {prodCommit && (
                        <>
                            <div className="px-4 py-3 border-t border-b border-zinc-200 dark:border-white/[0.05] flex items-center justify-between">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Production</span>
                                <button onClick={handleViewReleases} className="text-[9px] text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer transition-colors">View all →</button>
                            </div>
                            <div className="p-2 space-y-1">
                                {(() => {
                                    const commit = prodCommit;
                                    const isActive = selectedCommit?.id === commit.id;
                                    const commitTags = commit.commit_tags?.map((t: any) => ({ commit_id: commit.id, tag_name: t.tag_name })) || [];
                                    return (
                                        <div
                                            key={commit.id}
                                            onClick={() => setSelectedCommit(commit)}
                                            className={cn(
                                                "p-3 rounded-md border cursor-pointer transition-all group",
                                                isActive
                                                    ? "bg-zinc-200 dark:bg-white/10 border-zinc-300 dark:border-white/10 shadow-lg"
                                                    : "hover:bg-zinc-200/50 dark:hover:bg-white/[0.02] border-transparent hover:border-zinc-200 dark:hover:border-white/[0.05]"
                                            )}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={cn(
                                                        "text-[10px] font-mono px-1.5 py-0.5 rounded",
                                                        isActive ? "text-zinc-900 dark:text-white bg-zinc-300 dark:bg-white/10 border border-zinc-400 dark:border-white/10" : "text-zinc-500 bg-zinc-200 dark:bg-white/5"
                                                    )}>
                                                        {commit.id.substring(0, 7)}
                                                    </span>
                                                    <button
                                                        onClick={(e) => openTagDialog(commit, e)}
                                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-300 dark:hover:bg-white/5 rounded text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all"
                                                    >
                                                        <Settings size={10} />
                                                    </button>
                                                </div>
                                                <span className="text-[10px] text-zinc-400 dark:text-zinc-600">
                                                    {new Date(commit.created_at).toLocaleDateString() === new Date().toDateString() ? 'Today' : new Date(commit.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className={cn("text-xs font-medium truncate", isActive ? "text-zinc-900 dark:text-white" : "text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300")}>
                                                {commit.commit_message}
                                            </p>
                                            {commitTags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {commitTags.map((tag: any) => (
                                                        <Badge
                                                            key={`${tag.commit_id}-${tag.tag_name}`}
                                                            variant="secondary"
                                                            className={cn(
                                                                "group/tag inline-flex items-center gap-1 text-[8px] px-1.5 py-0 h-3.5 font-bold uppercase tracking-wider hover:pr-4 relative transition-all",
                                                                tag.tag_name === 'PROD'
                                                                    ? "bg-emerald-500 dark:bg-emerald-600 text-white border border-emerald-600 dark:border-emerald-500"
                                                                    : "bg-zinc-200 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 border border-zinc-300 dark:border-white/10"
                                                            )}
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
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        </>
                    )}
                </div>

                {/* 2. LEFT-INNER: Variable Config */}
                <div className={cn(
                    "w-full lg:w-72 border-r border-zinc-200 dark:border-white/5 bg-zinc-100 dark:bg-[#121212] flex flex-col shrink-0",
                    mobileTab === 'variables' ? "flex" : "hidden lg:flex"
                )}>
                    <div className="px-4 py-3 border-b border-zinc-200 dark:border-white/[0.05] flex items-center justify-between">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Template Variables</span>
                        <Code size={12} className="text-zinc-400 dark:text-zinc-600" />
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto space-y-3">
                        {detectedVariables().length > 0 ? (
                            detectedVariables().map((varName) => (
                                <div key={varName} className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                        <span className="text-purple-500/70">{`{{`}</span>
                                        {varName}
                                        <span className="text-purple-500/70">{`}}`}</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={templateVariables[varName] ?? ''}
                                        onChange={(e) => setTemplateVariables(prev => ({
                                            ...prev,
                                            [varName]: e.target.value
                                        }))}
                                        placeholder={`Enter ${varName}...`}
                                        className="w-full bg-white dark:bg-black/30 border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 font-mono focus:outline-none focus:border-zinc-300 dark:focus:border-white/20 focus:bg-zinc-50 dark:focus:bg-black/50 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-700"
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center py-12">
                                <div className="p-3 bg-zinc-200 dark:bg-white/5 rounded-full mb-3">
                                    <Code size={16} className="text-zinc-400 dark:text-zinc-600" />
                                </div>
                                <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-600 uppercase tracking-widest mb-1">No Variables</p>
                                <p className="text-[10px] text-zinc-400 dark:text-zinc-700 max-w-[180px] leading-relaxed">
                                    Use <span className="text-purple-500/70 font-mono">{`{{name}}`}</span> syntax in your prompts to create dynamic variables
                                </p>
                            </div>
                        )}
                    </div>
                    {detectedVariables().length > 0 && (
                        <div className="px-4 py-3 border-t border-zinc-200 dark:border-white/5 bg-zinc-200/50 dark:bg-black/20">
                            <div className="text-[9px] text-zinc-400 dark:text-zinc-600 font-mono">
                                {detectedVariables().length} variable{detectedVariables().length !== 1 ? 's' : ''} detected
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. CENTER: Prompt Editor - Stacked Layout */}
                <div className={cn(
                    "flex-1 flex flex-col bg-white dark:bg-[#181818] relative min-w-0",
                    mobileTab === 'editor' ? "flex" : "hidden lg:flex"
                )}>
                    {/* Header with token count */}
                    <div className="h-10 border-b border-zinc-200 dark:border-white/[0.05] flex items-center px-4 bg-zinc-100 dark:bg-[#121212] shrink-0">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Prompt Editor</span>
                        <div className="ml-auto flex items-center gap-4">
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-600 font-mono">Tokens: {systemPrompt.length + userQuery.length}</span>
                        </div>
                    </div>

                    {/* Two column editors container - stacked on mobile, side by side on desktop */}
                    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                        {/* System Prompt Section - Top on mobile, Left on desktop */}
                        <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-white/5 min-w-0 min-h-0">
                            <div className="px-4 py-2 bg-zinc-100 dark:bg-[#121212] border-b border-zinc-200 dark:border-white/[0.03] shrink-0">
                                <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">System Prompt</span>
                            </div>
                            <div className="flex-1 relative overflow-hidden">
                                {/* Color overlay for {{variable}} patterns */}
                                <div
                                    className="absolute inset-0 p-4 text-sm font-mono leading-[1.8] pointer-events-none whitespace-pre-wrap break-words overflow-auto text-zinc-700 dark:text-zinc-300"
                                    style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
                                    aria-hidden="true"
                                >
                                    {renderColoredText(systemPrompt)}
                                </div>
                                <textarea
                                    value={systemPrompt}
                                    onChange={(e) => setSystemPrompt(e.target.value)}
                                    className="w-full h-full bg-transparent text-sm text-transparent caret-zinc-900 dark:caret-zinc-100 p-4 resize-none focus:outline-none leading-[1.8] relative z-10"
                                    style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
                                    placeholder="Define AI persona and rules..."
                                    spellCheck="false"
                                />
                            </div>
                        </div>

                        {/* User Message Section - Bottom on mobile, Right on desktop */}
                        <div className="flex-1 flex flex-col min-w-0 min-h-0">
                            <div className="px-4 py-2 bg-zinc-100 dark:bg-[#121212] border-b border-zinc-200 dark:border-white/[0.03] shrink-0">
                                <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">User Message</span>
                            </div>
                            <div className="flex-1 relative overflow-hidden">
                                {/* Color overlay for {{variable}} patterns */}
                                <div
                                    className="absolute inset-0 p-4 text-sm font-mono leading-[1.8] pointer-events-none whitespace-pre-wrap break-words overflow-auto text-zinc-700 dark:text-zinc-300"
                                    style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
                                    aria-hidden="true"
                                >
                                    {renderColoredText(userQuery)}
                                </div>
                                <textarea
                                    value={userQuery}
                                    onChange={(e) => setUserQuery(e.target.value)}
                                    className="w-full h-full bg-transparent text-sm text-transparent caret-zinc-900 dark:caret-zinc-100 p-4 resize-none focus:outline-none leading-[1.8] relative z-10"
                                    style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
                                    placeholder="Enter user query for testing..."
                                    spellCheck="false"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Commit bar at bottom */}
                    <div className="p-3 border-t border-zinc-200 dark:border-white/5 bg-zinc-100 dark:bg-[#121212] shrink-0">
                        <div className="flex gap-3 items-center">
                            <div className="p-2 bg-zinc-200 dark:bg-white/5 rounded-lg text-zinc-500">
                                <GitBranch size={16} />
                            </div>
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={commitMessage || ""}
                                    onChange={(e) => setCommitMessage(e.target.value)}
                                    placeholder="Add a commit message..."
                                    className="w-full bg-white dark:bg-black/30 border border-zinc-200 dark:border-white/10 rounded-lg px-3 pr-10 py-2 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-300 dark:focus:border-white/20"
                                />
                                <button
                                    onClick={handleGenerateCommitMessage}
                                    disabled={isGeneratingMessage}
                                    title="Generate with AI"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-purple-500 dark:hover:text-purple-400 transition-colors disabled:opacity-50"
                                >
                                    {isGeneratingMessage ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <Sparkles size={14} />
                                    )}
                                </button>
                            </div>
                            <button
                                onClick={handleCommit}
                                disabled={isSaving}
                                className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black text-[10px] font-bold rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-all flex items-center gap-2"
                            >
                                {isSaving ? "Saving..." : "Commit"} <CornerDownLeft size={12} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 4. RIGHT: Simulation / Run History */}
                <div className={cn(
                    "w-full lg:w-96 border-l border-zinc-200 dark:border-white/5 bg-zinc-100 dark:bg-[#121212] flex flex-col shrink-0",
                    mobileTab === 'runs' ? "flex" : "hidden lg:flex"
                )}>
                    <div className="px-4 py-3 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Play size={12} className="text-emerald-500" />
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Simulation History</span>
                        </div>
                        <button
                            onClick={() => handleRun(selectedModel?.id)}
                            disabled={isRunning || !selectedModel}
                            className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold rounded flex items-center gap-1.5 transition-all disabled:opacity-50"
                        >
                            RUN
                        </button>
                    </div>

                    <div className="flex-1 p-4 space-y-6 overflow-y-auto">
                        {runs.length > 0 ? (
                            runs.map((run) => (
                                <div key={run.id} className="space-y-4">
                                    <div className="flex gap-3 justify-end">
                                        <div className="flex flex-col items-end gap-1 max-w-[85%]">
                                            <div className="bg-zinc-100 dark:bg-[#121212] border border-zinc-200 dark:border-white/5 p-3 rounded-lg rounded-tl-none text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed italic">
                                                Executed model: {run.model_name}
                                            </div>
                                        </div>
                                        <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500 dark:text-zinc-400 border border-zinc-300 dark:border-white/5 shrink-0">U</div>
                                    </div>

                                    <div className="flex gap-3 relative group">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-zinc-100 to-zinc-400 flex items-center justify-center text-[10px] font-bold text-black shadow-lg shadow-white/10 shrink-0">
                                            <Sparkles size={10} fill="currentColor" />
                                        </div>
                                        <div className="space-y-2 max-w-[90%] min-w-0">
                                            <div className={cn(
                                                "p-4 rounded-lg rounded-tl-none text-xs leading-relaxed shadow-sm border break-words overflow-hidden",
                                                run.status === 'success' ? "bg-zinc-100 dark:bg-[#1F1F1F] border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-200" : "bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-200"
                                            )}>
                                                <div className="whitespace-pre-wrap break-all">
                                                    {run.response}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 pl-1">
                                                <span className="text-[9px] text-zinc-400 dark:text-zinc-600 font-mono">{run.latency_ms}ms</span>
                                                <span className="text-[9px] text-zinc-400 dark:text-zinc-600 font-mono italic capitalize">{run.status}</span>
                                                <button onClick={() => openScoreDialog(run)} className="opacity-0 group-hover:opacity-100 text-[9px] text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-all">Score</button>
                                                <button onClick={() => handleDeleteRunClick(run.id)} className="opacity-0 group-hover:opacity-100 text-[9px] text-zinc-400 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 transition-all">
                                                    <Trash2 size={8} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                <Activity className="h-8 w-8 text-zinc-300 dark:text-zinc-800 mb-4" />
                                <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-700 uppercase tracking-widest">No runs recorded</p>
                                <p className="text-[10px] text-zinc-400 dark:text-zinc-800 max-w-[150px]">Click the RUN button to test your current prompts</p>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-zinc-200 dark:border-white/[0.05]">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Quick test message..."
                                className="w-full bg-white dark:bg-[#181818] border border-zinc-200 dark:border-white/10 rounded-lg pl-4 pr-10 py-3 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-zinc-300 dark:focus:border-white/20 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-700"
                                onKeyDown={(e) => e.key === 'Enter' && selectedModel && handleRun(selectedModel.id)}
                            />
                            <button
                                onClick={() => selectedModel && handleRun(selectedModel.id)}
                                disabled={!selectedModel}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-zinc-900 dark:bg-white rounded text-white dark:text-black hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
                            >
                                <ArrowUpRight size={12} />
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* --- Modals & Overlays --- */}
            <Dialog open={scoreDialogOpen} onOpenChange={setScoreDialogOpen}>
                <DialogContent className="bg-white dark:bg-[#1F1F1F] border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white">
                    <DialogHeader>
                        <DialogTitle>Evaluate Result</DialogTitle>
                        <DialogDescription className="text-zinc-500 dark:text-zinc-400">Score this execution result to track quality over time.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Score (0.0 - 1.0)</Label>
                            <Input
                                type="number"
                                step="0.1"
                                min="0"
                                max="1"
                                value={scoreValue}
                                onChange={(e) => setScoreValue(e.target.value)}
                                className="bg-zinc-100 dark:bg-black/50 border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Reasoning</Label>
                            <Input
                                placeholder="Why this score?"
                                value={scoreReasoning}
                                onChange={(e) => setScoreReasoning(e.target.value)}
                                className="bg-zinc-100 dark:bg-black/50 border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCreateScore} className="bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-700 dark:hover:bg-zinc-200 border-none">Save Score</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
                <DialogContent className="bg-white dark:bg-[#1F1F1F] border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white">
                    <DialogHeader>
                        <DialogTitle>Tag Version</DialogTitle>
                        <DialogDescription className="text-zinc-500 dark:text-zinc-400">Add a tag to version {commitToTag?.id.substring(0, 7)}</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Tag Name</Label>
                            <Input
                                placeholder="e.g. v1.0-release"
                                value={tagName}
                                onChange={(e) => setTagName(e.target.value)}
                                className="bg-zinc-100 dark:bg-black/50 border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCreateTag} className="bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-700 dark:hover:bg-zinc-200 border-none">Add Tag</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={compareDialogOpen} onOpenChange={setCompareDialogOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col bg-white dark:bg-[#0A0A0A] border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white">
                    <DialogHeader>
                        <DialogTitle>Compare Versions</DialogTitle>
                        <DialogDescription className="text-zinc-500">Compare version {commitToCompare?.id.substring(0, 7)} with another version</DialogDescription>
                    </DialogHeader>

                    {!comparisonResult ? (
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Compare With</Label>
                                <Select value={compareTargetId} onValueChange={setCompareTargetId}>
                                    <SelectTrigger className="bg-zinc-100 dark:bg-black/50 border-zinc-200 dark:border-white/10">
                                        <SelectValue placeholder="Select a version..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-[#1F1F1F] border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white">
                                        {commits
                                            .filter(c => c.id !== commitToCompare?.id)
                                            .map(c => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-[10px] bg-zinc-100 dark:bg-white/5 px-1 rounded text-zinc-500">{c.id.substring(0, 7)}</span>
                                                        <span className="truncate">{c.commit_message}</span>
                                                    </div>
                                                </SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter>
                                <Button
                                    onClick={() => handleCompare()}
                                    disabled={!compareTargetId || isComparing}
                                    className="bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-700 dark:hover:bg-zinc-200 border-none"
                                >
                                    {isComparing ? "Comparing..." : "Compare"}
                                </Button>
                            </DialogFooter>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-hidden flex flex-col">
                            <div className="flex items-center justify-between mb-6 px-1">
                                <div className="flex items-center gap-6">
                                    <span className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em]">Removed</span>
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em]">Added</span>
                                    </span>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="text-[10px] font-bold text-zinc-900 dark:text-white hover:text-zinc-600 dark:hover:text-zinc-300 uppercase tracking-[0.2em] transition-all flex items-center gap-2">
                                            COMPARE ANOTHER
                                            <ChevronDown size={10} className="opacity-50" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-white dark:bg-[#1F1F1F] border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white w-64 p-1">
                                        <div className="px-2 py-1.5 text-[9px] font-bold text-zinc-500 dark:text-zinc-600 uppercase tracking-widest">Select Version</div>
                                        {commits
                                            .filter(c => c.id !== commitToCompare?.id)
                                            .map(c => (
                                                <DropdownMenuItem
                                                    key={c.id}
                                                    onClick={() => handleCompare(c.id)}
                                                    className="flex items-center gap-3 cursor-pointer focus:bg-zinc-100 dark:focus:bg-white/5 focus:text-zinc-900 dark:focus:text-white py-2"
                                                >
                                                    <span className="font-mono text-[10px] text-zinc-500 bg-zinc-100 dark:bg-white/5 px-1 rounded">{c.id.substring(0, 7)}</span>
                                                    <span className="truncate text-xs">{c.commit_message}</span>
                                                </DropdownMenuItem>
                                            ))
                                        }
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div className="flex-1 overflow-y-auto border border-zinc-200 dark:border-white/5 rounded-xl bg-zinc-50 dark:bg-black/40 backdrop-blur-sm custom-scrollbar">
                                <div className="text-[13px] font-mono leading-[1.8] p-6">
                                    {comparisonResult.diff.map((part, index) => (
                                        <div key={index} className={cn(
                                            "whitespace-pre-wrap px-4 py-1.5 rounded-lg transition-all",
                                            part.type === 'added' ? "bg-emerald-500/10 text-emerald-500 my-1 border-l-2 border-emerald-500 shadow-[inset_4px_0_12px_-4px_rgba(16,185,129,0.3)]" :
                                                part.type === 'removed' ? "bg-red-500/10 text-red-500 my-1 border-l-2 border-red-500 shadow-[inset_4px_0_12px_-4px_rgba(239,68,68,0.3)]" : "text-zinc-600 opacity-60"
                                        )}>
                                            <span className="inline-block w-6 shrink-0 opacity-40 font-bold">
                                                {part.type === 'added' ? '+' : part.type === 'removed' ? '-' : ' '}
                                            </span>
                                            {part.value}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Releases Modal */}
            <Dialog open={releasesDialogOpen} onOpenChange={setReleasesDialogOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[70vh] overflow-hidden flex flex-col bg-white dark:bg-[#1F1F1F] border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white">
                    <DialogHeader>
                        <DialogTitle>Production Releases</DialogTitle>
                        <DialogDescription className="text-zinc-500 dark:text-zinc-400">All versions that have been pushed to production.</DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto py-2">
                        {isLoadingReleases ? (
                            <div className="flex items-center justify-center min-h-[280px]">
                                <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                            </div>
                        ) : releases.length > 0 ? (
                            <>
                                <div className="grid grid-cols-3 gap-2 min-h-[280px] content-start">
                                    {releases.map((release) => (
                                        <div
                                            key={release.id}
                                            onClick={async () => {
                                                try {
                                                    const commit = await api.getCommit(release.id);
                                                    if (commit) {
                                                        setSelectedCommit(commit);
                                                        setReleasesDialogOpen(false);
                                                    }
                                                } catch (e: any) {
                                                    console.error("Failed to fetch commit", e);
                                                    toast.error(e.message || "Failed to load commit");
                                                }
                                            }}
                                            className={cn(
                                                "p-3 rounded-md border cursor-pointer transition-all group",
                                                release.is_current_prod
                                                    ? "bg-zinc-200 dark:bg-white/10 border-zinc-300 dark:border-white/20 shadow-lg"
                                                    : "bg-zinc-100 dark:bg-white/[0.03] border-zinc-200 dark:border-white/5 hover:bg-zinc-150 dark:hover:bg-white/[0.05] hover:border-zinc-300 dark:hover:border-white/10"
                                            )}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={cn(
                                                        "text-[10px] font-mono px-1.5 py-0.5 rounded",
                                                        release.is_current_prod
                                                            ? "text-zinc-900 dark:text-white bg-zinc-300 dark:bg-white/10 border border-zinc-400 dark:border-white/10"
                                                            : "text-zinc-500 bg-zinc-200 dark:bg-white/5"
                                                    )}>
                                                        {release.id.substring(0, 7)}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-zinc-400 dark:text-zinc-600">
                                                    {new Date(release.created_at).toLocaleDateString() === new Date().toDateString() ? 'Today' : new Date(release.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className={cn(
                                                "text-xs font-medium truncate",
                                                release.is_current_prod
                                                    ? "text-zinc-900 dark:text-white"
                                                    : "text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300"
                                            )}>
                                                {release.commit_message}
                                            </p>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {release.tags.map(tag => (
                                                    <Badge
                                                        key={tag}
                                                        variant="secondary"
                                                        className={cn(
                                                            "text-[8px] px-1.5 py-0 h-3.5 font-bold uppercase tracking-wider",
                                                            tag === 'PROD'
                                                                ? "bg-emerald-500 dark:bg-emerald-600 text-white border border-emerald-600 dark:border-emerald-500"
                                                                : "bg-zinc-200 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 border border-zinc-300 dark:border-white/10"
                                                        )}
                                                    >
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Pagination */}
                                {releasesPagination && releasesPagination.total > 9 && (
                                    <div className="mt-4 flex items-center justify-between">
                                        <button
                                            onClick={() => handleReleasesPageChange('prev')}
                                            disabled={isLoadingMoreReleases || releasesPagination.offset === 0}
                                            className="px-3 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                                        >
                                            <ChevronDown className="w-3 h-3 rotate-90" />
                                            Previous
                                        </button>
                                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                                            {Math.floor(releasesPagination.offset / 9) + 1} / {Math.ceil(releasesPagination.total / 9)}
                                        </span>
                                        <button
                                            onClick={() => handleReleasesPageChange('next')}
                                            disabled={isLoadingMoreReleases || releasesPagination.offset + releasesPagination.limit >= releasesPagination.total}
                                            className="px-3 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                                        >
                                            Next
                                            <ChevronDown className="w-3 h-3 -rotate-90" />
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-8 text-zinc-500 text-sm">
                                No releases found.
                            </div>
                        )}
                    </div>
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
