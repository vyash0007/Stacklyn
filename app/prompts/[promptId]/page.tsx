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
import { ArrowLeft, Play, Save, GitCommit, Star, Tag as TagIcon, Plus } from "lucide-react";

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
            // In a real app we might optimize this efficiently
            const allTags = await api.getTags();
            setTags(allTags);

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

    const handleRun = async () => {
        if (!selectedCommit) return;
        setIsRunning(true);
        try {
            const newRun = await api.executeCommit(selectedCommit.id);
            setRuns([newRun, ...runs]);
        } catch (e) {
            console.error("Failed to run", e);
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

    if (!promptId) return <div>Invalid ID</div>;
    if (!prompt) return <div className="p-8">Loading workspace...</div>;

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-4">
                    <Link href={`/projects/${prompt.project_id}`}>
                        <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                    </Link>
                    <div>
                        <h2 className="text-xl font-bold">{prompt.name}</h2>
                        <p className="text-xs text-zinc-500">Workspace</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCommit} disabled={isSaving}>
                        <GitCommit className="mr-2 h-4 w-4" />
                        Commit Version
                    </Button>
                    <Button onClick={handleRun} disabled={isRunning || !selectedCommit}>
                        <Play className="mr-2 h-4 w-4" />
                        {isRunning ? "Running..." : "Run"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6 h-full min-h-0">
                <div className="col-span-2 overflow-y-auto border-r pr-4 space-y-4">
                    <h3 className="font-semibold text-sm text-zinc-500">Versions</h3>
                    {commits.map(commit => {
                        const commitTags = tags.filter(t => t.commit_id === commit.id);
                        return (
                            <div
                                key={commit.id}
                                onClick={() => setSelectedCommit(commit)}
                                className={`p-3 rounded-lg cursor-pointer border transition-colors group relative ${selectedCommit?.id === commit.id ? 'bg-zinc-100 border-zinc-300 dark:bg-zinc-800 dark:border-zinc-700' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900 border-transparent'}`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <GitCommit className="h-3 w-3" />
                                        <span className="text-xs font-mono">{commit.id.substring(0, 6)}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5 opacity-50 hover:opacity-100 transition-opacity"
                                        onClick={(e) => openTagDialog(commit, e)}
                                    >
                                        <TagIcon className="h-3 w-3" />
                                    </Button>
                                </div>
                                <p className="text-sm font-medium truncate">{commit.commit_message}</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {commitTags.map(tag => (
                                        <Badge key={tag.id} variant="secondary" className="text-[10px] px-1 py-0 h-4">
                                            {tag.name}
                                        </Badge>
                                    ))}
                                </div>
                                <p className="text-xs text-zinc-400 mt-1">{new Date(commit.created_at).toLocaleTimeString()}</p>
                            </div>
                        )
                    })}
                </div>

                <div className="col-span-6 flex flex-col gap-4 overflow-y-auto">
                    <Card className="flex-1 flex flex-col">
                        <CardHeader className="py-3 px-4 border-b">
                            <CardTitle className="text-sm">System Prompt</CardTitle>
                        </CardHeader>
                        <div className="flex-1 p-2">
                            <textarea
                                className="w-full h-full resize-none bg-transparent outline-none p-2 font-mono text-sm"
                                value={systemPrompt}
                                onChange={(e) => setSystemPrompt(e.target.value)}
                                placeholder="You are a helpful assistant..."
                            />
                        </div>
                    </Card>
                    <Card className="flex-1 flex flex-col">
                        <CardHeader className="py-3 px-4 border-b">
                            <CardTitle className="text-sm">User Query</CardTitle>
                        </CardHeader>
                        <div className="flex-1 p-2">
                            <textarea
                                className="w-full h-full resize-none bg-transparent outline-none p-2 font-mono text-sm"
                                value={userQuery}
                                onChange={(e) => setUserQuery(e.target.value)}
                                placeholder="Input text..."
                            />
                        </div>
                    </Card>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Commit Message (required to save)"
                            value={commitMessage}
                            onChange={(e) => setCommitMessage(e.target.value)}
                        />
                    </div>
                </div>

                <div className="col-span-4 overflow-y-auto border-l pl-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm text-zinc-500">Run History</h3>
                        {scores.length > 0 && (
                            <Badge variant="outline" className="gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                {(scores.reduce((a, b) => a + b.score, 0) / scores.length).toFixed(2)} Avg
                            </Badge>
                        )}
                    </div>

                    {runs.map(run => (
                        <Card key={run.id} className="bg-zinc-50 dark:bg-zinc-900 group relative">
                            <CardHeader className="py-2 px-3">
                                <div className="flex items-center justify-between">
                                    <Badge variant={run.status === 'success' ? 'success' : 'destructive'}>{run.status}</Badge>
                                    <div className="flex gap-2 text-xs text-zinc-400 items-center">
                                        <span>{run.latency_ms}ms</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => openScoreDialog(run)}
                                        >
                                            <Star className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="py-2 px-3">
                                <div className="text-xs font-mono bg-zinc-900 text-zinc-50 p-2 rounded max-h-[300px] overflow-y-auto whitespace-pre-wrap">
                                    {run.response}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {runs.length === 0 && <p className="text-sm text-zinc-500">No runs yet.</p>}
                </div>
            </div>

            <Dialog open={scoreDialogOpen} onOpenChange={setScoreDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Evaluate Result</DialogTitle>
                        <DialogDescription>
                            Score this execution result to track quality over time.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Score (0.0 - 1.0)</Label>
                            <Input
                                type="number"
                                step="0.1"
                                min="0"
                                max="1"
                                value={scoreValue}
                                onChange={(e) => setScoreValue(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Reasoning</Label>
                            <Input
                                placeholder="Why this score?"
                                value={scoreReasoning}
                                onChange={(e) => setScoreReasoning(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCreateScore}>Save Score</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tag Version</DialogTitle>
                        <DialogDescription>
                            Add a tag to version {commitToTag?.id.substring(0, 6)}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Tag Name</Label>
                            <Input
                                placeholder="v1.0-release"
                                value={tagName}
                                onChange={(e) => setTagName(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCreateTag}>Add Tag</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
