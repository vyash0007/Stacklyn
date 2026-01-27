"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { Prompt, Commit, Run, Score, Tag } from "@/types";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, Play, Save, GitCommit, Star, Tag as TagIcon, Plus, ChevronDown, Zap, Layers, X, Trash2, Clock } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";

export default function PromptWorkspacePage() {
    const params = useParams();
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

    const handleDeleteTag = async (commitId: string, tagName: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm(`Are you sure you want to delete tag "${tagName}"?`)) return;

        try {
            await api.deleteTag(commitId, tagName);
            setTags(tags.filter(t => !(t.commit_id === commitId && t.tag_name === tagName)));
        } catch (error) {
            console.error("Failed to delete tag", error);
        }
    };

    const handleDeleteRun = async (runId: string) => {
        if (!confirm("Are you sure you want to delete this run?")) return;
        try {
            await api.deleteRun(runId);
            setRuns(runs.filter(r => r.id !== runId));
        } catch (error) {
            console.error("Failed to delete run", error);
        }
    };

    const handleDeleteCommit = async (commitId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (commits.length <= 1) {
            alert("Cannot delete the only version of this prompt.");
            return;
        }
        if (!confirm("Are you sure you want to delete this version? All associated runs and tags will be lost.")) return;

        try {
            await api.deleteCommit(commitId);
            setCommits(commits.filter(c => c.id !== commitId));
            if (selectedCommit?.id === commitId) {
                const remaining = commits.filter(c => c.id !== commitId);
                setSelectedCommit(remaining[0]);
            }
        } catch (error) {
            console.error("Failed to delete commit", error);
        }
    };

    const handleDeleteScore = async (scoreId: string) => {
        if (!confirm("Delete this score?")) return;
        try {
            await api.deleteScore(scoreId);
            setScores(scores.filter(s => s.id !== scoreId));
        } catch (error) {
            console.error("Failed to delete score", error);
        }
    };

    if (!promptId) return <div>Invalid ID</div>;
    if (!prompt) return <div className="p-8">Loading workspace...</div>;

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50/30">
                {/* Header */}
                <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-40">
                    <div className="flex items-center gap-3">
                        <Link href={`/workspace/projects/${prompt.project_id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-[13px] font-bold text-slate-900 leading-none">{prompt.name}</h1>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 block">Workspace</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCommit}
                            disabled={isSaving}
                            className="h-8 text-[11px] font-bold text-slate-600 border-slate-200 hover:bg-slate-50"
                        >
                            <GitCommit className="mr-2 h-3.5 w-3.5" />
                            Commit Version
                        </Button>

                        <div className="flex items-center">
                            <Button
                                size="sm"
                                className="h-8 text-[11px] font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-r-none border-r border-slate-700 px-4 transition-all"
                                onClick={() => handleRun()}
                                disabled={isRunning || !selectedCommit}
                            >
                                <Play className="mr-2 h-3.5 w-3.5 fill-current" />
                                {isRunning ? "Running..." : "Run"}
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size="sm" className="h-8 px-1.5 rounded-l-none bg-slate-900 hover:bg-slate-800 border-l-0" disabled={isRunning || !selectedCommit}>
                                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuItem onClick={handleRunAll} className="text-xs font-medium">
                                        <Layers className="mr-2 h-3.5 w-3.5" />
                                        Run All Models
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-1.5">Run with...</DropdownMenuLabel>
                                    {availableModels.map(model => (
                                        <DropdownMenuItem key={model} onClick={() => handleRun(model)} className="text-xs">
                                            <Zap className="mr-2 h-3.5 w-3.5 text-indigo-500" />
                                            {model}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
                    {/* Left Column: Versions */}
                    <div className="col-span-2 border-r border-slate-100 flex flex-col bg-white">
                        <div className="p-4 border-b border-slate-100">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Versions</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {commits.map(commit => {
                                const commitTags = tags.filter(t => t.commit_id === commit.id);
                                const isActive = selectedCommit?.id === commit.id;
                                return (
                                    <div
                                        key={commit.id}
                                        onClick={() => setSelectedCommit(commit)}
                                        className={cn(
                                            "p-3 rounded-lg cursor-pointer transition-all border border-transparent group relative",
                                            isActive
                                                ? "bg-slate-50 border-slate-100"
                                                : "hover:bg-slate-50/50"
                                        )}
                                    >
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-1.5">
                                                <GitCommit className={cn("h-3 w-3", isActive ? "text-indigo-600" : "text-slate-400")} />
                                                <span className="text-[10px] font-mono text-slate-400">{commit.id.substring(0, 6)}</span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400"
                                                onClick={(e) => openTagDialog(commit, e)}
                                            >
                                                <TagIcon className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <h4 className={cn("text-[12px] font-semibold truncate mb-1", isActive ? "text-slate-900" : "text-slate-600")}>
                                            {commit.commit_message}
                                        </h4>
                                        <div className="flex flex-wrap gap-1">
                                            {commitTags.map((tag, i) => (
                                                <Badge key={`${tag.commit_id}-${tag.tag_name}-${i}`} variant="secondary" className="text-[9px] px-1.5 py-0 h-3.5 font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 border-none">
                                                    {tag.tag_name}
                                                </Badge>
                                            ))}
                                        </div>
                                        <p className="text-[9px] text-slate-400 font-medium mt-2">
                                            {new Date(commit.created_at).toLocaleDateString()} • {new Date(commit.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Middle Column: Editor */}
                    <div className="col-span-7 border-r border-slate-100 flex flex-col bg-slate-50/30 overflow-y-auto">
                        <div className="p-6 space-y-6 max-w-4xl mx-auto w-full">
                            <Card className="shadow-sm border-slate-200/60 overflow-hidden">
                                <CardHeader className="py-2.5 px-4 border-b border-slate-100 bg-slate-50/50">
                                    <CardTitle className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">System Prompt</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <textarea
                                        className="w-full min-h-[280px] p-5 text-[13px] bg-white outline-none border-none resize-none font-sans leading-relaxed text-slate-700 placeholder:text-slate-300"
                                        value={systemPrompt}
                                        onChange={(e) => setSystemPrompt(e.target.value)}
                                        placeholder="You are a helpful assistant..."
                                    />
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm border-slate-200/60 overflow-hidden">
                                <CardHeader className="py-2.5 px-4 border-b border-slate-100 bg-slate-50/50">
                                    <CardTitle className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">User Query</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <textarea
                                        className="w-full min-h-[180px] p-5 text-[13px] bg-white outline-none border-none resize-none font-sans leading-relaxed text-slate-700 placeholder:text-slate-300"
                                        value={userQuery}
                                        onChange={(e) => setUserQuery(e.target.value)}
                                        placeholder="Input text..."
                                    />
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm border-slate-200/60 p-1 bg-white">
                                <Input
                                    placeholder="Update prompt..."
                                    value={commitMessage}
                                    onChange={(e) => setCommitMessage(e.target.value)}
                                    className="border-none bg-transparent h-10 text-[13px] focus:ring-0"
                                />
                            </Card>
                        </div>
                    </div>

                    {/* Right Column: Run History */}
                    <div className="col-span-3 flex flex-col bg-white">
                        <div className="p-4 border-b border-slate-100">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Run History</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {runs.map(run => (
                                <Card key={run.id} className="shadow-none border-slate-100 bg-slate-50/50 group relative hover:border-slate-200 transition-all">
                                    <CardHeader className="py-2 px-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Badge className={cn(
                                                    "text-[9px] font-bold uppercase px-1.5 py-0 h-4 border-none",
                                                    run.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                                                )}>
                                                    {run.status}
                                                </Badge>
                                                <span className="text-[10px] font-bold text-slate-500">
                                                    {run.model_name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="text-[10px] text-slate-400 font-medium">{run.latency_ms}ms</span>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="py-2 px-3 pt-0">
                                        <div className="text-[11px] font-medium text-slate-600 bg-white border border-slate-100 p-2.5 rounded-lg max-h-[160px] overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-sm">
                                            {run.response}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {runs.length === 0 && (
                                <div className="text-center py-10 opacity-40">
                                    <p className="text-[12px] font-medium text-slate-500">No runs yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

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
        </div>
    );
}
